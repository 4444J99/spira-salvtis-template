export interface Pillar {
  name: string;
  slug: string;
  emoji: string;
  tagline: string;
  color: string;
  url: string;
  status: 'live' | 'coming-soon';
  order: number;
  citationIds?: string[];
}

export interface Branch {
  name: string;
  slug: string;
  emoji: string;
  order: number;
  citationIds: string[];
  ghlUrl?: string;
  /**
   * Whether the branch surfaces on the spiral site (water hub teasers, nav, etc).
   * Default true. Hidden branches keep their /water/[slug] route + .md source —
   * the route still resolves for direct links and HTML extraction — but no
   * navigation surface exposes them. Per admin 2026-05-16 voice note:
   * spiral = 3 visible branches (Inflammation, Hormone Health, Energy + Focus);
   * the other 3 move to her GHL water hub at water-spira-salvtis.dev.
   */
  visible?: boolean;
}

export type Phase = 'ELEVATE' | 'ALIGN' | 'UNLOCK';

/**
 * EnvVar — the immutable metaphysical substrate beneath each spiral node.
 * Surface names (admin's "Feel Good First", etc.) are mutable bindings;
 * the EnvVar is the True Name keyed to the icon shape and the node's
 * cross-cultural lineage. Used by `naming-chains.ts` to render the
 * `/lineage/[envvar]` view that shows the same essence named through
 * different traditions (Greek-classical, Sanskrit-Vedic, Egyptian,
 * Christian-mystical, Jungian, modern-wellness, etc.).
 */
export type EnvVar =
  | 'PYR' // 1 — Sunburst — primordial fire / radiance
  | 'OCULUS' // 2 — Eye — witness / observation
  | 'DYAD' // 3 — Yin-Yang — polarity / pair
  | 'PYRAMIS' // 4 — Triangle — pyramid / ascending volume
  | 'HYDOR' // 5 — Teardrop — water / source
  | 'MANDORLA' // 6 — Vesica Piscis — overlap / sacred gate
  | 'KENOSIS' // 7 — Crescent — emptying / receptive vessel
  | 'SHATKONA' // 8 — Hexagram — six-pointed union
  | 'PADMA' // 9 — Lotus — bloom / unfolding
  | 'BODHI' // 10 — Eye-in-Triangle — awakened seeing
  | 'TETRAD' // 11 — Solar Cross — fourfold cardinal order
  | 'OKTAEDRON' // 12 — Octahedron — eightfold crystalline form
  | 'ANKH'; // 13 — Ankh — eternal life / continuance

/**
 * QuizTheme — vocabulary used to match user quiz answers to nodes.
 * Tags chosen to be self-evident (no client copy gloss needed) and
 * non-overlapping enough to make scoring meaningful. The same theme
 * may appear on multiple nodes; the relative count + answer weight
 * is what produces a placement.
 */
export type QuizTheme =
  | 'state-shifting'
  | 'baseline'
  | 'simple-pleasure' // node 1
  | 'witness'
  | 'awareness'
  | 'signal-reading' // node 2
  | 'regulation'
  | 'balance'
  | 'calm' // node 3
  | 'elevation'
  | 'beyond-baseline'
  | 'knowing-better' // node 4
  | 'foundation'
  | 'hydration'
  | 'root-cause' // node 5
  | 'ownership'
  | 'gentleness'
  | 'choice' // node 6
  | 'release'
  | 'reclaim'
  | 'unwiring' // node 7
  | 'clarity'
  | 'intention'
  | 'coherence' // node 8
  | 'becoming'
  | 'life-fueling'
  | 'power' // node 9
  | 'awakening'
  | 'what-now'
  | 'post-awakening' // node 10
  | 'integration'
  | 'wholeness'
  | 'pulling-together' // node 11
  | 'expression'
  | 'identity'
  | 'loud-pride' // node 12
  | 'freedom'
  | 'gifts-amplified'
  | 'full-flow'; // node 13

export interface SpiralNode {
  id: number;
  name: string;
  phase: Phase;
  pillarSlug: string;
  emoji: string;
  tagline: string;
  color: string;
  status: 'live' | 'locked';
  url: string;
  /** Immutable substrate identity — see EnvVar type above. */
  envVar: EnvVar;
  /**
   * Theme tags used by the node-placement quiz. The themes describe
   * what the node addresses, not what the user must already know.
   * Three is the target count per node — enough to differentiate,
   * few enough to keep affinity scoring stable.
   */
  themes?: QuizTheme[];
  /**
   * Chakra mapping for the node's energetic/symbolic register.
   * Used in the asterisk/chakra geometry primitives and could feed
   * future quiz dimensions (chakra-resonance scoring).
   */
  chakra?:
    | 'root'
    | 'sacral'
    | 'solar-plexus'
    | 'heart'
    | 'throat'
    | 'third-eye'
    | 'crown'
    | 'root-crown';
}

