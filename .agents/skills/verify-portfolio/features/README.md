# Portfolio verification map

This directory is the maintained source for verifying user-facing layout. Read this index, then the matching feature file.

## Baseline preconditions

- Launch with `pnpm verify:ui launch` so the site is at `http://127.0.0.1:4322`.
- Run `pnpm verify:ui doctor` and require that URL.
- Drive only the instance this run started.
- Viewports: `mobile` 390×844, `laptop` 1366×768, `desktop` 1920×1080.

## Driving conventions

- Start from a fresh load of the feature's page. Reduced motion is on.
- Prefer roles, accessible names, and heading ids over DOM position.
- Treat commands as literal.
- After a mutation (open menu, next slide), screenshot the resulting state.

## Proof and skip reporting

- Capture the user action and the resulting screenshot, not only a pass/fail line.
- Record the feature id (or `--page` / `--target`) and viewport on the artifact.
- Report an unreachable path with the command and the unmet precondition.
- Do not report a skipped viewport as verified through a different one.

## Feature entry contract

Each feature file starts with an H1 title and one paragraph describing the user-visible behavior. It then uses exactly four H2 sections in this order.

1. `Sub-features` lists short IDs with one line for each behavior.
2. `How to get to it (user POV)` lists every user entry point.
3. `Driving it with verify-ui` starts with `Preconditions:` and uses labeled bullets that pair each user action with an exact command and observable result.
4. `Gotchas` lists traps that can waste or invalidate a verification run.

## Features

- [Home hero](./home-hero.md) covers the framed hero, side art, and peeking project card.
- [Site nav](./nav.md) covers desktop links and the mobile menu.
- [Project carousel](./project-carousel.md) covers case-study media carousels.
- [Project sidebar](./project-sidebar.md) covers on-this-page jump links.
- [Footer](./footer.md) covers the contact footer on default layout pages.

## Animations

Motion checks use `pnpm verify:ui animate`, not `drive`. Read [animations/README.md](./animations/README.md), then the matching animation feature file.

- [Hero sequence](./animations/hero-sequence.md) covers the home load choreography and featured CTA.
- [Project cards](./animations/project-cards.md) covers the projects index stagger.
- [Contact links](./animations/contact-links.md) covers contact link and thanks reveals.
- [Footer reveal](./animations/footer-reveal.md) covers the footer clip-path stagger after scroll.
- [About actions](./animations/about-actions.md) covers the about-page thank-you and CTA.
