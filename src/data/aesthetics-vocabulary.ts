/**
 * Aesthetics Vocabulary — shared language for the Spira salvtis Spiral.
 *
 * This file defines every named aesthetic / structural / visual / linguistic
 * primitive in the project, so that the client (admin) and the studio (us)
 * share one vocabulary when talking about specific parts. Each term has:
 *
 *   - a *public name* (what admin uses)
 *   - a *technical name* in parens (what the codebase uses)
 *   - a one-sentence definition (no jargon)
 *   - an *example* (concrete instance, so the term lands)
 *   - an optional *link* (where the thing can be inspected on the live site)
 *
 * The page at `/aesthetics` renders this vocabulary alongside live data from
 * `hub.config.ts`, `icon-worlds.ts`, `sacred-geometry-primitives.ts`,
 * `lens-geometry.ts`, and `naming-chains.ts`. Add a term here when a new
 * concept enters the system and we need shared language for it.
 */

export type VocabularyCategory =
  | 'structure' // how the system is organized (Spiral, Node, Pillar, Phase)
  | 'visual' // how things look (Vessel Mode, Chakra Spectrum)
  | 'language' // naming and identity (EnvVar, Lens, Naming Chain)
  | 'physics'; // generative laws (IconWorld, Sacred Geometry Primitive)

export interface VocabularyTerm {
  publicName: string;
  technicalName?: string;
  category: VocabularyCategory;
  definition: string;
  example?: string;
  link?: string;
  linkLabel?: string;
}