export interface HubConfig {
  name: string;
  tagline: string;
  pillars: Pillar[];
  nodes: SpiralNode[];
  branches: Branch[];
  domains: {
    hub: string;
    water: string;
    business: string;
  };
  ghl: {
    quizFormUrl: string;
    productUrl: string;
  };
}

/**
 * VesselMode — how spiral nodes render their substrate.
 *
 *  invisible       — mesh hidden, particle field is the visual identity
 *  visible         — mesh shown as a translucent membrane, particle field retained
 *  refracted-star  — mesh shown with stars-variant transmission/IOR/dispersion
 *                    material; particle field suppressed; prismatic look
 *  hybrid          — faint unique membrane + dense particle field — promoted
 *                    default after visual QA because the boundary must read
 *                    distinctly at small and large sizes without becoming the
 *                    whole node
 */
export type VesselMode = 'invisible' | 'visible' | 'refracted-star' | 'hybrid';

/**
 * NavVariant — top-of-page navigation surface.
 *
 *  pillar-first  — current default; nav links to /pillars/:slug + /water/ + /business/
 *  spiral-first  — alternate; nav links directly to /nodes/1..13 sequence
 */
export type NavVariant = 'pillar-first' | 'spiral-first';

/**
 * SpiralLayout — spatial projection for the homepage node field.
 *
 *  helix          — current default; 13 nodes climb the tapered golden spiral
 *  constellation  — v2 opt-in; the same 13 nodes project as star-map points
 */
export type SpiralLayout = 'helix' | 'constellation';

/**
 * LabelMode — when node-name labels render on the spiral.
 *
 *  hover   — names materialize on hover while the node's world excites
 *            (admin 2026-04-19: "the stars/nodes and name when you hover");
 *            touch devices (pointer: coarse) auto-fall-back to 'always'
 *            since they have no hover
 *  always  — names permanently visible below each node (prior ship state)
 */
export type LabelMode = 'hover' | 'always';

export interface UIConfig {
  spiralVesselMode: VesselMode;
  navVariant: NavVariant;
  spiralLayout: SpiralLayout;
  spiralLabelMode: LabelMode;
}

/**
 * Runtime UI defaults. All flags can be overridden at request time via
 * querystring (?vessel=visible, ?nav=spiral-first, ?layout=constellation,
 * ?labels=always) for live A/B comparison without a redeploy. The defaults
 * below are the ship state — change here to promote a variant to default after
 * admin picks.
 */
export const ui: UIConfig = {
  // 2026-06-22 (admin): 'invisible' — drop the geometric SHELL (which rendered
  // as white spiky / grey shapes when a node is near the camera = her "disaster")
  // so each node reads as its contained colored universe (materia) only. NOTE:
  // pair with NormalBlending on the materia particles (spiral.ts) — AdditiveBlending
  // was tried and made them fuzzy shapeless blobs ("far worse"). Normal blending
  // keeps clean colored orbs, no white spikes, no fuzz.
  spiralVesselMode: 'invisible',
  navVariant: 'pillar-first',
  // 2026-06-06: #99 constellation projection ships opt-in only. The current
  // helix remains default; use ?layout=constellation for admin's
  // "points as constellations" v2 review surface.
  spiralLayout: 'helix',
  // 2026-06-03: names on hover — her single most-wanted feature (open since
  // 2026-04-19, loop L-admin-0001). Hovering a node also excites its
  // IconWorld physics so the spiral reads "alive". ?labels=always restores
  // the permanent labels for comparison.
  spiralLabelMode: 'hover',
};

