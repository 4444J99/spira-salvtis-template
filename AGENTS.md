# AGENTS.md

This file provides guidance for AI coding agents operating in this repository.

## Project Overview

**Sovereign Systems Spiral** is a multi-domain Astro 6 website for a 4-pillar health and business brand. Hub-and-spoke across three domains:

| Domain | Purpose |
|--------|---------|
| `hub-example.com` | Central hub with spiral visualization and 4 pillars |
| `gateway-example.com` | Foundation Sovereignty gateway education funnel |
| `business-example.com` | Vision Sovereignty business hub |

**IP boundary:** content = client IP (do not distribute or reuse); code/architecture = studio IP.

## Tech Stack

- **Astro 6** with `@astrojs/cloudflare` 13.x. SSR routes use `export const prerender = false`; content uses the Astro Content Layer `glob()` loader.
- **Tailwind CSS 4** via `@tailwindcss/vite` (CSS-first, no `tailwind.config.js`).
- **TypeScript strict**, `@/*` -> `src/*`, with `@cloudflare/workers-types` installed.
- **Three.js** in `src/components/spiral/spiral.ts`: 13-node golden-angle helix, IconWorlds physics, post-processing bloom.
- **Pages CMS** via `.pages.yml` for git-based editing of pillars and branches. Keystatic was replaced because it has no Astro 6 support. Content renders as native Astro Markdown (the unused `@astrojs/markdoc` integration was removed 2026-06-05).
- **Vite override** pins `vite` to `^7.3.3` so the Cloudflare runner-worker bundles correctly.

## Commands

```bash
npm run dev              # Dev server at localhost:4321
npm run build            # Production build; prebuild generates data files first
npm run check            # Astro/TypeScript type check
npm run test             # Node assertion suite for content/config/site contracts
npm run test:all         # npm test && npm run check && npm run build
npm run format           # Prettier write
npm run format:check     # Prettier check
npm run preview          # Preview production build locally
npm run parse-citations  # Parse citations from source documents
npm run count-files      # File counting for system variables
npm run deploy           # test:all + wrangler deploy --config dist/server/wrangler.json
```

`prebuild` runs automatically before `build` and generates:

- `public/citations.json` from `docs/corpus-canon.md`
- `src/data/library-manifest.json` from `src/lib/docs-library.ts`

Do not edit either generated file by hand.

## Testing

Test suite: `scripts/test.mjs` (Node assert, no framework). It validates:

- Pillar and branch config slugs stay in sync with content files.
- All pillar and branch content frontmatter is public/live.
- The 13 spiral nodes have contiguous IDs, exactly 3 quiz themes each, and unique EnvVars.
- `/quiz` serializes node status and posts capture to `/capture`.
- `QuizEmbed.astro` falls back to the local quiz instead of the old waitlist stub.
- `/capture` validates email, bounds-checks quiz node IDs, and dispatches sinks in parallel.
- `public/citations.json` is parseable and nonempty.
- Annotated bibliography JSON and Markdown manifests exist.
- `scripts/vacuum-gate.mjs` passes.

No test filtering exists. To run a focused check, temporarily narrow assertions in `scripts/test.mjs`.

## Linting & Formatting

- Prettier is configured with `.prettierrc.json` and `.prettierignore`; use `npm run format:check` before broad formatting work.
- CI runs `trunk-io/trunk-action@v1` on PR-scoped changed files. There is no committed `.trunk/` config in the current main branch.
- `npm run check` is part of `test:all`; do not skip it just because `npm test` passes.

## Architecture

### Single Source of Truth

| File | Purpose |
|------|---------|
| `src/data/hub.config.ts` | Pillars, nodes, branches, domains, UI defaults, EnvVar types, QuizTheme types |
| `src/data/gateway.config.ts` | 6-step funnel config, filter tiers, cost data, matching engine |
| `src/data/quiz.config.ts` | Quiz questions, answer definitions, result copy, capture copy |
| `src/data/decisions.ts` | Decision-board options and recommendations |
| `src/content.config.ts` | Astro Content Layer schemas for branches, pillars, and nodes |
| `.pages.yml` | Pages CMS config for editing pillars and branches |
| `src/lib/docs-library.ts` | Source catalog for the generated `/library` manifest |

### Routes

