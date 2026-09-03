# Home hero

The home hero is a framed first screen: handwritten copy in the center, floating sketches on the left, tool logos on the right, and the VV Studios project card peeking in from the bottom on laptop and desktop.

## Sub-features

- `hero-copy` shows the title, roles, Projects/About buttons, and footer note.
- `hero-left-art` shows the portrait and sketches in the left gutter on laptop and desktop.
- `hero-right-art` shows "Stuff I use" and tool logos in the right gutter on laptop and desktop.
- `hero-peek` shows the featured project card crossing the bottom edge of the viewport.
- `hero-mobile` keeps the portrait and a reduced logo set; sketches and several logos hide on purpose.

## How to get to it (user POV)

- Open `/`.
- Land on the first screen with no scroll.

## Driving it with verify-ui

Preconditions:

- Site is healthy at `http://127.0.0.1:4322`.
- `pnpm verify:ui doctor` reports that URL.
- Layout intent: [references/home-hero.md](../references/home-hero.md).

- **Full pass.** Load `/` at every viewport. Run `pnpm verify:ui drive --feature home-hero`. Command exits 0. Evidence includes `home-hero-mobile.png`, `home-hero-laptop.png`, and `home-hero-desktop.png`.
- **Desktop framing.** Inspect `home-hero-desktop.png` against the reference PNG. Portrait, dolphin, ice cream, penrose, "Stuff I use", and tool logos sit in the gutters and do not cover the title or buttons. The project card peeks at the bottom.
- **Laptop framing.** Inspect `home-hero-laptop.png`. Same framing and peeking rules as desktop.
- **Mobile reductions.** Inspect `home-hero-mobile.png`. Portrait remains. Sketch cluster is gone. TypeScript logo and "Stuff I use" are gone.
- **One region.** Re-check only the hero shell. Run `pnpm verify:ui drive --page / --target "#hero" --viewports desktop`. `#hero` is visible and `target-desktop.png` exists.

## Gotchas

- Home nav fades in unless reduced motion is on. The helper turns reduced motion on. A raw browser pass without that wait will screenshot an invisible nav.
- Peeking is asserted on laptop and desktop only. Mobile hero padding is different; a fully in-view or fully hidden card there is not this feature's fail.
- Penrose, dolphin, and ice cream hide at narrower breakpoints. Treat that as intended, not a regression.
- Laptop height is 768px. Lower-right logos can sit near the fold. The automated pass requires TypeScript and the label, not every logo.
