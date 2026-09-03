# Footer reveal

The site footer clips in from the right after it crosses into view: CTA, optional Email/LinkedIn, copyright, then the typeface note.

## Sub-features

- `footer-hidden` starts those reveal nodes clipped from the right while the footer is offscreen.
- `footer-revealed` finishes the stagger after scrolling `[data-footer-root]` into view.
- `footer-reduced` shows the finished clip immediately when reduced motion is on.

## How to get to it (user POV)

- Load `/` and scroll to the bottom with motion enabled.
- Or load `/` with reduced motion and scroll to the footer already unclipped.

## Driving it with verify-ui

Preconditions:

- Site is healthy at `http://127.0.0.1:4322`.
- `pnpm verify:ui doctor` reports that URL.

- **Full pass.** Run `pnpm verify:ui animate --feature footer-reveal`. Command exits 0. Evidence includes `footer-reveal-*-full.json`, `footer-reveal-*-full-revealed.png`, and the matching reduced files.
- **Full motion only.** Run `pnpm verify:ui animate --feature footer-reveal --motion full --viewports laptop`. JSON `initial` is clipped. `revealed` is unclipped after scroll.

## Gotchas

- `drive --feature footer` turns reduced motion on and only checks layout.
- This recipe loads `/` so the footer starts offscreen. `/contact` can put the footer in view on load and skip the hidden sample.
- Email and LinkedIn render only when env is set. Missing those nodes is not a fail.
- `data-anim-ready` on `[data-footer-root]` means a second pass needs a fresh navigation.
