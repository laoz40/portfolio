# AGENTS.md

Practical instructions for coding agents operating in this repository.

## Project Snapshot

- Framework: Astro 5 (`astro`)
- UI runtime: Astro components (`.astro`)
- Styling: Tailwind CSS v4 (`@tailwindcss/vite`) + component-local CSS
- TypeScript baseline: `astro/tsconfigs/strict`
- Package manager: pnpm (`pnpm-lock.yaml` present)
- Primary references: `package.json`, `astro.config.mjs`, `tsconfig.json`, `.prettierrc`, `src/`

## Build/Lint/Test Commands

Run all commands from repository root.

### Install

- `pnpm install`

### Develop

- `pnpm dev`
- Starts Astro dev server at `http://localhost:4321`

### Build + Preview

- `pnpm build`
- Output directory: `dist/`
- `pnpm preview`

### Astro CLI

- `pnpm astro -- --help`
- `pnpm astro <command>`

### Typecheck / diagnostics

- `pnpm astro check`
- Run before commits touching `.astro`, `.jsx`, `.ts`, or config files

### Formatting / linting

- ESLint is not configured in this repository right now
- Formatting uses Prettier + `prettier-plugin-astro`
- Check formatting: `pnpm prettier --check .`
- Fix formatting: `pnpm prettier --write .`

## Repository Structure

- Pages: `src/pages/`
- Layouts: `src/layouts/`
- Components: `src/components/`
- Global styles: `src/styles/global.css`
- Long-form content: `src/content/**` markdown files

Naming patterns used now:

- Astro components: `PascalCase.astro`
- Components: `PascalCase.astro`
- Route pages: lowercase names (example: `about.astro`, `projects.astro`)
- Nested routes by folder (example: `src/pages/projects/sprout.astro`)

## Code Style Guidelines

### Formatting (authoritative)

Use `.prettierrc` as source of truth:

- `useTabs: true`
- `tabWidth: 2`
- `printWidth: 80`
- `semi: true`
- `trailingComma: all`
- `singleQuote: false`
- `singleAttributePerLine: true`
- Astro parser via `prettier-plugin-astro`

Do not hand-format against these rules; run Prettier.

### Imports

- Keep imports at top of `.astro` frontmatter (`---`)
- Prefer explicit imports; avoid wildcard imports
- Use relative import style consistent with neighboring files
- Remove unused imports
- Preserve local quote style

### Types

- Keep changes strict-compatible with TypeScript baseline
- Add explicit prop types when logic becomes non-trivial
- Avoid `any` unless unavoidable and justified inline
- Keep types and prop shapes narrow and predictable

### Naming

- `PascalCase` for components and component files
- `camelCase` for variables and functions
- Lowercase route filenames for URL clarity
- Use descriptive constants (avoid vague names)
- Keep markdown frontmatter keys consistent with existing content files

### Components and pages

- Prefer reusable components over duplicating complex markup
- Co-locate component-specific CSS in the same `.astro` file when reasonable
- Use `src/styles/global.css` only for truly global concerns
- Preserve existing responsive behavior and breakpoints

### Error handling / defensive coding

For browser scripts and UI logic:

- Use guard clauses early
- Check API support before use
- Null-check DOM lookups
- Make init code idempotent for Astro transitions/page-load events
- Fail soft for non-critical enhancements

### Accessibility and UX

- Preserve semantic HTML
- Add `aria-label` when visible text is not sufficiently descriptive
- Keep hover/focus behavior keyboard-accessible
- Respect `prefers-reduced-motion`
- Do not rely on motion alone for critical meaning

## Agent Working Agreement

When implementing changes:

1. Read nearby files first and follow local patterns
2. Make the smallest coherent change that solves the task
3. Run relevant checks:
   - `pnpm prettier --check .`
   - `pnpm astro check` for Astro/TS-impacting edits
   - `pnpm build` for integration confidence
4. If checks fail, fix before finishing
5. If you add tests/tooling scripts, update this file
6. Do not invent commands not configured in this repository
