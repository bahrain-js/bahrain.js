---
criticality: IMPORTANT
failure_mode: Community has no public publishing outlet, breaking the blog outcome
derives-from:
  - specs/2-strategy/architecture.spec.md
  - specs/1-requirements/strategic/outcomes.spec.md
---

# Blog Behaviors

## Requirements

- [!] Blog posts are markdown files with structured frontmatter.
  - Required fields: title, date, author, description
  - Optional fields: tags, cover_image, featured
  - Slug is derived from filename

- [!] Blog listing page displays posts in reverse chronological order.
  - Each post shows title, date, author, description, and tags
  - Pagination or infinite scroll for large post counts
  - Posts are filterable by tag

- [!] Blog detail page renders full markdown content.
  - Author attribution with link to member profile (when applicable)
  - Date and estimated reading time displayed
  - MDC components render correctly within post content

- [!] Post types include updates, recaps, guides, and guest posts.
  - Monthly "State of Bahrain.js" digests are a supported pattern
  - Guest posts attribute the external author
  - All posts are contributable via PR to the content directory

## Validation
- Posts render from markdown without errors
- Listing displays correct chronological order
- Author attribution is visible on every post
