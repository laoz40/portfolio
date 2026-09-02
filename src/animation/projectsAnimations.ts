import { animate } from "motion";
import { prefersReducedMotion } from "./motionPreferences";

const timings = {
	cardDuration: 0.35,
	cardStagger: 0.08,
	ctaDuration: 0.3,
};

const selectors = {
	page: ".projects-page",
	card: ".project-card-reveal",
	cta: ".projects-cta-reveal",
};

function runProjectsAnimations(): void {
	const page = document.querySelector(selectors.page);
	if (!(page instanceof HTMLElement) || page.dataset.animated === "true") {
		return;
	}

	const cta = page.querySelector(selectors.cta);
	const cards = Array.from(page.querySelectorAll(selectors.card)).filter(
		(card): card is HTMLElement => card instanceof HTMLElement,
	);

	if (!(cta instanceof HTMLElement) && cards.length === 0) {
		return;
	}

	page.dataset.animated = "true";

	if (prefersReducedMotion()) {
		cards.forEach((card) => {
			card.style.transform = "translateY(0)";
			card.style.opacity = "1";
		});
		if (cta instanceof HTMLElement) {
			cta.style.transform = "translateY(0)";
			cta.style.opacity = "1";
		}
		return;
	}

	cards.forEach((card) => {
		card.style.transform = "translateY(-18px)";
		card.style.opacity = "0";
		card.style.willChange = "transform, opacity";
	});

	if (cta instanceof HTMLElement) {
		cta.style.transform = "translateY(-14px)";
		cta.style.opacity = "0";
		cta.style.willChange = "transform, opacity";
	}

	cards.forEach((card, index) => {
		void animate(
			card,
			{
				transform: ["translateY(-18px)", "translateY(0px)"],
				opacity: [0, 1],
			},
			{ duration: timings.cardDuration, ease: "easeOut", delay: index * timings.cardStagger },
		).finished.then(() => {
			card.style.willChange = "";
		});
	});

	if (cta instanceof HTMLElement) {
		void animate(
			cta,
			{
				transform: ["translateY(-14px)", "translateY(0px)"],
				opacity: [0, 1],
			},
			{ duration: timings.ctaDuration, ease: "easeIn", delay: cards.length * timings.cardStagger },
		).finished.then(() => {
			cta.style.willChange = "";
		});
	}
}

document.addEventListener("astro:page-load", runProjectsAnimations);
runProjectsAnimations();
