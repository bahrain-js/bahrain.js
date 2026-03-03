---
applies_to: all_projects
criticality: IMPORTANT
failure_mode: Without taxonomy, agents make incorrect file placement decisions
governed-by:
  - .livespec/standard/metaspecs/taxonomy.spec.md
---

# Project Taxonomy

## Project Domain

**Domain**: Software

This project produces a Nuxt 3 community website deployed to Cloudflare Pages.

## Workspace Scope

**Operating Context** (workspace/):
- ✅ workspace/constitution.spec.md - Development principles
- ✅ workspace/patterns.spec.md - Conventions (naming, format, structure)
- ✅ workspace/workflows.spec.md - Development processes
- ✅ workspace/taxonomy.spec.md - This classification (check FIRST)

**Test**: "Is this ABOUT the workspace or IN the workspace?"
- ABOUT (operating context) → workspace/
- IN (deliverable) → numbered specs

**Deliverables** (NOT workspace/):
- ❌ Product architecture → specs/2-strategy/architecture.spec.md
- ❌ Feature behaviors → specs/3-behaviors/[feature].spec.md
- ❌ API contracts → specs/3-contracts/api/[endpoint].spec.md

## Specs Boundary

**specs/ contains ONLY .spec.md files**

- ❌ No source data (use data/ if needed)
- ❌ No research artifacts (use research/ if needed)
- ❌ No generated outputs (siblings of generating script)
- ✅ Only MSL specifications

## Validation
- Taxonomy declares Software domain clearly
- Workspace scope lists operating context explicitly
- Specs boundary prevents data/research/artifacts in specs/
- AI agents check this file FIRST before creating files
