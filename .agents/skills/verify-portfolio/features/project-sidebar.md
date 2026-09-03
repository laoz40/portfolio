# Project sidebar

Case study pages expose an "On this page" list built from h2 headings inside `[data-scrollspy-root]`. Links jump to heading ids.

## Sub-features

- `sidebar-list` shows jump links once headings exist.
- `sidebar-stack` still renders the list when the shell drops to one column on small screens.

## How to get to it (user POV)

- Open a case study such as `/projects/checkit`.
- Read the sticky list labeled `On this page` (beside the article on wide screens, above it when the grid collapses).

## Driving it with verify-ui

Preconditions:

- Site is healthy at `http://127.0.0.1:4322`.
- `pnpm verify:ui doctor` reports that URL.

- **Named feature.** Run `pnpm verify:ui drive --feature project-sidebar`. Asserts `nav[aria-label="On this page"]` and writes `project-sidebar-*.png`.
- **One page.** Run `pnpm verify:ui drive --page /projects/sprout --target "nav[aria-label='On this page']" --viewports laptop`. The same landmark exists on other case studies.

## Gotchas

- The aside mounts only after headings are scanned in `onMount`. A screenshot taken before that is empty; the helper waits for visibility.
- Two-column shell starts at 1143px. Laptop 1366 and desktop 1920 are side-by-side. Mobile 390 is stacked; the list must still be visible, not missing.
