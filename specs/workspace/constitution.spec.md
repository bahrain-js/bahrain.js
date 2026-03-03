---
applies_to: all_projects
criticality: CRITICAL
failure_mode: Without constitution, development becomes inconsistent and methodology unclear
context_compression: moderate
governed-by:
  - .livespec/standard/metaspecs/workspace.spec.md
---

# Development Constitution

## Requirements
- [!] Project follows specification-driven development with progressive disposability.
  - Upper layers are durable (PURPOSE → REQUIREMENTS → STRATEGY → BEHAVIORS)
  - Code is always disposable and regenerable from specs
  - Specifications use MSL format (minimal, testable, justifiable)
  - Workspace specs generate AI context (AGENTS.md, context tree)
  - Human owns intention; AI manages specs, code, and alignment
  - Phase 4 (EVOLVE) triggers regeneration when specs change

## Validation
- Specs created before implementations
- All specs follow MSL format
- Specs contain WHAT/WHY only, never implementation HOW
- Code regenerable from specs at any time
