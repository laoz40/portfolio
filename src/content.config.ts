import { defineCollection, type SchemaContext } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const sectionVariantSchema = z.enum(["featured", "media", "gallery", "carousel", "contentOnly"]);

const imageMediaVariantSchema = z.enum(["taped", "raw"]);

const sectionMediaSchema = ({ image }: SchemaContext) =>
	z.discriminatedUnion("type", [
		z.object({
			type: z.literal("image"),
			variant: imageMediaVariantSchema.optional(),
			image: image(),
			alt: z.string(),
			caption: z.string().optional(),
		}),
		z.object({
			type: z.literal("youtube"),
			url: z.string().url(),
			title: z.string().optional(),
		}),
		z.object({
			type: z.literal("gallery"),
			items: z.array(
				z.object({
					image: image(),
					alt: z.string(),
					caption: z.string().optional(),
				}),
			),
		}),
		z.object({
			type: z.literal("carousel"),
			imageFit: z.enum(["cover", "contain"]).optional(),
			aspectRatio: z.enum(["4:3", "16:9"]).optional(),
			background: z.enum(["default", "black"]).optional(),
			items: z.array(
				z.object({
					image: image(),
					alt: z.string(),
					title: z.string().optional(),
					description: z.string().optional(),
					caption: z.string().optional(),
				}),
			),
		}),
	]);

const sharedSchema = ({ image }: SchemaContext) =>
	z
		.object({
			title: z.string().optional(),
			project: z.string().optional(),
			description: z.string().optional(),
			tools: z.array(z.string()).optional(),
			coverImage: image().optional(),
			section: z
				.object({
					variant: sectionVariantSchema.optional(),
					extraClass: z.string().optional(),
					media: sectionMediaSchema({ image }).optional(),
					links: z
						.array(
							z.object({
								label: z.string(),
								href: z.string().url(),
								fill: z.string(),
							}),
						)
						.optional(),
					ariaLabel: z.string().optional(),
				})
				.optional(),
			inlineGalleries: z
				.array(
					z.object({
						id: z.string(),
						items: z.array(
							z.object({
								image: image(),
								alt: z.string(),
								caption: z.string().optional(),
							}),
						),
					}),
				)
				.optional(),
			inlineImages: z
				.array(
					z.object({
						id: z.string(),
						image: image(),
						alt: z.string(),
						caption: z.string().optional(),
					}),
				)
				.optional(),
			notes: z.array(z.string()).optional(),
		})
		.loose();

function createMarkdownCollection(base: string) {
	return defineCollection({
		loader: glob({ pattern: "**/*.md", base }),
		schema: sharedSchema,
	});
}

const about = createMarkdownCollection("./src/content/about");
const checkit = createMarkdownCollection("./src/content/checkit");
const horus = createMarkdownCollection("./src/content/horus");
const sprout = createMarkdownCollection("./src/content/sprout");
const vvstudios = createMarkdownCollection("./src/content/vvstudios");

export const collections = {
	about,
	checkit,
	horus,
	sprout,
	vvstudios,
};
