import {
	aboutTimings,
	contactTimings,
	footerTimings,
	heroTimings,
	motionSlackMs,
	observerSlackMs,
	projectsTimings,
	sequenceDuration,
} from "../../../../src/animation/timings.ts";

export type MotionMode = "full" | "reduced";

export type ClipExpect = "hidden-right" | "hidden-bottom" | "revealed";
export type OpacityExpect = "hidden" | "revealed";

export type NodeAssert = {
	selector: string;
	all?: boolean;
	optional?: boolean;
	opacity?: OpacityExpect;
	clip?: ClipExpect;
	translateY?: { hiddenMin?: number; revealedMax?: number };
};

export type AnimPhase = {
	id: string;
	atMs: number | "revealed";
	fromProbe?: boolean;
	scroll?: string;
	screenshot?: boolean;
	assert: NodeAssert[];
};

export type OrderCheck = {
	earlier: { selector: string; reveal: "clip" | "opacity" };
	later: { selector: string; reveal: "clip" | "opacity" };
};

export type AnimationRecipe = {
	page: string;
	screenshot: string;
	ready: string;
	countSelector?: string;
	revealedMs: (count: number) => number;
	order?: OrderCheck[];
	full: AnimPhase[];
	reduced: AnimPhase[];
};

const heroTitleLineCount = 2;
const heroTitleSeq = sequenceDuration(
	heroTitleLineCount,
	heroTimings.titleDuration,
	heroTimings.titleGap,
);
const heroSubtitleDelay = heroTimings.afterTitleDelay + heroTitleSeq;
const heroActionsDelay =
	heroSubtitleDelay + heroTimings.subtitleDuration + heroTimings.afterSubtitleDelay;
const heroCardDelay = heroActionsDelay + heroTimings.heroImagesDuration;
const heroDoneMs =
	Math.round((heroCardDelay + heroTimings.featuredCardDuration) * 1000) + motionSlackMs;
const heroCtaMs =
	Math.round(heroTimings.featuredCtaDuration * 1000) + motionSlackMs + observerSlackMs;
const heroAfterTitleMs = Math.round((heroTitleSeq + 0.15) * 1000);
const heroAfterRolesMs = Math.round(
	(heroSubtitleDelay + heroTimings.subtitleDuration + 0.1) * 1000,
);
const heroAfterActionsMs = Math.round(
	(heroActionsDelay + heroTimings.actionsDuration + 0.1) * 1000,
);
const heroAfterImagesMs = Math.round((heroCardDelay + 0.05) * 1000);

export function projectsRevealedMs(cardCount: number): number {
	const cardsEnd =
		cardCount <= 0
			? 0
			: (cardCount - 1) * projectsTimings.cardStagger + projectsTimings.cardDuration;
	const ctaEnd = cardCount * projectsTimings.cardStagger + projectsTimings.ctaDuration;
	return Math.round(Math.max(cardsEnd, ctaEnd) * 1000) + motionSlackMs;
}

export function contactRevealedMs(linkCount: number): number {
	const linksDone =
		linkCount <= 0 ? 0 : (linkCount - 1) * contactTimings.linkStagger + contactTimings.linkDuration;
	return (
		Math.round((linksDone + contactTimings.thanksDelay + contactTimings.thanksDuration) * 1000) +
		motionSlackMs
	);
}

export function footerRevealedMs(itemCount: number): number {
	const endSec =
		itemCount <= 0
			? 0
			: (itemCount - 1) * footerTimings.revealStagger + footerTimings.revealDuration;
	return Math.round(endSec * 1000) + motionSlackMs + observerSlackMs;
}

export function aboutRevealedMs(): number {
	return (
		Math.round((aboutTimings.thankYouDuration + aboutTimings.ctaDuration) * 1000) +
		motionSlackMs +
		observerSlackMs
	);
}

