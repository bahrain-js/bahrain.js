---
criticality: IMPORTANT
failure_mode: Home page fails to communicate community identity and activity at a glance
derives-from:
  - specs/2-strategy/architecture.spec.md
  - specs/1-requirements/strategic/outcomes.spec.md
---

# Home Page Behaviors

## Requirements

- [!] Hero communicates community identity and primary call to action.
  - Displays community name, tagline, and mission statement
  - Primary CTA leads to community sign-up or chat join
  - Secondary CTA links to the GitHub organization

- [!] Next event card surfaces the nearest upcoming event.
  - Shows event title, date, format, and topic
  - Links to full event details page
  - Disappears or shows "No upcoming events" state when calendar is empty

- [!] Recently shipped section displays the latest community output.
  - Shows 3 most recently updated projects from the bahrain-js org
  - Each card links to the project detail or GitHub repo
  - Updates automatically from GitHub API data

- [!] Community stats surface aggregate metrics.
  - Displays member count, events held, repos count, and published packages
  - Stats update from database and API sources
  - Placeholder values (0) are acceptable when data sources are not yet connected

- [!] Features section explains what Bahrain.js offers beyond meetups.
  - Signal hub, builder community, open source pipeline, and clear on-ramp
  - Each feature has a concise description and icon

## Validation
- All sections render without JavaScript errors
- Page loads in under 3 seconds on initial visit
- All links point to valid destinations
