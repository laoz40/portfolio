# About actions

The about page thank-you line wipes in after the actions block is scrolled into view, then the projects CTA fades up.

## Sub-features

- `about-hidden` starts the thank-you line clipped from the right and the CTA at opacity 0.
- `about-revealed` finishes both after scrolling `.about-actions-reveal` into view.
- `about-reduced` shows the finished styles immediately when reduced motion is on.

## How to get to it (user POV)

- Open `/about` and scroll to the bottom with motion enabled.
- Or open `/about` with reduced motion.

## Driving it with verify-ui

Preconditions:

- Site is healthy at `http://127.0.0.1:4322`.
- `pnpm verify:ui doctor` reports that URL.

- **Full pass.** Run `pnpm verify:ui animate --feature about-actions`. Command exits 0. Evidence includes `about-actions-*-full.json`, `about-actions-*-full-revealed.png`, and the matching reduced files.
- **Desktop only.** Run `pnpm verify:ui animate --feature about-actions --viewports desktop --motion full`. JSON `initial` is hidden. `revealed` is visible after scroll.

## Gotchas

- IntersectionObserver uses a 0.6 threshold. A screenshot taken before the actions block is mostly on screen will still be in the hidden state.
- `data-animated` on `.about-page` is set on load, before the scroll reveal runs.
- About body sections are not part of this recipe.
