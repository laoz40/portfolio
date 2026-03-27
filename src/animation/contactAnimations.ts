import { animate } from "motion";

const timings = {
	linkDuration: 0.25,
	linkStagger: 0.08,
	thanksDuration: 0.4,
	thanksDelay: 0.1,
};

function runContactAnimations(): void {
	const contactPage = document.querySelector(".contact-page");
	if (!(contactPage instanceof HTMLElement) || contactPage.dataset.animated === "true") {
		return;
	}

	const linkItems = Array.from(contactPage.querySelectorAll(".contact-link-reveal")).filter(
		(item): item is HTMLElement => item instanceof HTMLElement,
	);
	const thanks = contactPage.querySelector(".contact-thanks-reveal");

	if (linkItems.length === 0 && !(thanks instanceof HTMLElement)) {
		return;
	}

	contactPage.dataset.animated = "true";

	if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) {
		linkItems.forEach((item) => {
			item.style.transform = "translateY(0)";
			item.style.opacity = "1";
		});
		if (thanks instanceof HTMLElement) {
			thanks.style.clipPath = "inset(0 0 0 0)";
		}
		return;
	}

	linkItems.forEach((item) => {
		item.style.transform = "translateY(-14px)";
		item.style.opacity = "0";
		item.style.willChange = "transform, opacity";
	});

	if (thanks instanceof HTMLElement) {
		thanks.style.clipPath = "inset(0 100% 0 0)";
		thanks.style.willChange = "clip-path";
	}

	linkItems.forEach((item, index) => {
		void animate(
			item,
			{
				transform: ["translateY(-14px)", "translateY(0px)"],
				opacity: [0, 1],
			},
			{
				duration: timings.linkDuration,
				ease: "easeIn",
				delay: index * timings.linkStagger,
			},
		).finished.then(() => {
			item.style.willChange = "";
		});
	});

	if (thanks instanceof HTMLElement) {
		const thanksDelay =
			(linkItems.length ? (linkItems.length - 1) * timings.linkStagger + timings.linkDuration : 0) +
			timings.thanksDelay;
		void animate(
			thanks,
			{ clipPath: ["inset(0 100% 0 0)", "inset(0 0 0 0)"] },
			{ duration: timings.thanksDuration, ease: "easeIn", delay: thanksDelay },
		).finished.then(() => {
			thanks.style.willChange = "";
		});
	}
}

document.addEventListener("astro:page-load", runContactAnimations);
runContactAnimations();