export const VOCABULARY: VocabularyTerm[] = [
  {
    publicName: 'Spiral',
    technicalName: 'spiral.ts / SpiralIsland',
    category: 'structure',
    definition:
      'The tapered 3D helix at the center of the homepage. Thirteen nodes arranged bottom-to-top, colored along the chakra spectrum (root red to crown purple). Rendered live in three.js.',
    example: 'Visible on the homepage hero, sized 85% of viewport height.',
    link: '/',
    linkLabel: 'See the live spiral',
  },
  {
    publicName: 'Node',
    technicalName: 'SpiralNode',
    category: 'structure',
    definition:
      'One of the thirteen positions on the spiral. Each node has its own page, its own visual structure, its own thematic environment, and its own substrate structure.',
    example:
      'Node 1 — Feel Good First — root chakra, primordial-fire substrate, Forge of Dawn world.',
    link: '/nodes/1',
    linkLabel: 'Open node 1',
  },
  {
    publicName: 'Substrate / True Name',
    technicalName: 'EnvVar',
    category: 'language',
    definition:
      'The immutable structure of each node — the essence beneath all its surface names. Thirteen substrates: PYR, OCULUS, DYAD, PYRAMIS, HYDOR, MANDORLA, KENOSIS, SHATKONA, PADMA, BODHI, TETRAD, OKTAEDRON, ANKH.',
    example:
      'PYR (primordial fire) shows up as RA in Egyptian, Agni in Vedic, Plasma in physics, and "Feel Good First" in modern wellness — but the substrate beneath them all is one.',
    link: '/lineage/PYR',
    linkLabel: "See PYR's full lineage",
  },
  {
    publicName: 'Lens',
    technicalName: 'Lens',
    category: 'language',
    definition:
      'One of seven interpretive traditions through which a substrate is named. The lens determines which name appears for a given essence: the same substrate is "RA" through the Egyptian lens and "Plasma" through the physics lens.',
    example:
      'Lenses: Egyptian · Sanskrit-Vedic · Greek-Classical · Christian-Mystical · Jungian · Physics-Elemental · Modern-Wellness.',
  },
  {
    publicName: 'Naming Chain',
    technicalName: 'NAMING_CHAINS',
    category: 'language',
    definition:
      'The chronological lineage of names for one substrate across all seven lenses. The chain shows how the same essence has been recognized and re-named across traditions and centuries.',
    example:
      "HYDOR's chain: Nun (Egyptian, ~2400 BCE) → Apah (Vedic, ~1500 BCE) → HYDOR (Greek, ~600 BCE) → Living Gateway (Christian, 1st c. CE) → H₂O (physics, 18th c.) → Root Healing (modern wellness, 2026).",
    link: '/lineage/HYDOR',
    linkLabel: "See HYDOR's chain",
  },
  {
    publicName: 'Pillar',
    technicalName: 'Pillar',
    category: 'structure',
    definition:
      'One of four content categories that organize the site: Foundation Sovereignty, System Sovereignty, Structure Sovereignty, Vision Sovereignty. Each pillar has its own color and tagline; nodes are grouped under pillars by content domain.',
    example:
      'Foundation Sovereignty (orange, 🌊) contains nodes 1–5 — the INITIATE phase, bodily foundation work.',
  },
  {
    publicName: 'Phase',
    technicalName: 'Phase',
    category: 'structure',
    definition:
      'One of three stages of the journey arc: INITIATE (nodes 1–5, raising from baseline), INTEGRATE (nodes 6–10, integrating mind and life), ACTIVATE (nodes 11–13, freedom and full flow). Phases are the temporal arc; pillars are the topical categorization.',
    example:
      'A user who scores into node 8 ("Alignment") is in the INTEGRATE phase, inside the System Sovereignty pillar.',
  },
  {
    publicName: 'Vessel Mode',
    technicalName: 'VesselMode',
    category: 'visual',
    definition:
      'How each spiral node renders its substrate. Four modes available — invisible (only the particle field is visible), visible (opaque solid mesh), refracted-star (prismatic glass-like material with light dispersion), hybrid (mesh plus 30% particle field on top, the current default).',
    example:
      'Try ?vessel=refracted-star on the homepage URL for the prismatic look without redeploying.',
    link: '/?vessel=refracted-star',
    linkLabel: 'Preview refracted-star',
  },
  {
    publicName: 'Nav Variant',
    technicalName: 'NavVariant',
    category: 'structure',
    definition:
      'Which way the top-of-page navigation points. Two modes — pillar-first (nav links to the four pillar pages, the current default) or spiral-first (nav links directly to nodes 1–13 in sequence).',
    example: 'Try ?variant=spiral-first on any page URL for the alternate nav.',
    link: '/?variant=spiral-first',
    linkLabel: 'Preview spiral-first',
  },
  {
    publicName: 'Chakra Spectrum',
    technicalName: 'chakraColorForNode',
    category: 'visual',
    definition:
      'The thirteen-step color spectrum applied to nodes bottom-to-top. Root chakra (red) through crown (violet) and beyond. The mapping lives in spiral.ts and drives orb colors, accent tones, and the timeline of warm-to-cool through the helix.',
    example:
      'Node 1 is red (root); node 7 is green (heart); node 13 is violet-gold (crown).',
  },
  {
    publicName: 'Themed World',
    technicalName: 'IconWorld',
    category: 'physics',
    definition:
      'The complete environment that each node inhabits — its elements (fire, gateway, plasma, etc.), phase mix (gas/liquid/solid/plasma proportions), biology type (cosmic, organic, mineral, aquatic, lunar, volcanic, synthetic), gravity vector, particle behavior pattern, accent palette, thermal intensity, and particle size bias. Every node is its own complete world.',
    example:
      'Node 4 — Volcanic Pyre — fire + lava + smoke, rising particles, hot red-orange palette, gravity pointing upward (heat lift).',
  },
  {
    publicName: 'Sacred Geometry Primitive',
    technicalName: 'MathPrimitive',
    category: 'physics',
    definition:
      'The mathematical foundation of each node form: vertex count, symmetry type (radial, bilateral, crystalline, fractal), golden-ratio exponent, system-radius ratio, rotation-per-segment, twist factor, presence of a central void, depth-to-radius ratio. The "Platonic essence" of the form — not what it looks like, but what mathematical law generates it.',
    example:
      'OCULUS: 16 vertices, radial symmetry, PHI^1, has a central void (the pupil), 0.55 system ratio.',
  },
  {
    publicName: 'Quiz Theme',
    technicalName: 'QuizTheme',
    category: 'language',
    definition:
      'Self-evident tags used by the five-question affinity quiz to score user answers to a specific node. Three themes per node, chosen to make placement scoring meaningful and to avoid requiring client copy as a gloss.',
    example:
      'Node 3 (Regulation) carries themes [regulation, balance, calm]. A user who picks answers tagged with those themes scores higher into node 3.',
    link: '/quiz',
    linkLabel: 'Take the quiz',
  },
];

export function vocabularyByCategory(): Record<
  VocabularyCategory,
  VocabularyTerm[]
> {
  const groups: Record<VocabularyCategory, VocabularyTerm[]> = {
    structure: [],
    visual: [],
    language: [],
    physics: [],
  };
  for (const t of VOCABULARY) groups[t.category].push(t);
  return groups;
}

export const CATEGORY_LABEL: Record<VocabularyCategory, string> = {
  structure: 'Structure',
  visual: 'Visual',
  language: 'Language',
  physics: 'Physics',
};

export const CATEGORY_DESCRIPTION: Record<VocabularyCategory, string> = {
  structure: 'How the system is organized — what fits where.',
  visual: 'How things appear — colors, modes, spectrums.',
  language: 'How things are named — substrates, lenses, lineages.',
  physics: 'The generative laws — math and environment per node.',
};
