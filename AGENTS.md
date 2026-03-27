# AGENTS.md

Astro project with some Svelte components. Motion for complex animations.

## Build/Lint/Test Commands

Use pnpm.

## Code Style Guidelines

### Imports

- Prefer explicit imports; avoid wildcard imports
- Remove unused imports
- Preserve local quote style

### Types

- Keep changes strict-compatible with TypeScript baseline
- Add explicit prop types when logic becomes non-trivial
- Avoid `any` unless unavoidable and justified inline
- Keep types and prop shapes narrow and predictable

### Components and pages

- Prefer reusable components over duplicating complex markup
- Organise components in `src/components/` into subdirectories
- Co-locate component-specific CSS in the same `.astro` file when reasonable
- Use Tailwind CSS v4 (`@tailwindcss/vite`) for general divs & component-local CSS for main/important elements
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

## Agent Working Agreement

When implementing changes:

1. Make the smallest coherent change that solves the task
2. Run relevant checks:
   - `pnpm prettier --check .`
   - `pnpm astro check` for Astro/TS-impacting edits
   - `pnpm build` for integration confidence
3. If checks fail, fix before finishing
4. If you add tests/tooling scripts, update this file
