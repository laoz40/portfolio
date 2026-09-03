import { spawn } from "node:child_process";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, type Page } from "playwright";
import { features, viewports, type FeatureRecipe, type ViewportName } from "./recipes.ts";
import { driveAnimation } from "./animation-drive.ts";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");
const evidenceRoot = join(repoRoot, ".verification-evidence");
const instancePath = join(evidenceRoot, "instance.json");
const defaultHost = "127.0.0.1";
const defaultPort = 4322;

type InstanceState = {
	pid: number;
	url: string;
	port: number;
	host: string;
};

function readFlag(args: string[], name: string): string | undefined {
	const index = args.indexOf(name);
	if (index === -1) {
		return undefined;
	}

	return args[index + 1];
}

function parseViewports(raw: string | undefined): ViewportName[] {
	if (raw === undefined) {
		return ["mobile", "laptop", "desktop"];
	}

	const names = raw.split(",").map((name) => name.trim());
	const allowed: ViewportName[] = ["mobile", "laptop", "desktop"];
	const invalid = names.filter((name) => !allowed.includes(name as ViewportName));
	if (invalid.length > 0) {
		throw new Error(`Unknown viewport(s): ${invalid.join(", ")}`);
	}

	return names as ViewportName[];
}

function baseUrlFromEnv(): string {
	return process.env.VERIFY_BASE_URL ?? `http://${defaultHost}:${defaultPort}`;
}

async function pathExists(path: string): Promise<boolean> {
	try {
		await readFile(path);
		return true;
	} catch {
		return false;
	}
}

async function loadInstance(): Promise<InstanceState | undefined> {
	if (!(await pathExists(instancePath))) {
		return undefined;
	}

	const raw = await readFile(instancePath, "utf8");
	return JSON.parse(raw) as InstanceState;
}

function pidAlive(pid: number): boolean {
	try {
		process.kill(pid, 0);
		return true;
	} catch {
		return false;
	}
}

function killInstance(pid: number): void {
	try {
		process.kill(-pid, "SIGTERM");
	} catch {
		try {
			process.kill(pid, "SIGTERM");
		} catch {
			return;
		}
	}
}

async function fetchOk(url: string): Promise<boolean> {
	try {
		const response = await fetch(url, { redirect: "follow" });
		if (!response.ok) {
			return false;
		}

		const body = await response.text();
		return body.includes("Leo Zhou");
	} catch {
		return false;
	}
}

async function waitForUrl(url: string, timeoutMs: number): Promise<void> {
	const started = Date.now();
	while (Date.now() - started < timeoutMs) {
		if (await fetchOk(url)) {
			return;
		}

		await new Promise((resolveWait) => setTimeout(resolveWait, 250));
	}

	throw new Error(`Timed out waiting for ${url}`);
}

function isVisibleBox(box: { width: number; height: number } | null): boolean {
	return box !== null && box.width > 1 && box.height > 1;
}

async function assertVisible(page: Page, selector: string): Promise<void> {
	const locator = page.locator(selector).first();
	await locator.scrollIntoViewIfNeeded();
	await locator.waitFor({ state: "visible", timeout: 10_000 });
	const box = await locator.boundingBox();
	if (!isVisibleBox(box)) {
		throw new Error(`${selector} has no visible box`);
	}
}

async function assertHidden(page: Page, selector: string): Promise<void> {
	const locator = page.locator(selector).first();
	const hidden = await locator.isHidden();
	if (!hidden) {
		throw new Error(`${selector} should be hidden`);
	}
}

async function assertNoHorizontalOverflow(page: Page): Promise<void> {
	const overflowed = await page.evaluate(() => {
		return document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;
	});
	if (overflowed) {
		throw new Error("Page has horizontal overflow");
	}
}

