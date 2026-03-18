import type { ImageMetadata } from "astro";
import {
	getEntry,
	type CollectionEntry,
	type DataCollectionKey,
} from "astro:content";
import type { AstroComponentFactory } from "astro/runtime/server/index.js";

export type SectionVariant =
	| "featured"
	| "media"
	| "gallery"
	| "carousel"
	| "contentOnly";

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
	carouselItems?: CarouselItem[];
	frontmatter?: SectionFrontmatter;
};

type CreateContentSectionOptions<C extends DataCollectionKey> = {
	collection: C;
	entryId: string;
	Component: AstroComponentFactory;
	variant?: SectionVariant;
	extraClass?: string;
	props?: Record<string, unknown>;
	media?: SectionMedia;
	carouselItems?: CarouselItem[];
};

export type ContentSectionResult<C extends DataCollectionKey> = {
	frontmatter: CollectionEntry<C>["data"];
	section: CaseStudySection;
};

export const createContentSection = async <C extends DataCollectionKey>({
	collection,
	entryId,
	Component,
	variant,
	extraClass,
	props,
	media,
	carouselItems,
}: CreateContentSectionOptions<C>): Promise<ContentSectionResult<C>> => {
	const entry = await getEntry(collection, entryId);

	if (!entry) {
		throw new Error(`Missing ${entryId} entry for: ${collection}`);
	}

	const frontmatter = entry.data as CollectionEntry<C>["data"] &
		SectionFrontmatter;

	return {
		frontmatter,
		section: {
			Component,
			variant,
			extraClass,
			props,
			media,
			carouselItems,
			frontmatter,
		},
	};
};
