// @ts-check
import { defineConfig } from "astro/config";
import svelte from "@astrojs/svelte";
import sitemap from "@astrojs/sitemap";

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
	site: "https://leozhou.cc",
	server: {
		host: "127.0.0.1",
	},

	vite: {
		plugins: [tailwindcss()],
		server: {
			allowedHosts: [".ts.net"],
		},
	},

	integrations: [svelte(), sitemap()],
});
