import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const sectionVariantSchema = z.enum([
	"featured",
	"media",
	"gallery",
	"carousel",
	"contentOnly",
]);

const sectionMediaSchema = ({ image }) =>
	z.discriminatedUnion("type", [
		z.object({
			type: z.literal("image"),
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

const sharedSchema = ({ image }) =>
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
			notes: z.array(z.string()).optional(),
		})
		.passthrough();

const about = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./src/content/about" }),
	schema: sharedSchema,
});

const checkit = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./src/content/checkit" }),
	schema: sharedSchema,
});

const horus = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./src/content/horus" }),
	schema: sharedSchema,
});

const sprout = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./src/content/sprout" }),
	schema: sharedSchema,
});

const vvstudios = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./src/content/vvstudios" }),
	schema: sharedSchema,
});

export const collections = {
	about,
	checkit,
	horus,
	sprout,
	vvstudios,
};
