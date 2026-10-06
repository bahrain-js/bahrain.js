---
status: living
owner-agent: chronicler
refresh-trigger: every-ship
---

# Bahrain.js — Feature catalog (curated: what the product IS)

_One row per capability, **rewritten in place** when it changes — never appended.
History belongs to CHANGELOG/JOURNEY; this file is current state. Deploys to
`docs/product/catalog/features.md` next to the derived `api.md` /
`data-model.md` / `README.md` (`node tools/catalog.mjs`). WORKFLOW.md §6.1._

## The contract

- **Two hands.** The `chronicler` writes every column except **Benefit** — at
  checkpoints and `/agentic-workflow:end`, from the merged diff, PR-cited. The
  `marketing` agent fills **Benefit** (evidence-gated "so you can…" language,
  framed from `positioning.md`) and nothing else; `_unwritten_` is the hand-off
  sentinel between the two beats. Neither hand ever writes a claim into
  "Current behavior" — that column states what the code does today.
- **Rewrite, don't append.** A changed capability gets its row edited: `Status`
  → `changed` until the next release note lands, then `live`; `Last change` →
  the new PR + date; behavior text replaced. A removed capability keeps its row
  with `Status: removed` and the removing PR — so nothing that once existed
  silently vanishes — and drops `Marketable` to `no`.
- **Anchors must resolve.** Every row names the code that implements it, in
  backticks: `GET /api/…` or `/api/…` (routes in `api.md`), `Model` /
  `Model.field` (in `data-model.md`), and file paths (`app/…`, `server/…`).
  `node tools/catalog.mjs --verify` fails on any anchor that no longer
  resolves — the reviewer and `/agentic-workflow:groom` run it. A row with no
  anchors is a claim, not a catalog entry.
- **Marketable rows are the marketing source.** Landing page, launch assets,
  the sales kit's `data:capabilities` and "What's new" draw facts **only** from
  rows with `Marketable: yes` and `Status: live` (What's new = rows whose
  `Last change` falls in the release window). Bug fixes, internals and ops
  capabilities are `Marketable: no` and never reach the page.
- **Read before you build.** A brief that touches an anchor names the row; a
  builder reads it first; the reviewer REQUEST CHANGES a diff that changes a
  route, the schema, or a catalogued anchor without touching this file in the
  same PR.

## Catalog

| ID | Name | Status | Marketable | Audience | Current behavior | Anchors | Last change | Benefit |
|---|---|---|---|---|---|---|---|---|
| F-1 | Home page | live | yes | guest | Shows hero, next-event countdown, pipeline, stats, membership tiers and community CTA sections | `app/pages/index.vue`, `app/components/home/Hero.vue`, `app/components/home/Countdown.vue`, `app/components/home/Pipeline.vue`, `app/components/home/Stats.vue`, `app/components/home/Tiers.vue`, `app/components/home/Cta.vue` | PR #2 · 2026-09-14 | _unwritten_ |
| F-2 | Events list, detail and edit | live | yes | guest / member | Lists events with search and filter; detail page shows event with 404/error states; members edit events | `app/pages/events/index.vue`, `app/pages/events/[id]/index.vue`, `app/pages/events/[id]/edit.vue` | PR #4 · 2026-09-16 | _unwritten_ |
| F-3 | Event submission | live | yes | member | Signed-in members submit an event (date, time, speakers) for moderation; guests see an auth-required card | `app/pages/events/submit.vue` | c454091 · 2026-03-04 | _unwritten_ |
| F-4 | Event RSVP | live | yes | member | Event detail reads and writes `event_rsvps` and shows whether the signed-in member has RSVPed | `app/pages/events/[id]/index.vue`, `app/types/index.ts` | PR #4 · 2026-09-16 | _unwritten_ |
| F-5 | Projects showcase | live | yes | guest | Lists repos from the GitHub org plus database projects with search; excludes the `.github` repo | `app/pages/projects.vue`, `app/composables/useGitHubRepos.ts` | 4323af3 · 2026-04-26 | _unwritten_ |
| F-6 | People directory | live | yes | guest | Lists members with roles, skill chips, stats bar and core team spotlight | `app/pages/people.vue`, `app/types/index.ts` | 3de4be5 · 2026-03-03 | _unwritten_ |
| F-7 | Member profile | live | yes | member | Signed-in member views and edits their own profile | `app/pages/profile.vue` | e98a135 · 2026-04-26 | _unwritten_ |
| F-8 | Blog | live | yes | guest | Renders markdown posts from `content/blog` via Nuxt Content at `/blog/[slug]` | `app/pages/blog/index.vue`, `app/pages/blog/[slug].vue`, `content/blog/2026-03-01-welcome-to-bahrainjs.md` | PR #3 · 2026-09-15 | _unwritten_ |
| F-9 | Opportunities board | live | yes | guest | Lists jobs, open-source projects and startup ideas | `app/pages/opportunities/index.vue`, `app/pages/opportunities.vue` | PR #3 · 2026-09-15 | _unwritten_ |
| F-10 | Job and idea submission | live | yes | member | Signed-in members submit jobs and startup ideas for moderation | `app/pages/opportunities/submit-job.vue`, `app/pages/opportunities/submit-idea.vue` | d612452 · 2026-04-26 | _unwritten_ |
| F-11 | Frameworks landscape | live | yes | guest | Shows JavaScript frameworks grouped by category | `app/pages/frameworks.vue` | 9ac097c · 2026-03-04 | _unwritten_ |
| F-12 | Newsletter signup | live | yes | guest | Stores an email in Neon DB (public schema) without requiring sign-in | `app/components/NewsletterSignup.vue`, `app/composables/useNeonClient.ts` | a001c10 · 2026-03-06 | _unwritten_ |
| F-13 | GitHub sign-in | live | yes | guest / member | Signs in with GitHub OAuth through Neon Auth and returns to the current page | `app/composables/useAuth.ts` | e98a135 · 2026-04-26 | _unwritten_ |
| F-14 | Admin dashboard | live | no | admin | Moderates members, events, projects, jobs, OSS and ideas via status dropdowns; founder flag gates actions | `app/pages/admin.vue`, `app/components/admin/Members.vue`, `app/components/admin/Events.vue`, `app/components/admin/Projects.vue`, `app/components/admin/Jobs.vue`, `app/components/admin/Oss.vue`, `app/components/admin/Ideas.vue`, `app/components/admin/Stats.vue`, `app/composables/useAdmin.ts`, `app/composables/useAdminData.ts` | 5d900d7 · 2026-04-26 | _unwritten_ |

_IDs are stable and never reused. Keep rows ≤1 line each in the source; wrap
nothing. Add a row per capability the moment it ships; edit it the moment it
changes; mark it removed the moment it goes._
