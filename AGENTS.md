# AGENTS.md

Astro project with some Svelte components. Motion for complex animations.

## Build/Lint/Test Commands

Use pnpm.

## Code Style Guidelines

### Types

- Avoid `any` unless unavoidable and justified inline

### Components and pages

- Prefer reusable components over duplicating complex markup
- Organise components in `src/components/` into subdirectories
- Use Tailwind CSS v4 (`@tailwindcss/vite`) for general divs & component-local CSS for main/important elements
- Use `src/styles/global.css` only for truly global concerns
- Preserve existing responsive behavior and breakpoints

### Accessibility and UX

- Preserve semantic HTML
- Add `aria-label` when visible text is not sufficiently descriptive
- Keep hover/focus behavior keyboard-accessible
- Respect `prefers-reduced-motion`

## Agent Working Agreement

Prefer the simplest solution possible.
