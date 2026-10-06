---
status: semi-static
owner-agent: designer
refresh-trigger: event
---

# Bahrain.js — UX Brief (V1)

_What a designer (and the `frontend` implementer) needs to build the RIGHT
experience: who the user is, the job they're hiring the product for, the path
they take, and how it's all structured. Owned by the `designer` at V1; the PRD
references this instead of inlining journeys. **Evidence-grounded, not invented**
— every persona and pain traces to a `researcher` finding (cite it) or is
labelled `assumption` so the load-bearing guesses are visible._

_Seeded 2026-10-06 by `/agentic-workflow:bootstrap` (stage V6, as-built). The
`designer` fills this via `/agentic-workflow:adopt fill`. Existing sources:
`PURPOSE.md`, `README.md` pages table, `specs/3-behaviors/*.spec.md`
(gitignored), the tier model in `app/components/home/Tiers.vue`._

## Personas
_The 1–3 archetypes the MVP actually serves._

### Persona: _Newcomer developer in Bahrain_ — `assumption`
- **Who** — _TBD_
- **The job to be done** — _find the next meetup and a first project to contribute to._
- **Pain today** — _events scattered across LinkedIn (`PURPOSE.md`)._
- **Success for them** — _TBD_

### Persona: _Active member / builder_ — `assumption`
- **Who** — _TBD_
- **The job to be done** — _show what they are building; find collaborators, jobs, ideas._
- **Pain today** — _TBD_
- **Success for them** — _TBD_

### Persona: _Core team / organiser_ — `assumption`
- **Who** — _runs the admin dashboard (`app/pages/admin.vue`)._
- **The job to be done** — _moderate submissions, keep the directory and events clean._
- **Pain today** — _TBD_
- **Success for them** — _TBD_

## User journeys
### Journey: _Find and RSVP to the next event_ — _(Newcomer)_
- **Acceptance criteria** — _TBD_
- **States** — empty · loading · error · degraded — _TBD_
- **Aha-moment** — _TBD_

## Information architecture
_As built (`app/pages/`):_ Home · Events (list, detail, submit, edit) · Projects ·
People · Profile · Blog (index, post) · Opportunities (index, submit job, submit
idea) · Frameworks · Admin.

## Anti-manipulation guard
_No scarcity/urgency mechanics exist. The event countdown
(`app/components/home/Countdown.vue`) counts to a real event date._

---
_The `designer` proposes and organizes; the **owner** approves the scope this
serves and picks the brand direction separately._
