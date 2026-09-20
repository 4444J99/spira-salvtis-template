/**
 * Spiral version manifest — chronological record of every deployed visual
 * aesthetic of the Sovereign Systems Spiral site.
 *
 * Source of truth: HANDOFF.md and docs/timelines/2026-05-01-spiral-evolution-timeline.md
 * for V1–V8. Permanent CF Pages preview URLs come from
 *   `npx wrangler pages deployment list --project-name sovereign-systems-spiral`.
 *
 * Scope rule: this manifest contains ONLY entries representing actual site
 * deployments (or commits that should be deployed). Internal lab experiments
 * (Confluence × Apophatic batch, etc.) belong in `docs/spiral-experiments/`,
 * not here, and not in `public/`.
 *
 * Status semantics:
 *   - 'live'             — currently deployed at sovereign-systems-spiral.pages.dev
 *   - 'playable'         — has a permanent CF Pages preview URL at that commit
 *   - 'snapshot-pending' — commit exists but no permanent preview URL exists yet.
 *                          Backfilled via the runbook below.
 *
 * To promote a snapshot-pending entry to playable:
 *   1. git worktree add ../tmp-rebuild <commit>
 *   2. cd ../tmp-rebuild && npm ci && npm run build && \
 *      npx wrangler pages deploy dist --project-name sovereign-systems-spiral --branch backfill-<vN>
 *   3. Note the permanent `<hash>.sovereign-systems-spiral.pages.dev` URL; set
 *      `iframeSrc` and `status: 'playable'` here.
 *   4. git worktree remove --force ../tmp-rebuild
 *
 * The `--branch backfill-<vN>` flag is critical — it keeps the production alias
 * (sovereign-systems-spiral.pages.dev) pointing at current main rather than the
 * historical version being backfilled. Backfill 2026-05-16 used this protocol
 * for V1 / V3 / V5-V8.
 */

export type SpiralVersionStatus = 'live' | 'playable' | 'snapshot-pending';
export type SpiralVersionCategory =
  | 'production-historical' // shipped on the live site, now superseded
  | 'production-live'; // currently deployed

export interface SpiralVersion {
  /** Stable identifier; used in URL slugs and as React-key equivalent. */
  id: string;
  /** Display name shown in the timeline card header. */
  name: string;
  /** ISO date for chronological sort and display. */
  date: string;
  category: SpiralVersionCategory;
  status: SpiralVersionStatus;
  /** Git commit SHA where this version is the HEAD of spiral.ts (where known). */
  commit?: string;
  /** Short caption beneath the version name. */
  description: string;
  /** URL the card's "Open" button targets. For 'playable' or 'live' only. */
  iframeSrc?: string;
  /** Optional context note. */
  notes?: string;
}

export const SPIRAL_VERSIONS: SpiralVersion[] = [
  {
    id: 'v1-round1-lightening',
    name: 'V1 — Round 1 Lightening',
    date: '2026-04-23',
    category: 'production-historical',
    status: 'playable',
    commit: 'cdd046e',
    description:
      'First lightening pass on the spiral after the Apr 21 3D-helix realignment.',
    iframeSrc: 'https://36993402.sovereign-systems-spiral.pages.dev/',
    notes:
      'Originally not CF-deployed (auto-deploy was broken Apr 19). Permanent URL backfilled 2026-05-16.',
  },
  {
    id: 'v2-chakra-stars',
    name: 'V2 — Chakra-Colored Stars',
    date: '2026-04-25',
    category: 'production-historical',
    status: 'playable',
    commit: '02c90a2',
    description:
      '5-point stars with chakra-aligned color spectrum, bottom-to-top.',
    iframeSrc: 'https://3c27e19e.sovereign-systems-spiral.pages.dev/',
  },
  {
    id: 'v3-helix-compressed',
    name: 'V3 — Helix Compressed, Framed for Fold',
    date: '2026-04-25',
    category: 'production-historical',
    status: 'playable',
    commit: '845fcaf',
    description:
      'Background matches --color-ocean-900, helix height 14, camera (0,0,18), canvas height calc(100vh-240px).',
    iframeSrc: 'https://929c4cf9.sovereign-systems-spiral.pages.dev/',
  },
  {
    id: 'v4-dual-variants',
    name: 'V4 — Dual Variants (Sacred Symbols + Refracted Stars)',
    date: '2026-04-25',
    category: 'production-historical',
    status: 'playable',
    commit: 'b8d105b',
    description:
      'Two simultaneous aesthetics: 13 sacred symbols (Variant A) and generative refracted-light stars (Variant B).',
    iframeSrc: 'https://b6f1d5ec.sovereign-systems-spiral.pages.dev/',
    notes: 'admin: "IM SO OBSESSED !!!!"',
  },
  {
    id: 'v5-themed-solar-systems',
    name: 'V5 — Themed Solar Systems Inside Each Shape',
    date: '2026-04-25',
    category: 'production-historical',
    status: 'playable',
    commit: 'd8b34b6',
    description:
      'Each node holds a contained universe — phase states, biology, physics govern its materia. 10 sub-versions (V5.1–V5.10) in 3.5 hours iterating the containment physics.',
    iframeSrc: 'https://cb683daa.sovereign-systems-spiral.pages.dev/',
  },
  {
    id: 'v6-envvar-substrate',
    name: 'V6 — EnvVar / IconWorld Substrate',
    date: '2026-04-25',
    category: 'production-historical',
    status: 'playable',
    commit: '447ab84',
    description:
      'IconWorld type + 13-entry table + EnvVar substrate binding 13 nodes to True Names. NAMING_CHAINS multi-lens lineage data added.',
    iframeSrc: 'https://42a61ed2.sovereign-systems-spiral.pages.dev/',
  },
  {
    id: 'v7-mathematical-primitives',
    name: 'V7 — Mathematical Primitives Generative Geometry',
    date: '2026-04-26',
    category: 'production-historical',
    status: 'playable',
    commit: '671818b',
    description:
      'Proposal C: 13 sacred-geometry-primitives + 7 lens modulations wired into the spiral render loop.',
    iframeSrc: 'https://7f9572d5.sovereign-systems-spiral.pages.dev/',
  },
  {
    id: 'v8-unique-universes',
    name: 'V8 — Unique Universes via Lineage × Lenses × Math',
    date: '2026-04-26',
    category: 'production-historical',
    status: 'playable',
    commit: '66a6f0b',
    description:
      'Planets re-enabled (2–6 per node), per-planet lineage RNG, lens-driven icon geometry from 7-tradition sequence, creation/destruction duality.',
    iframeSrc: 'https://b8cbee30.sovereign-systems-spiral.pages.dev/',
  },
  {
    id: 'live-current',
    name: 'LIVE — Current Production Spiral',
    date: '2026-05-16',
    category: 'production-live',
    status: 'live',
    description:
      'V8+ with chakra-color nodes (chakraColorForNode at spiral.ts:1248), IconWorlds physics, hybrid vessel-mode default.',
    iframeSrc: 'https://sovereign-systems-spiral.pages.dev/',
    notes: 'Always reflects the current deployment.',
  },
];

/** Reverse-chronological grouping for the viewfinder UI. */
export function versionsGroupedByCategory(): Record<
  SpiralVersionCategory,
  SpiralVersion[]
> {
  const groups: Record<SpiralVersionCategory, SpiralVersion[]> = {
    'production-live': [],
    'production-historical': [],
  };
  for (const v of SPIRAL_VERSIONS) groups[v.category].push(v);
  return groups;
}
