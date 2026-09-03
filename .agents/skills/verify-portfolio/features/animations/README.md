# Animation verification map

This directory is the maintained source for verifying Motion reveals. Read this index, then the matching feature file.

Layout `drive` turns reduced motion on. These recipes do not. After changing `src/animation/*`, a reveal class, or timing in `src/animation/timings.ts`, run `animate`.

## Baseline preconditions

- Launch with `pnpm verify:ui launch` so the site is at `http://127.0.0.1:4322`.
- Run `pnpm verify:ui doctor` and require that URL.
- Drive only the instance this run started.
- Viewports: `mobile` 390×844, `laptop` 1366×768, `desktop` 1920×1080.
- `--motion` is `full`, `reduced`, or both (default both).

## Driving conventions

- Start from a fresh load of the feature's page. `data-animated` / `data-anim-ready` guards mean a reused document without navigation is invalid.
- Full motion records the first inline styles (must be hidden), waits through the recipe duration, then asserts the revealed styles.
- Reduced motion records the first inline styles (must already be revealed).
- Scroll-triggered recipes (footer, about, hero CTA) scroll the target into view after the hidden sample.
- Treat commands as literal.

## Proof and skip reporting

- Capture the JSON log and the phase screenshot, not only a pass/fail line.
- Record the feature id, viewport, and motion mode on the artifact.
- Report an unreachable path with the command and the unmet precondition.
- Do not report a skipped viewport or motion mode as verified through a different one.

## Feature entry contract

Each feature file starts with an H1 title and one paragraph describing the user-visible motion. It then uses exactly four H2 sections in this order.

1. `Sub-features` lists short IDs with one line for each behavior.
2. `How to get to it (user POV)` lists every user entry point.
3. `Driving it with verify-ui` starts with `Preconditions:` and uses labeled bullets that pair each user action with an exact command and observable result.
4. `Gotchas` lists traps that can waste or invalidate a verification run.

## Features

- [Hero sequence](./hero-sequence.md) covers the home load choreography and featured CTA.
- [Project cards](./project-cards.md) covers the projects index stagger.
- [Contact links](./contact-links.md) covers contact link and thanks reveals.
- [Footer reveal](./footer-reveal.md) covers the footer clip-path stagger after scroll.
- [About actions](./about-actions.md) covers the about-page thank-you and CTA.
