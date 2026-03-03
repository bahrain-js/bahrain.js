---
criticality: IMPORTANT
failure_mode: Members are invisible and the on-ramp outcome fails
derives-from:
  - specs/2-strategy/architecture.spec.md
  - specs/1-requirements/strategic/outcomes.spec.md
---

# People Behaviors

## Requirements

- [!] Member directory displays opt-in profiles from the database.
  - Profile fields: display name, avatar, bio, GitHub username, skills, "currently building"
  - Profiles are searchable by name and filterable by skill
  - Membership role is visible (Member, Contributor, Maintainer, Core Team)

- [!] Member profiles are created and edited via GitHub-authenticated sessions.
  - GitHub OAuth is required to create or edit a profile
  - Avatar and username are pre-populated from GitHub
  - Members can edit their bio, skills, and "currently building" at any time

- [!] Core team page highlights community leaders.
  - Core team members are prominently displayed with photos and roles
  - Each core team member links to their full profile

- [!] Membership tiers are transparent and public.
  - Tier definitions and advancement criteria are visible on the people page
  - No vanity metrics (follower counts, post counts) — focus on what people are building

## Validation
- Member directory renders profiles from database
- GitHub OAuth login redirects correctly
- Tier labels display accurately for each member
- Core team section highlights the right members
