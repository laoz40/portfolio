import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { chromium, type Page } from "playwright";
import {
	animationFeatures,
	listAnimationSelectors,
	parseMotionModes,
	type AnimationRecipe,
	type AnimPhase,
	type MotionMode,
	type NodeAssert,
	type OrderCheck,
} from "./animation-recipes.ts";
import { assertSnap, snapRevealed, type StyleSnap } from "./animation-style.ts";
import { viewports, type ViewportName } from "./recipes.ts";

type ProbeSample = {
	t: number;
	nodes: Partial<Record<string, StyleSnap>>;
};

type ProbeState = {
	t0: number;
	first: Partial<Record<string, StyleSnap>>;
	samples: ProbeSample[];
};

declare global {
	interface Window {
		__verifyAnim: ProbeState;
	}
}

type PhaseLog = {
	id: string;
	nodes: Array<{ selector: string; index: number } & StyleSnap>;
};

type DriveOptions = {
	url: string;
	featureId: string;
	viewportNames: ViewportName[];
	args: string[];
	runDir: string;
};

function readFlag(args: string[], name: string): string | undefined {
	const index = args.indexOf(name);
	if (index === -1) {
		return undefined;
	}

	return args[index + 1];
}

function getRecipe(featureId: string): AnimationRecipe {
	if (!Object.hasOwn(animationFeatures, featureId)) {
		throw new Error(`Unknown animation feature: ${featureId}`);
	}

	return animationFeatures[featureId];
}

function probeKey(selector: string, index: number): string {
	return `${selector}::${index}`;
}

async function installProbe(page: Page, recipe: AnimationRecipe): Promise<void> {
	const selectors = listAnimationSelectors(recipe);
	const payload = JSON.stringify({ selectors, ready: recipe.ready });
	await page.addInitScript({
		content: `(() => {
			const { selectors, ready } = ${payload};
			const state = { t0: 0, first: {}, samples: [] };
			window.__verifyAnim = state;

			const snapComputed = (el) => {
				const style = getComputedStyle(el);
				return {
					opacity: style.opacity,
					clipPath: style.clipPath,
					transform: style.transform,
				};
			};

			const snapInline = (el) => ({
				opacity: el.style.opacity,
				clipPath: el.style.clipPath,
				transform: el.style.transform,
			});

			const hasInline = (el) =>
				el.style.opacity !== "" ||
				el.style.clipPath !== "" ||
				el.style.transform !== "";

			const captureNodes = () => {
				const nodes = {};
				for (const selector of selectors) {
					document.querySelectorAll(selector).forEach((node, index) => {
						if (node instanceof HTMLElement) {
							nodes[selector + "::" + index] = snapComputed(node);
						}
					});
				}
				return nodes;
			};

			const recordFirst = () => {
				for (const selector of selectors) {
					document.querySelectorAll(selector).forEach((node, index) => {
						const key = selector + "::" + index;
						if (state.first[key] !== undefined) {
							return;
						}
						if (!(node instanceof HTMLElement) || !hasInline(node)) {
							return;
						}
						state.first[key] = snapInline(node);
					});
				}
			};

			const markReady = () => {
				if (state.t0 !== 0) {
					return;
				}
				if (document.querySelector(ready) === null) {
					return;
				}
				state.t0 = performance.now();
				recordFirst();
			};

			const observer = new MutationObserver(() => {
				recordFirst();
				markReady();
			});
			setInterval(() => {
				recordFirst();
				markReady();
				if (state.t0 === 0) {
					return;
				}
				const t = performance.now() - state.t0;
				if (t > 5000) {
					return;
				}
				state.samples.push({ t, nodes: captureNodes() });
			}, 50);

			try {
				observer.observe(document, {
					subtree: true,
					childList: true,
					attributes: true,
					attributeFilter: ["style", "data-animated", "data-anim-ready"],
				});
			} catch (error) {
				state.error = String(error);
			}
		})();`,
	});
}

async function resetClock(page: Page): Promise<void> {
	await page.evaluate(() => {
		window.__verifyAnim.t0 = performance.now();
	});
}

async function waitUntilAtMs(page: Page, atMs: number): Promise<void> {
	await page.waitForFunction(
		(target) => {
			const state = window.__verifyAnim;
			return state.t0 !== 0 && performance.now() - state.t0 >= target;
		},
		atMs,
		{ timeout: Math.max(atMs + 8_000, 10_000) },
	);
}

async function waitForProbe(page: Page): Promise<void> {
	await page.waitForFunction(() => {
		const state = window.__verifyAnim;
		return state.t0 !== 0 && Object.keys(state.first).length > 0;
	});
}

async function readSnaps(page: Page, selector: string, fromProbe: boolean): Promise<StyleSnap[]> {
	return page.evaluate(
		({ selector, fromProbe }) => {
			const state = window.__verifyAnim;
			if (fromProbe) {
				const snaps = [];
				for (let index = 0; ; index += 1) {
					const snap = state.first[`${selector}::${index}`];
					if (snap === undefined) {
						break;
					}

					snaps.push(snap);
				}

				return snaps;
			}

			return Array.from(document.querySelectorAll(selector)).flatMap((node) => {
				if (!(node instanceof HTMLElement)) {
					return [];
				}

				const style = getComputedStyle(node);
				return [
					{
						opacity: style.opacity,
						clipPath: style.clipPath,
						transform: style.transform,
					},
				];
			});
		},
		{ selector, fromProbe },
	);
}

