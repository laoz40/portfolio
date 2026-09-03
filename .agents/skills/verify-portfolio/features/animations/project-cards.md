# Project cards

The projects index staggers each `.project-card-reveal` up into place, then fades in the about CTA.

## Sub-features

- `cards-hidden` starts every project card and the CTA translated up and at opacity 0.
- `cards-revealed` finishes with cards and CTA at opacity 1 and no leftover translate.
- `cards-reduced` shows that finished state immediately when reduced motion is on.

## How to get to it (user POV)

- Open `/projects` with motion enabled.
- Or open `/projects` with reduced motion.

## Driving it with verify-ui

Preconditions:

- Site is healthy at `http://127.0.0.1:4322`.
- `pnpm verify:ui doctor` reports that URL.

- **Full pass.** Run `pnpm verify:ui animate --feature project-cards`. Command exits 0. Evidence includes `project-cards-*-full.json`, `project-cards-*-full-revealed.png`, and the matching reduced files.
- **Laptop only.** Run `pnpm verify:ui animate --feature project-cards --viewports laptop --motion full`. Cards start hidden in the JSON `initial` phase and are revealed in `revealed`.

## Gotchas

- Wait time scales with card count. Adding or removing a project changes when `revealed` is allowed to fire.
- The heading `.projects-heading-reveal` is not part of this recipe.
- `data-animated` on `.projects-page` means a second pass needs a fresh navigation.
