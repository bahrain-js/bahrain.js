# The Workflow — one agentic protocol from idea to viable product

<!-- protocol-master: v1.51.2 -->

## Quick reference — humans start here

**Entry points**

| You have | Run |
|---|---|
| **Just installed / not sure where to start** | **`/agentic-workflow:welcome`** — the one guided door: orients you, then guides or auto-drives, filling the docs |
| A fuzzy idea, not yet a clear problem | `/agentic-workflow:brainstorm "<itch>"` — shapes it into framings to choose from |
| A raw idea | `/agentic-workflow:autopilot "<idea>"` — hands-off; or `/agentic-workflow:bootstrap` to go stage by stage |
| An existing project | `/agentic-workflow:adopt` (add `fill` to also draft missing docs) |
| No idea what's next | `/agentic-workflow:next` — always safe, recommends exactly one command |

**The daily loop**: `/agentic-workflow:start` → build → `/agentic-workflow:end` → PR → human merges.
Small isolated fix → `/agentic-workflow:fix`. Bigger than one sitting → `/agentic-workflow:mission "<goal>"`.
Long missions and autopilot are **loop-friendly**: drive them with a recurring
`/loop … continue` or a scheduled agent — each tick resumes from files, so any
tick can be run from a fresh context (`/loop` itself is session-scoped and does
not reset the window). Once live, schedule `/agentic-workflow:operate` weekly.

**Stages at a glance**: V0 validate → V1 define → V2 foundation → V3 build →
V4 harden → V5 launch → V6 operate.

**The right command for the moment**

| Moment | Command |
|---|---|
| A big feature idea | `/agentic-workflow:plan "<feature>"` — interviewed, drafted by the team, counseled, decomposed |
| Before a big human decision | `/agentic-workflow:counsel "<decision>"` |
| "Is this production-ready?" | `/agentic-workflow:audit` |
| Cutting a version | `/agentic-workflow:release` |
| Just deployed | `/agentic-workflow:verify` |
| Weekly, once live | `/agentic-workflow:operate` |
| "What should we build next?" / the backlog feels stale | `/agentic-workflow:groom` (probe every open issue against the tree, close what shipped, re-size the rest), then `/agentic-workflow:next` |
| Health check / feeling stuck | `/agentic-workflow:check`, then `/agentic-workflow:next` |
| Something feels broken (tools, profile, hooks) | `/agentic-workflow:doctor` — add `fix` to install missing tools |
| An agent keeps underperforming | `/agentic-workflow:tune <agent> opus` — back: `/agentic-workflow:tune <agent> reset` |
| Away from the terminal | gates ping your owner channel — tap Approve/Reject (§12; set up: `/agentic-workflow:connect`) |
| Several ventures, one owner | a registry repo; `/agentic-workflow:operate` run there sweeps them all (§13) |
| Protocol copy or project structure behind the installed plugin (the session-start conform-check said so) | `/agentic-workflow:sync` — re-copies the master AND applies the structure ladder |
| After a mission or incident | `/agentic-workflow:retro` |

**You (the human) always own**: merges to the default branch (unless §10
delegates them), production deploys, spending, outward publishing, user
experiments, anything destructive. Agents prepare; you fire.

---

One workflow that can take any project from a raw idea to a working, viable
product — and keep evolving it. Two halves:

- **The venture lifecycle (§0)** — the stages a product moves through, each with
  an exit gate and the four quality pillars (§0.2: UX, DX, Security, Efficiency)
  enforced as gates, not aspirations.
- **The execution machinery (§1–§8)** — how any individual piece of work gets
  done: altitudes, session lifecycle, mission trio, checkpoints, roles.

Authority order: explicit user instruction > this document > tool defaults.
The human owner (**HITL** — see §10) is the only merge/deploy authority for the
default branch.

## 0. The venture lifecycle — idea → viable product

Every project is at exactly one stage; name it before routing work. Stage exits
are GATES: human go/no-go where marked, reviewer-verified otherwise. Skipping a
gate is a logged deviation, not a shortcut.

