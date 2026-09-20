/**
 * Docs Library catalog — declares every directory and notable file under
 * `docs/` (plus a few repo-root session artifacts) that earns a surface on
 * the `/library` index. Used by `src/pages/library.astro` at build time.
 *
 * Pattern matches existing index surfaces (`/timeline`, `/decisions`,
 * `/aesthetics`): one declarative catalog → one rendered surface that
 * grids the entries with file counts + click-through to GitHub source.
 *
 * Add a new category by appending an entry here; the library page picks
 * it up automatically on the next build.
 */
// NOTE: this module is imported by `src/pages/library.astro`, which prerenders
// in workerd under @astrojs/cloudflare v13 (no host filesystem). It must stay
// free of `node:fs`/`node:path`. The build-time file enumeration lives in
// `scripts/generate-library-manifest.mjs`, which writes the manifest JSON the
// page reads.

export type LibraryGroup =
  | 'client' // client deliverables, decisions, inbound PDFs
  | 'engineering' // SOPs, runbooks, manifests, proofs
  | 'product' // design proposals, content, superpowers intakes
  | 'session'; // raw session artifacts at repo root

export interface LibraryEntry {
  /** URL-safe identifier (also used as fragment anchor in the library page). */
  slug: string;
  /** Display name on the library card. */
  label: string;
  /** One-line description. */
  description: string;
  group: LibraryGroup;
  /** Either a directory under repo root, or a single file. */
  kind: 'dir' | 'single-file';
  /** Relative repo path — directory for kind='dir', file for kind='single-file'. */
  path: string;
  /** Extensions to surface (lowercase, with dot). Empty array = all files. Default: ['.md', '.html', '.pdf', '.json', '.txt']. */
  exts?: string[];
  /** When more than this many files exist, truncate and link out for the rest. */
  maxShown?: number;
}

