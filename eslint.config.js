import eslint from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintPluginAstro from "eslint-plugin-astro";
import eslintPluginSvelte from "eslint-plugin-svelte";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
	{ ignores: ["dist/", ".astro/"] },
	eslint.configs.recommended,
	...tseslint.configs.recommended,
	...eslintPluginAstro.configs["flat/recommended"],
	...eslintPluginSvelte.configs.recommended,
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
			},
		},
		rules: {
			// Borrowed from horus oxlint: general JS quality (no type info required).
			eqeqeq: "error",
			"array-callback-return": "error",
			complexity: ["error", { max: 12 }],
			"max-depth": ["error", { max: 3 }],
			"max-lines": ["error", { max: 500 }],
			"no-unused-expressions": "error",
			"no-var": "error",
			"prefer-const": "error",
			"prefer-rest-params": "error",
			"prefer-spread": "error",
			"@typescript-eslint/ban-ts-comment": "error",
			"@typescript-eslint/no-empty-object-type": "error",
			"@typescript-eslint/no-non-null-asserted-optional-chain": "error",
			"@typescript-eslint/prefer-as-const": "error",
		},
	},
	// Astro and Svelte use their own parsers; type-checked rules misparsed their syntax.
	{
		files: ["**/*.{astro,svelte}"],
		extends: [tseslint.configs.disableTypeChecked],
	},
	{
		files: ["**/*.ts"],
		extends: [tseslint.configs.recommendedTypeChecked],
		languageOptions: {
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
		rules: {
			"@typescript-eslint/no-floating-promises": "error",
			"@typescript-eslint/no-misused-promises": "error",
			"@typescript-eslint/switch-exhaustiveness-check": "error",
			"@typescript-eslint/no-unnecessary-condition": "error",
			"@typescript-eslint/no-unnecessary-type-assertion": "error",
		},
	},
	{
		files: ["**/*.svelte"],
		languageOptions: {
			parserOptions: {
				parser: tseslint.parser,
				extraFileExtensions: [".svelte"],
			},
		},
	},
	eslintConfigPrettier,
);