| Stage | Produces | Exit gate |
|---|---|---|
| **V0 Idea & validation** | `docs/product/idea.md`: problem, who pays, why now, riskiest assumption, kill criteria, cheapest test of the assumption. When the idea is still raw, the `brainstormer` agent shapes it first — 2–3 distinct framings for the human to choose between (`/agentic-workflow:brainstorm`) — then the `researcher` agent validates the chosen one (evidence for AND against) | **Human go/no-go.** No code before this exists — an unvalidated idea is cheapest to kill in prose |
| **V1 Definition** | PRD + MVP scope (what's deliberately OUT); the **UX brief** (personas, user journeys with acceptance criteria, IA) and brand/UX directions from the `designer` agent (`docs/product/ux-brief.md`) for the owner to choose; data-model sketch + stack decision as option memos from the `architect` agent (`docs/product/decisions/`), consolidated into the living **system architecture** doc and the frontend/backend **interface contract** the implementers build from; business model + pricing proposal from the `business` agent (`docs/product/business/`) — the model shapes scope and the data model | Stop-the-line: no implementation without acceptance criteria. **Human approves scope** (with the business model and the brand direction; `/agentic-workflow:counsel` convenes the advisor red-team on the approval first) |
| **V2 Foundation** | Deployable skeleton (`devops` lays CI + deploy): repo + CI gates (test/typecheck), deploy pipeline + health/ready checks, validated env with a **fail-closed production guard**, auth decision wired, error-monitoring hook, seed/reset path, README quickstart, chosen design system as tokens | "Hello world" **deployed and live-verified**; CI green. Security and DX are laid here — retrofitting costs 10× |
| **V3 Build (MVP)** | The product, feature by feature, via the execution machinery (§1–§5). Every checkpoint applies the pillar lenses | All MVP acceptance criteria met; behavioral/eval suite exists for AI-driven products |
| **V4 Hardening** | Four explicit audits (§0.2): security review, UX pass (incl. the `designer`'s heuristic usability evaluation), DX pass, efficiency pass — plus ops readiness (backups, monitoring, runbook, guard coverage). Audits run as an **adversarial multi-vote** (§5): lens-partitioned parallel reviewers, conservative merge — standalone via `/agentic-workflow:audit` at any stage | Reviewer-verified production-readiness checklist (full six-lens scorecard); findings fixed or accepted in writing |
| **V5 Launch** | Production deploy (`devops` prepares, `/agentic-workflow:release` cuts the version), first-user onboarding, **live end-to-end verification on the deployed instance**, monitoring confirmed receiving events, rollback tested; launch assets from the `marketing` agent under `docs/product/launch/` (one file per deliverable: positioning, landing copy, per-channel announcements, post-launch content plan, indexed by `launch-plan.md` with the channel plan) — **the human publishes**; pricing finalized against measured costs and the executive summary refreshed (`business`) | Pre-launch **multi-vote review** (§5) green; first real user/business served. **Human owns the launch decision** |
| **V6 Operate & evolve** | Growth is *users and features*: the `/agentic-workflow:operate` loop — measured numbers from the `analyst`, error/cost triage from `ops`, funnel/channel review against the launch metrics (`marketing`), economics drift (`business`) — beside feedback → ranked feature ideas → user-reviewed → growth missions (phased trio with locked decisions); retros that amend THIS document | Continuous — each growth mission re-cycles V3–V5 gates |

A stage may be revisited (a pivot reopens V0/V1; a big growth mission re-runs V4
before its launch). The stages sequence the *product*; the altitudes (§1)
sequence the *work inside a stage*.

### 0.2 The four pillars — enforced, not aspirational

Standing rules (checked at every checkpoint by the reviewer) plus a dedicated
audit each at V4. When a pillar conflicts with speed, the pillar wins at V4/V5
and speed wins at V0–V2 prototyping — say which mode you're in.

**UX** — *the product tells the truth and never dead-ends.*
- Every view handles empty / loading / error states; empty states point at the
  primary action.
- The UI never claims what the backend doesn't confirm (no "Synced" while
  disconnected; status derives from the same source the backend trusts).
- No mock/scaffold data reachable in production builds; no dead controls.
- Verified in a **real client** (real browser for web — clean console,
  hydration-safe SSR with no locale/timezone formatting in server HTML;
  keyboard + label + contrast basics).
- Copy is in the user's language and register.
- **Persuasion only through value clarity — never manipulation**: no fabricated
  scarcity or urgency, no confirm-shaming, no dark defaults, cancellation no
  harder than sign-up; retention comes from delivered value, not exit friction.
  Rewards and progress indicators map to REAL user progress (a reward that maps
  to nothing is manipulation, not motivation); variable-ratio reward mechanics
  — the gambling schedule — are excluded by default, and including them is an
  explicit human decision.

*Design-quality toolset (optional)*: **impeccable** — Paul Bakaus's
design-quality plugin (Apache-2.0, github.com/pbakaus/impeccable) — is the
recommended toolset for this pillar when it is installed alongside the
workflow. Presence probe (read-only, fail-closed to absent) — ANY of:
`grep -qsi impeccable ~/.claude/plugins/installed_plugins.json` exits 0 (the
plugin install), `.claude/skills/impeccable/` exists in the project (the skill
install), or `node_modules/.bin/impeccable` exists (the npm install). When
present, the design-facing agents (`designer`, `frontend`, the
reviewer's UX lens) load its design rules and DESIGN.md conventions and cite
the rules that informed their findings. It is a soft dependency, never a
requirement: when absent, every agent proceeds exactly as today and never
fabricates an impeccable citation.

*Stage map (when present)*: impeccable's command grammar maps onto the
lifecycle as **briefing vocabulary and human-session recommendations** —
subagents cannot invoke slash commands. An agent may only run its detector
CLI via Bash (the locally-installed binary if present, `npx impeccable
detect` as fallback) and read its context files (`DESIGN.md`, `PRODUCT.md`)
as plain files.

| Workflow moment | Impeccable counterpart |
|---|---|
| V1 definition & design — directions, then the brand system | `shape` for direction exploration; `init`/`document` conventions author the spec-compliant `DESIGN.md`, with `PRODUCT.md` cross-referencing the PRD |
| V3 UI build — a frontend slice returns | the frontend (UI-surface slices only) runs the detector CLI on the touched paths (`detect`) before returning any UI slice; findings with severities land in the hand-off |
| V4 hardening — the UX audit | `audit`/`critique`/`harden` are the audit briefing's vocabulary; the refine set (`polish`, `quieter`, `live`, …) is recommended to the human, never invoked by an agent |
| Checkpoint on a UI-touching diff | the reviewer's UX lens runs the detector CLI and reports findings with severities |

The detector gate is **advisory and fail-open**: when the CLI errors or times
out, the agent says so and continues — a peer tool's detector is never a
blocking gate of this workflow, and it is never run when the probe says
absent.

**Once per beat, classified at the checkpoint — never a per-turn feed.** In a
mission the builder runs the detector ONCE at hand-off and reports; the
reviewer runs it once at the checkpoint and classifies each finding
**blocking** (breaks a user-visible flow, an accessibility requirement, or a
rule the project's `DESIGN.md`/`PRODUCT.md` states) or **advisory** (taste,
density, polish). Only blocking findings may drive REQUEST CHANGES; advisory
ones ride into the ledger as a backlog line. Ventures that install impeccable's
own hooks (a `PostToolUse` per-edit pass and a `Stop` "deep pass" in
`.claude/settings*.json`) should, for **autonomous runs** (missions, autopilot,
loop ticks), drop the `Stop` entry from `.claude/settings*.json` (or set
`IMPECCABLE_HOOK_DISABLED=1` for the run — note `IMPECCABLE_HOOK_QUIET` only
silences the clean-file acks, it does NOT stop the deep-pass findings) — and
rely on the checkpoint gate; `/agentic-workflow:doctor`
reports the venture's impeccable hook configuration. Incident (orderly,
2026-08-17→19): the Stop deep pass fired at every turn end of a two-day
mission (110 firings in one transcript) inside a loop that treated every hint
as work; sessions stretched and the mission consumed 38% of the owner's weekly
quota. The detector was not wrong; the cadence was.

**The conventions file (CLAUDE.md/AGENTS.md) — conventions with anchors, never
state.** It is injected into every session, so it misleads at the highest
leverage when stale. Rules: it holds conventions and invariants only — product
state lives in the catalog (§6.1), protocol in this file (pointer, not copy),
the queue in the tracker (§4). Every fact carries an **anchor** (a path, a
package script, a symbol) so it can be checked; the conform ladder's
`claude-md-anchors` entry verifies anchors at session start and
`/agentic-workflow:sync` lists the dead ones. Writers
(**`/agentic-workflow:retro`**, **`/agentic-workflow:end`**, a checkpoint steer that
graduates into a durable convention) **rewrite the line they supersede in
place** — never append a second truth. A diff that renames or deletes an
anchor the conventions file names updates that line **in the same PR** — the
reviewer's DX lens gates it exactly like a catalog row.

**DX** — *a stranger clones the repo and ships a fix the same day.*
- README quickstart with few commands incl. a one-command dev datastore;
  `.env.example` that works as-is.
- Gates are fast and local (unit tests need no live services); the conventions
  file and docs index kept truthful — the stale-doc rule (§8) is enforced.
- Useful scripts documented; a CONTRIBUTING that states the CI gates and footguns.
- Agent-DX counts too: pre-resolved briefs, a code index if available,
  reusable test patterns — the repo is legible to humans and models alike.

**Security** — *fail closed, least privilege, independently reviewed.*
- Misconfiguration must refuse to serve, not silently degrade (a production
  guard that validates required config at boot; signature/token checks fail
  closed; route/authorization classification is exact).
- Least privilege: scoped CI permissions, pinned third-party actions touching
  secrets, hashed credentials, secrets encrypted at rest with a rotation story,
  additive-only migrations by default.
- Rate-limit every public/credential surface; close self-serve sign-up unless
  the product needs it; audit trail on privileged state changes.
- Independent security lens at every checkpoint; full review at V4 and for any
  auth/payment/webhook/CI-touching change.

**Efficiency** — *measure first; spend where users feel it; don't overbuild.*
- MVP scope discipline: a written "NOT in this version" list (deferred ≠ denied);
  simple infra until scale is a measured problem.
- Perf budgets on hot paths; no N+1s on list endpoints; caching only with an
  invalidation story.
- Cost awareness for AI products: model tiering (cheap router → strong executor),
  token/context budgets (§2, principle 2), per-feature spend visibility.
- Agent efficiency: route to the smallest altitude that fits (§1); reuse
  existing engines before building new ones.

## 1. Three altitudes — route every piece of work first

| Altitude | Trigger | Process | Overhead |
|---|---|---|---|
| **Task** | Typo-class fix, config tweak, single-file bug with an obvious test | Branch → fix → verify → PR | Minutes |
| **Session** | One sitting of focused work: a feature slice, a bug hunt, a refactor | Session lifecycle (§4) | One branch, one PR |
| **Mission** | Too big for one sitting: multi-feature, migration, audit | Plan trio + phases + checkpoints (§5) | `.plans/` ledger, reviewer gates |

Name the stage (§0), then route. When unsure between Session and Mission: if you
cannot pre-resolve all file targets in one exploration pass, it's a Mission.
Escalating mid-flight is fine (log it); silently sprawling is not.

## 2. Principles

1. **The ledger outlives the transcript.** Durable state lives in files
   (`.plans/<mission>.state.md` for missions; PRs/issues for sessions), never only
   in chat. Any fresh agent must resume from files alone.
2. **Ingest conclusions, not corpora.** Delegate high-volume reading to subagents
   that return distilled results. Budget ≤30% of the context window per session
   (~1,500 lines of reads); grep-first ranged reads for files >400 lines
   (Bash-side searches prefer `rg` when present — `/agentic-workflow:doctor fix` installs it).
3. **Retrieval-first.** If a code index exists (§10 records how to query it),
   use it before grep + whole-file reads for where/what/blast-radius questions.
   Agents whose toolset lacks the index's MCP tools use its CLI via Bash — the
   same pattern as Bash-driven browser verification.
4. **Gates, not logs.** Verification returns a signal (green/red + first error),
   never pasted build output. The project's gates are in §10.
5. **Verify live, in a real client.** Anything with a runtime surface gets
   exercised end-to-end — for web UI a real browser, not a status-code ping.
6. **Independence at the gates.** Work is reviewed by an agent that did not write
   it (fresh context) at every checkpoint and before any risky merge. Self-review
   only for Task-altitude changes, labeled "Self-QA (non-independent)".
7. **Evidence where reviewers look.** Decisions, deviations, verification results
   go on the PR/issue/ledger — the system of record.
8. **Crash-safe by write-ahead.** State updates are written before ending a
   session, so interruption never loses or doubles work.

## 3. Guardrails (mechanical, always on)

Shipped by this plugin as hooks. Advisory except where marked:

| Event | Behavior |
|---|---|
| Prompt submit | Reminder when the working tree is on the default branch |
| `git commit` | Conventional-format reminder; **BLOCKS** a message carrying a GitHub closing keyword + issue ref (`Closes/Fixes/Resolves #N`) — that fires auto-close whenever the commit reaches the default branch, including via the staging→main promote, closing the issue done-or-not (orderly #605). Reference an issue as `(#N)` or `refs #N`; put the close in the PR-to-default-branch body |
| `git push` | **BLOCKS** any push while on the default branch (feature branches only) |
| `git push` | **BLOCKS** any refspec targeting the default branch (`HEAD:main`, `feature:main`, `:main`) — never sanctioned, even with delegated merge authority |
| `git push --tags` / `--follow-tags` | Warns that tag pushes may fire a release/deploy pipeline — per `/agentic-workflow:release`, the human runs them |
| `git push` | Warns when tracked files are modified-but-uncommitted (untracked scratch dirs don't warn) |
| `gh pr merge` | **BLOCKS** unless the §10 **Merge policy** is `agent-may-merge` (fail closed when unset/absent); when delegated, reminds: merge only on a reviewer APPROVE |
| `gh pr create` | Reminder to have run the gates |
| `Write`/`Edit` | Reminder to update docs when high-impact files change; on a route file (`server/api/**`) or the schema, when the project ships `tools/catalog.mjs`, it names the catalog (§6.1: regenerate + rewrite the feature row in the same PR — the reviewer gates it) |
| `Read` (whole file, no `limit`) | **Read advisory** (context discipline) — nudges toward a ranged read or a delegating subagent (§6.2 Delegated reads) when a whole-file read targets a file over `READ_ADVISORY_LINES` (800 lines); a discipline line, not a measured optimum — this repo has no corpus to confirm an effect size, so none is claimed; never blocks |
| Prompt submit | **Router** (governance) — an un-prefixed work request gets a soft "route it through the protocol — hand to `intake`" nudge; silent on plain chat, never blocks |
| Prompt submit | **Mission-budget** (governance; supersedes the thread-keeper) — injects the active ledger's status line `Mission <name> — session k/N (est.)` + its **first** `Next up:` line each turn (§12 LA-7: the old `tail -1` fed the owner the stalest state for a day; duplicates now draw a loud warning). Reads `Estimate: N sessions` and `Sessions used: k` from the ledger header and, once **k ≥ 1.5 × N**, prints 🛑 OVERRUN on every prompt until the estimate is revised — a protocol STOP for the orchestrator (no further brief until the owner chooses subset / revised estimate / abort), never a hook block; a missing `Estimate:` draws a one-line reminder. Silent when no active ledger — *active* is one shared predicate (`hooks/lib/active-ledger.sh`, also used by handoff-budget, compact-resume and the beat-enforcers): the newest-touched ledger, skipped while never started (`Sessions used: 0` or `Status: planned`), and NOT active once it carries a `Closed:` stamp, a `Status:` other than `active`, a first `Next up:` saying the mission is closed/complete, or no open beat (a `[~] … → OB-<n>` row promoted to the register is not a beat) — an older never-closed ledger is never fallen back to; every hook in this table now carries a `timeout` (5 s; 30 s for compact-resume) so a slow hook can never stall a turn; never blocks |
| Prompt submit | **Handoff-budget** (governance) — nudges (≤3 lines) to write/refresh `docs/product/session-handoff.md` before compaction takes the window, once cumulative transcript **bytes** — a loose proxy, including tool results the window has already evicted, never a token measurement — cross an advisory (3,700,000 B) or urgent (5,380,000 B) band, boundary-inclusive; silent below the advisory band, once already fired for that band this session, while an active mission ledger exists, or once the handoff is already newer than the crossing; never blocks |
| turn end | **Beat-enforcer backstop** (governance, `Stop`) — nudges a not-started ledger beat (`chronicler` at close, `reviewer` at a checkpoint) at the overdue moment; it scans the open beats top-down and nudges the **first due** one — a beat whose own row is held is stepped over, not treated as a wall — and stays silent when nothing is due, i.e. when unfinished work, an unreleased ⛔/HARD PAUSE row, or an unreleased `[~]` **HELD** row sits above every candidate (a `[ ]` HELD row is parked, not a barrier: the scan steps over it); advisory, never blocks |
| `git commit` / `gh pr create` / `gh pr merge` | **Beat-enforcer** (governance, `PreToolUse`) — the same nudge at the closing action, but with **no due-ness scan yet**: it reports the **first** not-started beat outright, so it can name one that is held or behind unfinished work (the due-ness port is pending); advisory, never blocks |
| After a compaction | **Compact-resume** (governance) — on `SessionStart` with matcher `compact` only, injects a directive (≤6 lines) and is **never silent** (OQ6): active mission ledger → re-read the ledger and the last handoff **verbatim**; no ledger but `docs/product/session-handoff.md` exists → re-read it verbatim with freshness stated — its `_Written:` provenance stamp preferred over file mtime; **CURRENT** only if provably newer than the transcript's last append, else **SUSPECT** (older than the transcript's last append, or the transcript is missing/unreadable — fail closed): treat the handoff as a lead, not the truth, and verify against `git log`/`git status` before trusting its **Next**; neither record exists → names `git log -5`, `git status`, `.remember/now.md` and tells the agent to report the gap to the human, never to author a handoff on the spot; never blocks |
| Session start | **Conform-check** (governance, `SessionStart` matcher `startup|resume` — never `compact`) — runs the plugin's `tools/conform.mjs --brief` against the cwd: a versioned ladder of structural expectations (protocol stamp vs installed plugin; §10 **Staging** / **Issue tracker** rows; active ledgers carrying `Estimate:` / `Sessions used:` and exactly one `Next up:`; `docs/product/roadmap.md` as the epic view; a generated (not hand-written) backlog view; `tools/catalog.mjs` present and current; the `docs/product/catalog/` files). Gaps → a ≤3-line advisory naming the count, the first gap, and `/agentic-workflow:sync`, which applies the SAME ladder; silent when the cwd is not adopted, when conformant, when node/the script is missing; once per session; filesystem-only; never blocks. *Incident (2026-08-19):* a project adopted on v1.43 ran on v1.46 with ledgers that lacked the budget fields — the overrun stop could not fire — and nothing said so |
| Session start | **Obligations-due** (governance, `SessionStart` matcher `startup|resume` — never `compact`: compact-resume owns that beat, and the two directives must not compete) — grep-counts unticked `- [ ] OB-` rows in `.plans/OBLIGATIONS.md` plus unticked `- [ ]` rows inside any mission ledger's `## Closing` section, and injects a ≤3-line advisory naming both counts, the oldest unticked row (register first — it is append-only, so its first unticked row waited longest; bounded to 140 characters), and `/agentic-workflow:settle`; **grep-only, no network** — it never runs `gh` and probes no row's condition (the real probes live in `/agentic-workflow:settle`, `/agentic-workflow:end`, and `/agentic-workflow:check`); four silencers exactly: no register and no `## Closing` block anywhere → silent, zero unticked rows → silent, once per session (a silent dispatch does not consume the session's one advisory), always exit 0 on every path; advisory, never blocks |
| Foreign runtime (Codex) | Claude hooks fire **only on Claude tool calls**, so inside a `codex` run **none of the rows above fire**. Mechanical parity there is two things: the **execpolicy rules file** (`templates/codex.rules`, deployed to `<repo>/.codex/rules/agentic-workflow.rules` — inert until the repo carries a user-layer `trust_level = "trusted"` entry in `~/.codex/config.toml`, added only by `/agentic-workflow:connect codex`) whose literal `prefix_rule` tokens forbid push / commit / tag / `gh pr create` / `gh pr merge` / `git -C`, the shell-wrapper and global-option-prefix bypasses (`sh -c` / `bash -c` / `zsh -c`, `env`, `command`, `nohup`, `xargs`, `timeout`, `git -c …`, `gh api`), and the **sandbox mode** the adapter derives from the role's `tools:` (read-only vs workspace-write; network on only for builder roles). The `Write`/`Edit` docs-reminder has no analogue inside Codex — the distillate's `high_impact_touched` flag replaces it. **NOT replicated:** the §14 paid-promotion / publish-host guards ship as no execpolicy command rule — a `network_rule(host=…)` form parses in 0.146.0 but is not used or verified yet (probe at n=1) — so read-only roles are covered by the network-off sandbox, but a **builder role running with network on is a named, accepted gap** (carried as a mission Risk + `## Closing` row, not silently) |

Blockers exit 2 (hard stop); reminders exit 0. Guardrails catch autopilot
mistakes; they never replace judgment. Checks evaluate in the command's
**target repo** — a leading `cd <dir>` or `git -C <dir>`, else the session
cwd — and read **pre-execution** state: branch-switching and pushing belong
in separate commands.

## 4. Session lifecycle (the default altitude)

**Open** — route the work (§1); create/checkout the branch (never the default
branch); if part of a mission, read the ledger → `Next up:` → that brief.

**Work** — smallest change meeting the acceptance criteria; follow repo
conventions (the project's conventions file is the engineering source of truth);
tests accompany behavior changes; deviations from a brief are allowed but MUST be
logged in the ledger.

**Close** — gates green (§10); live verification if there's a runtime surface
(§2, principle 5); commit (`type(scope): description` — for mission sessions
`<mission>(S<n>): summary`); push the branch; PR with summary + test plan;
**update the record** (§6.1 — spawn the `chronicler` agent, then republish the
owner status page); **never merge the default branch yourself** — HITL merges
(merging often auto-deploys). **Finishing a mission** (its last checklist row
ticking)? The close falls through to the settle close-gate first: read the
ledger's `## Closing` block — while any `[ ]` obligation row remains, the
mission may not be reported closed; `/agentic-workflow:settle` fires or
promotes each row, and only then is the `Closed:` stamp written (§5).

**The queue — one place work waits.** Every open item — bug, review nit,
feature, deferral, `/agentic-workflow:operate` finding, `/agentic-workflow:retro`
action — is an issue in the §10 **Issue tracker** (GitHub Issues via `gh` when the
remote is GitHub), labelled `type/{bug,feature,debt,ops}` and `size/{XS,S,M}`,
optionally `epic/<id>` and `surface/<name>`. Markdown backlogs are **generated
views** of that queue, never hand-appended; the roadmap
(`docs/product/roadmap.md`, `templates/roadmap.md`) holds epics, the owner's
ranking and pointers — **never per-item status**. A deferral is a decision doc
plus a *closed* issue that links to it, not a third prose copy.
`/agentic-workflow:groom` keeps the queue true — it probes every open item
against the tree (anchors present, merged commit an ancestor of the default
branch, behavior proven), closes what shipped **with quoted evidence**, flags what
went stale, re-sizes the rest, and regenerates the view; `/agentic-workflow:next`
recommends ONE item from it; `/agentic-workflow:mission` and `/agentic-workflow:fix`
take one item out and close it on merge; `/agentic-workflow:operate` and
`/agentic-workflow:retro` write into it. *Incident (orderly, 2026-08-19):* an
append-only `BACKLOG.md` reached 123 KB / 119 open boxes with shipped items still
listed under "small effort", while a hand-reconciled roadmap marked every entry
shipped or deferred — two files, no consumer, no truth. A record nobody reads
back goes stale; an append-only one goes stale by design.

**Context discipline** — at ~25% usage, finish the current edit to a compiling
state, verify, write the handoff, end. A clean half-session beats a degraded full
one. Finished early (<15%)? Pull the next same-phase brief (checkpoints always
end a session). For a long *interactive* session with no natural session end,
`/agentic-workflow:handoff` writes a fresh-self re-read manifest so the reset stays lossless
(§6.2) — never lean on the auto-summary.

**Reflex backstops** — four §3 governance hooks keep a *running* session
on-protocol without being read: the *mission-budget* hook surfaces the active
ledger's `session k/N` + first `Next up:` every turn and turns into the
overrun STOP at 1.5× the estimate; the *beat-enforcer* nudges a
not-started beat (`chronicler` at close, `reviewer` at a checkpoint) at the moment
you try to close or advance; *compact-resume* fires the moment the context
window is compacted and is never silent (OQ6): with an active ledger it directs
a verbatim re-read of the ledger and the last handoff; with no ledger it falls
back to `docs/product/session-handoff.md`, stating freshness — stamp preferred,
mtime fallback — so a stale handoff reads **SUSPECT** ("treat the handoff as a
lead, not the truth") rather than being trusted outright; with neither record it
names `git log -5`, `git status` and `.remember/now.md` and tells you to flag
the gap to the human rather than proceed on the compaction summary; and
*handoff-budget* nudges once cumulative
transcript bytes — a loose proxy, never a token measurement — cross an advisory
or urgent band, telling you to write/refresh the handoff before compaction takes
the window. All four are advisory — they steer the session back to the ledger,
never block it. (§3's other two governance hooks fire at the session's edges
rather than during it: the *router* before the work starts, and
*obligations-due* at session start — surfacing how many deferred obligations
sit unticked so a due condition meets a session that can act on it.)

## 5. Mission lifecycle

**A mission is one session and one review by default.** The planner writes one
brief and `Estimate: 1 session`; one builder session runs it; one fresh
one-shot reviewer verifies it; it lands via **staging → verify → PR to the
default branch**. Multi-phase missions are an explicit opt-in
(`/agentic-workflow:mission "<name>" phases`) that carries an honest session
estimate and a hard overrun stop. **`.plans/` is tracked in git, never
gitignored** — the ledger is the record that survives a crash, a clone, and a
worktree; the conform ladder flags a gitignored `.plans/` (junk like
screenshots gets targeted sub-ignores instead). The plan trio, written by a
dedicated planning session:

| File | Job |
|---|---|
| `.plans/<mission>.md` | Master plan: numbered tasks with acceptance criteria, **locked decisions (dated)**, risks, open questions each with a recommendation |
| `.plans/<mission>.sessions.md` | One brief per session: pre-resolved reads (file → measured line count → anchors), do/verify steps, read budget; phases with named branches |
| `.plans/<mission>.state.md` | Ledger: checklist, open questions, **standing steers** (human steers quoted verbatim, captured at checkpoints only), deviations log, handoff log (≤10 lines each, newest first), `Next up:` — which must name the same next beat wherever it appears in the file. Checklist glyphs: `[ ]` not started · `[~]` in-flight / deferred / awaiting owner · `[x]` done — the beat-enforcer nudges only on a not-started `[ ]` checkpoint/reviewer/chronicler row, so set `[~]` when a beat is picked up or parked. Every ledger also carries a `## Closing` block — deferred obligations in the OB grammar (`do:` / an observable `when:` / `probe: <command | manual>`), read by the mission-close gate below |

Rules: briefs pre-resolve targets so execution sessions never explore; one branch
per phase, merged at checkpoint per the **gate policy** below; migrations and
CI/deploy-touching changes get extra checkpoint scrutiny; **one-corrective-retry**
— a failing session/agent is retried once with a corrective note, then escalated
to the human.

**Plan-judge — the trio is reviewed before any brief spends a session.** As soon
as the planner returns the trio (automatically in `/agentic-workflow:mission` §1
`plan` mode, on every `replan`, and in `/agentic-workflow:plan`), the
orchestrator spawns a **fresh, read-only, one-shot `reviewer` in plan-judge
mode** over the trio — a `reviewer` *mode*, not a new agent. Per brief it checks:
done criteria a named gate verifies · reads pre-resolved with line ranges · no
probe a doc lookup settles · decisions consistent with the source memo/issue ·
size within budget · the security-boundary flag set where the Fable tier applies ·
`Estimate:` = briefs + checkpoints only. It returns **APPROVE** or **REVISE**
with per-brief findings (≤ one page); the planner revises **once**, a **second
REVISE surfaces to the owner**. Most correctives trace to a brief defect an
up-front read would have caught — the judge spends one read-only pass to save the
session (#79).

**Convergence rules** (each one names the incident that produced it — orderly
`docs/WORKFLOW.md §12`, 2026-08; the mission-budget hook in §3 is their
mechanical half):
- **Estimate + count (LA-1).** The ledger header carries `Estimate: N sessions`
  (planner; counts **briefs + checkpoints only** — a corrective is counted when
  it fires, never pre-booked, #79)
  and `Sessions used: k` (orchestrator — incremented **write-ahead** at every
  brief, corrective, `continue` and loop tick). At **k ≥ 1.5 × N** the hook
  prints 🛑 OVERRUN on every prompt and the orchestrator MUST NOT start another
  brief: it gives the owner the scope decision — ship a defined subset now /
  continue at a revised estimate / abort — with the remaining phases and what
  each buys, records the answer as a dated locked decision, and only then
  revises `Estimate:`. *Incident:* multi-venue-manager, planned 18 sessions,
  ran ~44 over ~28 hours; every phase justified, no choice ever offered.
- **No standing agents (LA-5).** Reviews, counsel and audits are one-shot
  spawns at decision points (checkpoint, merge, gate verdict, scope change). A
  resident/supervisor agent is resumed over its whole transcript on every beat,
  so its cost rises for the life of the mission; one is permitted only under
  an explicit owner line in the ledger (`Standing agent authorized: <role> —
  <date> — "<words>"`), beaten on decisions only, cost re-quoted every ~3
  beats, killed when its remit ends. The reviewer flags any without the line.
  Model tiering is unchanged in principle (opus builders) but the **reviewer
  tier keys on the change's RISK CLASS, not its diff size**: Fable is required
  for any review whose diff touches auth, a session/entry credential,
  authorization/tenancy, money, schema/migrations, or a security boundary —
  a two-line auth diff included. The saving is in shape (one-shot, at decision
  points), not tier. And a security/auth/money review must **close the threat,
  not just verify the diff** — step outside the changed lines for a second
  path to the same asset (orderly #605→#730). A miscalled tier is a process
  finding.
  *Incident:* six supervisor beats ≈ 1.08M tokens, 94% of a session's Fable
  spend, against 70k for the one-shot review that found the real defects.
- **Write-ahead at every merge, gate result, and gate SPAWN (LA-6).** Builders
  have a session boundary that forces a write; the orchestrator does not. The
  ledger is written at every merge to staging, every verify result, every
  review verdict, every PR opened — and one line when a long gate is SPAWNED
  (what, on which range, when), because an unrecorded in-flight review is
  indistinguishable from a stall to any watcher — not at session end. *Incident:* a checkpoint
  review, three merges and a verify went unrecorded; a compaction erased them.
- **Exactly one `Next up:` (LA-7).** Supersede by renaming the old line
  (`SUPERSEDED next-up (historical):`); the hook reads the first and warns on
  duplicates; the lint backstop fails on disagreement.
- **Hotfix path (Lane A): when the defect is live on the default branch and
  staging has diverged, do NOT land the fix on staging.** A fix branched from
  the default branch and merged into a staging branch that is far ahead
  (commits + migrations) verifies a build that is not the fix, risks
  conflicts, and double-lands at the eventual promote. Instead: verify on a
  preview/branch deploy of the fix branch (the §10 Staging row's escape
  hatch), or a local real-client run against a scratch datastore, driving the
  actual defective flow; record the deviation + the verification target in
  the ledger; open the PR to the default branch as usual. The fix reaches
  staging via the normal promote/back-merge, never a direct landing.
  *Incident (orderly #605, 2026-08-19): staging sat 128 commits + 7 migrations
  ahead of main; landing a main-based security fix there would have made
  "verified on staging" a claim about the wrong build.*
- **Staging → verify → PR (venture flow).** On APPROVE the phase branch is
  merged into `staging` (created from the default branch if absent, recorded
  in §10), the staging deploy is confirmed green **on the diff-bearing
  commit** (`node tools/ci-wait.mjs <full-sha>`, run in the background — exit 0
  is the only green; no-runs and a never-triggered expected workflow are
  failures; a PR-level check summary is not evidence, LA-8),
  `/agentic-workflow:verify` runs against the staging URL — and staging is
  evidence only insofar as it exercises the SAME image/release/deploy commands
  AND the same connection topology as production (a pooled connection rejects
  what a direct one accepts: the release wrapper passed `lock_timeout` as a
  startup option — staging's direct Postgres took it, prod's PgBouncer
  FATAL'd, and the prod release aborted safely; migrations belong on the
  DIRECT database URL in every environment) (*incident, orderly #586: `fly.staging.toml` ran an old inline
  migrate command while `fly.toml` ran a wrapper script the Docker image never
  contained — staging green while the prod release phase would have
  MODULE_NOT_FOUND'd with zero of 7 migrations applied; a whole-range Fable
  re-gate caught it at the merge*) —,
  and only then does the PR to the default branch open. The human merges that
  PR (or the agent under a delegated §10 Merge policy). Never straight from a
  phase branch to the default branch.

**Gate policy** (chosen at mission start; default `human-merge`) — applied
AFTER the phase has landed on `staging` and verified there:
- `human-merge` — on a green staging verify, open the PR to the default branch
  and pause for HITL to merge it. Where the §10 **Merge policy** is
  `agent-may-merge`, the orchestrator may merge the reviewer-APPROVEd,
  staging-verified PR itself (logged in the ledger) instead of pausing — the
  delegation covers *who clicks merge*, never *skipping the review or the
  staging verify*.
- `batch` — phases accumulate on `staging` (each verified as it lands) —
  **never the default branch**, so the push-block guardrail (§3) and the merge
  authority (§11 safety boundary) stay intact — and HITL merges staging → default
  once, at the batched end-of-mission (or launch) confirmation. Used by
  `/agentic-workflow:autopilot` when the flight plan says "only stop at hard
  gates".

**Checkpoints** end every phase: the independent `reviewer` agent (fresh context)
re-runs all gates, diff-reviews `base..head`, performs deferred manual/live items,
checks claimed deviations against the actual diff, restores datastore state (§10),
and returns APPROVE / REQUEST CHANGES with concrete findings plus a **scorecard**
(per-lens 0–3; at routine checkpoints only the lenses the diff touched — the
binary verdict stays the gate signal, scores are diagnostics for the pillar-health
panel). Review fixes land as their own ledger entries (`S<n>-fix`).

**Adversarial multi-vote — high-stakes gates only.** At exactly two lifecycle
points — the V4 audit and the pre-launch (V5) review — the orchestrator spawns
2–3 fresh `reviewer` instances, lens-partitioned (security + efficiency /
UX + DX / QA + architecture), instead of one. Merge conservatively: any
REQUEST CHANGES blocks; findings are unioned; the same finding from two
reviewers raises its confidence. Routine checkpoints stay single-reviewer —
this is where review cost is spent deliberately, not everywhere.

**Mission close & deferred obligations.** A promised action with an observable
condition and no trigger yet ("reap the branches once the human's merge deploys
green", "re-measure once the corpus grows") parks instead of evaporating: as a
row in the active ledger's `## Closing` block — `- [ ] <id> · added YYYY-MM-DD
(<source>) — do: <action> — when: <observable condition> — probe: <command |
manual>`, where a `when:` names a state a probe can check, never a clock — or,
when it outlives its mission, promoted (`[~] … → OB-<n>`) as a verbatim copy
into the repo register `.plans/OBLIGATIONS.md`. Rows are never deleted: a fired
row ticks `[x]` and appends `· fired YYYY-MM-DD (<evidence>)`. The close gate:
a mission may not be reported closed while any `[ ]` Closing row remains —
`/agentic-workflow:settle` is the close step (probe every row, fire the
condition-met safe class — including branch reaping behind the deploy-green
ladder — surface the rest, refuse the close otherwise), and only a fully
fired-or-promoted block takes the `Closed: YYYY-MM-DD` stamp; the lint backstop
enforces the same rule fail-closed. The obligations-due reflex (§3) surfaces
due counts at session start; the `end` and `mission` commands route a finishing
mission through this gate — the checklist is the authority, and "zero open PRs"
is never a completeness signal.

**Hand-off across machines and sessions.** The tracked ledger is what makes a
mission portable: its edits are committed on the mission branch and pushed
like code, so another machine is `git pull` + `/agentic-workflow:mission
"<name>" continue` away from resuming exactly where the last one stopped.
Rules: **one driver per mission at a time** — hand off by pushing, never by
running the same mission from two places (the budget fields would
double-count and the header lines conflict); a session that stops — cleanly
or mid-flight — **commits and pushes the ledger before it ends** (write-ahead
already requires the commit; the push is what makes the hand-off real); and
`continue` **pulls first** — the ledger at origin is the state, the local
copy is a cache.

**Loop mode.** The ledger makes missions loop-drivable: a recurring
`/loop /mission "<name>" continue` (or a scheduled agent) has every tick read
the ledger, increment `Sessions used:`, execute exactly one brief or
checkpoint, write the handoff, and end — the overrun stop applies to ticks
exactly as to interactive runs. A `/loop` tick does NOT reset the context window — `/loop` is
session-scoped, and ticks accrete in the same transcript; genuine fresh context
requires `/clear`, a new session, or a scripted `claude -p`. What makes loop
mode safe is that **state lives in files**: any tick can be run from a fresh
context without losing anything, a crashed tick loses nothing, and the human
can stop the loop at any gate. The same applies to
`/agentic-workflow:autopilot continue` at venture scale (§11).

The trio is authored by the `planner` agent and driven by the bundled `/agentic-workflow:mission`
command (plan · run · continue · replan). Technical open questions may be routed
through the `architect` for an options memo before they reach the human — the
human still decides. The `planner` explores once and
pre-resolves every brief's targets; `/agentic-workflow:mission` orchestrates execution phase by
phase, spawning specialist implementers per brief and the `reviewer` at each
checkpoint. The planner can also **convert an existing plan document** into the
trio (its decisions arrive locked, not re-litigated), and **replan** re-evaluates
a trio against current reality — ledger reconciled with git, pending briefs
re-resolved, invalidated locked decisions surfaced to the human rather than
silently changed.

## 6. Roles

| Role | Who | Duty |
|---|---|---|
| **Implementer** | The main session agent, or a **specialist implementer** subagent (`backend`, `frontend`, `security`, `devops`) — used for a domain slice or to run slices in parallel in a mission | Route, build to convention, verify, document, hand off |
| **Reviewer** | The `reviewer` agent — always a fresh context | Checkpoint reviews; pre-merge review of risky changes; four pillar lenses + QA + architecture in one pass |
| **Chronicler** | The `chronicler` agent | Keeps the record (§6.1); documents, never touches product code |
| **Curator** | The `curator` agent | Owns the §13 portfolio commons lifecycle — harvest, single-best-match (k=1) brokering, freshness, write-back; never decides product direction, ships product code into a venture, or merges |
| **HITL** | The human owner (§10) | Answers open questions, merges the default branch, owns deploys and anything irreversible |

**Specialist implementers** carry their domain's pillar bias — `backend`
(data integrity, idempotency, migrations, efficiency), `frontend` (the UX pillar,
real-client verification), `security` (fail-closed hardening, least privilege),
`devops` (CI/CD pipelines, deploy config, releases, rollback).
They compose with, and never replace, independent review: a specialist BUILDS,
the fresh-context `reviewer` VERIFIES. No specialist self-approves, merges, or
pushes the default branch. Reach for them when a session has a clear single-domain
slice, or when a mission has parallel slices that can run at once; a plain session
on the main agent is fine for small or cross-cutting work.

**Roles are runtime-neutral: the prompt is the role, the runtime is a spawn
detail.** A role runs on `claude` (the Agent tool, the default) or on a foreign
runtime like **Codex** (`tools/run-codex.mjs`, §9) when the mission's tune table
or a brief's `runtime:` field says so — the same role prompt, read list, and
return distillate either way. What differs is only mechanical: inside Codex the
guardrails are the execpolicy rules file plus the sandbox mode (§3), and the
**orchestrator**, not the run, writes the ledger and the commits.

**Intake** (`intake`) is the front-door classifier for an un-invoked request:
when a plain-language work request arrives mid-chat with no command (the router
hook nudges it), the orchestrator spawns `intake` to classify its altitude
(mirroring `/agentic-workflow:next`'s tree — raw idea → brainstorm, defined feature → plan →
mission, small isolated → fix, unsure → next), shape it into a crisp problem
statement, and RETURN the recommended `/agentic-workflow:` route. It only reads and
recommends — it never runs commands, spawns agents, builds, or merges; the
**orchestrator drives** the recommended flow and the human owns every gate. It
also distinguishes a work request from plain conversation, never command-ifying
chat.

**Brainstormer** (`brainstormer`) works at the very front of V0, upstream of the
researcher: it turns a raw, fuzzy idea into 2–3 genuinely distinct framings —
each with the bet it makes, who it serves and who pays, the core value, and its
riskiest assumption — for the human to choose between. It questions the premise,
not just the solution; it is a thinking tool, not an evidence tool (no market
data required). Convened via `/agentic-workflow:brainstorm` (or `/agentic-workflow:bootstrap` at V0); it seeds
`docs/product/idea.md` with the chosen framing and hands off to the researcher
to validate. Like the advisor it is gate-bound, never ambient — and it never
decides, validates, designs, or builds.

**Researcher** (`researcher`) works upstream of code, in V0: it validates the
problem, sizes the market, maps competitors, and pressure-tests the riskiest
assumption with cited evidence for AND against, drafting `docs/product/idea.md`.
Like the reviewer, its value is independence — it hunts disconfirming evidence
rather than selling the idea. It informs the human's go/no-go; it never decides.

**Planner** (`planner`) decomposes an already-decided mission into the `.plans/`
trio, doing the expensive exploration once so execution sessions never do. It
pre-resolves every brief's targets and sizes them to the context budget; it does
tactical decomposition, not strategic scope (main session + HITL own that). Driven
by `/agentic-workflow:mission`.

**Architect** (`architect`) is the technical consultant for shape-before-build
decisions. At V1 it authors the stack decision and data-model sketch as option
memos — 2–3 options, tradeoffs, reversal cost, a recommendation — under
`docs/product/decisions/`; during missions it digests technical open questions
into decision-ready memos. It also authors and maintains the two living system
docs the implementers build from — `docs/product/engineering/architecture.md` (components,
data model, invariants) and `docs/product/engineering/interface-contract.md` (the
frontend/backend boundary that keeps parallel slices from diverging) — thin,
intent-and-contract only, pointing at the code index rather than re-narrating
code. It consults; the human decides (dated locked
decisions), implementers build, the reviewer verifies — it does none of those.

**Advisor** (`advisor`) is the decision red-team: the reviewer's counterpart
for judgment instead of code. Convened at the human gates via `/agentic-workflow:counsel` — 2–3
fresh instances, lens-partitioned (technical / market / financial, plus
behavioral for engagement-critical decisions) — each
argues the strongest case AGAINST the pending recommendation with cited
evidence and returns counsel (proceed / proceed-with-changes / hold), merged
into a one-page brief recorded in the decision log. It never decides, never
blocks, never edits the artifacts it critiques — and it is bound to the gates,
never ambient.

**Designer** (`designer`) works at V1–V2 and for redesigns: it surfaces several
distinct brand/UX directions for the owner to choose from, then organizes the
chosen one into a design-token system the `frontend` agent implements. It also
owns the **UX brief** (`docs/product/ux-brief.md`: personas grounded in the
researcher's evidence, user journeys with acceptance criteria, and information
architecture) at V1 — what the `frontend` builds from — and runs the
heuristic usability evaluation in the V4 UX audit (flagging its own
independence caveat). It proposes and organizes; the owner picks; frontend
builds.

**Marketing** (`marketing`) works at V5–V6: it turns the V0 evidence and the PRD
into launch assets under `docs/product/launch/`, one file per deliverable —
positioning (statement, ICP, pillars), landing-page copy, per-channel
announcement drafts in the owner's voice, a post-launch content plan, and a
`launch-plan.md` index carrying the channel plan and launch metrics. At V6 it
reviews the funnel, keeps the content plan current, and proposes channel
experiments as growth-mission candidates. Its copy is product-truthful (claims
trace to evidence or shipped behavior). It drafts; the **human publishes** —
outward publishing sits on the safety boundary (§11).

**Business** (`business`) owns the venture's viability math and business
documents (`docs/product/business/`): the business model (value metric, revenue
model, cost to serve, unit economics), the pricing strategy, and a one-page
executive summary refreshed at every stage transition. It proposes at V1
(model + pricing hypothesis with the PRD), finalizes against measured costs at
V4–V5, and proposes pricing experiments at V6. It proposes with evidence from
the V0 research; the **human decides** model and prices — and it never spends
or charges (§11 safety boundary).

**DevOps** (`devops`) owns the delivery pipeline as a first-class artifact —
CI/CD, GitHub Actions workflows, deploy config, environments, releases, rollback.
It lays the pipeline at V2 and prepares the launch at V5, co-owning CI security
posture with `security`. It prepares deploys/releases; the human fires the
irreversible ones (see §11).

**Ops** (`ops`) owns V6 operations: error/monitoring triage ranked by user
impact, runbook truthfulness, postmortem drafts, and infra-cost review against
the business model — each finding converted into a ranked, runnable mission or
session candidate. It is read-only against production; restarts, rollbacks, and
deploys are the human's to fire. Usually convened via `/agentic-workflow:operate`.

**Writer** (`writer`) is the optional copy & content craft specialist —
convened when a slice is copy-heavy (landing-page pass, UI-string sweep,
articles/docs, terminology audit), never a mandatory stop. It owns the **copy
kit/glossary** (`design/brand/copy-kit.md`, seeded by the `designer`): voice
rules, one-term-per-concept glossary, and string patterns applied per surface —
UI, marketing, docs. Every agent writes to the kit; the writer is the
specialist who maintains it and does the heavy drafting. It never publishes
(§11), never invents claims, and never owns positioning (`marketing`) or the
brand voice itself (`designer`).

**Analyst** (`analyst`) is the venture's measurement engine. It owns the
tracking plan (every event, and the question it answers), reads the numbers,
and hands cited conclusions to `marketing` (funnel), `business` (unit
economics), `ops` (trends), and the efficiency audits — so the venture runs on
one set of measurements instead of three improvised estimates. It specifies
instrumentation (implementers wire it, with review) and never invents a
number: unmeasured stays "unmeasured".

**Compass** (`compass`) holds the venture's *direction*: where the hooks keep the
orchestrator on protocol, `compass` keeps it on **purpose**. It owns
`docs/product/north-star.md` (human-owned Purpose + worthy-progress definition +
a live done-vs-roadmap rollup it maintains) and runs at strategic beats — a new
`intake` request, a phase-end, a periodic `/agentic-workflow:operate` sweep, or
on demand — judging whether the work in flight advances the end-goal. On a
concrete, named strategic drift it fires ONE **Alert-tier §12** owner
notification (severity- and frequency-gated so it never cries wolf, secrets by
name only, owner-only). It flags; it never decides, kills, builds, or merges —
purpose-misalignment is the human's call. Distinct from `advisor` (red-teams one
pending decision) and `analyst` (measures numbers); it runs independently of
`intake` and is never a hard gate on a route.

### 6.0 Writing for the owner (the plain-report rule)

A report is judged by what the owner can DO with it, and the owner was not in
the session. Every surface that talks to a person — orchestrator reports,
owner-channel notifications (§12), the status page and JOURNEY, any "decision
needed" message — follows the **`plain-report` skill**: define every id/term
the first time (`OB-6` means nothing to the owner — write "the split-payment log
check (OB-6)" once, then the id), lead with the action not the preamble, explain
instead of repeating, cut AI vocabulary and puffery, and use the plain word.
Structured status (gate tables, before/after) stays tabular; narrative prose
gets plain sentences. *Incident (orderly, 2026-08-20): a correct 20-hour session
handed the owner internal shorthand and a bare deadline date it never explained,
and took two rewrites to say the plain thing.* It does NOT touch commit messages
(fixed format), ledger rows (data), or code.

### 6.1 Documentation of record (Chronicler)

Three artifacts kept current so the project's story survives any single session:

- **`CHANGELOG.md`** — technical, Keep-a-Changelog format, PR-referenced.
- **`docs/product/JOURNEY.md`** — posterity, plain-language narrative, append-only.
- **`docs/product/overview.html`** — the owner's **live status page**: current
  stage, work in flight, owner action items, pillar health, timeline. Self-
  contained HTML published as a Claude Artifact to a stable URL (recorded in the
  file's `artifact-url` comment) the owner keeps bookmarked.

**When**: at session close, at every checkpoint, and at stage transitions. The
implementer spawns the chronicler with a summary (PRs, deviations, incidents, any
stage change); the chronicler edits the three files, then the **main session
republishes** `overview.html` via the Artifact tool to its recorded URL
(subagents cannot publish artifacts). Task-altitude changes update CHANGELOG only.

**The catalog — what the product IS (state, not history).** The three
artifacts above say what *happened*; a fresh session that has to replay them to
learn the current shape builds on old knowledge. `docs/product/catalog/` holds
the current state, in two halves:

- **Derived, never stale** — `api.md` (every route: method, path, auth class,
  handler) and `data-model.md` (models, fields, relations, enums), generated by
  `tools/catalog.mjs` (shipped by the plugin, copied in by
  `/agentic-workflow:bootstrap` / `adopt` / `sync`) from the route files and the
  schema. Deterministic and sorted, so **`git diff` on them IS the API and
  data-model change log**; `--check` fails when they are out of date.
  `README.md` (≤40 lines, generated) carries counts + the last five changed
  features — the first thing a session reads.
- **Curated, rewritten in place** — `features.md` (`templates/catalog-features.md`):
  one row per capability — `id · name · status (live|changed|removed) ·
  marketable · audience · current behavior · anchors · last change · benefit`.
  The `chronicler` rewrites rows at checkpoints and `/agentic-workflow:end`
  (never appends; history stays in the CHANGELOG); `marketing` fills only
  `benefit`. Every row's **anchors must resolve** — `tools/catalog.mjs --verify`
  fails otherwise; `/agentic-workflow:groom` and the reviewer run it.

**Consumed, so old knowledge cannot be built on**: `/agentic-workflow:start`,
`/agentic-workflow:next` and the compact-resume directive read
`catalog/README.md`; the `planner` lists in every brief the `features.md` rows
and `api.md`/`data-model.md` sections whose anchors intersect the brief's
reads; builders read a row before touching its anchor and name the rows they
changed at hand-off; the `reviewer` REQUEST CHANGES a diff that touches
`server/api/**`, the schema, or a catalogued anchor without a catalog update in
the same PR (`--check` green, the row edited). **Marketing reads the catalog,
not the changelog**: landing page, launch assets, the sales kit's
`data:capabilities` and "What's new" draw facts only from rows with
`marketable: yes` + `status: live`. *Incident (orderly, 2026-08-19):* 304
routes, a 158 KB schema and an openapi endpoint with no derived inventory; a
1,848-line CHANGELOG as the only "what is built"; landing copy drafted from
that changelog. Sessions were building on old knowledge because nothing said
what the product is.

### 6.2 The context firewall — bounded returns & the fresh-self handoff

A context window fills mostly with **tool output** — file reads, command dumps,
subagent reports — not the dialogue. When it nears the limit the harness
auto-summarizes older context, and that paraphrase **dilutes fidelity**. The
defense is never a better summary; it is to keep the window lean and, when it
still fills, hand off to a fresh agent that **re-reads verbatim files** rather
than inheriting a summary. Two rules make that work:

**Bounded returns.** A spawned agent's final message to its caller is a
**distillate, not a transcript** — target ≤~15 lines: status · changed *paths*
(not diffs) · verify signal (green/red + first error — §2, "gates not logs") · deviation
*references* (not content) · what's next / to re-verify. The heavy reading and
building happened in the subagent's OWN context; only the distillate crosses
back. The caller ingests conclusions, not corpora (§2, principle 2), and pulls
detail from the named files on demand into its own budget. `advisor` (one page)
and `chronicler` (≤10 lines) are the model.

**Bounded writes.** The firewall has a write side. The orchestrating session
**authors only the ledger**, plus edits of roughly fifteen lines or fewer; any
longer document — a PR body, a report, a spec — is authored by a **subagent and
comes back as a path, not as content**. The reason is fidelity and division of
labour: the reading a document needs belongs in the window of the agent that
writes it, and a document the caller composes out of a subagent's distillate
sits one paraphrase further from the source files. This is discipline, not a
gate — nothing checks it for you.

**Delegated reads.** The read side binds the driving session too — interactive
work included, not just missions. Before pulling a large file or corpus into
the window, ask whose window the reading belongs in: when what you need is a
conclusion — a summary, an anchor list, a yes/no — spawn a subagent to do the
reading in its own context and return a bounded distillate, and spend your own
budget on ranged reads of only what you must see verbatim. Pulling a corpus
into the very window you are trying to preserve is how an interactive session
drifts toward compaction; the `Read` advisory reflex (§3) backstops the worst
case — a whole-file read of a large file — but the discipline, not the reflex,
is the lever. This is the same explore-once ethos that keeps a planner's briefs
lean (§5), applied at the moment of each read.

**The fresh-self handoff.** The interactive main session is context-disciplined
too — the same "ledger outlives the transcript" rule (§2, principle 1) and loop
mode (§5) that protect missions apply here. Externalize durable state to files
continuously; when context fills (past ~half for a driving/interactive agent),
run `/agentic-workflow:handoff` to write a **re-read manifest** (`docs/product/session-handoff.md`
— goal, locked decisions, next, and *pointers* to the real artifacts), then the
human starts a fresh session that resumes from it. A new agent re-reading files
is lossless where an auto-summary is not; a sharp agent at low context beats a
tired one near the limit. Agents prepare the handoff; the human fires the reset.
If context compacts before the human fires that fresh session, `compact-resume`
(§3–§4) catches it automatically at the next `SessionStart`: absent an active
mission ledger, it falls back to this same handoff file, states its freshness
against the transcript, and re-reads it verbatim — the manual reset and the
automatic fallback are one mechanism reading one file, just triggered at
different moments.

## 7. Fulfilment: definition of done

DONE = gates green → live verification passed (real client for UI) → docs updated
when behavior/config changed → **catalog current** (`docs/product/catalog/`
regenerated and the feature row rewritten when a route, the schema, or a
catalogued anchor changed — §6.1) → PR merged by HITL → **post-deploy verification on
the deployed instance** for anything user-facing (`/agentic-workflow:verify` is the vehicle:
drive the real flow, confirm monitoring is receiving, record the result).
"Deployed and verified" is the finish line, not "PR open".

## 8. Evolution: the loop that improves the loop

- **Retro** after significant missions: what to keep/change lands as edits to THIS
  document or the guardrails — via PR like any other change.
- **Lessons become memory or docs**: project-derivable facts → repo docs;
  agent-behavioral lessons → auto-memory. Never both.
- **Stale-doc rule**: any session that catches docs lying about the code fixes it
  in the same PR.
- **Harness changes are code**: hooks, commands, agents, and this protocol are
  versioned and reviewed like source.

## 9. How this maps to the plugin

- Agents ship with the plugin: `intake` (front-door classifier — routes an
  un-invoked plain-language request by altitude), `brainstormer` (V0 idea-shaping,
  front of the lifecycle), `researcher` (V0 validation), `designer`
  (V1–V2 brand/UX, journeys/IA, V4 usability pass), `architect` (V1
  shape-before-build option memos), `business` (V1/V5/V6 model, pricing,
  business documents), `planner` (mission decomposition), `advisor` (decision
  red-team at the human gates, via `/agentic-workflow:counsel`), `marketing` (V5–V6
  go-to-market), `ops` (V6 operations), `analyst` (measurement engine),
  `compass` (holds the venture's direction — owns the north-star, flags strategic
  drift), `writer` (optional copy craft — owns the copy kit/glossary), `reviewer`,
  `chronicler`, and the specialist implementers `backend`, `frontend`,
  `security`, `devops` (CI/CD, deploy, releases).
- **Model tuning**: `/agentic-workflow:tune <agent> <model>` shadows a plugin agent with a
  project-level copy (`.claude/agents/`) whose only change is the model —
  upgrade an underperformer, `/agentic-workflow:tune <agent> reset` to restore the default.
  When a `TUNED`-prefixed variant of an agent exists, orchestrators spawn
  THAT one. Tunes are files: committed and reviewed like any harness change
  (§8).
- Guardrail hooks (§3) install automatically.
- Commands: `/agentic-workflow:welcome` (the guided front door — orient, then
  guide or auto-drive, filling the project docs), `/agentic-workflow:brainstorm` (shape a raw idea into a chosen framing via the
  `brainstormer`, before validation), `/agentic-workflow:bootstrap` (bootstrap a project into this workflow),
  `/agentic-workflow:adopt` (one-command adoption for an existing project: bootstrap + convert
  existing plans + stage-gap report; `fill` mode also drafts the missing
  document deliverables, decisions pending), `/agentic-workflow:autopilot` (drive an idea to
  launch-ready, §11), `/agentic-workflow:mission` (plan + drive a multi-session mission),
  `/agentic-workflow:plan` (interview-driven feature planning: brief, journeys, memos,
  counsel, trio — in one command), `/agentic-workflow:counsel` (advisor red-team on a pending decision), `/agentic-workflow:audit` (on-demand
  adversarial pillar audit), `/agentic-workflow:release` (cut a version), `/agentic-workflow:verify` (post-deploy
  verification, §7), `/agentic-workflow:settle` (probe deferred obligations, fire the
  condition-met safe class — merged-branch + worktree reaping behind the
  deploy-green gate — surface the rest, and hold the mission-close gate),
  `/agentic-workflow:operate` (the V6 loop), `/agentic-workflow:publish` (the §14 publishing
  pipeline — connect channels, stage the queue, fire under the Publish policy),
  `/agentic-workflow:sync` (bring
  docs/WORKFLOW.md up to the installed protocol master), `/agentic-workflow:next` (recommends
  the single best next command from the project state), `/agentic-workflow:doctor` (machinery
  diagnosis — environment tools, §10 truthfulness; `fix` installs missing dev
  tools like codegraph and ripgrep), `/agentic-workflow:tune` (per-project agent model
  upgrade/reset), `/agentic-workflow:connect` (interactive owner-channel setup with a
  round-trip test), `/agentic-workflow:handoff` (snapshot working state to a re-read manifest for
  a fresh-self continuation — §6.2), `/agentic-workflow:start`,
  `/agentic-workflow:check`, `/agentic-workflow:pr`, `/agentic-workflow:end`, `/agentic-workflow:fix`, `/agentic-workflow:retro`.
- The `protocol` skill points every session at the project's
  `docs/WORKFLOW.md` (or this master if none exists yet).
- Templates for the status page, `idea.md`, `flight-plan.md`, `decision-log.md`,
  the V1 `prd.md`, the `designer`'s `ux-brief.md`, the `architect`'s
  `architecture.md` and `interface-contract.md`, the architect's option memo
  (`decision-memo.md`), the mission
  trio (`mission-plan.md`, `mission-sessions.md`, `mission-state.md`),
  the launch asset set (`launch-plan.md`, `launch-positioning.md`,
  `launch-landing-page.md`, `launch-announcement.md`, `launch-content-plan.md`),
  the publishing pipeline (`publish-queue.md`, `publish-log.md`),
  the `session-handoff.md` re-read manifest,
  the business set (`business-executive-summary.md`, `business-model.md`,
  `business-pricing.md`), the `compass`'s `north-star.md` (Purpose +
  worthy-progress definition + done-vs-roadmap rollup), and this protocol live
  under the plugin's `templates/`.
- **Runtime adapters** let a role run outside Claude. `tools/run-codex.mjs` spawns
  a role on the Codex CLI in the background and returns the shared **distillate**
  (`templates/distillate.schema.json`), which the orchestrator reads as a FILE;
  guardrail parity is the execpolicy rules file (`templates/codex.rules` →
  `<repo>/.codex/rules/agentic-workflow.rules`) plus the sandbox mode the adapter
  derives from the role's `tools:` (§3). Role prompts live in `agents/` either
  way; a Codex-native repo reads conventions from `AGENTS.md` (seeded from
  `templates/agents-md.md`) — a runtime-neutral pointer that `CLAUDE.md` imports
  via `@AGENTS.md`, not the other way round.
  `/agentic-workflow:connect codex` trusts the repo and proves the round trip;
  `/agentic-workflow:tune <agent> codex[:<model>]` puts a role on Codex;
  `/agentic-workflow:doctor` probes the available runtimes. The **plan-judge** (a
  `reviewer` mode, §5) is the one-shot read-only check over the plan trio before
  any brief runs.

## 10. Project profile (filled by `/agentic-workflow:bootstrap`)

_Filled 2026-10-06 by `/agentic-workflow:bootstrap`. Stage at bootstrap: **V6 Operate & evolve** — the
site is live at https://bahrain.js.org with real community users. Rows marked
`TBD — confirm` await the owner; everything else was read from the repo._

| Key | Value |
|---|---|
| **HITL (merge/deploy authority)** | Baker (`git config user.name`; GitHub org `bahrain-js`) — TBD — confirm |
| **Merge policy** | `human-only` |
| **Publish policy** | `human-only` — no publishing channels connected yet (`/agentic-workflow:publish connect`). Community channels listed in `README.md`: Discord, Reddit, Instagram, WhatsApp, npm org `@bahrain.js` |
| **Default branch** | `main` |
| **Staging** | `none` — GitHub Pages deploys only from `main`; there is no preview/branch deploy. Until the first mission creates `staging` (and a Pages/Cloudflare preview for it) and records it here, a phase is verified locally: `pnpm build && pnpm preview`, driven in a real browser against the Neon data the build points at |
| **Test gate** | `pnpm test` (Vitest, `tests/**`, happy-dom; needs no live services). **Not run in CI** — `.github/workflows/ci.yml` runs lint + typecheck only |
| **Typecheck/lint gate** | `pnpm lint && pnpm typecheck` (exactly what `.github/workflows/ci.yml` runs on every push) |
| **Build** | `pnpm build` (`nuxt build`, Nitro preset `github-pages`, prerender `failOnError: false`). The deploy workflow runs `npx nuxi generate` → `.output/public` |
| **Datastore seed/reset** | `none` — Neon Postgres (remote, shared by prod and dev; `NUXT_PUBLIC_NEON_DATA_API_URL`). Schema changes are hand-run SQL in `migrations/*.sql` via the Neon SQL editor; no seed script, no reset path — agents never bulk-mutate it |
| **Remote executor** (optional) | `none` |
| **Runtimes** | `claude only` |
| **Test users / auth access** | `none` — sign-in is GitHub OAuth via Neon Auth (`app/composables/useAuth.ts`); no seeded credentials. Admin = `members.role = 'core'` / `founder` flag (`migrations/001_add_founder_flag.sql`, `app/composables/useAdmin.ts`). Auth flows are verified only in a human-driven browser session |
| **Deploy + live-verify** | Push to `main` → `.github/workflows/deploy.yml` (`npx nuxi generate` → `actions/deploy-pages`) → https://bahrain.js.org (GitHub Pages behind Cloudflare; `public/CNAME`). Wait: `node tools/ci-wait.mjs <sha>` in the background. Verify (`/agentic-workflow:verify`): real browser on https://bahrain.js.org — home prerendered, `/events/`, `/people/`, `/projects/`, `/opportunities/` load Neon data client-side, `/blog/` prerendered, console clean, trailing-slash links resolve without a cross-protocol redirect |
| **Eval suite** (behavioral, if any) | `none` |
| **High-impact files** (docs-reminder targets) | `AGENTS.md` / `CLAUDE.md` (gitignored — see Local amendments), `docs/WORKFLOW.md`, `nuxt.config.ts`, `.github/workflows/*.yml`, `migrations/*.sql`, `app/types/index.ts` (mirror of the Neon schema), `app/composables/useNeonClient.ts`, `app/composables/useAuth.ts`, `docs/product/engineering/architecture.md`, `docs/product/catalog/features.md` |
| **Code index** | codegraph — MCP tools `codegraph_search` / `codegraph_context` / `codegraph_explore` / `codegraph_callers` / `codegraph_impact`; CLI `codegraph` (`~/.local/bin/codegraph`) via Bash for agents without the MCP tools. **Index not initialized** (`.codegraph/` absent at bootstrap) — run `codegraph init -i` once; grep-first (`rg`) until then |
| **Memory/recall store** (optional) | `.remember/` (remember-plugin session log, untracked) and `.memory/` (gitignored owner notes: `checkpoint.md`, `gotchas.md`, strategy docs) — accelerators only; `agentmemory` MCP is configured but did not connect at bootstrap |
| **Version pin** | `none` — `package.json` carries no `version` key; the site ships continuously from `main` |
| **Owner channel** (§12) | `none` — set up with `/agentic-workflow:connect` |
| **Portfolio** (§13, optional) | `none` |
| **Catalog** | `docs/product/catalog/` — `catalog.config.json` sets `routesDir: "none"` and `schemaFiles: []` (no `server/api`, no Prisma; the data model lives in Neon and `app/types/index.ts`), so `api.md`/`data-model.md` are stubs and `features.md` anchors are file paths. `node tools/catalog.mjs --verify` |
| **Issue tracker** | GitHub Issues via `gh` (`bahrain-js/bahrain.js`). Queue labels created 2026-10-06: `type/{bug,feature,debt,ops}`, `size/{XS,S,M}`, `stale`, `needs-owner`. 0 open issues at bootstrap — `/agentic-workflow:groom` imports the hand-written backlogs (`docs/project.md` §6, `PRD.md`, `tasks/*.md`) |

## 11. Autopilot mode

`/agentic-workflow:autopilot "<idea>"` drives the whole lifecycle (V0→V5, then a V6 handoff) with
the bare-minimum human input — validation, definition, design choice, foundation,
build, hardening, and launch-prep — pausing only at the gates a human must own.
It's the same workflow, orchestrated end-to-end instead of session-by-session.
On an **existing project**, autopilot first runs the `/agentic-workflow:adopt` procedure
(profile, plan conversion, stage-gap audit), then resumes at the first stage
whose exit gate isn't met — the gap report's findings become its first work
items; existing artifacts are settled history, not gates to re-run.
Autopilot does not run V6 operations; at the launch gate it hands the owner a V6
operating brief (feedback channels, ranked growth backlog, retro cadence) and ends.

**The only upfront ask is a flight plan** (`docs/product/flight-plan.md`, from the
bundled template): the idea, a budget ceiling, risk tolerance, a brand preference
(or "you choose"), the deploy target, and how often to check in. That is the
standing authorization; anything outside it returns to the human. The check-in
level also selects the mission **gate policy** (§5): "check in each stage" keeps
the default `human-merge` at every phase; "only hard gates" authorizes `batch` —
phases land autonomously on `staging` (verified there, never the default
branch) and the human merges staging → default once, at the consolidated
launch confirmation.

**Autopilot inherits the §5 convergence rules unchanged.** The flight plan
carries an `Estimate:` for the whole flight (sessions per stage, written by the
planner at V3 and by autopilot itself for the other stages) and autopilot
increments `Sessions used:` in the active mission ledger at every stage step,
brief and `continue` tick, so the mission-budget hook (§3) reads it and the
🛑 OVERRUN stop applies to the flight exactly as to a mission: at 1.5× the
estimate autopilot stops and gives the owner the scope decision (ship the
subset that exists / continue at a revised estimate / abort) through the owner
channel or the next interactive turn — it never keeps building silently. No
standing/resident agents (LA-5): counsel, review and audit are one-shot spawns
at gates. Every stage's merges and gate verdicts are written to the ledger and
decision log as they happen (LA-6). Design-quality tooling runs at the
checkpoint cadence (§0.2), never as a per-turn feed.

**What runs autonomously**: the reviewer-verified stage gates. The `researcher`
validates (and can auto-stop on kill criteria); the `designer` picks a direction
if pre-authorized and drafts the journeys/IA; the `architect` shapes stack and
data model as option memos; the `business` agent proposes model and pricing (V1)
for the human to approve with scope; `devops` lays the pipeline (V2) and stages
the release (V5); `marketing` drafts the launch assets (V5) for the human to
publish; `backend`/`frontend`/`security` build with a `reviewer` checkpoint per
phase (one corrective retry, then surface); the `chronicler` keeps the status
page live as the owner's window; a `decision-log.md` records every autonomous
choice and how to reverse it. At the human gates, `/agentic-workflow:counsel` convenes the
`advisor` red-team so each pause arrives with the case against in hand.

**The safety boundary is never crossed autonomously** — even here, these need an
explicit human confirmation each time (pre-authorization lets you *prepare*, not
*fire*): merging the default branch (unless the §10 **Merge policy** delegates it
— the delegation itself is a human decision, and even then only reviewer-APPROVEd
PRs or §13 registry bookkeeping, never direct pushes), deploying to production /
going live, spending beyond
the flight-plan ceiling, publishing outward or messaging on the owner's behalf
(unless the §10 **Publish policy** delegates **organic** publishing — scoped,
dated, revocable, §14; paid promotion and individual outreach to real users stay
never delegable), launching behavioral experiments on real users (propose the
hypothesis and measurement plan; the human launches), and
destructive/irreversible actions. Two authorities are delegable — **merge**
(§10 Merge policy) and **scoped organic publishing** (§10 Publish policy) — each
an explicit, dated, revocable human act; everything else here (deploys, spending
including paid promotion, individual outreach, behavioral experiments,
destructive actions) is never delegable. These are **batched**: at
the launch boundary the human gets ONE consolidated "ready to launch" summary to
confirm, not a stream of interruptions.

Autopilot mode is therefore *autonomous up to the reversible boundary*, with the
irreducible human decisions collapsed to the fewest, best-informed touchpoints.

Autopilot is also **crash-safe and context-disciplined** like every other part
of the machinery (§2): its durable state is files (flight plan, decision log,
stage artifacts, status page), it ends cleanly at a stage boundary when its
context fills, and `/agentic-workflow:autopilot continue` re-derives the current stage from
those files and resumes — locked decisions stay decided. That makes autopilot
**loop-drivable**: a recurring `/loop /autopilot continue` (or a scheduled
agent) advances the venture one clean stage boundary per tick. `/loop` is
session-scoped and does not reset the context window, so the stage-boundary
stop still matters — but because state lives in files, any tick can be run
from a fresh context (`/clear`, a new session, or a scripted `claude -p`)
without losing anything. Human confirmations may arrive through the verified **owner
channel** (§12) — another input device for the same human; the boundary list
above is unchanged.

## 12. Owner channel — notifications & remote gate decisions

An indefinitely-operating project needs a push channel to its owner; gates
must not block invisibly. The owner channel is a **private, owner-configured
DM** (Telegram bot chat, Slack DM), recorded in §10 — set up interactively
with `/agentic-workflow:connect` (guided steps, auto-discovered IDs, round-trip test). Direction is the
boundary: messaging THE OWNER is telemetry; any audience beyond the owner
makes it publishing (§11, human-gated). Sends are best-effort side effects —
a notification failure is logged and never blocks work.

**Outbound — three tiers, never routine progress** (the status page stays the
pull surface):

| Tier | When | Examples |
|---|---|---|
| **Gate** | Work is blocked on the human | approval ready, kill-stop, escalation after one-corrective-retry |
| **Alert** | The owner would want to know now | `/agentic-workflow:verify` FAIL, user-impacting incident, budget ceiling near |
| **Digest** | Rhythm | one message per `/agentic-workflow:operate` cycle: ≤3 lines + status-page link |

Messages carry summaries and links (PR, status page) — never secrets.

**Inbound — remote gate decisions, fail closed:**

1. **Interactive where daemon-free**: Telegram gate notifications carry
   buttons (Approve / Reject / Hold) whose callback payload is the gate
   nonce — callbacks arrive via the same `getUpdates` polling as messages.
   Slack's daemon-free equivalent is **emoji reactions** on the gate message
   (✅ approve / ❌ reject / ✋ hold, read via `reactions.get` polling) —
   structurally bound to the gate because the reaction sits ON the message,
   and carrying the reactor's id. Typed replies (`approve <id>`) are the
   universal fallback and carry reject reasons; Slack Block Kit buttons need
   an interactivity endpoint, which most solo setups don't have.
2. **Identity pinned**: only the §10 owner id counts; verify the transport's
   signature/secret where offered. Unverifiable input is ignored AND reported
   (alert tier — someone knocked).
3. **Nonce-bound, single-use, expiring**: the pending gate is written to
   `.plans/pending-gates.md` (id, what it decides, TTL) BEFORE the
   notification goes out; a decision must carry that id, is consumed once,
   then the message is edited into a receipt ("Approved 14:02", buttons
   removed). Expired gates get their buttons removed too.
4. **Decision gates only**: buttons resolve decisions the agents then act on
   (scope/brand/model approval, open questions, kill-stop, hold/continue).
   Irreversible ACTIONS — merge, deploy, spend, publish — are never fired
   from a chat tap: the notification carries the link and the human fires
   them where they live (unless §10 delegates merges, where the normal
   reviewer-APPROVE path applies). Free text (a reject reason) is recorded
   as content, never executed as instructions.
5. **Recorded**: every channel decision lands in the decision log with the
   message reference — the same auditability as a terminal approval.

**Multi-project, one owner.** Several projects on one machine can share the
owner — with transport-specific rules:

- **Slack shares cleanly**: one app/token machine-wide. `conversations.history`
  is a NON-consuming read — every project polls independently with its own
  local read cursor, nobody steals messages. A shared DM works for a few
  projects; a private channel per project (bot invited, that channel id as
  this project's `SLACK_OWNER_DM` in its `.env`) gives a named stream per
  venture.
- **Telegram: one bot per project**. `getUpdates` has a single CONSUMING
  offset per bot — two projects polling the same bot race each other and
  steal updates (including button taps). A fresh BotFather bot per project
  (token in the project's `.env`) avoids the race and yields per-project
  chats.
- **Attribution rules regardless of transport**: every message starts with a
  `[<project>]` prefix; gate nonces embed the project slug
  (`G-<project>-7f3a`); a project matches ONLY its own pending ids when
  polling a shared channel.

## 13. Portfolio — one owner, many ventures

When one owner runs several ventures, portfolio awareness lives in a
**registry repo** — files + git, like every other record. Never a database:
a DB may exist only as the §10 memory *accelerator*; the registry is the
record. Structure:

- **`registry.md`** — one row per venture: name · local path · git remote ·
  stage · status-page URL · owner channel · last `/agentic-workflow:operate`.
- **`ledger.md`** — portfolio-level decisions and handoffs (same rules as
  mission ledgers: dated, append-biased, crash-safe).
- **`precedents.md`** — POINTERS to citable decisions across ventures
  (repo + file + one-line summary), never copies — each venture stays its
  own system of record.
- **`commons/`** — the one **writable, copy-holding** surface: reusable
  artifacts *copied* into the registry (adapted on the way in, improved and
  written back), organized **per-type** as `commons/<type>/<slug>/` with a
  per-entry `README.md`, and indexed by **`commons/index.md`**. `code/` is
  the only populated type in the first increment. This is the deliberate
  exception to the pointer rule: `registry.md` and `precedents.md` stay
  **pointers, never copies**, whereas the commons holds copies precisely so a
  reusable exemplar survives independent of the venture it came from.
- **`overview.html`** — the portfolio status page: every venture's stage
  rail in one view (the first portfolio `/agentic-workflow:operate` seeds it).

Pointers run both ways: the registry points at ventures via paths/remotes
(co-location under one folder is tidy *convention*, never a requirement),
and a venture's §10 **Portfolio** row points back so agents working inside
it can find and cite cross-venture precedent.

**The commons is a curated, freshness-tracked library.** Each `commons/index.md`
entry carries a fixed schema so a consumer can choose without opening every
artifact: **slug · path · type · stack · tags · provenance** (venture · repo ·
pinned commit) **· licence · why-it's-good · reuse-match · `last-reviewed`**.
Provenance and `last-reviewed` are load-bearing, not decorative — they drive the
**freshness signal**: an entry is **stale** when it ages past its `last-reviewed`
threshold OR its source repo has advanced past the pinned commit. Staleness is
computed daemon-free (git + a date, like all §13 awareness) and **surfaced, never
auto-mutated** — a stale entry is flagged for review, not silently rewritten.

**The `curator` agent owns the commons lifecycle.** It finds reusable
artifacts, harvests them (copy-and-adapt into `commons/<type>/<slug>/`, pinning
provenance), brokers them single-best-match to other agents, writes the index
entry, and keeps entries fresh — re-harvesting when the freshness signal fires,
and writing a consumer's improvements back as a delegable bookkeeping PR (below).
This role and the ingest capability that populates the commons — `/agentic-workflow:ingest`,
which copies a reusable first-party artifact into `commons/code/<slug>/`, pins its
provenance, and writes its index entry as a delegable bookkeeping PR — are each
specified in their own protocol surface; §13 fixes only the shared layout and the
invariants they operate on. The commons is **portfolio-global**, not owned by any
one venture: `/agentic-workflow:ingest` resolves its target registry by
`--registry` flag → the registry repo it is run inside → the current venture's §10
Portfolio row → a global default (`~/.config/agentic-workflow/registry`), so a
codebase can be harvested without first adopting it as a portfolio project.

**Brokering is single-best-match (k=1), never a top-N firehose.** The default is
a **read-protocol**: a consumer that needs prior art reads `commons/index.md`,
picks the **single best** matching entry, opens that entry's README + files, and
copy-adapts — it does not pull several. This preserves k=1 by construction and
costs only a file read. **Escalation:** when the commons grows past what one
index read can disambiguate — roughly a screenful of entries per type, OR a
consumer is observed consulting more than one entry — brokering escalates to a
dedicated broker (the curator role, invoked to return exactly one match) so k=1
moves from discipline to enforced structure.

**Registry bookkeeping is delegable.** The owner may set the registry
repo's §10 Merge policy to `agent-may-merge (bookkeeping, delegated <date>)`:
bookkeeping PRs — registry rows, ledger appends, precedent pointers, the
portfolio status page, and commons writes (index entries + copied/refreshed
artifacts under `commons/`) — may then be merged by the orchestrator WITHOUT
independent review. Rationale: the registry is record, not product — no
runtime, no users, fully git-reversible; PRs (never direct pushes, which stay
unconditionally blocked) preserve the audit trail. Merging a commons exemplar
here ships nothing to production: copied `code/` under `commons/` runs nowhere
in the registry — it reaches a live product only when a consuming venture
copy-adapts it **through that venture's own review gates**, so "no runtime"
means the commons is a staging library, never a deploy path, and never a way
for agent-merged code to skip a product's own review. The delegation is scoped:
anything in a registry repo beyond those bookkeeping files (CI workflows,
scripts, this policy file itself) still needs the human.

Awareness is **command-time and daemon-free**, like everything else:
`/agentic-workflow:operate` run in the registry repo sweeps every registered venture — one
reader per venture ingesting its existing *conclusions* (status-page data
regions, ledger `Next up:`, track record), never its corpora — and rolls up
to one report: every stage, blocked gates, and ONE ranked cross-portfolio
backlog (this week's mission goes where?). Registration is a single
`registry.md` row, offered by `/agentic-workflow:adopt`. Ventures without a local checkout
are read via their remotes (`gh`) — slower, same record.

## 14. Publishing & distribution — outward, gated, auditable

Getting the product in front of users is part of the venture, not outside it —
but publishing outward is reputation-bearing and semi-irreversible (a deleted
post was still seen and may stay indexed). So it runs as a **pipeline** with the
same shape as the owner channel (§12): everything up to the moment of publish is
automated; the publish itself is gated. Set up interactively with `/agentic-workflow:publish
connect` (per-channel credentials, secret-rule, round-trip test); driven by
`/agentic-workflow:publish`.

**Prepare — always automated, always safe.** The `marketing` agent (short-form,
strategy) and `writer` agent (long-form articles) populate the **publish queue**
(`docs/product/launch/publish-queue.md`) from the launch assets and content
plan. Each item carries its channel, scheduled time, full body, source asset,
and a state (`draft → approved → posted`). Writing to the queue **fires
nothing**.

**Fire — gated by the §10 Publish policy.**

| Policy | Who fires | What posts |
|---|---|---|
| `human-only` (default, fail-closed) | the human runs `/agentic-workflow:publish run` | approved + due items, from a formatted preview |
| `may-publish (delegated <date>, channels, rate, organic-only)` | a scheduled `/agentic-workflow:publish run` | only approved + due + **organic** items **within the scope** |

The delegation is a §11 authority — the second delegable one alongside merge —
explicit, dated, scoped (channels, rate limit, organic-only), and revocable by
editing the §10 row. **Paid promotion is never in it**: paid crosses the money
boundary (§11 spending), so every paid item is human-fired and bounded by the
flight-plan budget ceiling, confirmed each time. A change to an approved body
resets it to `draft` — re-approval before it can fire.

**Record — the audit trail.** Every successful post appends to the **publish
log** (`docs/product/launch/publish-log.md`: what, where, when, permalink,
source, and the firing authority) and the queue item becomes a receipt — the
same auditability §12 gives channel decisions. **Measure**: the `analyst` reads
the log to attribute funnel results back to posts, into the V6 review.

**Channels**: socials (X, LinkedIn, Mastodon, Bluesky), article platforms
(dev.to, Medium, Hashnode, own-blog), mailing list (Buttondown/Mailchimp/
ConvertKit), and own site / RSS (PR-based). Credentials follow the §12 secret
rule — never echoed, var NAMES only in the profile and `.env.example`, verified
by a round-trip test, values in the human's env.

**Mechanical backstop.** Like the push/merge guardrails (§3), a hook fails
closed: an autonomous publish is **blocked unless the §10 Publish policy
delegates it**, and any paid action is blocked without an explicit human
confirmation regardless of policy. Interactive human-fired `/agentic-workflow:publish run` is
allowed. As with §12, a publish is **never fired from an owner-channel chat
tap** — the delegated firing is a scheduled command within policy, not a button.

## Local amendments

- **Conventions file is gitignored (2026-10-06, bootstrap finding).** `AGENTS.md`,
  `CLAUDE.md`, `PURPOSE.md`, `specs/` and `Bahrainjs-Plan.md` were removed from
  tracking on 2026-03-07 (`70f261a`, `81e330e`) and are in `.gitignore`. The
  workflow expects `AGENTS.md` committed so every clone and Codex run reads the
  same conventions. Owner decision pending: un-ignore `AGENTS.md` + `CLAUDE.md`
  (recommended) or keep them local. Until decided, the local copies carry the
  workflow pointer and `docs/WORKFLOW.md` is the committed source of truth.
- **No server tier.** The app is a thick client: pages call Neon's Data API
  directly through `app/composables/useNeonClient.ts`, and authorization is
  Neon Row Level Security plus client-side admin checks. Every "backend" change
  is therefore SQL in `migrations/` (hand-run, additive only) and the security
  lens at checkpoints reviews RLS assumptions, not route handlers.
- **Tests are not a CI gate yet.** `pnpm test` exists but `ci.yml` does not run
  it; adding it is a `type/debt` queue item, not a local rule change.