export const LIBRARY: LibraryEntry[] = [
  // Client stream
  {
    slug: 'client-decisions',
    label: 'Client Decisions',
    description:
      'Authoritative decisions made with admin — locked architecture, accepted agreements, request audits.',
    group: 'client',
    kind: 'dir',
    path: 'docs/client-decisions',
  },
  {
    slug: 'client-deliverables',
    label: 'Client Deliverables',
    description:
      'Walkthrough docs, revenue agreements, anything shipped to the client.',
    group: 'client',
    kind: 'dir',
    path: 'docs/client-deliverables',
  },
  // NOTE: `client-pdfs` and `admin` entries intentionally NOT surfaced on
  // the public /library page (2026-05-16). Repo is public so files remain on
  // GitHub, but they're no longer clickable from the deployed site —
  // protects internal analysis docs from accidental client surfacing.

  // Product stream
  {
    slug: 'superpowers-intakes',
    label: 'Superpowers — Intakes',
    description: "admin's dictated/written intake docs that seed the system.",
    group: 'product',
    kind: 'dir',
    path: 'docs/superpowers/intakes',
  },
  {
    slug: 'superpowers-plans',
    label: 'Superpowers — Plans',
    description: 'Implementation plans authored against the intakes.',
    group: 'product',
    kind: 'dir',
    path: 'docs/superpowers/plans',
  },
  {
    slug: 'superpowers-specs',
    label: 'Superpowers — Specs',
    description: 'Specifications: contracts, schemas, interfaces.',
    group: 'product',
    kind: 'dir',
    path: 'docs/superpowers/specs',
  },
  {
    slug: 'design-proposals',
    label: 'Design Proposals',
    description:
      'Concrete design-direction docs (node shapes, vessel modes, etc).',
    group: 'product',
    kind: 'dir',
    path: 'docs/design-proposals',
  },
  {
    slug: 'social-content-calendar',
    label: 'Social Content Calendar',
    description:
      'Reel, post, carousel, email, video — content asset library organized by format.',
    group: 'product',
    kind: 'dir',
    path: 'docs/social-content-calendar',
  },
  {
    slug: 'critiques',
    label: 'Design Critiques',
    description:
      'Severity-rated architectural-critique passes — usability, hierarchy, accessibility findings.',
    group: 'product',
    kind: 'dir',
    path: 'docs/critiques',
  },
  {
    slug: 'timelines',
    label: 'Evolution Timelines',
    description:
      'Chronological evolution transcripts of named artifacts (date / client request / studio prompt / shipped version).',
    group: 'product',
    kind: 'dir',
    path: 'docs/timelines',
  },

  // Engineering stream
  {
    slug: 'sops',
    label: 'SOPs',
    description:
      'Standard operating procedures — atomic decomposition, board QA, issue tracking, review chains.',
    group: 'engineering',
    kind: 'dir',
    path: 'docs/sops',
  },
  {
    slug: 'runbooks',
    label: 'Runbooks',
    description:
      'Operational runbooks — CF token rotation, deploy paths, recovery procedures.',
    group: 'engineering',
    kind: 'dir',
    path: 'docs/runbooks',
  },
  {
    slug: 'manifests',
    label: 'Project Manifests',
    description:
      'Dated annotated bibliographies of the entire repo corpus (deterministic UIDs, SHA-256 per file).',
    group: 'engineering',
    kind: 'dir',
    path: 'docs/manifests',
    exts: ['.md'], // skip the .json twins on the index (still visible on GH)
  },
  {
    slug: 'reports',
    label: 'Reports',
    description:
      'Cross-cutting reports — case studies, prompt-atom registries, implementation logs.',
    group: 'engineering',
    kind: 'dir',
    path: 'docs/reports',
  },
  {
    slug: 'proofs',
    label: 'Proofs',
    description:
      'Diff proofs, deploy proofs, screenshot evidence of feature behavior.',
    group: 'engineering',
    kind: 'dir',
    path: 'docs/proofs',
  },
  {
    slug: 'decisions-docs',
    label: 'Decision Docs',
    description:
      'Markdown decision records (NOT the /decisions board — those live in src/data/decisions.ts).',
    group: 'engineering',
    kind: 'dir',
    path: 'docs/decisions',
  },

  // Single files / session artifacts
  {
    slug: 'triangle-irf-iii-033',
    label: 'IRF-III-033 (Triangle)',
    description: 'Triangle-stream IRF document — read directly.',
    group: 'engineering',
    kind: 'single-file',
    path: 'docs/triangle/IRF-III-033.md',
  },
  {
    slug: 'session-export-2026-04-25',
    label: 'Session Export 2026-04-25T20:24',
    description:
      'Conversation transcript export captured 2026-04-25 20:24:30 UTC.',
    group: 'session',
    kind: 'single-file',
    path: 'export-2026-04-25T20-24-30.md',
  },
];

export const GROUP_LABEL: Record<LibraryGroup, string> = {
  client: 'Client Stream',
  product: 'Product Stream',
  engineering: 'Engineering Stream',
  session: 'Session Artifacts',
};

export const GROUP_DESCRIPTION: Record<LibraryGroup, string> = {
  client: 'Everything that originated from or was shipped to admin.',
  product:
    'The product-design surface — intakes, specs, plans, content, critiques.',
  engineering: 'How the system is built, operated, and proven.',
  session:
    'Raw working-state captures left at the repo root by session-management tooling.',
};

export interface DiscoveredFile {
  name: string;
  relPath: string; // repo-relative
  ext: string;
  sizeBytes: number;
  mtimeIso: string;
  sha256?: string;
  isDir: boolean;
}

export function libraryByGroup(): Record<LibraryGroup, LibraryEntry[]> {
  const groups: Record<LibraryGroup, LibraryEntry[]> = {
    client: [],
    product: [],
    engineering: [],
    session: [],
  };
  for (const e of LIBRARY) groups[e.group].push(e);
  return groups;
}

export function formatBytes(n: number): string {
  if (!n) return '—';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} kB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

export const GITHUB_BLOB_BASE =
  'https://github.com/organvm-iii-ergon/sovereign-systems--spiral-template/blob/main';
export const GITHUB_TREE_BASE =
  'https://github.com/organvm-iii-ergon/sovereign-systems--spiral-template/tree/main';
