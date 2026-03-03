---
applies_to: all_projects
criticality: IMPORTANT
failure_mode: Without patterns, specifications become inconsistent
governed-by:
  - .livespec/standard/metaspecs/workspace.spec.md
---

# Development Patterns

## Requirements
- [!] Project follows LiveSpec naming and structure patterns.
  - Specs use .spec.md extension
  - Frontmatter declares criticality and failure_mode
  - Requirements section with [!] items
  - Validation section with observable criteria
  - Check taxonomy.spec.md FIRST before creating files

## Validation
- All specifications follow MSL format
- File naming conventions consistent
- Taxonomy checked before file creation