export const config: HubConfig = {
  name: 'Sovereign Systems Spiral',
  tagline:
    'Rebuilding life from the foundation up \u2014 stabilizing the body, strengthening inner authority, refining identity, and installing financial systems.',
  pillars: [
    {
      name: 'Physical Sovereignty',
      slug: 'physical',
      emoji: '\u{1F30A}',
      tagline: 'Control your inputs. Stabilize your body.',
      color: '#ff9a3c',
      url: '/pillars/physical',
      status: 'live',
      order: 1,
      citationIds: ['B-01', 'B-78', 'S-14', 'S-19'],
    },
    {
      name: 'Inner Sovereignty',
      slug: 'inner',
      emoji: '\u{1F54A}',
      tagline: 'Control your internal state.',
      color: '#4ed158',
      url: '/pillars/inner',
      status: 'live',
      order: 2,
      citationIds: ['S-36', 'S-39', 'S-44', 'B-79', 'B-80', 'B-87', 'B-91'],
    },
    {
      name: 'Identity Sovereignty',
      slug: 'identity',
      emoji: '\u2728',
      tagline: 'Control your self-expression.',
      color: '#6c4cd6',
      url: '/pillars/identity',
      status: 'live',
      order: 3,
      citationIds: ['S-61', 'S-62', 'S-68', 'S-78', 'B-104', 'B-105', 'B-106'],
    },
    {
      name: 'Financial Sovereignty',
      slug: 'financial',
      emoji: '\u{1F4A0}',
      tagline: 'Control your income and systems.',
      color: '#c97ce8',
      url: '/business/',
      status: 'live',
      order: 4,
      citationIds: ['S-86', 'S-88', 'S-90', 'B-129', 'B-133', 'B-134'],
    },
  ],
  nodes: [
    // ELEVATE: body → Physical Sovereignty (nodes 1-5)
    {
      id: 1,
      name: 'Feel Good First',
      phase: 'ELEVATE',
      pillarSlug: 'physical',
      emoji: '✦',
      tagline: 'Feeling good is the baseline — not the bonus.',
      color: '#ff3b3b',
      status: 'live',
      url: '/nodes/1',
      envVar: 'PYR',
      themes: ['state-shifting', 'baseline', 'simple-pleasure'],
      chakra: 'root',
    },
    {
      id: 2,
      name: 'Awareness',
      phase: 'ELEVATE',
      pillarSlug: 'physical',
      emoji: '🧬',
      tagline: 'Your body is always speaking — are you listening?',
      color: '#ff563c',
      status: 'live',
      url: '/nodes/2',
      envVar: 'OCULUS',
      themes: ['witness', 'awareness', 'signal-reading'],
      chakra: 'third-eye',
    },
    {
      id: 3,
      name: 'Regulation',
      phase: 'ELEVATE',
      pillarSlug: 'physical',
      emoji: '⚖️',
      tagline: 'Balance your energy, calm your system.',
      color: '#ff723c',
      status: 'live',
      url: '/nodes/3',
      envVar: 'DYAD',
      themes: ['regulation', 'balance', 'calm'],
      chakra: 'sacral',
    },
    {
      id: 4,
      name: 'Elevate',
      phase: 'ELEVATE',
      pillarSlug: 'physical',
      emoji: '🛡️',
      tagline:
        'Feeling like shit is not normal — when you know better, you do better.',
      color: '#ff8e3c',
      status: 'live',
      url: '/nodes/4',
      envVar: 'PYRAMIS',
      themes: ['elevation', 'beyond-baseline', 'knowing-better'],
      chakra: 'solar-plexus',
    },
    {
      id: 5,
      name: 'Root Healing',
      phase: 'ELEVATE',
      pillarSlug: 'physical',
      emoji: '🌊',
      tagline: 'Optimize your absorption & energy flow.',
      color: '#ffad3c',
      status: 'live',
      url: '/water/',
      envVar: 'HYDOR',
      themes: ['foundation', 'hydration', 'root-cause'],
      chakra: 'sacral',
    },
    // ALIGN: mind + life → Inner & Identity Sovereignty (nodes 6-10)
    {
      id: 6,
      name: 'Responsibility (with Love)',
      phase: 'ALIGN',
      pillarSlug: 'inner',
      emoji: '🕊️',
      tagline: 'Own your choices, gently.',
      color: '#ffcd3b',
      status: 'locked',
      url: '/nodes/6',
      envVar: 'MANDORLA',
      themes: ['ownership', 'gentleness', 'choice'],
      chakra: 'heart',
    },
    {
      id: 7,
      name: 'Unbecoming',
      phase: 'ALIGN',
      pillarSlug: 'inner',
      emoji: '🌙',
      tagline: 'Reclaim / Remember / Release.',
      color: '#a7d24a',
      status: 'locked',
      url: '/nodes/7',
      envVar: 'KENOSIS',
      themes: ['release', 'reclaim', 'unwiring'],
      chakra: 'throat',
    },
    {
      id: 8,
      name: 'Alignment',
      phase: 'ALIGN',
      pillarSlug: 'inner',
      emoji: '🔮',
      tagline: 'See clearly, act intentionally.',
      color: '#4dce65',
      status: 'locked',
      url: '/nodes/8',
      envVar: 'SHATKONA',
      themes: ['clarity', 'intention', 'coherence'],
      chakra: 'third-eye',
    },
    {
      id: 9,
      name: 'The Becoming',
      phase: 'ALIGN',
      pillarSlug: 'identity',
      emoji: '🪷',
      tagline: 'Know your power — your choices create a life that fuels you.',
      color: '#43b6c1',
      status: 'locked',
      url: '/nodes/9',
      envVar: 'PADMA',
      themes: ['becoming', 'life-fueling', 'power'],
      chakra: 'heart',
    },
    {
      id: 10,
      name: 'Awakening',
      phase: 'ALIGN',
      pillarSlug: 'identity',
      emoji: '✨',
      tagline: "I'm awake, I have all this power — now what?",
      color: '#4992ed',
      status: 'locked',
      url: '/nodes/10',
      envVar: 'BODHI',
      themes: ['awakening', 'what-now', 'post-awakening'],
      chakra: 'crown',
    },
    // UNLOCK: integration + freedom → Identity & Financial Sovereignty (nodes 11-13)
    {
      id: 11,
      name: 'Integrate',
      phase: 'UNLOCK',
      pillarSlug: 'identity',
      emoji: '⨁',
      tagline: 'Pull it all together; your wholeness is the work.',
      color: '#645bdb',
      status: 'locked',
      url: '/nodes/11',
      envVar: 'TETRAD',
      themes: ['integration', 'wholeness', 'pulling-together'],
      chakra: 'root-crown',
    },
    {
      id: 12,
      name: 'Authenticate',
      phase: 'UNLOCK',
      pillarSlug: 'financial',
      emoji: '💠',
      tagline: 'Be YOU — loudly, proudly, unapologetically.',
      color: '#9360de',
      status: 'locked',
      url: '/nodes/12',
      envVar: 'OKTAEDRON',
      themes: ['expression', 'identity', 'loud-pride'],
      chakra: 'throat',
    },
    {
      id: 13,
      name: 'Unlock',
      phase: 'UNLOCK',
      pillarSlug: 'financial',
      emoji: '⚡',
      tagline: 'Level up fully — your gifts, flow, and freedom amplified.',
      color: '#c97ce8',
      status: 'locked',
      url: '/nodes/13',
      envVar: 'ANKH',
      themes: ['freedom', 'gifts-amplified', 'full-flow'],
      chakra: 'crown',
    },
  ],
  branches: [
    {
      name: 'Hormone Health',
      slug: 'gut-hormones',
      emoji: '\u{1F33F}',
      order: 1,
      citationIds: [
        'B-13',
        'B-14',
        'B-15',
        'B-16',
        'B-17',
        'B-18',
        'B-19',
        'B-20',
        'S-16',
      ],
      // Unlinked (admin 2026-06-22 #35 "Option A — full swap"): deep water
      // branch content moves to GHL / water-spira-salvtis.dev; markdown preserved.
      visible: false,
    },
    {
      name: 'Fertility',
      slug: 'fertility',
      emoji: '\u{1F90D}',
      order: 2,
      citationIds: [
        'B-21',
        'B-22',
        'B-23',
        'B-24',
        'B-25',
        'B-26',
        'B-27',
        'B-28',
        'B-29',
        'B-01',
      ],
      visible: false,
    },
    {
      name: 'Energy + Focus',
      slug: 'athletic',
      emoji: '\u{1F4AA}',
      order: 3,
      citationIds: [
        'B-38',
        'B-39',
        'B-40',
        'B-41',
        'B-42',
        'B-43',
        'B-44',
        'B-45',
      ],
      // Unlinked (admin 2026-06-22 #35 "Option A — full swap"); preserved.
      visible: false,
    },
    {
      name: 'Inflammation',
      slug: 'autoimmune',
      emoji: '\u{1F525}',
      order: 4,
      citationIds: [
        'B-30',
        'B-31',
        'B-32',
        'B-33',
        'B-34',
        'B-35',
        'B-36',
        'B-37',
      ],
      // Unlinked (admin 2026-06-22 #35 "Option A — full swap"); preserved.
      visible: false,
    },
    {
      name: 'Cancer Support',
      slug: 'cancer-support',
      emoji: '\u{1F397}',
      order: 5,
      citationIds: [
        'B-46',
        'B-47',
        'B-48',
        'B-49',
        'B-50',
        'B-51',
        'B-52',
        'B-53',
      ],
      visible: false,
    },
    {
      name: 'Sustainability / Savings',
      slug: 'sustainability',
      emoji: '\u{1F30E}',
      order: 6,
      citationIds: ['S-13', 'S-17', 'S-19'],
      visible: false,
    },
  ],
  domains: {
    hub: 'hub-spira-salvtis.dev',
    water: 'water-spira-salvtis.dev',
    business: 'business-spira-salvtis.dev',
  },
  ghl: {
    quizFormUrl:
      'https://api.leadconnectorhq.com/widget/quiz/qoZk7lZax3nSDwIVkZOW',
    productUrl: 'https://water-spira-salvtis.dev',
  },
};
