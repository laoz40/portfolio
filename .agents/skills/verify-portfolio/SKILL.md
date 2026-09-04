---
name: verify-portfolio
description: Verify site UI or Motion animation changes. Use after making large adjustments to the site UI or advanced animations using Motion.
---

# Verify portfolio

Drive the live site like a user. Capture screenshots. Fail on collapsed elements, horizontal overflow, or a home hero that lost its side frames or peeking project card.

Read `features/README.md`, then the matching feature file. If the change is a page region with no feature file, use `--page` and `--target`. After changing Motion code or reveal classes, read `features/animations/README.md` and run `animate` instead of `drive`.

## Launch

Isolated dev server on port 4322. Do not attach to a server you did not start.

```sh
pnpm verify:ui launch
```

Ready when `pnpm verify:ui doctor` prints `Healthy at http://127.0.0.1:4322`.

This writes `.verification-evidence/instance.json` with the pid and URL. Chromium must already be installed (`pnpm exec playwright install chromium`).

## Doctor

Read-only. Process from `instance.json` still running (when that file exists), URL returns HTML that includes `Leo Zhou`.

```sh
pnpm verify:ui doctor
```

Run doctor before the first drive or animate, after any failed run, and before treating a surprising UI as a product bug.

## Drive

Layout check. Reduced motion is on.

```sh
pnpm verify:ui drive --feature home-hero
pnpm verify:ui drive --feature nav --viewports mobile
pnpm verify:ui drive --page /projects/checkit --target "#project-showcase" --viewports laptop,desktop
```

`--viewports` is a comma list of `mobile` (390×844), `laptop` (1366×768), `desktop` (1920×1080). Default is all three.

Named features live in `bin/recipes.ts` and match `features/*.md`. A custom `--target` is any locator: heading id, `[data-footer-root]`, `.section--carousel`.

Each viewport: reduced motion, wait for fonts, assert listed nodes are visible (or hidden where the recipe says so), reject horizontal overflow, screenshot.

Proof is the action plus the resulting screenshot in `.verification-evidence/<run-id>/`. A green command with no screenshot is not proof.

## Animate

Motion check. Full motion plus reduced-motion, unless `--motion` names one.

```sh
pnpm verify:ui animate --feature hero-sequence
pnpm verify:ui animate --feature project-cards --viewports laptop
pnpm verify:ui animate --feature footer-reveal --motion reduced
```

`--motion` is `full`, `reduced`, or `full,reduced`. Default is both.

Named features live in `bin/animation-recipes.ts` and match `features/animations/*.md`.

Full motion: first inline styles must be the hidden state, then the sequence must finish revealed. Hero also checks title before subtitle before the featured card. Reduced motion: first inline styles must already be the revealed state.

Proof is the JSON log plus each phase screenshot in `.verification-evidence/<run-id>/`. A green command with no JSON is not proof.

## Evidence

Kept at `.verification-evidence/<run-id>/`. Layout files look like `home-hero-desktop.png`. Animation files look like `hero-sequence-desktop-full.json` and `hero-sequence-desktop-full-hero-done.png`.

Layout intent for the home hero (side art framing the copy, featured card peeking) is in [references/home-hero.md](references/home-hero.md). The PNG there is a visual reference, not a pixel baseline.

## Cleanup

Stops the process recorded in `instance.json`. Leaves evidence on disk.

```sh
pnpm verify:ui cleanup
```

Kill only that pid group. After cleanup, confirm the screenshots and JSON still exist.

## Helpers

`pnpm verify:ui` runs `.agents/skills/verify-portfolio/bin/verify-ui.ts`.

Subcommands: `launch`, `doctor`, `drive`, `animate`, `cleanup`.
