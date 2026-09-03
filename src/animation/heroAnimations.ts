import { animate } from "motion";
import { prefersReducedMotion } from "./motionPreferences";
import { heroTimings as timings, sequenceDuration } from "./timings";

type HeroElements = {
	titleLines: HTMLElement[];
	subtitleLines: HTMLElement[];
	subtitle: Element | null;
	actions: Element | null;
	imageClusters: HTMLElement[];
	footerNote: Element | null;
	featuredCard: Element | null;
	featuredCta: Element | null;
};

function collectHeroElements(hero: HTMLElement): HeroElements | null {
	const titleLines = Array.from(hero.querySelectorAll(".hero-title-text")).filter(
		(line): line is HTMLElement => line instanceof HTMLElement,
	);
	if (!titleLines.length) {
		return null;
	}

	return {
		titleLines,
		subtitleLines: Array.from(hero.querySelectorAll(".hero-roles h2")).filter(
			(line): line is HTMLElement => line instanceof HTMLElement,
		),
		subtitle: hero.querySelector(".hero-roles"),
		actions: hero.querySelector(".hero-actions"),
		imageClusters: Array.from(hero.querySelectorAll(".hero-image-reveal")).filter(
			(cluster): cluster is HTMLElement => cluster instanceof HTMLElement,
		),
		footerNote: hero.querySelector(".hero-note"),
		featuredCard: document.querySelector(".featured-project-card-reveal"),
		featuredCta: document.querySelector(".featured-projects-cta-reveal"),
	};
}

function revealClipPath(lines: HTMLElement[]): void {
	lines.forEach((line) => {
		line.style.clipPath = "inset(0 0% 0 0)";
	});
}

function showHeroReducedMotion(elements: HeroElements): void {
	const {
		titleLines,
		subtitleLines,
		subtitle,
		actions,
		imageClusters,
		footerNote,
		featuredCard,
		featuredCta,
	} = elements;

	revealClipPath(titleLines);
	revealClipPath(subtitleLines);

	if (subtitle instanceof HTMLElement) {
		subtitle.style.opacity = "1";
		subtitle.style.transform = "translateY(0)";
	}
	if (actions instanceof HTMLElement) {
		actions.style.opacity = "1";
		actions.style.transform = "translateY(0)";
	}

	imageClusters.forEach((cluster) => {
		cluster.style.clipPath = "inset(0 0 0 0)";
	});
	if (footerNote instanceof HTMLElement) {
		footerNote.style.clipPath = "inset(0 0 0 0)";
	}
	if (featuredCard instanceof HTMLElement) {
		featuredCard.style.transform = "translateY(0)";
		featuredCard.style.opacity = "1";
	}
	if (featuredCta instanceof HTMLElement) {
		featuredCta.style.transform = "translateY(0)";
		featuredCta.style.opacity = "1";
	}
}

function hideClipPath(lines: HTMLElement[]): void {
	lines.forEach((line) => {
		line.style.clipPath = "inset(0 100% 0 0)";
		line.style.willChange = "clip-path";
	});
}

function setHeroHiddenState(elements: HeroElements): void {
	const {
		titleLines,
		subtitleLines,
		subtitle,
		actions,
		imageClusters,
		footerNote,
		featuredCard,
		featuredCta,
	} = elements;

	hideClipPath(titleLines);
	hideClipPath(subtitleLines);

	if (subtitle instanceof HTMLElement) {
		subtitle.style.opacity = "0";
		subtitle.style.transform = "translateY(6px)";
	}
	if (actions instanceof HTMLElement) {
		actions.style.opacity = "0";
		actions.style.transform = "translateY(8px)";
	}

	imageClusters.forEach((cluster) => {
		cluster.style.clipPath = "inset(0 0 100% 0)";
		cluster.style.willChange = "clip-path";
	});
	if (footerNote instanceof HTMLElement) {
		footerNote.style.clipPath = "inset(0 100% 0 0)";
		footerNote.style.willChange = "clip-path";
	}
	if (featuredCard instanceof HTMLElement) {
		featuredCard.style.transform = "translateY(16rem)";
		featuredCard.style.opacity = "0";
		featuredCard.style.willChange = "transform, opacity";
	}
	if (featuredCta instanceof HTMLElement) {
		featuredCta.style.transform = "translateY(-12px)";
		featuredCta.style.opacity = "0";
		featuredCta.style.willChange = "transform, opacity";
	}
}

function setupFeaturedCtaReveal(featuredCta: HTMLElement): void {
	if (!("IntersectionObserver" in window)) {
		featuredCta.style.transform = "translateY(0)";
		featuredCta.style.opacity = "1";
		featuredCta.style.willChange = "";
		return;
	}

	const featuredCtaObserver = new IntersectionObserver(
		(entries, observer) => {
			entries.forEach((entry) => {
				if (!entry.isIntersecting || entry.intersectionRatio < 0.6) {
					return;
				}
				const target = entry.target;
				if (!(target instanceof HTMLElement)) {
					return;
				}

				void animate(
					target,
					{
						transform: ["translateY(-12px)", "translateY(0px)"],
						opacity: [0, 1],
					},
					{ duration: timings.featuredCtaDuration, ease: "easeIn" },
				).finished.then(() => {
					target.style.willChange = "";
				});

				observer.unobserve(target);
			});
		},
		{ threshold: [0.6] },
	);

	featuredCtaObserver.observe(featuredCta);
}

