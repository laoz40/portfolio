# Project carousel

Case study carousels show a taped media frame with slides, previous/next controls, and dot indicators. Check It is the default drive page because its showcase section uses this carousel.

## Sub-features

- `carousel-visible` shows the media viewport on a case study section.
- `carousel-next` advances from slide 1 with `Next slide`.
- `carousel-region` can be targeted by heading id when only one section changed.

## How to get to it (user POV)

- Open `/projects/checkit`.
- Scroll to the showcase section whose heading becomes `#project-showcase` (sidebar slug from the h2 text).
- Other case studies with `section.variant: carousel` use the same chrome.

## Driving it with verify-ui

Preconditions:

- Site is healthy at `http://127.0.0.1:4322`.
- `pnpm verify:ui doctor` reports that URL.

- **Named feature.** Run `pnpm verify:ui drive --feature project-carousel`. The helper loads Check It, asserts `[aria-label="Project media carousel"]`, clicks `Next slide`, and screenshots the carousel at each viewport.
- **One section.** After editing a specific block, run `pnpm verify:ui drive --page /projects/checkit --target "#project-showcase" --viewports mobile,desktop`. The heading section is visible and `target-*.png` files exist.

## Gotchas

- Heading ids are slugified from h2 text at runtime. If the heading copy changes, the id changes.
- Single-slide carousels disable previous/next. Check It has multiple slides; a one-slide section is a different proof.
- Carousel images lazy-load. If a screenshot is empty, wait for the frame and retry the same command.
