# Spiral Source Alignment Audit

**Date:** 2026-06-05
**Scope:** admin/user prompt corpus, spiral visual direction, `/spiral`, `/nodes/[id]`, and the background/theme contract.

## Sources Reviewed

- `.conductor/active-handoff.md`
- `.claude/plans/2026-06-04-handoff-hover-motion-relationship-pipeline.md`
- `.claude/plans/2026-04-25-*spiral*.md`
- `.claude/plans/2026-04-29-*admin*spiral*.md`
- `.claude/plans/2026-05-01-admin-messages-translation.md`
- `.claude/sessions/*/prompts.md`
- `docs/client-decisions/2026-04-04-admin-feedback-session.md`
- `docs/client-decisions/2026-04-17-atomized-wants.md`
- `docs/client-decisions/2026-04-17-comprehensive-request-audit.md`
- `docs/client-decisions/2026-04-25-admin-spiral-v4-direction.md`
- `docs/critiques/2026-04-30-spiral-hero-polish-critique.md`
- `docs/critiques/2026-05-29-spiral-animation-intent-gap.md`
- `docs/handoff-admin-spiral-2026-04-25.md`
- `docs/handoff-admin-spiral-path-2026-04-01.md`
- `docs/internal/2026-05-16-admin-imessage-transcript-and-signals.md`
- `docs/admin/2026-06-03-hover-names-living-motion.md`
- `docs/admin/2026-06-03-spiral-hero-default.md`
- `docs/reports/2026-04-27-prompt-atom-registry.md`
- `docs/reports/2026-04-29-admin-asks-from-stream-a.md`
- `docs/timelines/2026-05-01-spiral-evolution-timeline.md`
- `docs/archive/2026-04/2026-04-27-221222-find-everything-related-to-admin-the-spiral.txt`
- `docs/archive/extracted/1a-master-spiral-backend-breakdown.md`
- `docs/archive/extracted/1b-spiral-dump-questionnaire.md`
- `docs/archive/source-bundle/spiral/**`

The canonical repo document sweep covered 667 files under `.conductor/`, `.claude/`, and `docs/`, excluding nested worktree copies and generated/vendor output. The broad term sweep produced more than 170k prompt/client-text hits, so this audit is organized by the repeated requirements that survived across the prompt corpus rather than by pasting every duplicate line.

## Governing Requirements

1. The spiral is its own immersive landing page, not a marketing page with the spiral as a framed widget.
2. Each node is an offshoot world with its own URL and own material structure.
3. The node boundary must be readable at small and large sizes.
4. The boundary is not just a shell; the interior matter must make the boundary understandable.
5. Gas, liquid, solid, and plasma states are real visual inputs, not labels.
6. Each node needs a distinctive theme and color set.
7. The background must be a unified site field; random page-by-page background colors break the system.
8. Hover names and clickable node navigation remain required, but they do not replace the visual structure.
9. The render should feel alive, refracted, gateway-like, atmospheric, and always slightly different.
10. Repeated generic orbs, repeated card wrappers, and decorative-only glow do not satisfy the source direction.

## Current Gap

The previous `/nodes/[id]` pass had the right data inputs but the wrong visual force. It projected each `IconWorld` into a CSS glass object, yet most nodes still shared the same orb/marble anatomy. That preserved the data model but failed the source requirement that each node's telological/ontological purpose be visible through matter, phase state, boundary, and color.

The background also drifted: `/spiral`, `/nodes/[id]`, and global surfaces used different dark gradients and teal values. The visual language therefore read as separate pages, not one system.

## Corrections Applied In This Pass

- Unified the canonical dark field through `--ss-page-bg` and the ocean base token.
- Made `/spiral` consume that same field instead of a separate hard-coded background.
- Made `/nodes/[id]` consume the same field, with only restrained per-node light in the hero.
- Added node phase variables: `--node-gas`, `--node-liquid`, `--node-solid`, `--node-plasma`.
- Added EnvVar-specific node vessel classes for PYR, OCULUS, DYAD, PYRAMIS, HYDOR, MANDORLA, KENOSIS, SHATKONA, PADMA, BODHI, TETRAD, OKTAEDRON, and ANKH.
- Added internal boundary, star, gas, liquid, solid, and plasma layers whose opacity/weight is driven by the actual `IconWorld.phaseMix`.
- Increased Three.js materia visibility and bloom so the particle universe is no longer visually subordinate to a shell.
- Strengthened the wire boundary so the shape reads at distance while keeping the membrane secondary to the contained matter.

## 2026-06-05 Follow-Up: Source Manifest, Not One-Off Styling