async function assertPeeking(page: Page, selector: string): Promise<void> {
	const locator = page.locator(selector).first();
	await locator.waitFor({ state: "attached", timeout: 10_000 });
	const result = await locator.evaluate((node) => {
		const rect = node.getBoundingClientRect();
		const viewportHeight = window.innerHeight;
		return {
			top: rect.top,
			bottom: rect.bottom,
			viewportHeight,
		};
	});

	const inLowerHalf = result.top > result.viewportHeight * 0.45;
	const visibleTop = result.top < result.viewportHeight;
	const extendsBelow = result.bottom > result.viewportHeight;
	if (!inLowerHalf || !visibleTop || !extendsBelow) {
		throw new Error(
			`${selector} is not peeking (top=${result.top.toFixed(1)}, bottom=${result.bottom.toFixed(1)}, vh=${result.viewportHeight})`,
		);
	}
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

async function openMobileNavIfNeeded(
	page: Page,
	recipe: FeatureRecipe,
	viewport: ViewportName,
): Promise<void> {
	if (!recipe.openMobileNav) {
		return;
	}

	if (viewport !== "mobile") {
		return;
	}

	await page.getByRole("button", { name: "Open navigation menu" }).click();
	await assertVisible(page, "#site-nav-links");
}

async function assertRecipe(
	page: Page,
	recipe: FeatureRecipe,
	viewport: ViewportName,
): Promise<void> {
	for (const selector of recipe.visible) {
		await assertVisible(page, selector);
	}

	for (const selector of recipe.visibleAt?.[viewport] ?? []) {
		await assertVisible(page, selector);
	}

	for (const selector of recipe.hiddenAt?.[viewport] ?? []) {
		await assertHidden(page, selector);
	}

	await assertPeekIfNeeded(page, recipe, viewport);
	await clickIfNeeded(page, recipe);
	await assertNoHorizontalOverflow(page);
}

async function assertPeekIfNeeded(
	page: Page,
	recipe: FeatureRecipe,
	viewport: ViewportName,
): Promise<void> {
	if (recipe.peek === undefined) {
		return;
	}

	if (!recipe.peekAt.includes(viewport)) {
		return;
	}

	await assertPeeking(page, recipe.peek);
}

async function clickIfNeeded(page: Page, recipe: FeatureRecipe): Promise<void> {
	if (recipe.clickName === undefined) {
		return;
	}

	const button = page.getByRole("button", { name: recipe.clickName });
	await button.scrollIntoViewIfNeeded();
	await button.click();
}

async function runViewport(
	page: Page,
	viewport: ViewportName,
	recipe: FeatureRecipe,
	shotDir: string,
	featureId: string,
): Promise<void> {
	await page.setViewportSize(viewports[viewport]);
	await page.emulateMedia({ reducedMotion: "reduce" });
	await page.goto(new URL(recipe.page, page.url()).toString(), { waitUntil: "load" });
	await page.evaluate(() => document.fonts.ready);
	await openMobileNavIfNeeded(page, recipe, viewport);
	await assertRecipe(page, recipe, viewport);
	await captureShot(page, recipe.screenshot, join(shotDir, `${featureId}-${viewport}.png`));
}

function getFeature(featureId: string): FeatureRecipe {
	if (!Object.hasOwn(features, featureId)) {
		throw new Error(`Unknown feature: ${featureId}`);
	}

	return features[featureId];
}

async function driveFeature(
	url: string,
	featureId: string,
	viewportNames: ViewportName[],
	runDir: string,
): Promise<void> {
	const recipe = getFeature(featureId);

	const browser = await chromium.launch();
	const page = await browser.newPage();
	await page.goto(url, { waitUntil: "domcontentloaded" });

	try {
		for (const viewport of viewportNames) {
			await runViewport(page, viewport, recipe, runDir, featureId);
		}
	} finally {
		await browser.close();
	}
}

async function driveTarget(
	url: string,
	pagePath: string,
	target: string,
	viewportNames: ViewportName[],
	runDir: string,
): Promise<void> {
	const browser = await chromium.launch();
	const page = await browser.newPage();
	await page.goto(url, { waitUntil: "domcontentloaded" });

	try {
		for (const viewport of viewportNames) {
			await page.setViewportSize(viewports[viewport]);
			await page.emulateMedia({ reducedMotion: "reduce" });
			await page.goto(new URL(pagePath, url).toString(), { waitUntil: "load" });
			await page.evaluate(() => document.fonts.ready);
			await assertVisible(page, target);
			await assertNoHorizontalOverflow(page);
			await captureShot(page, target, join(runDir, `target-${viewport}.png`));
		}
	} finally {
		await browser.close();
	}
}

async function launch(): Promise<void> {
	const existing = await loadInstance();
	const url = `http://${defaultHost}:${defaultPort}`;
	if (existing !== undefined && pidAlive(existing.pid) && (await fetchOk(existing.url))) {
		console.log(`Already running at ${existing.url} (pid ${existing.pid})`);
		return;
	}

	if (await fetchOk(url)) {
		throw new Error(
			`${url} is already serving this site, but this run did not start it. Use a free port or VERIFY_BASE_URL.`,
		);
	}

	await mkdir(evidenceRoot, { recursive: true });
	const child = spawn(
		"pnpm",
		["astro", "dev", "--host", defaultHost, "--port", String(defaultPort)],
		{
			cwd: repoRoot,
			detached: true,
			stdio: "ignore",
		},
	);

	if (child.pid === undefined) {
		throw new Error("Failed to spawn astro dev");
	}

	child.unref();

	try {
		await waitForUrl(url, 30_000);
	} catch (error) {
		killInstance(child.pid);
		throw error;
	}

	const instance: InstanceState = {
		pid: child.pid,
		url,
		port: defaultPort,
		host: defaultHost,
	};
	await writeFile(instancePath, `${JSON.stringify(instance, null, 2)}\n`);
	console.log(`Launched ${url} (pid ${child.pid})`);
}

async function doctor(): Promise<void> {
	const instance = await loadInstance();
	const url = instance?.url ?? baseUrlFromEnv();
	if (instance !== undefined && !pidAlive(instance.pid)) {
		throw new Error(`Instance pid ${instance.pid} is not running`);
	}

	if (!(await fetchOk(url))) {
		throw new Error(`Doctor failed for ${url}`);
	}

	console.log(`Healthy at ${url}`);
}

async function cleanup(): Promise<void> {
	const instance = await loadInstance();
	if (instance === undefined) {
		console.log("No instance file; nothing to stop");
		return;
	}

	if (pidAlive(instance.pid)) {
		killInstance(instance.pid);
	}

	await unlink(instancePath);
	console.log(`Stopped pid ${instance.pid}; evidence kept in ${evidenceRoot}`);
}

async function drive(args: string[]): Promise<void> {
	const instance = await loadInstance();
	const url = instance?.url ?? baseUrlFromEnv();
	if (!(await fetchOk(url))) {
		throw new Error(`Nothing healthy at ${url}. Run launch, then doctor.`);
	}

	const runId = process.env.VERIFY_RUN_ID ?? String(Date.now());
	const runDir = join(evidenceRoot, runId);
	await mkdir(runDir, { recursive: true });
	const viewportNames = parseViewports(readFlag(args, "--viewports"));
	const featureId = readFlag(args, "--feature");
	const pagePath = readFlag(args, "--page");
	const target = readFlag(args, "--target");

	if (featureId !== undefined) {
		await driveFeature(url, featureId, viewportNames, runDir);
		console.log(`Drove ${featureId}; evidence in ${runDir}`);
		return;
	}

	if (pagePath !== undefined && target !== undefined) {
		await driveTarget(url, pagePath, target, viewportNames, runDir);
		console.log(`Drove ${pagePath} ${target}; evidence in ${runDir}`);
		return;
	}

	throw new Error("drive needs --feature <id> or both --page and --target");
}

async function animate(args: string[]): Promise<void> {
	const instance = await loadInstance();
	const url = instance?.url ?? baseUrlFromEnv();
	if (!(await fetchOk(url))) {
		throw new Error(`Nothing healthy at ${url}. Run launch, then doctor.`);
	}

	const runId = process.env.VERIFY_RUN_ID ?? String(Date.now());
	const runDir = join(evidenceRoot, runId);
	await mkdir(runDir, { recursive: true });
	const viewportNames = parseViewports(readFlag(args, "--viewports"));
	const featureId = readFlag(args, "--feature");
	if (featureId === undefined) {
		throw new Error("animate needs --feature <id>");
	}

	await driveAnimation({ url, featureId, viewportNames, args, runDir });
	console.log(`Animated ${featureId}; evidence in ${runDir}`);
}

const command = process.argv[2];
const commandArgs = process.argv.slice(3);

async function main(): Promise<void> {
	if (command === "launch") {
		await launch();
		return;
	}

	if (command === "doctor") {
		await doctor();
		return;
	}

	if (command === "drive") {
		await drive(commandArgs);
		return;
	}

	if (command === "animate") {
		await animate(commandArgs);
		return;
	}

	if (command === "cleanup") {
		await cleanup();
		return;
	}

	throw new Error("Usage: verify-ui launch|doctor|drive|animate|cleanup");
}

try {
	await main();
} catch (error) {
	const message = error instanceof Error ? error.message : String(error);
	console.error(message);
	process.exitCode = 1;
}
