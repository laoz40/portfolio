import type { ImageMetadata } from "astro";
import type {
	CarouselItem,
	CaseStudySection,
	SectionLink,
	SectionMedia,
} from "./caseStudySections";

function getYouTubeVideoId(url: string): string | undefined {
	try {
		const parsedUrl = new URL(url);
		const shortCode = parsedUrl.hostname === "youtu.be" ? parsedUrl.pathname.slice(1) : undefined;

		if (shortCode) {
			return shortCode;
		}

		const embedCode = parsedUrl.pathname.match(/^\/embed\/([^/?#]+)/)?.[1];

		if (embedCode) {
			return embedCode;
		}

		return parsedUrl.searchParams.get("v") ?? undefined;
	} catch {
		return undefined;
	}
}

function resolveSectionMedia(
	explicitMedia?: SectionMedia,
	frontmatterMedia?: SectionMedia,
): SectionMedia | undefined {
	const media = explicitMedia ?? frontmatterMedia;

	if (!media) {
		return undefined;
	}

	if (media.type === "youtube") {
		const videoId = media.videoId ?? (media.url ? getYouTubeVideoId(media.url) : undefined);

		if (!videoId) {
			return undefined;
		}

		return {
			...media,
			videoId,
		};
	}

	return media;
}

function getCarouselItems(resolvedMedia?: SectionMedia): CarouselItem[] {
	if (resolvedMedia?.type === "carousel" && resolvedMedia.items.length > 0) {
		return resolvedMedia.items;
	}

	return [];
}

type InlineGalleryData = {
	id: string;
	items: Array<{
		image: ImageMetadata;
		alt: string;
		caption?: string;
	}>;
};

type InlineImageData = {
	id: string;
	image: {
		src: string;
		width: number;
		height: number;
	};
	alt: string;
	caption?: string;
};

type SectionFrontmatterExtras = {
	links?: SectionLink[];
	ariaLabel?: string;
	extraClass?: string;
	media?: SectionMedia;
	variant?: CaseStudySection["variant"];
};

type SectionContentFrontmatter = {
	section?: SectionFrontmatterExtras;
	inlineGalleries?: InlineGalleryData[];
	inlineImages?: InlineImageData[];
};

type SectionMediaKind = "none" | "carousel" | "video" | "image";

export type ResolvedSectionData = {
	variant: NonNullable<CaseStudySection["variant"]>;
	sectionClass: string | undefined;
	sectionProps: Record<string, unknown>;
	sectionLinks: SectionLink[];
	linksAriaLabel: string | undefined;
	inlineGalleries: InlineGalleryData[];
	inlineImages: InlineImageData[];
	carouselItems: ReturnType<typeof getCarouselItems>;
	carouselImageFit: "cover" | "contain";
	carouselAspectRatio: "4:3" | "16:9";
	carouselBackground: "default" | "black";
	mediaKind: SectionMediaKind;
	imageMedia: Extract<SectionMedia, { type: "image" }> | undefined;
	videoMedia: Extract<SectionMedia, { type: "youtube" }> | undefined;
};

function getSectionFrontmatter(section: CaseStudySection): SectionContentFrontmatter {
	return section.frontmatter ?? {};
}

function getSectionVariant(
	section: CaseStudySection,
	frontmatterSection?: SectionFrontmatterExtras,
): NonNullable<CaseStudySection["variant"]> {
	return section.variant ?? frontmatterSection?.variant ?? "contentOnly";
}

function getMediaKind(
	variant: NonNullable<CaseStudySection["variant"]>,
	resolvedMedia?: SectionMedia,
): SectionMediaKind {
	if (variant === "contentOnly") {
		return "none";
	}

	if (variant === "carousel") {
		return "carousel";
	}

	if (resolvedMedia?.type === "youtube") {
		return "video";
	}

	if (resolvedMedia?.type === "image") {
		return "image";
	}

	return "none";
}

function getCarouselRenderConfig(
	resolvedMedia?: SectionMedia,
): Pick<
	ResolvedSectionData,
	"carouselItems" | "carouselImageFit" | "carouselAspectRatio" | "carouselBackground"
> {
	if (resolvedMedia?.type !== "carousel") {
		return {
			carouselItems: [],
			carouselImageFit: "cover",
			carouselAspectRatio: "4:3",
			carouselBackground: "default",
		};
	}

	return {
		carouselItems: getCarouselItems(resolvedMedia),
		carouselImageFit: resolvedMedia.imageFit ?? "cover",
		carouselAspectRatio: resolvedMedia.aspectRatio ?? "4:3",
		carouselBackground: resolvedMedia.background ?? "default",
	};
}

function getSectionContentState(
	section: CaseStudySection,
	frontmatter: SectionContentFrontmatter,
): Pick<
	ResolvedSectionData,
	| "sectionClass"
	| "sectionProps"
	| "sectionLinks"
	| "linksAriaLabel"
	| "inlineGalleries"
	| "inlineImages"
> {
	const frontmatterSection = frontmatter.section;

	return {
		sectionClass: section.extraClass ?? frontmatterSection?.extraClass,
		sectionProps: section.props ?? {},
		sectionLinks: frontmatterSection?.links ?? [],
		linksAriaLabel: frontmatterSection?.ariaLabel,
		inlineGalleries: frontmatter.inlineGalleries ?? [],
		inlineImages: frontmatter.inlineImages ?? [],
	};
}

function getResolvedMediaState(
	variant: NonNullable<CaseStudySection["variant"]>,
	resolvedMedia?: SectionMedia,
): Pick<ResolvedSectionData, "mediaKind" | "imageMedia" | "videoMedia"> {
	return {
		mediaKind: getMediaKind(variant, resolvedMedia),
		videoMedia: resolvedMedia?.type === "youtube" ? resolvedMedia : undefined,
		imageMedia: resolvedMedia?.type === "image" ? resolvedMedia : undefined,
	};
}

export function getSectionRenderState(section: CaseStudySection): ResolvedSectionData {
	const frontmatter = getSectionFrontmatter(section);
	const frontmatterSection = frontmatter.section;
	const variant = getSectionVariant(section, frontmatterSection);
	const resolvedMedia = resolveSectionMedia(section.media, frontmatterSection?.media);

	return {
		variant,
		...getSectionContentState(section, frontmatter),
		...getCarouselRenderConfig(resolvedMedia),
		...getResolvedMediaState(variant, resolvedMedia),
	};
}
