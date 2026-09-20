# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

**Sovereign Systems Spiral** — multi-domain Astro 6 website for client admin's 4-pillar health and business brand. Hub-and-spoke architecture: `hub-example.com` is the central hub; `water-example.com` powers the Water/Physical Sovereignty funnel; `business-example.com` hosts the Financial Sovereignty business arm.

- **Organ:** III (Commerce / Ergon)
- **Client IP boundary:** content = client's IP (do not distribute or reuse); code/architecture = studio IP
- **Deploy:** Cloudflare Workers + Static Assets, auto-deploy on push to `main`

## Sibling AI Guidance

Three other AI/human guidance files live at repo root: `AGENTS.md` (vendor-agnostic agent contract), `GEMINI.md` (Gemini-specific), `README.md` (human overview). When a fact appears in more than one, **`AGENTS.md` is canonical for tech-stack and command claims** (commit `667e808` — "AGENTS.md tech-stack truth"). CLAUDE.md is canonical for Claude-specific protocols: capture pipeline, content genome handling, governance scripts, session close, and the conventions documented below.

## Universal Mandates (live in memory, not CLAUDE.md)

Cross-stream rules that govern _all_ code/content changes are recorded as feedback memories under the project memory scope (current: `~/.claude/projects/-Users-4jp-Code-organvm-sovereign-systems--spiral-template/memory/feedback_*.md`; legacy Workspace-scope copies remain) and indexed in `MEMORY.md` (auto-loaded at session start). Do not duplicate the rule text in CLAUDE.md (drift risk).

**Scope rule:** memory entries are universal unless their `description:` frontmatter says otherwise. CLAUDE.md is the _index_; memory is the _source_. `MEMORY.md` is auto-truncated past line 200 — when the index grows beyond that, the underlying `feedback_*.md` files remain readable directly via filesystem; never let truncation hide active mandates.

As of 2026-05-01 the active universal mandates:

- **M1 multi-citation** (`feedback_multi_citation_mandate.md`) — every assertion needs ≥2 independent citations.
- **M2 no hardcoded dynamic data** (`feedback_no_hardcoded_dynamic_data.md`) — names, links, statistics, costs, affiliate URLs, contaminant thresholds, prices live in env vars or external config; never inline in source.
- **M3 macro→atom decomposition + iteration tracking** (`feedback_macro_to_atom_tracking.md`) — client asks AND 4jp's prompts each live in canonical sources, recursively decomposed, mapped to commits, with continuous diff/spread + per-audience visual surfaces. Substrate grammar: `~/Code/organvm/organvm-corpvs-testamentvm/data/prompt-registry/GRAMMAR.md`.

When a new universal rule is established, save the feedback memory FIRST and add a one-line entry above. CLAUDE.md is the index pointer; memory is the source.

## Cross-Client IP Isolation (`.private/`)

`.private/` at repo root holds artifacts that mix multi-client IP (e.g., orchestration showcases referencing both admin and other studio clients). Gitignored except for `.private/README.md` (rule at `.gitignore:37-38` — `.private/*` + `!.private/README.md`). Use it when an artifact is operationally useful but would leak IP if filed in a single client's repo. See `feedback_private_directory.md` in scope memory.

## Client-Separation Substrate

Client information must never bleed across clients or into public surfaces. The four zones and their flow rules are documented at `~/workspace/meta-organvm/governance/client-separation-substrate.md`. Read that doc before triaging any cross-scope artifact, before pasting external session content into a chat bound to this repo, or before writing files that name another client. Routing rule: route by content / scope-of-generation (R1), not by user-declared intent. Live-paste rule: if cross-client material lands in this scope's chat, refuse to operationalize, suggest correct routing, never absorb the wrong-scope content into auto-memory.

## Tech Stack

