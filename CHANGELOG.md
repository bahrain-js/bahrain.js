# Changelog

All notable changes to Bahrain.js are recorded here in [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format.
The project has no version tags, so history is grouped into dated sections by work burst.

## [Unreleased]

_Bootstrap adopted the Agentic Workflow on 2026-10-06. Added / Changed / Fixed entries accumulate here from the next merged PR._

> Note: PRs #2-#5 are merged on GitHub but their commits are not in the local clone (local `main` ends at 16a151b, 2026-04-26). They are recorded below from PR titles only.

## [2026-09-16] — event detail states, CI on Node 24

### Fixed
- Event detail page: 404 and error states handled (#4).

### CI
- GitHub Actions bumped to Node 24 releases (#4, #5).

## [2026-09-15] — navigation blank page

### Fixed
- Blank page on navigation out of events, blog and opportunities (#3).
- Main CI repaired (#3).

## [2026-09-14] — Pipeline layout

### Changed
- Pipeline component layout streamlined; card heights now responsive (#2).

## [2026-04-26] — auth hardening, founder flag, polish

### Added
- Founder flag on members with permission guards in admin (a4319bb).
- OG image, page transitions, error page, admin ideas editing (5dc6b5a).
- "Looking For" field uses USelectMenu with create-item (d612452).

### Changed
- Admin auth guard hardened; `alert()` replaced by `useToast()`; dead code removed (5d900d7, 16a151b).

### Fixed
- Auth/signup flow hardened (e98a135, merged as #1 via 10462bc).
- 500 on direct navigation to `/projects`; `useAsyncData` replaced by `useState` in `useGitHubRepos` (8c78f14, 1395073).
- `.github` meta repo excluded from the projects list (4323af3).
- Blog page crash on first client-side navigation; trailing-slash handling (683b664, 5dc6b5a).

## [2026-03-07] — repo hygiene, favicons, README

### Added
- Favicons and web manifest under `/favicons/` and `/manifest.json` (31f320f, 9dad3b5).
- Community links in README and header; WhatsApp link updated (f1f494d).

### Changed
- Blog routing moved from catch-all `[...slug]` to `[slug]` (06cf0af).
- Nitro prerender `failOnError` set to false (3eeede9).
- `isAuthenticated` renamed in admin page; lint/format fixes (6e6b54f).

### Docs
- README: comprehensive documentation, license, badges, npm org name (e3b6801, 1d292f6, 030a832, ce66fb6, 570439a).
- Methodology files, `tmp/`, specs and symlinks removed from tracking (70f261a, 4c41f58, 81e330e, ce75365, 60c1e78).

## [2026-03-03..06] — initial build

### Added
- Homepage: GSAP cinematic animations, 3D hero word flip, SVG wave dividers, parallax (a15068a, 52b1902); redesign with new sections and rotating hero words (221f3b8, c588a6a).
- People page redesign: hero, stats bar, core team spotlight, skill chips (3de4be5).
- Member-only submission forms for jobs and startup ideas (45c846d); auth-required card on submit pages (a32fc77); event speakers field (c454091).
- Newsletter signup stored in Neon DB, usable without auth (6fd4ec5, f40a6e7); later moved to the Neon client with public schema (a001c10).
- Search and filtering on Events and Projects pages (622c5fa).
- Discord link in header, footer, hero and CTAs (c75d288, 7ba12b7); header "Community" section; footer ecosystem links (95eefef, a001c10).
- Admin: project management; Projects page now reads from the database (eb7267c); status dropdowns replace approve/reject (54e82e1); page decomposed into `app/components/admin/*` (d25b803, e782bce).
- Member removal also deletes the `neon_auth` user, later via DB trigger (b54e933, a38f7df, f9366b4).
- Blog posts on contributing and the JS landscape (175c048).
- Vitest and Nuxt Test Utils with initial tests (cbc7167).
- Global types, SPA loading template, type-safety pass (47c4a27, 7a84bc3); CNAME for custom domain (7a84bc3).
- GitHub Pages deployment: Nitro preset, workflow (a5cfdf9).

### Changed
- Astro re-categorized as Frontend on Frameworks page (9ac097c).
- Site copy and headings tightened (312f3b7); redundant blog H1s removed (490db82).
- Event date and time inputs split from form object; pnpm override for `@internationalized/date` (f9afbeb).
- Yellow palette shifted to warm amber for light-mode contrast (878fd7f).

### Fixed
- OAuth callback uses base URL; redirect returns to current page after sign-in (11f3f05, 2f9f824).
- GitHub Pages subpath `NUXT_APP_BASE_URL=/bahrain.js/` (9903717), later superseded by the custom domain.
- Lint, typecheck and pnpm version errors in CI (38cd93b, 148c69d, 08502bb).
- Horizontal scroll on homepage (9566e3a, 3309d69, 8447a77); USelect "all" sentinel (8adb3de); opportunities nested routes (6ef53cb).
