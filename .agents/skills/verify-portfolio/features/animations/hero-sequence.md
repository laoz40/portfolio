# Hero sequence

The home hero plays a timed load sequence: title lines wipe in, then roles, then Projects/About buttons and the hero note (together with the side-image clip), then the featured project card slides up. The "See more projects" CTA waits until it is scrolled into view.

## Sub-features

- `hero-hidden` starts title, roles, actions, images, note, featured card, and CTA in their hidden styles.
- `after-title` shows the welcome wipe finished while roles and everything below are still hidden.
- `after-roles` shows roles visible while buttons, images, note, and card are still hidden.
- `after-actions` shows buttons and the hero note visible while side images and the card are still hidden or not finished.
- `after-images` shows side images and note visible while the featured card is still off-screen.
- `hero-done` finishes the load sequence with the card revealed. The CTA stays hidden until it is on screen.
- `hero-cta` reveals the featured CTA after scrolling it into view.
- `hero-reduced` shows the final styles immediately when reduced motion is on, including the CTA.

## How to get to it (user POV)

- Open `/` with motion enabled and wait through the first-screen sequence.
- Scroll down to the featured project CTA.
- Or open `/` with reduced motion and see the finished hero with no sequence.

## Driving it with verify-ui

Preconditions:

- Site is healthy at `http://127.0.0.1:4322`.
- `pnpm verify:ui doctor` reports that URL.

- **Full pass.** Run `pnpm verify:ui animate --feature hero-sequence`. Command exits 0. Evidence includes phase JSON (`initial`, `after-title`, `after-roles`, `after-actions`, `after-images`, `hero-done`, `cta`) plus matching `*-full-*.png` screenshots and `*-reduced.json`.
- **Full motion only.** Run `pnpm verify:ui animate --feature hero-sequence --motion full --viewports desktop`. Each timed phase asserts the beat that should have finished and the beats that should still be hidden.
- **Reduced motion only.** Run `pnpm verify:ui animate --feature hero-sequence --motion reduced --viewports desktop`. Probe styles are already revealed, including the CTA.

## Gotchas

- `drive --feature home-hero` turns reduced motion on and does not prove this sequence.
- Phase times are derived from `src/animation/timings.ts` and assume two title lines. Changing line count or timings requires updating the recipe constants.
- Buttons, side images, and the hero note all start at the same delay in code. The note is checked at `after-actions`, not after images.
- The featured card peeks on laptop and desktop. The CTA sits below it and must stay hidden until the `cta` phase scrolls.
- `data-animated` on `#hero` means a second pass needs a fresh navigation.
