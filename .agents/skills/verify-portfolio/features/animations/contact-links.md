# Contact links

The contact page staggers each `.contact-link-reveal` into place, then wipes in the thanks line.

## Sub-features

- `links-hidden` starts the contact buttons at opacity 0 and the thanks line clipped from the right.
- `links-revealed` finishes with the buttons at opacity 1 and the thanks line fully unclipped.
- `links-reduced` shows that finished state immediately when reduced motion is on.

## How to get to it (user POV)

- Open `/contact` with motion enabled.
- Or open `/contact` with reduced motion.

## Driving it with verify-ui

Preconditions:

- Site is healthy at `http://127.0.0.1:4322`.
- `pnpm verify:ui doctor` reports that URL.

- **Full pass.** Run `pnpm verify:ui animate --feature contact-links`. Command exits 0. Evidence includes `contact-links-*-full.json`, `contact-links-*-full-revealed.png`, and the matching reduced files.
- **Reduced only.** Run `pnpm verify:ui animate --feature contact-links --motion reduced --viewports mobile`. Thanks text is fully visible in the screenshot.

## Gotchas

- Email, LinkedIn, and GitHub links depend on env. Resume is always present. Wait time scales with however many `.contact-link-reveal` nodes render.
- The site footer on `/contact` can sit near the fold. This recipe does not assert footer motion; use `footer-reveal` on `/`.
- `data-animated` on `.contact-page` means a second pass needs a fresh navigation.