- **Astro 6** — static SSG, zero JS by default; Cloudflare adapter (`@astrojs/cloudflare` 13.x, dev server in workerd via `@cloudflare/vite-plugin`). Migrated from Astro 5 on 2026-05-24 (CVE clearance; see `docs/design-proposals/2026-05-24-astro-6-migration-scope.md`). `vite` is pinned to `^7.3.3` in `package.json` `overrides` to dedupe `@tailwindcss/vite`'s vite 8 (the duplicate broke the cloudflare runner-worker).
- **Tailwind CSS 4** — via `@tailwindcss/vite` plugin (no `tailwind.config.js` — CSS-first config)
- **TypeScript** — strict, no `any` (escapes were dropped in commit `0322e37`)
- **Three.js** — `src/components/spiral/spiral.ts` drives the 3D helix: tapered helix, `OrbitControls`, `MeshPhysicalMaterial` orbs, `FogExp2`, and an `EffectComposer` bloom pipeline. IconWorlds physics gives each node its own particle behavior (cohesion for symbol-mode, chaos for star-mode); node colors map to a 13-step chakra spectrum via `chakraColorForNode`. Default vessel mode is `ui.spiralVesselMode` in `hub.config.ts`. Treat `spiral.ts` as authoritative — grep symbol names, don't trust line numbers.
- **Pages CMS** — content editing is via [Pages CMS](https://pagescms.org) (`.pages.yml` at repo root), a git-based hosted editor at app.pagescms.org for the pillars and branches collections. (Replaced Keystatic in the Astro 6 migration — no `@keystatic/astro` supports Astro 6; see `keystatic#1515`.)

## Commands

```bash
npm run dev              # Dev server at localhost:4321 (host:true; tunnel-friendly)
npm run build            # Production build → dist/
npm run preview          # Preview production build locally
npm run deploy           # test:all + wrangler deploy --config dist/server/wrangler.json
npm test                 # pretest regenerates public/citations.json, then scripts/test.mjs — content-shape validator (frontmatter + schema invariants) + vacuum gate (scripts/vacuum-gate.mjs)
npm run check            # astro check — TypeScript / Astro diagnostics
npm run test:all         # test + check + production build (the CI-style gate)
npm run format           # prettier --write . (format all files)
npm run format:check     # prettier --check . (Trunk runs this PR-scoped in CI)
npm run parse-citations  # Regenerate citations from source bibliography
npm run count-files      # Repo file census utility
```

**`prebuild` auto-runs** `node scripts/generate-citations-json.js && node scripts/generate-library-manifest.mjs` before every `npm run build` (npm lifecycle hook in `package.json`). A companion **`pretest`** hook runs `node scripts/generate-citations-json.js` before `npm test`, so `npm test` (and `npm run test:all`) regenerates `public/citations.json` rather than asserting against a stale snapshot. Citations JSON and the library manifest are rebuilt on every build — do not commit a stale snapshot expecting it to survive deploy. The library manifest stores `sha256` for file entries and preserves `mtimeIso` when content is unchanged, so squash merges and fresh checkouts do not rewrite displayed dates for identical files.

**No ESLint or Vitest — but Prettier IS configured** (`.prettierrc.json`, not `prettier.config.*`; `singleQuote` + `prettier-plugin-astro`). Quality gates: TypeScript strictness (`npm run check`), `npm test` (content-shape + vacuum), and Prettier — the last enforced PR-scoped via `trunk-io/trunk-action` in CI (no committed `.trunk/`). Run `npm run format:check` before broad formatting work.

## Key Files

| File                                         | Purpose                                                                                                                                                                                                                                                                                     |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/data/hub.config.ts`                     | Master metadata — `Pillar`, `Branch`, `SpiralNode` definitions; `Phase` / `EnvVar` / `QuizTheme` / `VesselMode` / `NavVariant` types; domain map; GHL URLs; UI defaults                                                                                                                     |
| `src/data/icon-worlds.ts`                    | Per-node visual physics — `Element`, `Biology`, `ParticleBehavior`; 13 themed `IconWorld` records (one per node)                                                                                                                                                                            |
| `src/data/sacred-geometry-primitives.ts`     | Immutable geometric essences per `EnvVar` — vertex counts, PHI exponents, symmetry types                                                                                                                                                                                                    |
| `src/data/lens-geometry.ts`                  | Tradition lenses (Egyptian / Vedic / Jungian / etc.) — modulations applied to essences (vertex addends, scale multipliers)                                                                                                                                                                  |
| `src/data/naming-chains.ts`                  | Surface bindings (`EnvVar` × `Lens` → name); decouples immutable identity from mutable surface; exports `chainsFor(envVar)` and `viewThroughLens(lens)`                                                                                                                                     |
| `src/data/hydration.config.ts`               | Water-funnel data model — `WaterReport`, `Contaminant` (zip-code lookup, EWG limits)                                                                                                                                                                                                        |
| `src/data/citations.ts`                      | Citations source for the research page (regenerated by `npm run parse-citations`)                                                                                                                                                                                                           |
| `src/data/quiz.config.ts`                    | Externalized quiz copy — `quizQuestions` (5 × 4 answers), `quizResultCopy`, `quizCaptureCopy`, `quizEmbedCopy`. Result-panel templates use `{placeholder}` token substitution, NOT functions — `JSON.stringify` strips function values when embedded in `data-*` attrs for client hydration |
| `scripts/vacuum-gate.mjs`                    | Build gate enforcing Constitutional Axiom #1 ("N/A is a vacuum"). See dedicated section below                                                                                                                                                                                               |
| `src/components/spiral/spiral.ts`            | Three.js 3D helix — tapered spiral with OrbitControls, 3D orb meshes, micro-motion, IconWorlds physics; exports `initSpiral(container, nodes, variant, vesselMode)` returning a cleanup fn                                                                                                  |
| `src/components/spiral/SpiralIsland.astro`   | Astro island wrapper — mounts spiral via dynamic import; reads `?vessel=` / `?variant=` querystring overrides                                                                                                                                                                               |
| `src/components/spiral/SpiralFallback.astro` | Static SVG fallback for no-JS environments                                                                                                                                                                                                                                                  |
| `src/layouts/Base.astro`                     | Root HTML layout — head, fonts, global styles, dual nav (pillar-first default; spiral-first variant)                                                                                                                                                                                        |
| `src/pages/capture.ts`                       | Astro APIRoute — POST `/capture`; multi-sink dispatch (KV + GHL webhook + extension points). Replaces prior `functions/capture.ts`.                                                                                                                                                         |
| `src/pages/quiz.astro`                       | 5-question affinity flow → node-placement scoring → result panel + optional capture                                                                                                                                                                                                         |
| `src/pages/lineage/[envvar].astro`           | Naming chains substrate — renders all lens bindings for one `EnvVar`                                                                                                                                                                                                                        |
| `src/content.config.ts`                      | Astro content collection schemas (`branches`, `pillars`, `nodes`) — Astro 6 Content Layer via the `glob()` loader (legacy `type: 'content'` removed in the migration)                                                                                                                       |
| `.pages.yml`                                 | Pages CMS config — `pillars` + `branches` collections (git-based hosted editor at app.pagescms.org). Replaced `keystatic.config.ts` in the Astro 6 migration                                                                                                                                |
| `astro.config.mjs`                           | Cloudflare adapter; integrations: `sitemap`; dev tunneling allowlist (cloudflare, ngrok, localhost)                                                                                                                                                                                         |

## Configuration Layering

The codebase separates **immutable identity** from **mutable surface** through a layered structure in `src/data/`. Each layer modulates rendering downstream; edits to one layer can have invisible knock-on effects in others.

1. **`hub.config.ts`** — master metadata; the single source of truth for node count (13), pillar definitions (4), branch list (6), domain/GHL URLs, and UI defaults.
2. **`sacred-geometry-primitives.ts`** — immutable geometric essence per `EnvVar` (PYR, OCULUS, DYAD, PYRAMIS, HYDOR, MANDORLA, KENOSIS, SHATKONA, PADMA, BODHI, TETRAD, OKTAEDRON, ANKH); vertex counts, PHI exponents, symmetry types.
3. **`icon-worlds.ts`** — per-node visual physics (particles, palette, gravity, behavior); one `IconWorld` per node.
4. **`lens-geometry.ts`** — tradition-specific transformations (Egyptian, Sanskrit-Vedic, Greek-classical, Christian-mystical, Jungian, physics-elemental, modern-wellness); how essences appear through each lens.
5. **`naming-chains.ts`** — bindings (`EnvVar` × `Lens` → surface name); `chainsFor(envVar)` returns chronological lineage, `viewThroughLens(lens)` returns all 13 nodes through one tradition.

**When changing node identity:** check all 5 layers. Adding a `QuizTheme` tag, for example, requires both `hub.config.ts` (node theme list) AND `src/pages/quiz.astro` (button labels must match exactly).

## Landing Engine

`src/lib/landing-engine/` is a declarative composer for `/for/[persona]` routes (commit `3d8cabd`): three data layers (`personas.ts`, `narratives.ts`, `sections.ts`) feed `compose.ts` (pure), which produces the section list rendered by section components in `src/components/landing/`. **Adding a persona to `personas.ts` spawns a new `/for/<id>` page automatically** via `getStaticPaths` in `src/pages/for/[persona].astro` — no route-file edit required.

## Content Directories

All client-editable content lives in Markdown files:

```text
src/content/
  branches/    # 6 branch pages (gut-hormones, fertility, athletic, autoimmune, cancer-support, sustainability)
  pillars/     # 4 pillar pages (physical, inner, identity, financial)
  nodes/       # 13 spiral node pages — richer schema than branches/pillars
```

Frontmatter schema is enforced by `src/content.config.ts` — any new file must include all required fields.

**Node schema is the deepest** — beyond `title` and `nodeId`, supports optional `subHeader`, `intention`, `steps[]` (`{title, text}`), `practiceTable[]` (`{science, sacred, soul}`), `toolsTable[]` (`{tool, purpose, sacred}`), `reflectionPrompts[]`, and `closingLine`. All optional except `title` and `nodeId`. See `src/content.config.ts` for the Zod definitions.

## Content Genome

The site is powered by an **atom registry** — content units extracted from client conversations, each carrying a 17-field metadata schema (signal class, pillar, phase, citations, linked issues, etc.). README.md cites the current corpus census (atom totals, SIGNAL/CONTEXT/NOISE split, issue links, citations) and is the authoritative count — do not re-inline the numbers here (they drift).

Regenerate after content changes:

```bash
bash scripts/build-atom-registry.sh
python3 scripts/link-atoms-to-issues.py --write
```

## Governance Scripts

**Hard rule: no direct project-board edits.** All board mutations go through config-driven scripts so state transitions are auditable and reversible. Config lives at `.config/board.config.json`.

```bash
bash scripts/transition-issue.sh <issue#> --status <STATUS> --reason "why"  # the gatekeeper
bash scripts/sync-tracking-table.sh --write                                  # board → tracking table
bash scripts/audit-board.sh                                                  # drift + missing fields
bash scripts/detect-redundancy.sh                                            # duplicate issues
bash scripts/setup-board.sh --dry-run                                        # board scaffolding
```

## Vacuum Gate (Axiom #1)

`scripts/vacuum-gate.mjs` runs as part of `npm test`, which CI invokes via `npm run test:all` in `.github/workflows/ci.yml` on every push and PR (both `build` and `deploy` jobs). It scans `src/data/hub.config.ts` and `src/data/hydration.config.ts` for empty config strings (and `src/content/{pillars,branches}/*.md` for empty required frontmatter). Every detected vacuum is checked against an in-file `TRACKED_VACUUMS` map (field-key → GH issue ref). UNTRACKED vacuums fail the build.

**Why allow-list rather than live `gh` query:** deterministic, no network on test, explicit context for any reader of the gate. The map is the truth source — `.config/board.config.json` does NOT contain an `issues[]` array (the project board lives in GH Projects #5; that JSON is metadata for the transition scripts only).

**Resolving a tracked vacuum** (all three move together, or the gate fails-closed): populate the source config → remove its `TRACKED_VACUUMS` entry → close the GH issue. **Adding one:** file a `vacuum`-labelled GH issue first, then add the `TRACKED_VACUUMS` entry — no issue, no acknowledgement.

## Hook Noise Expectation

The PreToolUse:Write hook prints `HARD BLOCK — LaunchAgent creation is forbidden` on **every** Write call — the print is universal; the block is conditional. It only blocks when the target matches a LaunchAgent danger pattern (`.plist`, `~/Library/LaunchAgents/`, or a `launchctl` call); otherwise the print is informational and the write proceeds. If your target _does_ match, **STOP — never override** (every prior LaunchAgent incident froze the machine; on-demand CLI only). Future safety hooks may share this shape: read the message, verify the path, decide.

## Project Manifest

`scripts/generate_project_manifest.py` produces a dated annotated bibliography of the entire repo corpus to `docs/manifests/YYYY-MM-DD-project-manifest-annotated-bibliography.{md,json}`. Deterministic UIDs, thread-grouped, content-previewed for text/Markdown/JSON/DOCX/PDF, SHA-256 per file. Excludes `.git`, `node_modules`, `dist`, `.astro`, `.netlify`, `.wrangler`, `output`, and `docs/manifests/` itself. Re-run on any session that materially changes the corpus.

## Canonical Intake

- `docs/handoff-admin-spiral-path-2026-04-01.md` — mirrored canonical handoff for the 2026-04-01 admin Spiral Path intake
- `docs/superpowers/intakes/2026-04-01-admin-spiral-path-board-atomization.md` — board translation from handoff to executable issue surface
- `.claude/plans/2026-04-01-admin-spiral-orchestration-assignment.md` — dated orchestration plan preserved as session history

## Docs Conventions

Each `docs/` subdir has a distinct role — don't conflate them. All grow forward (additive).

| Dir | Holds (role + key rules) | First exemplar |
| --- | --- | --- |
| `docs/archive/YYYY-MM/` | Filed transcript exports (`# Title` + `**Session ID:** ses_…`), named `YYYY-MM-DD-<slug>-ses_<id>.md`. Auto-committed by the conductor pipeline ~7 min after landing (verify via `git log`, don't wait). **Stream-isolation:** only admin transcripts here; Rob's → `4444J99/hokage-chess`; workspace-meta → `~/.claude/sessions/` (mirrored in `organvm-corpvs-testamentvm`). See `feedback_stream_repo_alignment.md`. | — |
| `docs/critiques/YYYY-MM-DD-<slug>.md` | Severity-rated architectural critiques (usability, hierarchy, a11y, color) — _evaluative_ deliverables, not records-of-conversation. If produced in an `isolation: "worktree"` session, migrate back to main before the worktree is removed. | `2026-04-30-spiral-hero-polish-critique.md` |
| `docs/timelines/…-evolution-timeline.md` | Chronological 3-column (date \| client request \| 4jp prompt \| version) _historical narrative_ of one artifact across iterations; quotes traceable to primary sources (`prompts-raw.jsonl`, `.specstory/` for 4jp; iMessage + decision docs for the client). | `2026-05-01-spiral-evolution-timeline.md` |
| `docs/admin/YYYY-MM-DD-<topic>.md` | iMessage-ready outbound drafts — plain text (no markdown bold). Reviewable artifacts the user pastes manually; NOT auto-sent. | `2026-05-01-outbound-tracks-status.md` |

## Page Map

**19 source files in `src/pages/` generate ~51 routes** — prerendered pages + 2 server APIRoutes (`/capture`, `/api/water-report`). Most expansion is via `[id]` / `[slug]` / `[persona]` / `[envvar]` dynamic templates. (These counts drift as pages are added — regenerate from `npm run build` output rather than trusting the numbers.)

| Route | File | Description |
| --- | --- | --- |
| `/` | `src/pages/index.astro` | Hub — 3D helix hero (`calc(100vh-240px)`), quiz CTA, video, pillar phases + Elevate/Align/Unlock framework (below fold) |
| `/spiral` | `src/pages/spiral.astro` | Immersive 13-node spiral landing (`SpiralIsland immersive`, full-viewport) — each node a distinct world; distinct from the `/` hub hero (added PRs #188/#191) |
| `/quiz` | `src/pages/quiz.astro` | 5-question affinity flow → scores user into 1 of 13 spiral nodes (max 12 points: phase + pillar + theme matches) → result panel + optional capture |
| `/nodes/[id]` | `src/pages/nodes/[id].astro` | Dynamic spiral node pages (**12** pages — node 5/Water has url `/water/`, so it is filtered out of `/nodes/`; there is no `/nodes/5`) |
| `/pillars/[slug]` | `src/pages/pillars/[slug].astro` | Dynamic pillar pages (physical, inner, identity, financial) |
| `/lineage/[envvar]` | `src/pages/lineage/[envvar].astro` | Naming-chains substrate — all lens bindings for one EnvVar identity |
| `/for/[persona]` | `src/pages/for/[persona].astro` | Persona-specific landing (dynamic by persona slug) |
| `/water/` | `src/pages/water/index.astro` | Water mini version — hero, video, education, HydrationNode funnel |
| `/water/#branches` | (inline in `water/index.astro`) | Branch grid — accessible from single scrollable water page |
| `/water/quiz` | `src/pages/water/quiz.astro` | Local assessment route when GHL URL is empty |
| `/water/[slug]` | `src/pages/water/[slug].astro` | Individual branch deep-dives (6 branches) |
| `/business/` | `src/pages/business/index.astro` | Financial Sovereignty / EauCo Hub landing |
| `/research` | `src/pages/research.astro` | Full research bibliography (email-gated) |
| `/aesthetics` | `src/pages/aesthetics.astro` | Internal aesthetics/design surface |
| `/decisions` | `src/pages/decisions.astro` | Client decision board (option clicks POST to `/capture`, source `decision-board`) |
| `/library` | `src/pages/library.astro` | Docs/library index (built from the library manifest) |
| `/timeline` | `src/pages/timeline.astro` | Deployed-version timeline surface |
| `/capture` | `src/pages/capture.ts` | POST-only APIRoute (not a renderable page) — see Capture Pipeline below |
| `/api/water-report` | `src/pages/api/water-report.ts` | POST APIRoute — EWG water-report proxy (replaced the removed `functions/api/water-report.ts`) |
| `/404` | `src/pages/404.astro` | Not-found page |

**Live querystring overrides (no redeploy required):**

- `?vessel={invisible|visible|refracted-star|hybrid}` — spiral vessel-mode rendering (`SpiralIsland.astro`)
- `?variant=stars` — switches the spiral render to the refracted-light **stars** mode (default `symbols`; `SpiralIsland.astro`)
- `?nav={pillar-first|spiral-first}` — nav variant (`Base.astro`)

These are A/B flags wired into `src/data/hub.config.ts` defaults (`ui.spiralVesselMode`, `ui.navVariant`); the querystring takes precedence client-side via `SpiralIsland.astro` and `Base.astro`. (Note: `?variant=` controls the **spiral render**, not the nav — nav is `?nav=`.)

## Capture Pipeline

**Endpoint:** `POST /capture` — `src/pages/capture.ts` (Astro APIRoute; replaces prior `functions/capture.ts` because the Cloudflare adapter's `_worker.js` takes precedence over `functions/`).

**Payload:** `CapturePayload` — `email` (required), `name`, `source`, plus quiz extension fields (`quizNodeId` 1..13, `quizScore` 0..100, `quizPath`, `selectedPillar`, `selectedPhase`), a decision-board extension block (`decisionId`, `chosenOptionLabel`, `chosenOptionRecommended`, `studioSuggestion`, `decisionCategory`, `decisionOwner`) for `/decisions` submissions, and a water personalized-plan `address` field (free-text ZIP/address, source `water-personalized-plan` — W-070/#65).

**Sinks (additive, isolated):**

1. **KV** (`SUBMISSIONS` namespace) — full payload + `ipHint` (last octet only, from `CF-Connecting-IP`). Optional; degrades gracefully if KV not bound.
2. **GHL webhook** (`GHL_WEBHOOK_URL` env var) — fire-and-forget POST with flat JSON envelope. Optional; skips silently if env var unset.
3. **Extension points** in place for D1, email, etc. — additive Promise.all branches.

**Contract:** Always returns 200 `{success: true}` for valid email. Quiz UX shows result _before_ the capture network call completes — this is a UX invariant, not a bug. Sink failures never block the response.

**Adding a sink:** new Promise.all branch; no contract change. **De-identification:** only the last octet (IPv4) or the **first** hextet (IPv6 — the shared routing prefix, never the trailing interface identifier that would single out a host) of the IP is kept.

**Source-string registry** — the `source` field on capture submissions (filter downstream by these). Find exact call sites with `grep -rn "source:" src/pages src/components` (line numbers drift — grep, don't trust a pinned number):

- `spiral_quiz` — `/quiz` capture form
- `business-application-waitlist` — `/business/` waitlist form
- `decision-board` — `/decisions` option clicks (constant `DECISION_BOARD_SOURCE` in `capture.ts`)
- `hydration-node` — water-funnel email form (`HydrationNode.astro`)
- `water-personalized-plan` — `/water/` "send me a personalized filter plan" CTA (`PersonalizedFilterPlan.astro`; carries optional `address` for admin's manual EWG lookup — W-070/#65)
- `email_gate` — `EmailGate.astro` (e.g. `/research` unlock)

(Note: `quiz.astro` also emits `source: 'hub'` inside a `trackEvent` analytics ping — that is NOT a capture-payload source. Don't conflate.)

## Content Editing Notes

- Edit Markdown files in `src/content/` for copy changes — no code knowledge required
- To update pillar metadata (taglines, colors, URLs, GHL form URLs): edit `src/data/hub.config.ts`
- To add a new branch: create `src/content/branches/<slug>.md` with correct frontmatter, then add an entry to the `branches` array in `hub.config.ts`
- **Pages CMS** (`.pages.yml`) provides a GUI for editing pillars and branches collections — connect the repo at app.pagescms.org (git-based; commits straight to the Markdown files, GitHub OAuth handled by Pages CMS). Replaced Keystatic in the Astro 6 migration (no `@keystatic/astro` supports Astro 6).

## Project Board

[Operating Board](https://github.com/orgs/organvm-iii-ergon/projects/5) — the live source for issue state and recent closures (don't inline a closures list here; it self-ages). Critical path complete; content genome processed. Deploy / auto-deploy status is documented once in **Deploy Configuration** below.

## Triple-Reference Law

Identity by triangulation — every work item exists across 3 surfaces: (a) atomized-want `W-###` (or `seed.yaml`) in this repo, (b) IRF entry `IRF-XXX-NNN` at `~/Code/organvm/organvm-corpvs-testamentvm/INST-INDEX-RERUM-FACIENDARUM.md`, (c) GitHub issue on the project board. Per IRF-SYS-078: **3/3 CONSTITUTED**, **2/3 EMBRYONIC** (blocked work OK), **1/3 NASCENT** (likely unfiled vacuum), **0/3 VACUUM** (Axiom #1 violation). Verify at session close — untriangulated items drift into ambiguity. (`sys-check-pulse` is the self/local/remote instance of the same principle.)

## Deploy Configuration

- **Platform:** Cloudflare Workers + Static Assets; auto-deploy on push to `main`. Current review origin lives in `src/data/site.config.ts` (`PUBLIC_SITE_ORIGIN` can override it at build time).
- **Build:** `npm run build` → `dist/`. The Astro Cloudflare adapter (v13, Workers output) produces `dist/client` (static assets) + `dist/server/entry.mjs` (the SSR worker); `src/pages/*.ts` (e.g., `capture.ts`) are bundled into that server worker, _not_ separate Pages Functions. (Astro 5 / adapter 12 emitted a single `dist/_worker.js`; that model is gone — see #170.)
- **Manual deploy:** `npm run deploy` (= `npm run test:all && wrangler deploy --config dist/server/wrangler.json`). `wrangler pages deploy dist/client` is static-only and leaves `/capture` and `/api/water-report` dead.
- **`functions/` removed:** the EWG proxy is now `src/pages/api/water-report.ts` (Astro APIRoute, like `capture.ts`). The old `functions/api/water-report.ts` 404'd in production (the worker bundle takes precedence over root `functions/`, which isn't in `dist/`), silently serving demo data. The worker bundle is authoritative for all routes.
- **Multi-domain story is metadata-only.** `src/data/hub.config.ts` declares `domains: { hub, water, business }` for content references; actual multi-domain routing is DNS-level (CNAMEs in Cloudflare), not Astro logic.
  - Primary: `hub-example.com` (connect via Cloudflare Workers → Settings → Domains & Routes → Custom domain)
  - Secondary: `water-example.com`, `business-example.com` (connect when ready)
- **Dev server (`astro.config.mjs`):** `host: true` + allowed hosts (`.trycloudflare.com`, `.ngrok-free.app`/`.dev`, `.ngrok.io`, `localhost`, `127.0.0.1`) for tunnel-based dev with the client.
- `.config/netlify.toml` is legacy (relocated from repo root in hygiene pass `294d071`) — kept for reference but deployment is on Cloudflare.

## Session Close

Close-out is a checklist, not a feeling: **check-all, skip-inapplicable, never check-none.** The full generic ritual (additive-only discipline, N/A-vacuum law, 10-index propagation, plan-file durability, the FRAME→SHAPE→BUILD→PROVE→HARVEST framing) lives in the `/closeout` skill and the reliquary `working-state-reference.md` — not duplicated here. Repo-specific gates that must pass:

1. **Local↔remote = 1:1** — `git rev-list --count origin/main..main` and the reverse both `0`, for this repo _and_ any workspace-meta repos touched.
2. **Vacuum gate** — `npm test`. New `src/data/*` fields must be in the `TRACKED_VACUUMS` map (with GH issue) or filled; UNTRACKED vacuums fail the build.
3. **Triple-Reference Law** (IRF-SYS-078) — verify each new work item across the 3 surfaces (see section above): 3/3 CONSTITUTED, 2/3 EMBRYONIC (blocked work OK), <2 → file the missing references.
4. **Memory parity** — files in `~/.claude/projects/.../memory/` minus 1 (the `MEMORY.md` index) = `MEMORY.md` line count; session memory written as `project_session_YYYY_MM_DD_<slug>.md` and indexed.
5. **Land on origin** — every touched repo lands on `origin/main` (direct-push for low-risk hygiene; PR-cascade for multi-section / structural / governance changes). Auto-deploy picks up either.

**Recover-on-loss:** if any check fails, recover immediately — nothing local-only, nothing lost.

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


**Prompting (Anthropic)**: context 200K tokens, format: XML tags, thinking: extended thinking (budget_tokens)


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
