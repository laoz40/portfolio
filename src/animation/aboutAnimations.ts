import { animate } from "motion";

const timings = {
	thankYouDuration: 0.3,
	ctaDuration: 0.3,
};

function runAboutActionsAnimation(): void {
	const aboutPage = document.querySelector(".about-page");
	if (!(aboutPage instanceof HTMLElement) || aboutPage.dataset.animated === "true") {
		return;
	}

	const actions = aboutPage.querySelector(".about-actions-reveal");
	const thankYou = aboutPage.querySelector(".about-actions-note-reveal");
	const cta = aboutPage.querySelector(".about-actions-cta-reveal");

	if (
		!(actions instanceof HTMLElement) ||
		!(thankYou instanceof HTMLElement) ||
		!(cta instanceof HTMLElement)
	) {
		return;
	}

	aboutPage.dataset.animated = "true";

	if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) {
		thankYou.style.clipPath = "inset(0 0 0 0)";
		cta.style.opacity = "1";
		cta.style.transform = "translateY(0)";
		return;
	}

	thankYou.style.clipPath = "inset(0 100% 0 0)";
	thankYou.style.willChange = "clip-path";
	cta.style.opacity = "0";
	cta.style.transform = "translateY(-12px)";
	cta.style.willChange = "transform, opacity";

	if (!("IntersectionObserver" in window)) {
		thankYou.style.clipPath = "inset(0 0 0 0)";
		thankYou.style.willChange = "";
		cta.style.opacity = "1";
		cta.style.transform = "translateY(0)";
		cta.style.willChange = "";
		return;
	}

	const observer = new IntersectionObserver(
		(entries, observerInstance) => {
			entries.forEach((entry) => {
					if (!entry.isIntersecting || entry.intersectionRatio < 0.6) {
					return;
				}

				void animate(
					thankYou,
					{ clipPath: ["inset(0 100% 0 0)", "inset(0 0 0 0)"] },
					{ duration: timings.thankYouDuration, ease: "easeOut" },
				).finished.then(() => {
					thankYou.style.willChange = "";
				});

				void animate(
					cta,
					{
						opacity: [0, 1],
						transform: ["translateY(-12px)", "translateY(0px)"],
					},
					{
						duration: timings.ctaDuration,
						ease: "easeOut",
						delay: timings.thankYouDuration,
					},
				).finished.then(() => {
					cta.style.willChange = "";
				});

				observerInstance.unobserve(actions);
			});
		},
			{ threshold: [0.6] },
		);

	observer.observe(actions);
}

document.addEventListener("astro:page-load", runAboutActionsAnimation);
runAboutActionsAnimation();
