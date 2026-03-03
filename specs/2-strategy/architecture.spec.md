---
criticality: CRITICAL
failure_mode: Without architecture, implementation lacks structural guidance and components are built in isolation
derives-from:
  - PURPOSE.md
  - specs/1-requirements/strategic/outcomes.spec.md
  - specs/1-requirements/strategic/constraints.spec.md
---

# System Architecture

## Requirements

- [!] The system is a Nuxt 3 full-stack web application with two data sources.
  - **Content layer** (Nuxt Content): Markdown-driven pages for events, blog posts, and learning resources. Stored in the repository, contributable via PRs.
  - **Database layer** (Neon Postgres via Drizzle): Member profiles, project metadata, opportunities, and dynamic community stats.
  - Content and database layers are independent — the site functions with content alone, database adds dynamic features.

- [!] The system has seven public-facing page boundaries.
  - **Home**: Aggregation surface — pulls next event, recent projects, and community stats from both layers.
  - **Events**: Content-driven — upcoming and past events rendered from markdown files with structured frontmatter.
  - **Projects**: Hybrid — static showcase cards enriched with live GitHub/npm data via API.
  - **People**: Database-driven — member directory with GitHub-authenticated profiles.
  - **Opportunities**: Database-driven — curated job/gig listings with expiration.
  - **Learn**: Content-driven — curated learning paths and community-written guides from markdown.
  - **Blog**: Content-driven — posts, recaps, and digests from markdown with author attribution.

- [!] Authentication boundary uses GitHub OAuth exclusively.
  - Neon Auth (Better Auth) manages sessions and tokens.
  - Authenticated actions: creating/editing member profile, RSVP to events, posting opportunities.
  - All read operations are public — no auth required to browse.

- [!] External integrations are read-only at the boundary.
  - **GitHub API**: Fetch org repos, contributor lists, commit activity for the bahrain-js org.
  - **npm Registry API**: Fetch download counts and version info for @bahrainjs packages.
  - Data is cached and refreshed on a schedule, not on every request.

- [!] Deployment boundary is Cloudflare Pages with edge SSR.
  - Nuxt renders pages at the edge via Cloudflare Workers.
  - Static content (blog, events, learn) can be pre-rendered at build time.
  - Dynamic pages (people, opportunities, home stats) use server-side rendering.

## External Dependencies

- **Neon** (https://neon.tech/docs) — Serverless Postgres for member profiles, projects, and opportunities data.
- **Drizzle ORM** (https://orm.drizzle.team) — Type-safe database access, edge-compatible.
- **Nuxt Content** (https://content.nuxt.com) — Markdown content management for events, blog, and learning resources.
- **Better Auth / Neon Auth** (https://www.betterauth.com) — GitHub OAuth authentication and session management.
- **GitHub REST API** (https://docs.github.com/en/rest) — Org repos, contributors, and activity data.
- **npm Registry API** (https://github.com/npm/registry) — Package download and version data.

## Validation
- Architecture defines component boundaries without implementation details
- All outcomes from outcomes.spec.md are addressable by at least one component
- All constraints from constraints.spec.md are satisfied
- External dependencies are architecturally significant (not utility libraries)
