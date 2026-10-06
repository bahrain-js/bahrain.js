---
status: semi-static
owner-agent: business
refresh-trigger: stage-transition
---

# Bahrain.js — Product Requirements (V1)

_What the MVP is — and, just as load-bearing, what it deliberately is NOT. The
V1 definition deliverable: the `designer` owns the journeys and IA, the
`architect` shapes the data model and stack as option memos, the `analyst`
defines success, the `business` agent supplies the model. The exit gate is a
human approval of scope — no implementation without acceptance criteria (§0)._

_Seeded 2026-10-06 by `/agentic-workflow:bootstrap` at stage V6: the product
already ships, so this file records the **as-built** definition. Existing
sources to fold in: `PURPOSE.md` (why), `README.md` (pages), `docs/project.md`
(architecture + next steps), `specs/3-behaviors/*.spec.md` (per-page behaviour,
gitignored), `PRD.md` (a single-feature PRD: production auth fix). Run
`/agentic-workflow:adopt fill` to have the agents draft the sections below._

## Problem recap
→ `PURPOSE.md` — Bahrain has no central hub for its JavaScript community;
Bahrain.js is the signal hub, builder community and on-ramp.

## MVP scope
_As built (see `docs/product/catalog/features.md` for the current rows):_
- Events — list, detail, member submission, admin moderation, RSVP.
- Projects — showcase from the `bahrain-js` GitHub org plus DB-curated entries.
- People — member directory with roles (member → contributor → maintainer → core) and founder flag.
- Blog — Markdown posts via Nuxt Content.
- Opportunities — jobs, open-source issues, startup ideas; member submission forms.
- Frameworks — interactive landscape.
- Newsletter signup.
- Admin dashboard for the core team.

## NOT in this version
- _TBD — confirm._ Candidates from the repo: paid features, non-GitHub sign-in
  providers (`PRD.md` out-of-scope), server-side rendering of data pages.

## User journeys → the UX brief
→ `docs/product/ux-brief.md`

- _Journey name — **acceptance criteria** the V1 gate approves._

## Data model sketch
→ `app/types/index.ts` (as built; mirrors the Neon schema). No architect memo exists yet.

## Stack decision
→ `docs/product/engineering/architecture.md` (as built). No architect memo exists yet.

## Success metrics
_Owned by the `analyst`. Unmeasured today: no analytics or tracking plan exists
in the repo. `PURPOSE.md` names qualitative success (regular meetups, packages
under `@bahrain.js`, a learner → maintainer path)._

## Business model
_Community project, MIT-licensed, no revenue model. `.memory/sponsorship-strategy.md`
(gitignored owner notes) holds sponsorship ideas — not yet a decision._

---
_Exit V1 → V2 when the **human approves this scope** (with the business model and
a chosen brand direction). At V6 this file is maintained, not gated._
