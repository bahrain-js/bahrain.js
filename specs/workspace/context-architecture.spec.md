---
criticality: IMPORTANT
failure_mode: Without context architecture, agents receive inappropriate or bloated context leading to focus inefficiency
applies_to: this_project
governed-by:
  - .livespec/standard/conventions/context-tree.spec.md
derives-from:
  - specs/workspace/constitution.spec.md
  - specs/workspace/taxonomy.spec.md
---

# Context Architecture

## Requirements

- [!] This project uses hierarchical agent context tree following context-tree convention.
  - Root AGENTS.md: Compressed methodology (20-30KB) with routing to sub-agents
  - Phase specialists (ctxt/phases/): 0-define through 4-evolve
  - Domain specialists (ctxt/domains/): Based on taxonomy classification
  - Utility specialists (ctxt/utils/): session-completion, drift-detection, msl-audit
  - Proactive loading: Agent decides what context to load based on task

- [!] This project defines what content populates agent contexts.

  Always Include (root AGENTS.md):
  - specs/workspace/constitution.spec.md - Development principles
  - specs/workspace/patterns.spec.md - Naming conventions
  - Key behaviors from specs/3-behaviors/ relevant to daily work

  Include When Relevant (sub-agent contexts):
  - Phase-specific behaviors when agent determines phase work
  - Domain-specific patterns when taxonomy indicates
  - Utility workflows when completing sessions or detecting drift

  Content Focus (balanced mix):
  - Behaviors: 40% - Observable outcomes from specs/3-behaviors/
  - Constraints: 30% - Requirements from specs/1-requirements/
  - Patterns: 30% - Workspace methodology from specs/workspace/

  Compression Level: moderate

## Validation
- Root AGENTS.md follows convention size budgets (20-30KB)
- Context tree structure matches taxonomy domain
- Load triggers functional (agent matches query to sub-agent)
- Context generation reads this spec before building AGENTS.md
- Compression level matches constitution.spec.md declaration