const hiddenOpacity: NodeAssert["opacity"] = "hidden";
const revealedOpacity: NodeAssert["opacity"] = "revealed";
const hiddenRight: NodeAssert["clip"] = "hidden-right";
const hiddenBottom: NodeAssert["clip"] = "hidden-bottom";
const revealedClip: NodeAssert["clip"] = "revealed";

const heroHidden: NodeAssert[] = [
	{ selector: ".hero-title-text", all: true, clip: hiddenRight },
	{ selector: ".hero-roles", opacity: hiddenOpacity },
	{ selector: ".hero-actions", opacity: hiddenOpacity },
	{ selector: ".hero-image-reveal", all: true, clip: hiddenBottom },
	{ selector: ".hero-note", clip: hiddenRight },
	{
		selector: ".featured-project-card-reveal",
		opacity: hiddenOpacity,
		translateY: { hiddenMin: 80 },
	},
	{ selector: ".featured-projects-cta-reveal", opacity: hiddenOpacity },
];

const heroRevealed: NodeAssert[] = [
	{ selector: ".hero-title-text", all: true, clip: revealedClip },
	{ selector: ".hero-roles", opacity: revealedOpacity },
	{ selector: ".hero-actions", opacity: revealedOpacity },
	{ selector: ".hero-image-reveal", all: true, clip: revealedClip },
	{ selector: ".hero-note", clip: revealedClip },
	{
		selector: ".featured-project-card-reveal",
		opacity: revealedOpacity,
		translateY: { revealedMax: 12 },
	},
];

const heroTitleRevealed: NodeAssert[] = [
	{ selector: ".hero-title-text", all: true, clip: revealedClip },
];

const heroCardStillOffscreen: NodeAssert[] = [
	{
		selector: ".featured-project-card-reveal",
		opacity: hiddenOpacity,
		translateY: { hiddenMin: 80 },
	},
	{ selector: ".featured-projects-cta-reveal", opacity: hiddenOpacity },
];

const heroCardStillTranslating: NodeAssert[] = [
	{
		selector: ".featured-project-card-reveal",
		translateY: { hiddenMin: 40 },
	},
	{ selector: ".featured-projects-cta-reveal", opacity: hiddenOpacity },
];

const heroStillBelowTitle: NodeAssert[] = [
	{ selector: ".hero-roles", opacity: hiddenOpacity },
	{ selector: ".hero-actions", opacity: hiddenOpacity },
	{ selector: ".hero-image-reveal", all: true, clip: hiddenBottom },
	{ selector: ".hero-note", clip: hiddenRight },
	...heroCardStillOffscreen,
];

const heroStillBelowRoles: NodeAssert[] = [
	{ selector: ".hero-actions", opacity: hiddenOpacity },
	{ selector: ".hero-image-reveal", all: true, clip: hiddenBottom },
	{ selector: ".hero-note", clip: hiddenRight },
	...heroCardStillOffscreen,
];

