# AGENTS.md

This is portfolio website. Main aesthetic is scrapbook style (paper texture background, handwritten text, sticky taped images).

## Stack

- Astro, with some Svelte components for complex parts.
  - Built in Astro to prioritise performance and SEO. Want to have super low bundle size.
  - Goal is to keep site blazingly fast and accessible.
  - One of the most important things it to keep the site responsive. Many people may see it on mobile.
- Motion for complex animations, because want it to look pleasing and interesting.
- Markdown files are how I want to structure all content for each project e.g. text, images, layout of each section
  - Good way to keep content organised and easy to maintain.
  - Each project loops through all markdown files in a dir and builds a page, where each file becomes a section.
  - Sections can include title, media, text in different layouts.
  - Media (mostly images) can be inline, inline grid, to the side or carousel.
  - Section variant/styling, images, text, links are defined in the markdown frontmatter.
- pnpm

## File/Change Hygiene

- Before adding helper functions, check if similar function already exist in codebase
- Do not make tiny helper files/functions for one-off logic

- format, lint and typecheck once changes are complete
- do not run build unless asked

## Behaviour

- Strive for the simplest solution possible.
- If problem can be solved in simpler way, propose it
- Always apply YAGNI principle

## Code Style Guidelines

### Components and pages

- Prefer reusable components over duplicating complex markup
- Organise components in `src/components/` into subdirectories

### Accessibility and UX

- Preserve semantic HTML
- Add `aria-label` when visible text is not sufficiently descriptive
- Keep hover/focus behavior keyboard-accessible
- Respect `prefers-reduced-motion`

### Tailwind

- Avoid arbitrary values: clamp, min(...), custom pixel brackets, and custom breakpoints.
- Use theme-token color utilities (background, foreground, primary, etc.) over standard palette classes (white, gray, black).
- Do not add classes that already exist in the parent component
