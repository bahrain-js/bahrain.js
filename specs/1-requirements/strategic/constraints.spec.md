---
criticality: CRITICAL
failure_mode: Violating these constraints makes the project unusable or unmaintainable
derives-from:
  - PURPOSE.md
  - specs/1-requirements/strategic/outcomes.spec.md
---

# Project Constraints

## Requirements

- [!] Static-first deployment: The website must deploy to Cloudflare Pages as a static or edge-rendered site.
  - No persistent server process — all server logic runs as edge functions or at build time
  - Cold start for any page must be under 3 seconds globally

- [!] Open contribution model: All content and code must be contributable via GitHub pull requests.
  - Blog posts, event listings, and guides are markdown files in the repository
  - No proprietary CMS or admin panel required to publish content
  - Any community member can submit a PR to add or edit content

- [!] GitHub-based authentication: Member identity is tied to GitHub accounts.
  - OAuth via GitHub is the sole sign-in method
  - Member profiles link to their GitHub username and public activity
  - No email/password auth system to maintain

- [!] Zero recurring cost at launch: The website must operate within free tiers of all services.
  - Cloudflare Pages free tier (500 builds/month, unlimited bandwidth)
  - Neon Postgres free tier (0.5 GiB storage, 190 compute hours)
  - No paid dependencies required for the MVP

- [!] Nuxt 3 ecosystem: The website must use Nuxt 3 with Nuxt UI and Nuxt Content.
  - Framework choice is non-negotiable — it demonstrates JS community identity
  - Component library must be Nuxt UI (consistent, accessible, maintained)
  - Content must use Nuxt Content MDC format for markdown-driven pages

## Validation
- Every constraint has a measurable verification criterion
- No constraint is a preference or design decision — each would break the project if violated
- Constraints are compatible with each other (no contradictions)
