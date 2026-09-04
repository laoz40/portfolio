import type { ImageMetadata } from "astro";
import { getEntry, type CollectionKey } from "astro:content";
import type { AstroComponentFactory } from "astro/runtime/server/index.js";

export type SectionVariant = "featured" | "media" | "gallery" | "carousel" | "contentOnly";

export type CarouselItem = {
	image: ImageMetadata;
	alt: string;
	title?: string;
	description?: string;
	caption?: string;
};

export type SectionLink = {
	label: string;
	href: string;
	fill: string;
	target?: string;
	rel?: string;
};

export type SectionMedia =
	| {
			type: "youtube";
			videoId?: string;
			url?: string;
			title?: string;
	  }
	| {
			type: "image";
			variant?: "taped" | "raw";
			image: ImageMetadata;
			alt?: string;
			caption?: string;
	  }
	| {
			type: "gallery";
			items: Array<{
				image: ImageMetadata;
				alt: string;
				caption?: string;
			}>;
	  }
	| {
			type: "carousel";
			imageFit?: "cover" | "contain";
			aspectRatio?: "4:3" | "16:9";
			background?: "default" | "black";
			items: CarouselItem[];
	  };

export type SectionFrontmatter = {
	section?: {
		variant?: SectionVariant;
		extraClass?: string;
		media?: SectionMedia;
		links?: SectionLink[];
		ariaLabel?: string;
	};
};

export type CaseStudySection = {
	Component: AstroComponentFactory;
	variant?: SectionVariant;
	extraClass?: string;
	props?: Record<string, unknown>;
	media?: SectionMedia;
	frontmatter?: SectionFrontmatter;
};

type CreateContentSectionOptions<C extends CollectionKey> = {
	collection: C;
	entryId: string;
	Component: AstroComponentFactory;
	variant?: SectionVariant;
	extraClass?: string;
	props?: Record<string, unknown>;
	media?: SectionMedia;
};

export type ContentFrontmatter = SectionFrontmatter & {
	title?: string;
	project?: string;
	description?: string;
	coverImage?: ImageMetadata;
	altText?: string;
};

export type ContentSectionResult = {
	frontmatter: ContentFrontmatter;
	section: CaseStudySection;
};

export function getImageMediaAlt(media?: SectionMedia): string | undefined {
	return media?.type === "image" ? media.alt : undefined;
}

export const createContentSection = async <C extends CollectionKey>({
	collection,
	entryId,
	Component,
	variant,
	extraClass,
	props,
	media,
}: CreateContentSectionOptions<C>): Promise<ContentSectionResult> => {
	const entry = await getEntry(collection, entryId);

	if (!entry) {
		throw new Error(`Missing ${entryId} entry for: ${collection}`);
	}

	const frontmatter = entry.data as ContentFrontmatter;

	return {
		frontmatter,
		section: {
			Component,
			variant,
			extraClass,
			props,
			media,
			frontmatter,
		},
	};
};
