# Home hero reference

Baseline screenshot: [home-hero-desktop-1080p.png](./home-hero-desktop-1080p.png)

Captured at desktop 1080p. Use as the visual reference for the hero layout, not for pixel-diff comparison.

## Viewports

| Name    | Size      | Notes           |
| ------- | --------- | --------------- |
| mobile  | 390×844   | iPhone 12 class |
| laptop  | 1366×768  | common laptop   |
| desktop | 1920×1080 | 1080p           |

No tablet breakpoint.

## Page and targets

- **URL:** `/`
- **Section:** `#hero`
- **Left art:** `.hero-art-cluster` (portrait + sketches)
- **Right art:** `.hero-logo-cluster` ("Stuff I use" + tool logos)
- **Center copy:** `.hero-copy`, `.hero-actions`, `.hero-footer`
- **Peeking card:** `#featured .project-card` (VV Studios featured project)

## Layout intent (desktop / laptop)

The hero is a framed composition: floating hand-drawn art on both sides, centered copy in the middle.

**Left side (`.hero-art-cluster`):**

- Portrait sketch visible top-left, framing the hero copy.
- Dolphin and ice cream sketches visible below the portrait.
- Penrose triangle visible lower-left (hidden below 820px).

**Right side (`.hero-logo-cluster`):**

- "Stuff I use" label visible.
- Tool logos visible in a loose vertical stack: TypeScript, Next.js, React, CSS3, Figma.
- Logos sit in the right gutter and frame the center, not overlapping the title or buttons.

**Center:**

- "Welcome to Leo's Website!" title, role lines, Projects/About buttons, and the hand-drawn footer note are centered and readable.
- Side art must not obscure the title or CTAs.

## Peeking project card

On first load (no scroll), the featured VV Studios project card should peek in from below the fold.

- The top of `.project-card` (tape + preview image) is visible at the bottom edge of the viewport.
- Most of the card sits below the fold, inviting scroll.
- The card is horizontally centered under the hero.

A broken state: card fully off-screen, card fully on-screen with no peek, or card overlapping hero copy.

## Mobile differences (expected, not broken)

At 820px and below, some desktop-only art is intentionally hidden:

- Penrose triangle hidden.
- "Stuff I use", TypeScript, and CSS logos hidden.
- Portrait moves up; hero copy gets extra top padding.

At 640px and below:

- Sketch cluster (dolphin, ice cream) hidden.
- Fewer logos on the right (React, Next.js, Figma remain).

Verify visibility against these breakpoints, not the desktop baseline.

## Checks to automate later

1. `.hero-portrait` visible with width and height > 0.
2. `.hero-logo-cluster` visible; at desktop, `.hero-logo-ts` and `.hero-logo-label` visible.
3. `.hero-copy` visible; no horizontal overflow on `document.documentElement`.
4. Featured `.project-card` intersects the viewport bottom: `getBoundingClientRect().top < innerHeight` and `getBoundingClientRect().bottom > innerHeight`.
5. Screenshot `#hero` plus a viewport screenshot showing the peeking card.

## Source files

- `src/pages/index.astro`
- `src/components/home/HeroSketchCluster.astro`
- `src/components/home/HeroLogoCluster.astro`
