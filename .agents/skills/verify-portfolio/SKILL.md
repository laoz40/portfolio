---
name: verify-portfolio
description: Verify the portfolio site UI for broken layout after changing pages, nav, home hero, project case studies, carousels, or responsive CSS. Playwright screenshots at mobile, laptop, and 1080p desktop.
---

# Verify portfolio

Drive the live site like a user. Capture screenshots. Fail on collapsed elements, horizontal overflow, or a home hero that lost its side frames or peeking project card.

Read `features/README.md`, then the matching feature file. If the change is a page region with no feature file, use `--page` and `--target`.

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

Run doctor before the first drive, after any failed drive, and before treating a surprising UI as a product bug.

## Drive

```sh
pnpm verify:ui drive --feature home-hero
pnpm verify:ui drive --feature nav --viewports mobile
pnpm verify:ui drive --page /projects/checkit --target "#project-showcase" --viewports laptop,desktop
```

`--viewports` is a comma list of `mobile` (390×844), `laptop` (1366×768), `desktop` (1920×1080). Default is all three.

Named features live in `bin/verify-ui.ts` and match `features/*.md`. A custom `--target` is any locator: heading id, `[data-footer-root]`, `.section--carousel`.

Each viewport: reduced motion, wait for fonts, assert listed nodes are visible (or hidden where the recipe says so), reject horizontal overflow, screenshot.

Proof is the action plus the resulting screenshot in `.verification-evidence/<run-id>/`. A green command with no screenshot is not proof.

## Evidence

Kept at `.verification-evidence/<run-id>/`. Filenames look like `home-hero-desktop.png` or `target-mobile.png`.

Layout intent for the home hero (side art framing the copy, featured card peeking) is in [references/home-hero.md](references/home-hero.md). The PNG there is a visual reference, not a pixel baseline.

## Cleanup

Stops the process recorded in `instance.json`. Leaves evidence on disk.

```sh
pnpm verify:ui cleanup
```

Kill only that pid group. After cleanup, confirm the screenshots still exist.

## Helpers

`pnpm verify:ui` runs `.agents/skills/verify-portfolio/bin/verify-ui.ts`.

Subcommands: `launch`, `doctor`, `drive`, `cleanup`.