async function assertNodes(
	page: Page,
	nodes: NodeAssert[],
	fromProbe: boolean,
): Promise<PhaseLog["nodes"]> {
	const log: PhaseLog["nodes"] = [];
	for (const node of nodes) {
		const snaps = await readSnaps(page, node.selector, fromProbe);
		if (snaps.length === 0) {
			if (node.optional === true) {
				continue;
			}

			throw new Error(`${node.selector} matched nothing`);
		}

		const selected = node.all === true ? snaps : snaps.slice(0, 1);
		for (const [index, snap] of selected.entries()) {
			assertSnap(node.selector, index, snap, node);
			log.push({ selector: node.selector, index, ...snap });
		}
	}

	return log;
}

async function captureShot(page: Page, target: string, path: string): Promise<void> {
	if (target === "viewport") {
		await page.screenshot({ path, fullPage: false });
		return;
	}

	const locator = page.locator(target).first();
	await locator.scrollIntoViewIfNeeded();
	await locator.screenshot({ path });
}

async function runPhase(
	page: Page,
	recipe: AnimationRecipe,
	phase: AnimPhase,
	revealedMs: number,
	shotPath: string | undefined,
): Promise<PhaseLog> {
	if (phase.scroll !== undefined) {
		await page.locator(phase.scroll).first().scrollIntoViewIfNeeded();
		await resetClock(page);
	}

	if (phase.fromProbe === true) {
		await waitForProbe(page);
	} else {
		const atMs = phase.atMs === "revealed" ? revealedMs : phase.atMs;
		if (atMs > 0) {
			await waitUntilAtMs(page, atMs);
		}
	}

	const nodes = await assertNodes(page, phase.assert, phase.fromProbe === true);
	if (phase.screenshot === true && shotPath !== undefined) {
		await captureShot(page, recipe.screenshot, shotPath);
	}

	return { id: phase.id, nodes };
}

function firstRevealedAt(
	samples: ProbeSample[],
	selector: string,
	how: "clip" | "opacity",
): number | undefined {
	for (const sample of samples) {
		const snap = sample.nodes[probeKey(selector, 0)];
		if (snap !== undefined && snapRevealed(snap, how)) {
			return sample.t;
		}
	}

	return undefined;
}

function assertOrder(samples: ProbeSample[], checks: OrderCheck[]): void {
	for (const check of checks) {
		const earlierAt = firstRevealedAt(samples, check.earlier.selector, check.earlier.reveal);
		const laterAt = firstRevealedAt(samples, check.later.selector, check.later.reveal);
		if (earlierAt === undefined) {
			throw new Error(`${check.earlier.selector} never revealed in the sampled timeline`);
		}

		if (laterAt === undefined) {
			throw new Error(`${check.later.selector} never revealed in the sampled timeline`);
		}

		if (laterAt < earlierAt) {
			throw new Error(
				`${check.later.selector} revealed at ${laterAt.toFixed(0)}ms before ${check.earlier.selector} at ${earlierAt.toFixed(0)}ms`,
			);
		}
	}
}

async function runMotionPass(options: {
	page: Page;
	url: string;
	recipe: AnimationRecipe;
	featureId: string;
	viewport: ViewportName;
	motion: MotionMode;
	runDir: string;
}): Promise<void> {
	const { page, url, recipe, featureId, viewport, motion, runDir } = options;
	await page.setViewportSize(viewports[viewport]);
	await page.emulateMedia({
		reducedMotion: motion === "reduced" ? "reduce" : "no-preference",
	});
	await page.goto(new URL(recipe.page, url).toString(), { waitUntil: "domcontentloaded" });
	await page.locator(recipe.ready).waitFor({ state: "attached", timeout: 10_000 });

	const count =
		recipe.countSelector === undefined ? 0 : await page.locator(recipe.countSelector).count();
	const revealedMs = recipe.revealedMs(count);
	const phases = motion === "full" ? recipe.full : recipe.reduced;
	const phaseLogs: PhaseLog[] = [];

	for (const phase of phases) {
		const shotPath =
			phase.screenshot === true
				? join(runDir, `${featureId}-${viewport}-${motion}-${phase.id}.png`)
				: undefined;
		phaseLogs.push(await runPhase(page, recipe, phase, revealedMs, shotPath));
	}

	if (motion === "full" && recipe.order !== undefined) {
		const samples = await page.evaluate(() => window.__verifyAnim.samples);
		assertOrder(samples, recipe.order);
	}

	const jsonPath = join(runDir, `${featureId}-${viewport}-${motion}.json`);
	await writeFile(
		jsonPath,
		`${JSON.stringify({ feature: featureId, viewport, motion, revealedMs, phases: phaseLogs }, null, 2)}\n`,
	);
}

async function runViewportMotion(
	browser: Awaited<ReturnType<typeof chromium.launch>>,
	options: DriveOptions,
	recipe: AnimationRecipe,
	motion: MotionMode,
	viewport: ViewportName,
): Promise<void> {
	const page = await browser.newPage();
	await installProbe(page, recipe);
	try {
		await runMotionPass({
			page,
			url: options.url,
			recipe,
			featureId: options.featureId,
			viewport,
			motion,
			runDir: options.runDir,
		});
	} finally {
		await page.close();
	}
}

export async function driveAnimation(options: DriveOptions): Promise<void> {
	const recipe = getRecipe(options.featureId);
	const motionModes = parseMotionModes(readFlag(options.args, "--motion"));
	const browser = await chromium.launch();

	try {
		for (const motion of motionModes) {
			for (const viewport of options.viewportNames) {
				await runViewportMotion(browser, options, recipe, motion, viewport);
			}
		}
	} finally {
		await browser.close();
	}
}
