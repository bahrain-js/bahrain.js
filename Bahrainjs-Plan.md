# Bahrain.js — Community Website & Purpose Plan

## Identity

**Bahrain.js** is the local JavaScript community for Bahrain. It's where the JS scene comes together — to build, ship, learn, and connect. Not a conference brand. Not a Discord server. A **living hub** with a website at its center.

### Assets
| Asset | Value |
|---|---|
| **npm namespaces** | `@bahrain.js` · `@bahrainjs` |
| **GitHub org** | [bahrain-js](https://github.com/bahrain-js) |
| **Domain** (suggested) | `bahrainjs.org` or `bahrain.js.org` |

---

## Purpose — Why Bahrain.js Exists

Bahrain has a growing tech scene — bootcamps, accelerators, startups — but **no single home for JavaScript developers**. There are scattered meetups, isolated Discord channels, and LinkedIn posts that disappear in a day.

Bahrain.js fixes that by being:

1. **A signal hub** — One place to find out what's happening in JS in Bahrain: events, projects, jobs, and people.
2. **A builder community** — Not passive consumption. Members ship code, present work, and collaborate on open source.
3. **An on-ramp** — A clear path from "I just learned JavaScript" to "I'm contributing to real projects under `@bahrainjs` on npm."

### Guiding Principles

| Principle | What it means |
|---|---|
| **Output over activity** | We measure success by what members build and ship, not by how many meetups we host. |
| **Low floor, high ceiling** | Anyone can join. The path to core contributor is transparent and earned. |
| **Local first, open always** | Rooted in Bahrain, but everything is open source and accessible to anyone. |
| **Practical over theoretical** | Talks should include demos. Workshops should produce working code. |

---

## The Website — What It Does

The website is the **public face and operating system** of the community. It's not a blog. It's a living dashboard.

### Core Pages

#### 1. **Home** — The Pulse
- Hero with community identity, tagline, and CTA to join
- **Next event** card with countdown, topic, and RSVP link
- **Recently shipped** — latest 3 projects/packages from members
- **Community stats** — members, events held, packages published, GitHub stars
- Live activity feed (latest GitHub commits across `bahrain-js` org repos)

#### 2. **Events** — What's Happening
- Upcoming events with date, format (in-person / virtual / hybrid), topic, speaker(s)
- Past events archive with slides, recordings, and takeaways
- **Event types**:
  - 🎤 **Meetups** — Monthly talks + demos (2–3 speakers, 15 min each)
  - 🛠️ **Builder Sessions** — Hands-on coding sessions around a theme (e.g., "Build a CLI tool in 2 hours")
  - 🏗️ **Hackathons** — Quarterly weekend builds with themes
  - ☕ **Coffee & Code** — Informal co-working meetups, no agenda

#### 3. **Projects** — What We're Building
- Showcase of community open source projects under `bahrain-js` org
- Each project card: name, description, tech stack, contributors, npm badge, GitHub stars
- **Featured project** rotation
- **"Start Here" projects** — beginner-friendly repos with `good-first-issue` labels
- Link to the `@bahrainjs` npm namespace to see published packages

#### 4. **People** — Who's Here
- Member directory (opt-in profiles)
- Profile fields: name, avatar, bio, GitHub, skills, "currently building"
- **Roles**: Member → Contributor → Maintainer → Core Team
- Core team page with photos and roles
- **No follower counts or vanity metrics** — just what people are working on

#### 5. **Opportunities** — High-Signal Jobs & Gigs
- Curated JavaScript/TypeScript roles in Bahrain (and remote-friendly)
- No recruiter spam — only verified, relevant listings
- Company sponsorship tier for featured listings
- Freelance/contract board for community members

#### 6. **Learn** — Resources & Paths
- Curated learning paths: "New to JS" → "Building with Node" → "Contributing to OSS"
- Community-written guides and tutorials
- Recommended talks from past events
- Links to global resources (MDN, javascript.info, NodeSchool)

#### 7. **Blog / Changelog**
- Community updates, recaps, announcements
- Member guest posts (vetted)
- Monthly "State of Bahrain.js" digest — what happened, what's coming, who shipped what

---

## Community Operating Model

### Membership Tiers

```
┌─────────────────────────────────────────┐
│               CORE TEAM                 │  ← Stewards of the org, repos, events
├─────────────────────────────────────────┤
│             MAINTAINERS                 │  ← Own specific projects/repos
├─────────────────────────────────────────┤
│            CONTRIBUTORS                 │  ← Merged PRs, gave talks, ran sessions
├─────────────────────────────────────────┤
│              MEMBERS                    │  ← Joined, attending events, learning
└─────────────────────────────────────────┘
```

### How to Level Up

| From → To | How |
|---|---|
| **Visitor → Member** | Sign up on the website, join the community chat |
| **Member → Contributor** | Submit a PR to any `bahrain-js` repo, give a lightning talk, or write a blog post |
| **Contributor → Maintainer** | Consistently contribute to a project; nominated by core team |
| **Maintainer → Core Team** | Stewarding community direction; by invitation after sustained impact |

### Open Source Pipeline

This is the unique value prop — Bahrain.js isn't just events, it's a **factory for open source output**.

```
Idea → Builder Session → Prototype → bahrain-js/repo → npm publish @bahrainjs/package
```

1. **Ideas surface** at meetups, in chat, or on the website's project board
2. **Builder sessions** turn ideas into prototypes in a single session
3. **Promising prototypes** get a repo under `bahrain-js` org
4. **Contributors** iterate and ship to npm under `@bahrainjs`
5. **Maintainers** own the long-term health of each package

---

## Technical Architecture for the Website

### Stack

| Layer | Choice | Rationale |
|---|---|---|
| **Framework** | Nuxt 3 (SSR/SSG) | SEO, performance, great DX, Vue ecosystem |
| **Styling** | Nuxt UI + UnoCSS | Polished components out of the box |
| **Content** | Nuxt Content (MDC) | Markdown-driven blog, events, guides |
| **Database** | Neon (Serverless Postgres) | Member profiles, events, projects metadata |
| **Auth** | Neon Auth (Better Auth) | GitHub OAuth for members, session management |
| **ORM** | Drizzle | Type-safe, lightweight, edge-compatible |
| **Hosting** | Cloudflare Pages | Edge SSR, fast global delivery, free tier |
| **CMS for events** | Nuxt Content `.md` files in the repo | Anyone can PR a new event |
| **Analytics** | Plausible or Umami | Privacy-respecting, lightweight |
| **API integrations** | GitHub API (org repos, contributors), npm registry API |

### Data Model (Core)

```
members
├── id, github_username, display_name, avatar_url
├── bio, skills[], currently_building
├── role (member | contributor | maintainer | core)
└── joined_at

events
├── id, title, slug, description
├── date, time, location, format (in-person | virtual | hybrid)
├── speakers[] → members
├── rsvp_url, slides_url, recording_url
└── status (upcoming | past)

projects
├── id, name, slug, description
├── github_repo, npm_package
├── tech_stack[], contributors[] → members
├── stars, downloads
└── featured (boolean)

opportunities
├── id, title, company, location
├── type (full-time | contract | freelance)
├── url, description
└── posted_at, expires_at
```

---

## Growth Strategy — Phase by Phase

### Phase 1: Foundation (Month 1–2)
- [ ] Launch website with Home, Events, Projects, and About pages
- [ ] Set up GitHub org with README, contributing guide, and code of conduct
- [ ] Host first meetup (can be small — 10–15 people)
- [ ] Publish 2–3 starter projects as `bahrain-js` repos
- [ ] Open community chat (Discord or Telegram — pick one, not both)

### Phase 2: Rhythm (Month 3–6)
- [ ] Monthly meetups with consistent format
- [ ] First builder session → first `@bahrainjs` npm package
- [ ] Member profiles live on the website
- [ ] 3–5 blog posts / event recaps published
- [ ] Opportunities board live with 5+ listings
- [ ] 50+ members signed up

### Phase 3: Momentum (Month 6–12)
- [ ] First hackathon
- [ ] 5+ npm packages under `@bahrainjs`
- [ ] Guest speakers from regional JS communities
- [ ] Partnership with local bootcamps / universities
- [ ] Company sponsors for events and job board
- [ ] 150+ active members

### Phase 4: Ecosystem (Year 2+)
- [ ] Bahrain.js becomes the recognized JS community brand in the region
- [ ] Annual conference or unconference
- [ ] Mentorship program pairing juniors with maintainers
- [ ] Cross-pollination with other `*.js` communities (Dubai.js, Amman.js, etc.)
- [ ] Community-maintained packages used in production by local companies

---

## Content Calendar Template

| Week | Activity |
|---|---|
| **Week 1** | Monthly meetup (talks + demos) |
| **Week 2** | Blog post / event recap published |
| **Week 3** | Builder session or Coffee & Code |
| **Week 4** | "What We Shipped" social post + community digest |

---

## What Makes This Different

Most developer community websites are either:
- A Meetup.com page with no content beyond event RSVPs
- A static landing page that never gets updated
- A Discord server with no public presence

**Bahrain.js is different because:**

1. **The website is the product** — not an afterthought. It's where projects live, people are visible, and activity is tracked.
2. **There's a clear output pipeline** — ideas become packages under `@bahrainjs` on npm. That's tangible.
3. **Tiered participation is transparent** — you know exactly how to go from attendee to maintainer.
4. **It's git-native** — events, blog posts, and project listings are Markdown files in the repo. Contributing to the website IS contributing to the community.
5. **It's Bahrain-first** — not a global platform trying to serve everyone. Hyper-local focus with global openness.

---

## Next Steps

> [!IMPORTANT]
> Before building, we need decisions on:

1. **Domain**: `bahrain.js.org`
2. **Chat platform**: Discord or Telegram or WhatsApp for community chat?
3. **Branding**: Logo, color palette, visual identity — do you have anything, or should we design from scratch?
4. **First event**: Do you have a date/venue in mind for the inaugural meetup?
5. **Core team**: Who are the initial 2–3 people stewarding Bahrain.js?

Once these are decided, we can begin building the website.
