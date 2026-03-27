import { animate } from "motion";

const timings = {
	titleDuration: 0.2,
	titleGap: 0.2,
	subtitleDuration: 0.1,
	afterTitleDelay: 0.2,
	afterSubtitleDelay: 0.2,
	actionsDuration: 0.2,
	heroImagesDuration: 0.7,
};

function sequenceDuration(count: number, duration: number, gap: number): number {
	return count ? (count - 1) * (duration + gap) + duration : 0;
}

function runHeroTitleAnimation(): void {
	const hero = document.querySelector("#hero");
	if (!(hero instanceof HTMLElement) || hero.dataset.animated === "true") {
		return;
	}

	const titleLines = Array.from(hero.querySelectorAll(".hero-title-text")).filter(
		(line): line is HTMLElement => line instanceof HTMLElement,
	);
	if (!titleLines.length) {
		return;
	}

	const subtitleLines = Array.from(hero.querySelectorAll(".hero-roles h2")).filter(
		(line): line is HTMLElement => line instanceof HTMLElement,
	);
	const subtitle = hero.querySelector(".hero-roles");
	const actions = hero.querySelector(".hero-actions");
	const imageClusters = Array.from(hero.querySelectorAll(".hero-image-reveal")).filter(
		(cluster): cluster is HTMLElement => cluster instanceof HTMLElement,
	);

	hero.dataset.animated = "true";

	if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) {
		titleLines.forEach((line) => {
			line.style.clipPath = "inset(0 0% 0 0)";
		});
		subtitleLines.forEach((line) => {
			line.style.clipPath = "inset(0 0% 0 0)";
		});
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
		return;
	}

	// Set initial hidden state before animating.
	titleLines.forEach((line) => {
		line.style.clipPath = "inset(0 100% 0 0)";
		line.style.willChange = "clip-path";
	});
	subtitleLines.forEach((line) => {
		line.style.clipPath = "inset(0 100% 0 0)";
		line.style.willChange = "clip-path";
	});
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

	// Animate title lines in sequence.
	const lineControls = animate(
		titleLines,
		{ clipPath: ["inset(0 100% 0 0)", "inset(0 0% 0 0)"] },
		{
			duration: timings.titleDuration,
			ease: "easeOut",
			delay: (index) => index * (timings.titleDuration + timings.titleGap),
		},
	);

	// Subtitle starts after title finishes + small gap.
	const subtitleDelay =
		timings.afterTitleDelay +
		sequenceDuration(titleLines.length, timings.titleDuration, timings.titleGap);

	// Reveal both subtitle lines together.
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

	// Fade in the subtitle wrapper at the same time.
	if (subtitle instanceof HTMLElement) {
		animate(subtitle, { opacity: [0, 1] }, { duration: timings.subtitleDuration, delay: subtitleDelay });
	}

	// Actions follow after subtitle finishes + small gap.
	const actionsDelay =
		subtitleDelay +
		(subtitleLines.length ? timings.subtitleDuration : 0) +
		timings.afterSubtitleDelay;

	// Fade/slide actions in last.
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

	// Clear will-change when title animation completes.
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

document.addEventListener("astro:page-load", runHeroTitleAnimation);
runHeroTitleAnimation();