export const animationFeatures: Record<string, AnimationRecipe> = {
	"hero-sequence": {
		page: "/",
		screenshot: "viewport",
		ready: "#hero[data-animated='true']",
		revealedMs: () => heroDoneMs,
		order: [
			{
				earlier: { selector: ".hero-title-text", reveal: "clip" },
				later: { selector: ".hero-roles", reveal: "opacity" },
			},
			{
				earlier: { selector: ".hero-roles", reveal: "opacity" },
				later: { selector: ".hero-actions", reveal: "opacity" },
			},
			{
				earlier: { selector: ".hero-image-reveal", reveal: "clip" },
				later: { selector: ".featured-project-card-reveal", reveal: "opacity" },
			},
		],
		full: [
			{ id: "initial", atMs: 0, fromProbe: true, assert: heroHidden },
			{
				id: "after-title",
				atMs: heroAfterTitleMs,
				screenshot: true,
				assert: [...heroTitleRevealed, ...heroStillBelowTitle],
			},
			{
				id: "after-roles",
				atMs: heroAfterRolesMs,
				screenshot: true,
				assert: [
					...heroTitleRevealed,
					{ selector: ".hero-roles", opacity: revealedOpacity },
					...heroStillBelowRoles,
				],
			},
			{
				id: "after-actions",
				atMs: heroAfterActionsMs,
				screenshot: true,
				assert: [
					...heroTitleRevealed,
					{ selector: ".hero-roles", opacity: revealedOpacity },
					{ selector: ".hero-actions", opacity: revealedOpacity },
					{ selector: ".hero-note", clip: revealedClip },
					...heroCardStillOffscreen,
				],
			},
			{
				id: "after-images",
				atMs: heroAfterImagesMs,
				screenshot: true,
				assert: [
					...heroTitleRevealed,
					{ selector: ".hero-roles", opacity: revealedOpacity },
					{ selector: ".hero-actions", opacity: revealedOpacity },
					{ selector: ".hero-image-reveal", all: true, clip: revealedClip },
					{ selector: ".hero-note", clip: revealedClip },
					...heroCardStillTranslating,
				],
			},
			{
				id: "hero-done",
				atMs: "revealed",
				screenshot: true,
				assert: [
					...heroRevealed,
					{ selector: ".featured-projects-cta-reveal", opacity: hiddenOpacity },
				],
			},
			{
				id: "cta",
				atMs: heroCtaMs,
				scroll: ".featured-projects-cta-reveal",
				screenshot: true,
				assert: [{ selector: ".featured-projects-cta-reveal", opacity: revealedOpacity }],
			},
		],
		reduced: [
			{
				id: "revealed",
				atMs: 0,
				fromProbe: true,
				screenshot: true,
				assert: [
					...heroRevealed,
					{ selector: ".featured-projects-cta-reveal", opacity: revealedOpacity },
				],
			},
		],
	},
	"project-cards": {
		page: "/projects",
		screenshot: ".projects-page",
		ready: ".projects-page[data-animated='true']",
		countSelector: ".project-card-reveal",
		revealedMs: projectsRevealedMs,
		full: [
			{
				id: "initial",
				atMs: 0,
				fromProbe: true,
				assert: [
					{
						selector: ".project-card-reveal",
						all: true,
						opacity: hiddenOpacity,
						translateY: { hiddenMin: 10 },
					},
					{ selector: ".projects-cta-reveal", opacity: hiddenOpacity },
				],
			},
			{
				id: "revealed",
				atMs: "revealed",
				screenshot: true,
				assert: [
					{
						selector: ".project-card-reveal",
						all: true,
						opacity: revealedOpacity,
						translateY: { revealedMax: 8 },
					},
					{ selector: ".projects-cta-reveal", opacity: revealedOpacity },
				],
			},
		],
		reduced: [
			{
				id: "revealed",
				atMs: 0,
				fromProbe: true,
				screenshot: true,
				assert: [
					{
						selector: ".project-card-reveal",
						all: true,
						opacity: revealedOpacity,
						translateY: { revealedMax: 8 },
					},
					{ selector: ".projects-cta-reveal", opacity: revealedOpacity },
				],
			},
		],
	},
	"contact-links": {
		page: "/contact",
		screenshot: ".contact-page",
		ready: ".contact-page[data-animated='true']",
		countSelector: ".contact-link-reveal",
		revealedMs: contactRevealedMs,
		full: [
			{
				id: "initial",
				atMs: 0,
				fromProbe: true,
				assert: [
					{ selector: ".contact-link-reveal", all: true, opacity: hiddenOpacity },
					{ selector: ".contact-thanks-reveal", clip: hiddenRight },
				],
			},
			{
				id: "revealed",
				atMs: "revealed",
				screenshot: true,
				assert: [
					{ selector: ".contact-link-reveal", all: true, opacity: revealedOpacity },
					{ selector: ".contact-thanks-reveal", clip: revealedClip },
				],
			},
		],
		reduced: [
			{
				id: "revealed",
				atMs: 0,
				fromProbe: true,
				screenshot: true,
				assert: [
					{ selector: ".contact-link-reveal", all: true, opacity: revealedOpacity },
					{ selector: ".contact-thanks-reveal", clip: revealedClip },
				],
			},
		],
	},
	"footer-reveal": {
		page: "/",
		screenshot: "[data-footer-root]",
		ready: "[data-footer-root][data-anim-ready='true']",
		countSelector:
			".footer-cta-reveal, .footer-link-reveal, .footer-copyright-reveal, .footer-note-reveal",
		revealedMs: footerRevealedMs,
		full: [
			{
				id: "initial",
				atMs: 0,
				fromProbe: true,
				assert: [
					{ selector: ".footer-cta-reveal", clip: hiddenRight },
					{ selector: ".footer-link-reveal", all: true, optional: true, clip: hiddenRight },
					{ selector: ".footer-copyright-reveal", clip: hiddenRight },
					{ selector: ".footer-note-reveal", clip: hiddenRight },
				],
			},
			{
				id: "revealed",
				atMs: "revealed",
				scroll: "[data-footer-root]",
				screenshot: true,
				assert: [
					{ selector: ".footer-cta-reveal", clip: revealedClip },
					{ selector: ".footer-link-reveal", all: true, optional: true, clip: revealedClip },
					{ selector: ".footer-copyright-reveal", clip: revealedClip },
					{ selector: ".footer-note-reveal", clip: revealedClip },
				],
			},
		],
		reduced: [
			{
				id: "revealed",
				atMs: 0,
				fromProbe: true,
				scroll: "[data-footer-root]",
				screenshot: true,
				assert: [
					{ selector: ".footer-cta-reveal", clip: revealedClip },
					{ selector: ".footer-link-reveal", all: true, optional: true, clip: revealedClip },
					{ selector: ".footer-copyright-reveal", clip: revealedClip },
					{ selector: ".footer-note-reveal", clip: revealedClip },
				],
			},
		],
	},
	"about-actions": {
		page: "/about",
		screenshot: ".about-actions-reveal",
		ready: ".about-page[data-animated='true']",
		revealedMs: aboutRevealedMs,
		full: [
			{
				id: "initial",
				atMs: 0,
				fromProbe: true,
				assert: [
					{ selector: ".about-actions-note-reveal", clip: hiddenRight },
					{ selector: ".about-actions-cta-reveal", opacity: hiddenOpacity },
				],
			},
			{
				id: "revealed",
				atMs: "revealed",
				scroll: ".about-actions-reveal",
				screenshot: true,
				assert: [
					{ selector: ".about-actions-note-reveal", clip: revealedClip },
					{ selector: ".about-actions-cta-reveal", opacity: revealedOpacity },
				],
			},
		],
		reduced: [
			{
				id: "revealed",
				atMs: 0,
				fromProbe: true,
				scroll: ".about-actions-reveal",
				screenshot: true,
				assert: [
					{ selector: ".about-actions-note-reveal", clip: revealedClip },
					{ selector: ".about-actions-cta-reveal", opacity: revealedOpacity },
				],
			},
		],
	},
};

export function listAnimationSelectors(recipe: AnimationRecipe): string[] {
	const selectors = new Set<string>();
	for (const phase of [...recipe.full, ...recipe.reduced]) {
		if (phase.scroll !== undefined) {
			selectors.add(phase.scroll);
		}
		for (const node of phase.assert) {
			selectors.add(node.selector);
		}
	}
	for (const check of recipe.order ?? []) {
		selectors.add(check.earlier.selector);
		selectors.add(check.later.selector);
	}
	return [...selectors];
}

export function parseMotionModes(raw: string | undefined): MotionMode[] {
	if (raw === undefined) {
		return ["full", "reduced"];
	}

	const names = raw.split(",").map((name) => name.trim());
	const allowed: MotionMode[] = ["full", "reduced"];
	const invalid = names.filter((name) => !allowed.includes(name as MotionMode));
	if (invalid.length > 0) {
		throw new Error(`Unknown motion mode(s): ${invalid.join(", ")}`);
	}

	return names as MotionMode[];
}
