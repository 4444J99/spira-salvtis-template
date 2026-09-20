# Sovereign Systems Spiral — Workspace Context

## Project Overview
**Sovereign Systems Spiral** is a multi-domain Astro 6 hub-and-spoke website for admin's 4-pillar health and business brand. It centralizes three distinct domains into a single codebase and deployment architecture.

- **Hub (`hub-example.com`):** Central entry point featuring the interactive 4-pillar spiral navigation.
- **Gateway/Foundation (`gateway-example.com`):** Documentary-first funnel, quiz, and 6 branch deep-dives.
- **Business/Vision (`business-example.com`):** Landing page for the professional/systems arm of the brand.

**Organ:** III (Commerce / Ergon)
**Client:** admin
**Studio:** ORGANVM Studio

## Tech Stack
- **Framework:** [Astro 6](https://astro.build/) (Static Site Generation) with the `@astrojs/cloudflare` 13.x adapter (SSR routes use `export const prerender = false`).
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/) (using `@tailwindcss/vite`, CSS-first config — no `tailwind.config.js`).
- **Language:** TypeScript (Strict mode, no `any`)
- **Visuals:** [Three.js](https://threejs.org/) drives the 13-node golden-angle helix in `src/components/spiral/spiral.ts` (IconWorlds physics + post-processing bloom).
- **CMS:** [Pages CMS](https://pagescms.org) via `.pages.yml` — git-based hosted editing of the pillars and branches collections (replaced Keystatic, which has no Astro 6 support).
- **Build pin:** `vite` is pinned to `^7.3.3` in `package.json` `overrides` so the Cloudflare runner-worker bundles correctly.
- **Deployment:** Cloudflare Workers + Static Assets (auto-deploy on push to `main`).

## Core Architecture & Key Files

### Configuration & Data
- `src/data/hub.config.ts`: **Single source of truth.** Defines pillars, branches, domain mapping, and external GHL (GoHighLevel) URLs.
- `src/content.config.ts`: Defines Zod schemas for the Astro Content Layer collections (`branches`, `pillars`, `nodes`) via the `glob()` loader.
- `.pages.yml`: Pages CMS config — the git-based hosted editor for the pillars and branches collections.
- `astro.config.mjs`: Cloudflare adapter config plus the dev-server tunnel host allowlist.

### The Spiral Component
- `src/components/spiral/spiral.ts`: Three.js logic for the floating, interactive 3D helix.
- `src/components/spiral/SpiralIsland.astro`: Astro client-side island that mounts the spiral via dynamic import.
- `src/components/spiral/SpiralFallback.astro`: Static SVG fallback for non-JS/low-power environments.

### Content Structure
All client-editable content is managed via Markdown in `src/content/`:
- `src/content/branches/`: 6 pages (e.g., `archetype-epsilon.md`, `archetype-delta.md`).
- `src/content/pillars/`: 4 pillar pages (e.g., `foundation.md`, `system.md`).

## Development Workflow

### Commands
```bash
npm run dev        # Local development server (localhost:4321)
npm run build      # Production build to dist/
npm run preview    # Local preview of the production build
```

### Conventions
1. **Surgical Updates:** When updating content, target the Markdown files in `src/content/`.
2. **Config First:** To change metadata (colors, URLs, taglines), edit `src/data/hub.config.ts`.
3. **Extend, Don't Reinvent:** The 3D helix is Three.js in `src/components/spiral/spiral.ts`; extend it rather than adding parallel animation libraries.
4. **Tailwind 4:** Use the CSS-first configuration. No `tailwind.config.js` exists; global styles and Tailwind variables live in `src/styles/global.css`.
5. **Strict Types:** Always use TypeScript interfaces (see `hub.config.ts` for examples).

## Documentation Hierarchy
- `CLAUDE.md`: High-level summary of commands and page mapping.
- `docs/design-decisions.md`: Record of architectural and aesthetic choices.
- `docs/corpus-canon.md`: **Foundational Mandate.** Contains 263 sacred and biomedical citations backing every claim on the site. Every health claim must map back to an entry here.
- `docs/superpowers/`: Project-specific plans and specifications.

## Deployment Notes
- **Platform:** Cloudflare Workers + Static Assets (auto-deploy on push to `main`).
- **Build:** `npm run build` → `dist/`. The Astro Cloudflare adapter emits `dist/client` (static assets) plus `dist/server/entry.mjs` (the SSR worker); `src/pages/*.ts` API routes are bundled into that worker, not into separate Pages Functions.
- **Email capture:** `src/pages/capture.ts` — an Astro API route (`POST /capture`) bundled into the SSR worker. There is no `functions/` directory; the legacy `functions/capture.ts` was removed because the worker bundle takes precedence over root `functions/`.
- **Manual deploy:** `npm run deploy` (= `npm run test:all && wrangler deploy --config dist/server/wrangler.json`).
- **Custom domains:** attach via the Cloudflare dashboard → Workers → Settings → Domains & Routes → Custom domain.
- `.config/netlify.toml` is legacy reference only — deployment is on Cloudflare Workers, not Netlify or Cloudflare Pages.

<!-- ORGANVM:AUTO:START -->
## System Context (auto-generated — do not edit)

**Organ:** ORGAN-III (Commerce) | **Tier:** standard | **Status:** LOCAL
**Org:** `organvm-iii-ergon` | **Repo:** `sovereign-systems--spiral-template`

### Edges
- *No inter-repo edges declared in seed.yaml*

### Siblings in Commerce
`classroom-rpg-aetheria`, `gamified-coach-interface`, `trade-perpetual-future`, `fetch-familiar-friends`, `sovereign-ecosystem--real-estate-luxury`, `public-record-data-scrapper`, `search-local--happy-hour`, `multi-camera--livestream--framework`, `universal-mail--automation`, `mirror-mirror`, `the-invisible-ledger`, `enterprise-plugin`, `virgil-training-overlay`, `tab-bookmark-manager`, `a-i-chat--exporter` ... and 16 more

### Governance
- Strictly unidirectional flow: I→II→III. No dependencies on Theory (I).

*Last synced: 2026-06-04T11:30:37Z*

## Active Handoff Protocol

If `.conductor/active-handoff.md` exists, **READ IT FIRST** before doing any work.
It contains constraints, locked files, conventions, and completed work from the
originating agent. You MUST honor all constraints listed there.

If the handoff says "CROSS-VERIFICATION REQUIRED", your self-assessment will
NOT be trusted. A different agent will verify your output against these constraints.

## Session Review Protocol

At the end of each session that produces or modifies files:
1. Run `organvm session review --latest` to get a session summary
2. Check for unimplemented plans: `organvm session plans --project .`
3. Export significant sessions: `organvm session export <id> --slug <slug>`
4. Run `organvm prompts distill --dry-run` to detect uncovered operational patterns

Transcripts are on-demand (never committed):
- `organvm session transcript <id>` — conversation summary
- `organvm session transcript <id> --unabridged` — full audit trail
- `organvm session prompts <id>` — human prompts only


## System Library

Plans: 269 indexed | Chains: 5 available | SOPs: 8 active
Discover: `organvm plans search <query>` | `organvm chains list` | `organvm sop lifecycle`
Library: `/Users/4jp/Code/organvm/praxis-perpetua/library`


## Active Directives

| Scope | Phase | Name | Description |
|-------|-------|------|-------------|
| system | any | atomic-clock | The Atomic Clock |
| system | any | execution-sequence | Execution Sequence |
| system | any | multi-agent-dispatch | Multi-Agent Dispatch |
| system | any | session-handoff-avalanche | Session Handoff Avalanche |
| system | any | system-loops | System Loops |
| system | any | prompting-standards | Prompting Standards |
| system | any | prompting-standards | Prompting Standards |
| system | any | prompting-standards | Prompting Standards |
| system | foundation | agent-seeding-and-workforce-planning | agent-seeding-and-workforce-planning |
| system | foundation | architecture-decision-records | architecture-decision-records |
| system | any | background-task-resilience | background-task-resilience |
| system | any | context-window-conservation | context-window-conservation |
| system | foundation | legal-compliance-matrix | legal-compliance-matrix |
| system | foundation | ontological-renaming | ontological-renaming |
| system | foundation | readme-and-documentation | readme-and-documentation |
| system | any | session-self-critique | session-self-critique |
| system | any | the-descent-protocol | the-descent-protocol |
| system | any | the-membrane-protocol | the-membrane-protocol |
| system | any | theory-to-concrete-gate | theory-to-concrete-gate |
| system | any | triangulation-protocol | triangulation-protocol |
| unknown | any | SOP-SS-ATM-001_001-atomic-decomposition | SOP-SS-ATM-001_001: Atomic Decomposition & Coverage Proof |
| unknown | any | SOP-SS-CLT-001_001-ontology_client_decisions | SOP-SS-CLT-001_001-ontology_client_decisions |
| unknown | any | SOP-SS-CNT-001_001-content-extraction-and-node-injection | SOP-SS-CNT-001_001: Content Extraction & Node Injection |
| unknown | any | SOP-SS-ISS-001-001-ontology-issue-specification | SOP-SS-ISS-001-001-ontology-issue-specification |
| unknown | any | SOP-SS-PRC-001_001-ontology_meta_process | SOP-SS-PRC-001-001-ontology-meta-process |
| unknown | any | SOP-SS-QAB-001_001-project-board-qa | SOP-SS-QAB-001_001-project-board-qa |
| unknown | any | SOP-SS-REV-001_001-evaluation-to-growth-review-chain | SOP-SS-REV-001_001: Evaluation-to-Growth Review Chain |
| unknown | any | SOP-SS-TRK-001_001-ontology_issue_tracking | SOP-SS-TRK-001_001-ontology_issue_tracking |
| unknown | any | registry | SOP Registry — Sovereign Systems |

Linked skills: SOP-TRIADIC-REVIEW-PROTOCOL, api-design-patterns, cicd-resilience-and-recovery, coding-standards-enforcer, continuous-learning-agent, contract-risk-analyzer, cross-agent-handoff, evaluation-to-growth, gdpr-compliance-check, genesis-dna, multi-agent-workforce-planner, planning-and-roadmapping, promotion-and-state-transitions, quality-gate-baseline-calibration, repo-onboarding-and-habitat-creation, security-threat-modeler, session-self-critique, structural-integrity-audit, the-membrane-protocol, triple-reference


**Prompting (Google)**: context 1M tokens (Gemini 1.5 Pro), format: markdown, thinking: thinking mode (thinkingConfig)


## Atomization Pipeline

Run `organvm atoms pipeline --write && organvm atoms fanout --write` to generate task queue.


## System Density (auto-generated)

AMMOI: 25% | Edges: 0 | Tensions: 0 | Clusters: 0 | Adv: 27 | Events(24h): 38770
Structure: 8 organs / 149 repos / 1654 components (depth 17) | Inference: 0% | Organs: META-ORGANVM:63%, ORGAN-I:53%, ORGAN-II:48%, ORGAN-III:55% +5 more
Last pulse: 2026-06-04T11:30:28 | Δ24h: n/a | Δ7d: n/a


## Dialect Identity (Trivium)

**Dialect:** EXECUTABLE_ALGORITHM | **Classical Parallel:** Arithmetic | **Translation Role:** The Engineering — proves that proofs compute

Strongest translations: I (formal), II (structural), VII (structural)

Scan: `organvm trivium scan III <OTHER>` | Matrix: `organvm trivium matrix` | Synthesize: `organvm trivium synthesize`


## Logos Documentation Layer

**Status:** ACTIVE | **Symmetry:** 1.0 (SYMMETRIC)

Nature demands a documentation counterpart. This formation maintains its narrative record in `docs/logos/`.

### The Tetradic Counterpart
- **[Telos (Idealized Form)](../docs/logos/telos.md)** — The dream and theoretical grounding.
- **[Pragma (Concrete State)](../docs/logos/pragma.md)** — The honest account of what exists.
- **[Praxis (Remediation Plan)](../docs/logos/praxis.md)** — The attack vectors for evolution.
- **[Receptio (Reception)](../docs/logos/receptio.md)** — The account of the constructed polis.

### Alchemical I/O
- **[Source & Transmutation](../docs/logos/alchemical-io.md)** — Narrative of inputs, process, and returns.



*Compliance: Nature and Counterpart are in balance.*

<!-- ORGANVM:AUTO:END -->
