# Bahrain.js

[![Build](https://img.shields.io/github/actions/workflow/status/bahrain-js/bahrain.js/deploy.yml?label=Build&logo=github)](https://github.com/bahrain-js/bahrain.js/actions/workflows/deploy.yml)
[![Live Site](https://img.shields.io/badge/bahrain.js.org-live-00DC82?style=flat&logo=nuxt)](https://bahrain.js.org)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

The community platform for JavaScript developers in Bahrain. One place to find events, projects, people, and opportunities in the local JS scene.

**🌐 [bahrain.js.org](https://bahrain.js.org)**

---

## What This Is

Bahrain.js is a community hub — not just a landing page. The website is the operating system for the community: events are listed, projects are showcased, members have profiles, and everything is open source.

### Pages

| Page | Description |
|---|---|
| **Home** | Hero, next event, recent projects, community stats |
| **Events** | Upcoming and past meetups, builder sessions, hackathons |
| **Projects** | Open source showcase from the `bahrain-js` GitHub org |
| **People** | Member directory with profiles, skills, and roles |
| **Blog** | Community updates, guides, and member posts |
| **Opportunities** | Curated JS/TS roles and gigs in Bahrain |
| **Frameworks** | Interactive framework landscape |

## Tech Stack

| Layer | Choice |
|---|---|
| **Framework** | [Nuxt 4](https://nuxt.com) (SSG via GitHub Pages) |
| **UI** | [Nuxt UI v4](https://ui.nuxt.com) + [Tailwind CSS v4](https://tailwindcss.com) |
| **Content** | [Nuxt Content v3](https://content.nuxt.com) (Markdown-driven blog) |
| **Database** | [Neon](https://neon.tech) (Serverless Postgres) |
| **Auth** | [Neon Auth](https://neon.tech/docs/guides/neon-auth) (GitHub OAuth) |
| **Animations** | [GSAP](https://gsap.com) via `v-gsap-nuxt` |
| **Hosting** | [GitHub Pages](https://pages.github.com) (static deployment) |
| **Package Manager** | pnpm |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) 18+
- [pnpm](https://pnpm.io) 10+

### Setup

```bash
# Clone the repo
git clone https://github.com/bahrain-js/bahrain.js.git
cd bahrain.js

# Install dependencies
pnpm install
```

### Environment

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Required variables:

| Variable | Purpose |
|---|---|
| `NUXT_PUBLIC_NEON_AUTH_URL` | Neon Auth endpoint for GitHub OAuth |
| `NUXT_PUBLIC_NEON_DATA_API_URL` | Neon Data API endpoint for database access |

### Development

```bash
pnpm dev
```

The dev server starts at `http://localhost:3000`.

### Other Commands

```bash
pnpm build        # Production build (GitHub Pages preset)
pnpm preview      # Preview the production build locally
pnpm lint         # Run ESLint
pnpm typecheck    # Run TypeScript type checking
pnpm test         # Run tests with Vitest
```

## Project Structure

```
bahrain.js/
├── app/
│   ├── components/     # Vue components (AppHeader, AppFooter, home/*, admin/*)
│   ├── composables/    # Shared composables (auth, data fetching)
│   ├── pages/          # File-based routing (index, events, projects, people, blog, etc.)
│   ├── types/          # TypeScript type definitions
│   └── assets/         # CSS and static assets
├── content/            # Markdown content for blog posts (Nuxt Content)
├── public/             # Static files (favicons, images)
├── server/             # Server routes (if any)
└── nuxt.config.ts      # Nuxt configuration
```

## Contributing

Contributions are welcome! Whether it's fixing a bug, adding a feature, or writing a blog post — all PRs are appreciated.

1. Fork the repo
2. Create your branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'Add my feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

### Writing Blog Posts

Blog content lives in the `content/` directory as Markdown files. Create a new `.md` file and submit a PR.

## Community

- **GitHub**: [bahrain-js](https://github.com/bahrain-js)
- **npm**: [`@bahrain.js`](https://www.npmjs.com/org/bahrain.js)

## License

[MIT](LICENSE) © Bahrain.js
