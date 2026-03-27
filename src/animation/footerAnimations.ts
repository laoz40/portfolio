import { animate } from "motion";

const timings = {
	revealDuration: 0.28,
	revealStagger: 0.3,
};

function syncFooterYear(): void {
	const currentYearTargets = document.querySelectorAll("[data-current-year]");

	if (currentYearTargets.length === 0) {
		return;
	}

	const currentYear = new Date().toLocaleDateString(undefined, {
		year: "numeric",
	});

	currentYearTargets.forEach((target) => {
		target.textContent = currentYear;
	});
}

function getFooterRevealItems(footerRoot: HTMLElement): HTMLElement[] {
	const cta = footerRoot.querySelector(".footer-cta-reveal");
	const buttons = Array.from(footerRoot.querySelectorAll(".footer-link-reveal"));
	const copyright = footerRoot.querySelector(".footer-copyright-reveal");
	const note = footerRoot.querySelector(".footer-note-reveal");

	return [cta, ...buttons, copyright, note].filter(
		(item): item is HTMLElement => item instanceof HTMLElement,
	);
}

function runFooterRevealAnimation(): void {
	const footerRoot = document.querySelector("[data-footer-root]");

	if (!(footerRoot instanceof HTMLElement)) {
		return;
	}

	if (footerRoot.dataset.animReady === "true") {
		return;
	}

	footerRoot.dataset.animReady = "true";
	const revealItems = getFooterRevealItems(footerRoot);

	if (revealItems.length === 0) {
		return;
	}

	const showFinalState = () => {
		revealItems.forEach((item) => {
			item.style.clipPath = "inset(0 0 0 0)";
			item.style.willChange = "";
		});
	};

	if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) {
		showFinalState();
		return;
	}

	revealItems.forEach((item) => {
		item.style.clipPath = "inset(0 100% 0 0)";
		item.style.willChange = "clip-path";
	});

	if (!("IntersectionObserver" in window)) {
		showFinalState();
		return;
	}

	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (!entry.isIntersecting) {
					return;
				}

				const controls = animate(
					revealItems,
					{ clipPath: ["inset(0 100% 0 0)", "inset(0 0 0 0)"] },
					{
						duration: timings.revealDuration,
						ease: "easeOut",
						delay: (index) => index * timings.revealStagger,
					},
				);

				void controls.finished.then(() => {
					revealItems.forEach((item) => {
						item.style.willChange = "";
					});
				});

				observer.disconnect();
			});
		},
		{
			threshold: 0.25,
			rootMargin: "0px 0px -8% 0px",
		},
	);

	observer.observe(footerRoot);
}

function runFooterUi(): void {
	syncFooterYear();
	runFooterRevealAnimation();
}

document.addEventListener("astro:page-load", runFooterUi);
runFooterUi();