The first correction pass still left too much interpretation inside
`src/pages/nodes/[id].astro`. That made the node pages technically different
but not governed by a durable source of truth. The follow-up fix adds
`src/data/node-visuals.ts` as the canonical visual-intent manifest for all 13
offshoot worlds.

Each node now carries:

- `boundaryPrinciple` — how the exterior container is understood.
- `matterPrinciple` — how gas, liquid, solid, and plasma explain the boundary.
- `colorStory` — the node-specific theme palette in language.
- `containerRule` — the design constraint that prevents generic orb drift.
- CSS variables for refraction, boundary weight, gas scale, liquid depth, solid
  fracture, plasma reach, and rotation.

`/nodes/[id]` consumes that manifest directly. The visible "Interior matter"
copy and the vessel's material behavior are now derived from the same reviewed
prompt requirements, rather than from repeated CSS defaults.

The automated test suite now verifies that all 13 nodes have complete visual
profiles, unique profile classes, every EnvVar covered, and all required
material variables present. This makes "every node needs a thematic color set
and a distinct boundary/matter rule" a testable repo contract.

## 2026-06-05 Follow-Up: Background Contract Regression

The source of the remaining background drift was not the page wrapper alone.
The global CSS set `--ss-page-bg` / `--color-ocean-900` to `#020b10`, while
the Three.js renderer still used `BG_COLOR = 0x071e22` and incorrectly
commented that it matched ocean-900. That made the WebGL canvas read as a
different dark field from the site chrome.

The renderer now uses `BG_COLOR = 0x020b10`, and `scripts/test.mjs` verifies
that the renderer constant matches `--ss-page-bg`. Local production-build
screenshots were captured for `/spiral`, `/nodes/1`, `/nodes/5`, `/nodes/8`,
and `/nodes/13` under `/tmp/ss-bg-contract-audit/`. These prove the background
field is now coherent across the spiral and sampled node pages.

The same screenshot pass also confirms the next remaining visual gap: nodes 1,
8, and 13 are distinct by silhouette and palette, but still rely too much on
outer icon geometry. Node 5 better satisfies the requested model because its
interior liquid mass visibly explains the gateway-drop boundary. The next node
render pass should make the interior matter laws visually primary for every
node, not merely present as subtle overlays.

## 2026-06-05 Follow-Up: Generative Matter Field

The next correction pass moved `/nodes/[id]` from static vessel styling toward
the prompt requirement that each node is born from rules, phase states, and
constant movement. The node page now adds an internal `node-vessel__phase-field`
layer, dominant-phase classes, seeded render variables, and per-particle
orbit/LFO variables. The particle budget is still capped by the manifest; the
variation comes from phase law and oscillator values rather than from adding an
unbounded number of DOM elements.

The visible improvements are:

- Gas, liquid, solid, and plasma now have distinct field textures.
- The liquid node reads through refraction and meniscus behavior.
- The solid node reads through faceted stress and lattice behavior.
- The plasma node reads through radial filament pressure.
- The ANKH/gas-plasma node gained loop and stem currents so the shape reads as
  a contained life-current instead of a flat emblem.

Local and live Worker screenshot passes covered `/nodes/1`, `/nodes/5`,
`/nodes/8`, and `/nodes/13`; the live pass is stored at
`/tmp/ss-node-matter-live-final/`. The current deployed Worker version for that
pass was `7bfb6c37-1125-4e06-9cce-c8f36f538098`.

## 2026-06-05 Follow-Up: App-Wide Background Token Sweep

The background complaint was not fully closed by the WebGL fix. A later source
sweep found legacy dark fields still hard-coded in app source:

- `/decisions` used `#071e22` inside the aggregate ring.
- `VideoEmbed.astro` used a placeholder gradient with `#071e22`, `#113d42`,
  and `#0c2e33`.
- `Base.astro` used `#0c2e33` for citation tooltips.

These are now tokenized through `--ss-page-bg`, `--color-ocean-900`,
`--color-ocean-800`, and `--color-ocean-700`. `scripts/test.mjs` now scans
`src/**/*.astro`, `src/**/*.css`, and `src/**/*.ts` and fails if the legacy
background hexes `#071e22` or `#0c2e33` reappear. This turns the user's "why
are the backgrounds different colors still" complaint into a repo-level
regression contract, not just another visual patch.

## Acceptance Standard

This visual lane is not complete until browser screenshots show:

- `/spiral`, `/nodes/[id]`, `/decisions`, and placeholder video surfaces on the
  same canonical dark field.
- Node 1, 5, 8, and 13 visibly different without reading labels.
- At least one gas-dominant, one liquid-dominant, one solid-dominant, and one plasma-dominant node showing different interior matter behavior.
- Mobile hero content readable without covering the vessel.
- No generic repeated node card/orb language in the first viewport.
- No legacy hard-coded background fields in app source.
