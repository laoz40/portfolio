# Site nav

Site nav is the fixed header: "Leo Zhou" home link on the left, Projects/About/Contact on the right at laptop and desktop, and a menu button that reveals those links on mobile.

## Sub-features

- `nav-brand` shows the Leo Zhou home link.
- `nav-desktop-links` shows Projects, About, and Contact without opening a menu.
- `nav-mobile-open` opens the menu and shows the same links.
- `nav-mobile-close` closes the menu with the toggle.

## How to get to it (user POV)

- Load any default-layout page (`/`, `/projects`, `/about`, `/contact`, a case study).
- On a narrow screen, choose the button named `Open navigation menu`.

## Driving it with verify-ui

Preconditions:

- Site is healthy at `http://127.0.0.1:4322`.
- `pnpm verify:ui doctor` reports that URL.

- **Named feature.** Run `pnpm verify:ui drive --feature nav`. On mobile the helper opens the menu before asserting `#site-nav-links`. Evidence includes `nav-mobile.png`, `nav-laptop.png`, and `nav-desktop.png`.
- **Mobile only.** Run `pnpm verify:ui drive --feature nav --viewports mobile`. Screenshot shows the open menu and the three section links.
- **Header on another page.** Run `pnpm verify:ui drive --page /projects --target "nav" --viewports laptop`. The `nav` landmark is visible on the projects index.

## Gotchas

- The menu button is `hidden` above 820px. Laptop and desktop must not require it.
- After open, the toggle name becomes `Close navigation menu`.
- Nav uses `max-[820px]` for the hamburger. 390 is mobile; 1366 and 1920 are the open-link layout.
