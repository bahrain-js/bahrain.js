---
status: semi-static
owner-agent: planner
refresh-trigger: event
---

# Bahrain.js — Roadmap (epic view)

_The strategic view and nothing else: which themes matter now, in the owner's
order, and where their items live. **Per-item status does not live here** — the
queue does (§10 **Issue tracker**: GitHub Issues via `gh`; `/agentic-workflow:groom`
keeps it true and regenerates the backlog view). A roadmap that carries item
status duplicates the tracker and goes stale the day after it is reconciled._

## Owner ranking (dated)

_The order the owner wants epics worked, with the date they said so. Re-rank by
editing this list — the history of rankings is `git log` on this file. The
ranking below is the bootstrap's **proposal** from `docs/project.md` §6 and
`PRD.md`; the owner has not ranked yet._

1. `E-1` — Operational hygiene — _(proposed 2026-10-06)_
2. `E-2` — Member engagement — _(proposed 2026-10-06)_
3. `E-3` — Discovery and search — _(proposed 2026-10-06)_

## Epics

### E-1 — Operational hygiene
- **Outcome**: Changes ship with tests in CI, a staging preview, and a reviewed security posture for the Neon RLS + client-admin model.
- **Why now**: Bootstrap finding (2026-10-06): `pnpm test` is not a CI gate, there is no staging, and no pillar audit has run (`docs/WORKFLOW.md` §10, Local amendments).
- **Items**: `gh issue list --label epic/E-1`
- **Decisions**: _(none yet)_
- **Status**: proposed

### E-2 — Member engagement
- **Outcome**: Members come back: event RSVPs are visible and useful, the newsletter actually sends, and public submission forms feed the queue of jobs and ideas.
- **Why now**: `docs/project.md` §6 "Next steps" (newsletter, public submission forms, RSVP logic); `PURPOSE.md` success criteria (regular meetups, learner → contributor path).
- **Items**: `gh issue list --label epic/E-2`
- **Decisions**: _(none yet)_
- **Status**: proposed

### E-3 — Discovery and search
- **Outcome**: Members, projects and opportunities are findable by skill, framework and tag across the site.
- **Why now**: `docs/project.md` §6 (rich search and advanced filtering); events/projects already have basic search (`622c5fa`).
- **Items**: `gh issue list --label epic/E-3`
- **Decisions**: _(none yet)_
- **Status**: proposed

## Deferred (owner decisions)

_An epic the owner parked: one line, the date, and the decision doc. Its items
are closed in the tracker with a comment pointing here — never left open._

- _(none)_