| Route | Purpose |
|-------|---------|
| `/` | Hub homepage with spiral visualization |
| `/pillars/[slug]` | Dynamic 4 pillar pages |
| `/nodes/[id]` | 13 spiral node pages; nodes 6-13 are locked |
| `/quiz` | Node-placement quiz with affinity scoring |
| `/gateway/` | Foundation Sovereignty funnel |
| `/gateway/[slug]` | Branch-specific gateway pages |
| `/gateway/quiz` | Gateway funnel quiz route |
| `/business/` | Vision Sovereignty landing |
| `/research` | Bibliography page |
| `/lineage/[envvar]` | Cross-cultural naming chains per EnvVar |
| `/for/[persona]` | Audience-targeted landing pages |
| `/decisions` | Decision board with option tracking |
| `/aesthetics` | Aesthetics vocabulary showcase |
| `/timeline` | Spiral/site version timeline |
| `/library` | Generated documentation library index |
| `/api/gateway-report` | Gateway report API route |
| `/capture` (POST) | Multi-sink form capture |

### Key Components

- `src/components/spiral/spiral.ts` - Three.js helix and IconWorlds interaction surface.
- `src/components/QuizEmbed.astro` - quiz iframe wrapper with fallback to `/quiz`.
- `src/components/HydrateFlow.astro` - gateway funnel orchestrator.
- `src/pages/capture.ts` - Astro API route for KV + GHL capture.

## Capture Endpoint

`/capture` is a fire-and-forget form sink. It validates email syntax, bounds-checks `quizNodeId` 1-13, and dispatches to the optional `SUBMISSIONS` KV namespace and `GHL_WEBHOOK_URL` in parallel. Sink failures are logged but do not block a valid 200 response.

Decision-board submissions use `source: "decision-board"` and can capture `decisionId`, chosen option, whether the choice matched the studio recommendation, suggestion text, category, and owner. If the decision-board caller omits email, the route uses a local synthetic email so KV writes still succeed.

## Content Management

- Branch, pillar, and node content lives under `src/content/`.
- Current content collections are `pillars`, `branches`, and `nodes`.
- Pages CMS edits pillars and branches only; new pillars/branches remain code changes because `hub.config.ts` must receive the matching slug.
- Node content lives in `src/content/nodes/` and is not part of the Pages CMS config.

## Governance Scripts

Config: `.config/board.config.json`. All board operations flow through scripts; never edit the board directly.

| Script | Purpose |
|--------|---------|
| `bash scripts/transition-issue.sh <n> --status <STATUS> --reason "why"` | Gatekeeper for state transitions |
| `bash scripts/sync-tracking-table.sh --write` | Generate tracking table from board |
| `bash scripts/audit-board.sh` | Detect expected vs actual board drift |
| `bash scripts/detect-redundancy.sh` | Detect duplicate issues |
| `bash scripts/setup-board.sh --dry-run` | Dry-run board setup from config |

Content genome scripts are documented in `scripts/README.md`.

## CI/CD

GitHub Actions (`.github/workflows/ci.yml`):

- Build job: Node 22, `npm ci`, Trunk lint, `npm run test:all` on push/PR to `main`.
- Deploy job: only on push to `main`; reruns `npm run test:all` and deploys the Astro SSR Worker with `cloudflare/wrangler-action@v3`.
- Deploy uses explicit Cloudflare `accountId` and the `CLOUDFLARE_API_TOKEN` secret.
- Required Cloudflare token scope is tracked in `docs/runbooks/cf-token-rotation.md`; current workflow text requires Workers Scripts Edit, Workers Routes Edit, Workers KV Storage Edit, and Account Settings Read.
- Workflow concurrency cancels in-flight deploys when a newer push arrives on the same ref.

## Gotchas

- Dev server binds `0.0.0.0`; `astro.config.mjs` contains the tunnel host allowlist.
- Nodes 6-13 are locked in `hub.config.ts`; do not unlock without client approval.
- Node 5 routes to `/gateway/`, not `/nodes/5`.
- Vessel mode and nav variant can be tested with `?vessel=visible` and `?nav=spiral-first`; defaults live in `hub.config.ts`.
- `functions/` is legacy. Use Astro API routes in `src/pages/*.ts` with `prerender = false`.
- Empty affiliate URLs for Anespa DX and K8 Kangen are intentional client-gated placeholders tracked in GH#49.
- `ghl.quizFormUrl` is empty; local fallback is `/quiz`, with affiliate routing tracked in GH#49 and GH#56.
- Three branches are currently hidden from navigation via `visible: false`: Archetype-delta, Cancer Support, and Archetype-zeta. Their routes still exist.
- `package-lock.json` is committed; use `npm ci` in CI and `npm install` only when intentionally updating dependencies.

<!-- ORGANVM:AUTO:START -->
## Agent Context (auto-generated — do not edit)

This repo participates in the **ORGAN-III (Commerce)** swarm.

### Active Subscriptions
- *No active event subscriptions*

### Production Responsibilities
- *No production responsibilities*

### External Dependencies
- *No external dependencies*

### Governance Constraints
- Adhere to unidirectional flow: I→II→III
- Never commit secrets or credentials

*Last synced: 2026-06-04T11:30:37Z*
<!-- ORGANVM:AUTO:END -->
