# Sovereign Systems Spiral

Multi-domain Astro 6 website for a 4-pillar health and sovereignty brand. Hub-and-spoke architecture across three domains.

| Domain | Purpose |
|--------|---------|
| `hub-example.com` | Central hub — spiral visualization, 4 pillars |
| `water-example.com` | Physical Sovereignty — water education funnel |
| `business-example.com` | Financial Sovereignty — business hub |

## Quick Start

```bash
npm install
npm run dev        # localhost:4321
npm run build      # production → dist/
```

## Architecture

```
Hub (hub-example.com)
├── Spiral Visualization (Three.js 3D helix, ~3,878 LOC)
├── 4 Pillar Pages (Physical, Inner, Identity, Financial)
├── Research Bibliography (263 citations, gated)
│
├── /water/ (water-example.com)
│   ├── Documentary landing
│   ├── Quiz → GHL integration
│   ├── 6 Branch deep-dives (gut, fertility, athletic, autoimmune, cancer, sustainability)
│   └── Hydration Node funnel (ZIP lookup, filter recs, cost calculator)
│
└── /business/ (business-example.com)
    └── Financial Sovereignty — systems, authority, time reclamation
```

## Content System

The site is powered by a **content genome** — 1,821 atomic content units extracted from client conversations, each with 17 metadata fields.

| Metric | Value |
|--------|-------|
| Total atoms | 1,821 |
| SIGNAL (build-worthy) | 1,153 |
| CONTEXT (structural) | 557 |
| NOISE (filtered) | 111 |
| Linked to issues | 1,343 |
| Citations | 263 (sacred + peer-reviewed) |

Regenerate: `bash scripts/build-atom-registry.sh && python3 scripts/link-atoms-to-issues.py --write`

## Governance Scripts

All project board operations flow through config-driven scripts. No direct board edits.

```bash
# State transitions (the gatekeeper)
bash scripts/transition-issue.sh <issue#> --status <STATUS> --reason "why"

# Generate tracking table from board
bash scripts/sync-tracking-table.sh --write

# Audit for drift and missing fields
bash scripts/audit-board.sh

# Detect duplicate issues
bash scripts/detect-redundancy.sh

# Board setup from config
bash scripts/setup-board.sh --dry-run
```

Config: `.config/board.config.json`

## Stack

- **Astro 6** — static site generator
- **Tailwind CSS 4** — CSS-first config via `@tailwindcss/vite`
- **TypeScript** — strict mode
- **Cloudflare Workers + Static Assets** — deploy on push to `main`
- **Three.js** — 3D helix spiral visualization at `src/components/spiral/spiral.ts` (V8: per-node universes, IconWorlds physics, kepler orbital motion, generative geometry)

## IP Boundary

Content is client intellectual property. Architecture, components, and governance tooling are studio IP.

## Deploy

Cloudflare Workers auto-deploys on push to `main`. Build: `npm run build` → `dist/`.

Current review origin is centralized in `src/data/site.config.ts` as
`siteConfig.cloudflare.reviewOrigin`; override with `PUBLIC_SITE_ORIGIN` when the
shared review/custom domain changes.
