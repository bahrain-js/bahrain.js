---
criticality: IMPORTANT
failure_mode: Community output is invisible, breaking the builder community outcome
derives-from:
  - specs/2-strategy/architecture.spec.md
  - specs/1-requirements/strategic/outcomes.spec.md
---

# Projects Behaviors

## Requirements

- [!] Projects page showcases open source repos from the bahrain-js GitHub org.
  - Each project card shows name, description, tech stack, and contributor avatars
  - npm badge and GitHub stars are displayed when available
  - Featured projects are highlighted

- [!] "Start Here" projects are discoverable for newcomers.
  - Repos with "good-first-issue" labels are surfaced separately
  - Clear guidance on how to contribute (link to contributing guide)

- [!] Project data is sourced from GitHub API with caching.
  - Repo list, stars, description, and contributors fetched from GitHub REST API
  - npm download counts fetched from npm registry when @bahrainjs package exists
  - Data refreshed on a schedule (not per-request)

- [!] Open source pipeline is visible on the projects page.
  - Visual representation: Idea → Builder Session → Prototype → Repo → Package
  - Each project shows its current stage in the pipeline

## Validation
- Project cards render correctly with GitHub data
- Featured project rotation works
- "Start Here" section surfaces beginner-friendly repos
