export type ViewportName = "mobile" | "laptop" | "desktop";

export type FeatureRecipe = {
	page: string;
	screenshot: string;
	visible: string[];
	visibleAt?: Partial<Record<ViewportName, string[]>>;
	hiddenAt?: Partial<Record<ViewportName, string[]>>;
	peekAt: ViewportName[];
	peek: string | undefined;
	openMobileNav: boolean;
	clickName: string | undefined;
};

export const viewports: Record<ViewportName, { width: number; height: number }> = {
	mobile: { width: 390, height: 844 },
	laptop: { width: 1366, height: 768 },
	desktop: { width: 1920, height: 1080 },
};

const framedArt = [
	".hero-sketch-dolphin",
	".hero-sketch-icecream",
	".hero-sketch-penrose",
	".hero-logo-label",
	".hero-logo-ts",
];

export const features: Record<string, FeatureRecipe> = {
	"home-hero": {
		page: "/",
		screenshot: "viewport",
		visible: ["#hero", ".hero-copy", ".hero-actions", ".hero-portrait", ".hero-logo-cluster"],
		visibleAt: { laptop: framedArt, desktop: framedArt },
		hiddenAt: {
			mobile: [".hero-sketch-cluster", ".hero-logo-label", ".hero-logo-ts"],
		},
		peek: "#featured .project-card",
		peekAt: ["laptop", "desktop"],
		openMobileNav: false,
		clickName: undefined,
	},
	nav: {
		page: "/",
		screenshot: "nav",
		visible: ["nav"],
		visibleAt: {
			laptop: ["#site-nav-links"],
			desktop: ["#site-nav-links"],
		},
		peek: undefined,
		peekAt: [],
		openMobileNav: true,
		clickName: undefined,
	},
	"project-carousel": {
		page: "/projects/checkit",
		screenshot: '[aria-label="Project media carousel"]',
		visible: ['[aria-label="Project media carousel"]'],
		peek: undefined,
		peekAt: [],
		openMobileNav: false,
		clickName: "Next slide",
	},
	"project-sidebar": {
		page: "/projects/checkit",
		screenshot: 'nav[aria-label="On this page"]',
		visible: ['nav[aria-label="On this page"]'],
		peek: undefined,
		peekAt: [],
		openMobileNav: false,
		clickName: undefined,
	},
	footer: {
		page: "/",
		screenshot: "[data-footer-root]",
		visible: ["[data-footer-root]"],
		peek: undefined,
		peekAt: [],
		openMobileNav: false,
		clickName: undefined,
	},
};
