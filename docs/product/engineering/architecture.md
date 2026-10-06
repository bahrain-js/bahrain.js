---
status: semi-static
owner-agent: architect
refresh-trigger: event
---

# Bahrain.js — System Architecture

_What the `backend` and `frontend` implementers need to understand the system
they're building a slice of: the components, how data moves, and the invariants
they must not break. Owned by the `architect`. **Holds only what code search
can't recover**: intent, invariants, and contracts. It points at the code index
for structure and at the decision memos for the "why" — it never re-describes
the code. Keep it thin._

_Seeded 2026-10-06 by `/agentic-workflow:bootstrap` from `docs/project.md`,
`nuxt.config.ts` and `app/types/index.ts` (as built). The `architect` hardens it
via `/agentic-workflow:adopt fill`._

## Components
- **Static site (Nuxt 4, Nitro `github-pages` preset)** — prerenders `/` and
  `/blog/**`; renders `/events`, `/projects`, `/people`, `/profile`,
  `/opportunities`, `/frameworks`, `/admin` client-side only (`ssr: false` in
  `nuxt.config.ts` routeRules). Must NOT contain server routes — there is no
  server at runtime.
- **Neon Postgres via the Data API** — the only datastore; reached from the
  browser through `app/composables/useNeonClient.ts`. Owns all community data.
- **Neon Auth (Better Auth, GitHub OAuth)** — session + identity;
  `app/composables/useAuth.ts`. Members table links `user_id` to the auth user.
- **Nuxt Content** — Markdown blog in `content/blog/`, built at generate time.
- **GitHub API (read-only, public)** — project showcase from the `bahrain-js`
  org via `app/composables/useGitHubRepos.ts`.
- **GitHub Pages behind Cloudflare** — hosting; forces trailing slashes
  (`experimental.defaults.nuxtLink.trailingSlash: 'append'`) to avoid the
  Pages http redirect under the Cloudflare proxy.

## Data flow
A member opens `/events/`: the SPA shell loads, `useAuth` restores the Neon Auth
session, the page queries `events` through the Neon Data API with the session
token, and Row Level Security decides which rows (approved vs the member's own
pending ones) come back. Submissions go the same way — an `INSERT` from the
client, status `pending`, visible to admins in `/admin/`.

## Data model
Types in `app/types/index.ts` mirror the Neon schema: `members`, `events`,
`event_rsvps`, `projects`, `job_listings`, `oss_opportunities`,
`startup_ideas`, newsletter signups. Invariants as built:
- A member row exists per authenticated user; `role ∈ {member, contributor,
  maintainer, core}`; `founder` is a separate boolean
  (`migrations/001_add_founder_flag.sql`).
- Submitted content (`events`, jobs, ideas) carries `status` with `pending` as
  the default; only admins change it.
- Deleting a member cascades to the auth user via a database trigger
  (`a38f7df`).
- Migrations are hand-run SQL in `migrations/`, additive only.

→ _decision memo: none yet_

## Invariants & cross-cutting rules
- **Authorization lives in Neon RLS.** Client-side checks in `useAdmin.ts` are
  UX gating only; any new table or write path needs its RLS policy reviewed —
  the security lens at every checkpoint.
- **No secrets in the bundle.** Only `NUXT_PUBLIC_*` values are injected at
  build (`.github/workflows/deploy.yml`); everything else stays server-less.
- **SSG safety.** Pages that read the session or Neon must stay `ssr: false`;
  prerendered pages must not format locale/timezone-dependent data on the
  server.
- **No runtime server.** A feature that needs a secret or a webhook needs an
  architecture decision first (edge function, Neon function, or a server tier).

## Key decisions
_None recorded as memos yet. Candidates to backfill under
`docs/product/decisions/`: thick-client + RLS instead of a server tier; GitHub
Pages over Vercel/Fly; Neon Auth over a self-hosted auth._

## The seams
There is one real seam — the browser ↔ Neon Data API boundary — described in
`docs/product/engineering/interface-contract.md`.

---
_The `architect` authors and maintains this; implementers read it before
building and honor its invariants; the `reviewer` checks changes against them.
Any session that catches this doc lying about the system fixes it in the same PR
(§8)._
