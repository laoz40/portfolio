# Footer

The site footer is the contact block at the bottom of default-layout pages: a prompt that links to `/contact`, optional Email/LinkedIn, and a copyright line.

## Sub-features

- `footer-visible` shows `[data-footer-root]` after scrolling to the bottom.
- `footer-contact` exposes the social/contact landmark named `Social and contact links`.

## How to get to it (user POV)

- Scroll to the bottom of `/`, `/projects`, `/about`, or a case study.
- Or open `/contact` for the dedicated contact actions; the footer still sits below.

## Driving it with verify-ui

Preconditions:

- Site is healthy at `http://127.0.0.1:4322`.
- `pnpm verify:ui doctor` reports that URL.

- **Named feature.** Run `pnpm verify:ui drive --feature footer`. Scrolls the footer into view, asserts it, and writes `footer-*.png`.
- **Contact page.** Run `pnpm verify:ui drive --page /contact --target ".contact-page" --viewports mobile,desktop`. The contact heading region is visible.

## Gotchas

- Email and LinkedIn render only when `PUBLIC_CONTACT_EMAIL` and `PUBLIC_LINKEDIN_URL` are set. A missing Email link is env, not a broken footer.
- Footer `mt-40` means a viewport screenshot of `/` will not include it. The named feature screenshots the footer node after scroll.
