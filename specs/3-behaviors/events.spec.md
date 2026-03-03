---
criticality: IMPORTANT
failure_mode: Event information is inaccessible or stale, breaking the signal hub outcome
derives-from:
  - specs/2-strategy/architecture.spec.md
  - specs/1-requirements/strategic/outcomes.spec.md
---

# Events Behaviors

## Requirements

- [!] Events are defined as markdown files with structured frontmatter.
  - Required fields: title, date, format (in-person | virtual | hybrid), description
  - Optional fields: speakers, rsvp_url, slides_url, recording_url, location
  - Slug is derived from filename

- [!] Events listing page separates upcoming from past events.
  - Upcoming events sorted by date ascending (nearest first)
  - Past events sorted by date descending (most recent first)
  - Past events can display attached resources (slides, recordings)

- [!] Event detail page displays all event information.
  - Full description, date/time, format, location
  - Speaker information with links to member profiles (when applicable)
  - RSVP link for upcoming events
  - Post-event resources for past events

- [!] Four event types are supported.
  - Meetups (talks + demos), Builder Sessions (hands-on coding), Hackathons (weekend builds), Coffee & Code (informal)
  - Each type is visually distinguishable via icon or label
  - Events can be filtered by type

## Validation
- Events render from markdown without errors
- Upcoming/past separation is based on current date
- Event type labels display correctly for all four types
