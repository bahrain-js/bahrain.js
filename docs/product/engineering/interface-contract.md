---
status: semi-static
owner-agent: backend
refresh-trigger: event
---

# Bahrain.js — Interface Contract

_The boundary the `backend` and `frontend` both honor — the one artifact that
lets their slices proceed **in parallel** without diverging. Small on purpose.
Owned jointly by the `architect` and `backend`._

_Seeded 2026-10-06 by `/agentic-workflow:bootstrap` (as built). There is no
first-party HTTP API: the contract is the Neon Data API (PostgREST-style) over
the `public` schema, plus Neon Auth. The `backend`/`architect` fill the
per-table sections via `/agentic-workflow:adopt fill`._

## Scope
Browser (Nuxt SPA pages and composables) ↔ Neon Data API (`NUXT_PUBLIC_NEON_DATA_API_URL`)
and Neon Auth (`NUXT_PUBLIC_NEON_AUTH_URL`). No `server/api` routes exist.

## Conventions
- **Transport** — Neon Data API (PostgREST semantics) via `@neondatabase/neon-js`
  from `app/composables/useNeonClient.ts`; JSON in/out; table names are the
  resource names.
- **Auth** — Neon Auth session token attached by the client; authorization is
  Row Level Security per table. Anonymous reads are allowed where RLS permits
  (e.g. approved events, members, newsletter `INSERT`).
- **Error shape** — the Data API's PostgREST error object; the UI surfaces it
  through `useToast()` (never `alert()`, `5d900d7`).
- **Pagination / filtering** — PostgREST query params; sorting and search done
  client-side today.
- **Versioning** — none; the schema is the contract. Additive migrations only.

## Endpoints / messages
_One block per table the client touches; **TBD — fill from `app/composables/useAdminData.ts` and the pages**._

### `members` — directory + profile
- **Request/Response** — `Member` shape (`app/types/index.ts`).
- **Auth** — read: public; write: own row (RLS); role/founder: admin only.

### `events` / `event_rsvps`
- **Shape** — `CommunityEvent`, `EventRsvp`.
- **Auth** — read approved: public; insert: member (status `pending`); status change: admin.

### `projects`, `job_listings`, `oss_opportunities`, `startup_ideas`
- **Shape** — `Project`, `JobListing`, `OssOpportunity`, `StartupIdea`.
- **Auth** — read approved: public; insert: member; moderation: admin.

## Shared types
`app/types/index.ts` is the single source for wire shapes on the client side;
the Neon schema (`migrations/`) owns the persisted invariants.

---
_A change to this contract is a change to BOTH sides — treat it as a coordinated
edit, not a one-sided tweak, and flag it at the checkpoint. Additive changes
preferred._
