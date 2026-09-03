export const heroTimings = {
	titleDuration: 0.2,
	titleGap: 0.1,
	afterTitleDelay: 0.5,
	subtitleDuration: 0.1,
	afterSubtitleDelay: 0.3,
	actionsDuration: 0.3,
	heroImagesDuration: 0.8,
	footerNoteDuration: 0.3,
	featuredCardDuration: 0.45,
	featuredCardFadeDuration: 0.12,
	featuredCtaDuration: 0.3,
};

export const projectsTimings = {
	cardDuration: 0.35,
	cardStagger: 0.08,
	ctaDuration: 0.3,
};

export const contactTimings = {
	linkDuration: 0.25,
	linkStagger: 0.08,
	thanksDuration: 0.4,
	thanksDelay: 0.1,
};

export const footerTimings = {
	revealDuration: 0.28,
	revealStagger: 0.3,
};

export const aboutTimings = {
	thankYouDuration: 0.3,
	ctaDuration: 0.3,
};

export function sequenceDuration(count: number, duration: number, gap: number): number {
	return count ? (count - 1) * (duration + gap) + duration : 0;
}

export const motionSlackMs = 200;
export const observerSlackMs = 400;
