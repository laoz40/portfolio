import { animate } from "motion";

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

	if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) {
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

	if (!("IntersectionObserver" in window)) {
		cards.forEach((card) => {
			card.style.transform = "translateY(0)";
			card.style.opacity = "1";
			card.style.willChange = "";
		});
		if (cta instanceof HTMLElement) {
			cta.style.transform = "translateY(0)";
			cta.style.opacity = "1";
			cta.style.willChange = "";
		}
		return;
	}

	const cardObserver = new IntersectionObserver(
		(entries, observer) => {
			const enteringCards = entries
				.filter(
					(entry) =>
						entry.isIntersecting &&
						entry.intersectionRatio >= 0.2 &&
						entry.target instanceof HTMLElement,
				)
				.map((entry) => entry.target)
				.filter((target): target is HTMLElement => target instanceof HTMLElement)
				.sort((a, b) => cards.indexOf(a) - cards.indexOf(b));

			enteringCards.forEach((card, index) => {
				const delay = enteringCards.length > 1 ? index * timings.cardStagger : 0;

				void animate(
					card,
					{
						transform: ["translateY(-18px)", "translateY(0px)"],
						opacity: [0, 1],
					},
					{ duration: timings.cardDuration, ease: "easeOut", delay },
				).finished.then(() => {
					card.style.willChange = "";
				});

				observer.unobserve(card);
			});
		},
		{ threshold: [0.2] },
	);

	cards.forEach((card) => {
		cardObserver.observe(card);
	});

	if (cta instanceof HTMLElement) {
		const ctaObserver = new IntersectionObserver(
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
							transform: ["translateY(-14px)", "translateY(0px)"],
							opacity: [0, 1],
						},
						{ duration: timings.ctaDuration, ease: "easeOut" },
					).finished.then(() => {
						target.style.willChange = "";
					});

					observer.unobserve(target);
				});
			},
			{ threshold: [0.6] },
		);

		ctaObserver.observe(cta);
	}
}

document.addEventListener("astro:page-load", runProjectsAnimations);
runProjectsAnimations();