function animateFeaturedCard(featuredCard: HTMLElement, delay: number): void {
	void animate(
		featuredCard,
		{ transform: ["translateY(16rem)", "translateY(0px)"] },
		{
			duration: timings.featuredCardDuration,
			ease: "easeOut",
			delay,
		},
	).finished.then(() => {
		featuredCard.style.willChange = "";
	});
	void animate(
		featuredCard,
		{ opacity: [0, 1] },
		{ duration: timings.featuredCardFadeDuration, delay },
	);
}

function clearWillChangeAfterTitle(
	lineControls: ReturnType<typeof animate>,
	elements: HeroElements,
): void {
	const { titleLines, subtitleLines, imageClusters } = elements;

	void lineControls.finished.then(() => {
		titleLines.forEach((line) => {
			line.style.willChange = "";
		});
		subtitleLines.forEach((line) => {
			line.style.willChange = "";
		});
		imageClusters.forEach((cluster) => {
			cluster.style.willChange = "";
		});
	});
}

function runHeroMotionSequence(elements: HeroElements): void {
	const {
		titleLines,
		subtitleLines,
		subtitle,
		actions,
		imageClusters,
		footerNote,
		featuredCard,
		featuredCta,
	} = elements;

	setHeroHiddenState(elements);

	if (featuredCta instanceof HTMLElement) {
		setupFeaturedCtaReveal(featuredCta);
	}

	const lineControls = animate(
		titleLines,
		{ clipPath: ["inset(0 100% 0 0)", "inset(0 0% 0 0)"] },
		{
			duration: timings.titleDuration,
			ease: "easeOut",
			delay: (index) => index * (timings.titleDuration + timings.titleGap),
		},
	);

	const subtitleDelay =
		timings.afterTitleDelay +
		sequenceDuration(titleLines.length, timings.titleDuration, timings.titleGap);

	if (subtitleLines.length) {
		animate(
			subtitleLines,
			{ clipPath: ["inset(0 100% 0 0)", "inset(0 0% 0 0)"] },
			{
				duration: timings.subtitleDuration,
				ease: "easeOut",
				delay: subtitleDelay,
			},
		);
	}

	if (subtitle instanceof HTMLElement) {
		animate(
			subtitle,
			{ opacity: [0, 1] },
			{ duration: timings.subtitleDuration, delay: subtitleDelay },
		);
	}

	const actionsDelay =
		subtitleDelay +
		(subtitleLines.length ? timings.subtitleDuration : 0) +
		timings.afterSubtitleDelay;
	const featuredCardDelay = actionsDelay + timings.heroImagesDuration;

	if (featuredCard instanceof HTMLElement) {
		animateFeaturedCard(featuredCard, featuredCardDelay);
	}

	if (actions instanceof HTMLElement) {
		animate(
			actions,
			{ opacity: [0, 1], y: [-5, 0] },
			{ duration: timings.actionsDuration, ease: "easeOut", delay: actionsDelay },
		);
	}

	if (imageClusters.length) {
		animate(
			imageClusters,
			{ clipPath: ["inset(0 0 100% 0)", "inset(0 0 0 0)"] },
			{ duration: timings.heroImagesDuration, ease: "easeOut", delay: actionsDelay },
		);
	}

	const footerAnimations: Promise<void>[] = [];

	if (footerNote instanceof HTMLElement) {
		footerAnimations.push(
			animate(
				footerNote,
				{ clipPath: ["inset(0 100% 0 0)", "inset(0 0 0 0)"] },
				{ duration: timings.footerNoteDuration, ease: "easeOut", delay: actionsDelay },
			).finished.then(() => undefined),
		);
	}

	clearWillChangeAfterTitle(lineControls, elements);

	if (footerAnimations.length && footerNote instanceof HTMLElement) {
		const note = footerNote;
		void Promise.all(footerAnimations).then(() => {
			note.style.willChange = "";
		});
	}
}

function runHeroTitleAnimation(): void {
	const hero = document.querySelector("#hero");
	if (!(hero instanceof HTMLElement) || hero.dataset.animated === "true") {
		return;
	}

	const elements = collectHeroElements(hero);
	if (!elements) {
		return;
	}

	hero.dataset.animated = "true";

	if (prefersReducedMotion()) {
		showHeroReducedMotion(elements);
		return;
	}

	runHeroMotionSequence(elements);
}

document.addEventListener("astro:page-load", runHeroTitleAnimation);
runHeroTitleAnimation();
