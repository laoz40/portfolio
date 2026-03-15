import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const sharedSchema = ({ image }) =>
	z
		.object({
			title: z.string().optional(),
			project: z.string().optional(),
			description: z.string().optional(),
			tools: z.array(z.string()).optional(),
			githubUrl: z.string().url().optional(),
			websiteUrl: z.string().url().optional(),
			coverImage: image().optional(),
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
