---
applies_to: all_projects
criticality: IMPORTANT
failure_mode: Without workflows, phases unclear and development unstructured
governed-by:
  - .livespec/standard/metaspecs/workspace.spec.md
---

# Development Workflows

## Requirements
- [!] Project follows five-phase workflow (DEFINE → DESIGN → BUILD → VERIFY → EVOLVE).
  - Phase 0 (DEFINE): Problem, constraints, workspace setup (PURPOSE is most durable)
  - Phase 1 (DESIGN): Architecture, behaviors, contracts (specs before code)
  - Phase 2 (BUILD): Implementation, tests (TDD - acceptance tests semi-durable, unit tests disposable)
  - Phase 3 (VERIFY): Validation, acceptance
  - Phase 4 (EVOLVE): Regeneration workflow - code is disposable, regenerate from specs
  - Discoveries level up to appropriate spec layer or stay disposable

## Validation
- Phases followed in natural order for first pass
- Cycling back when discovering fundamental issues
- Phase 4 regenerates code from specs when needed
