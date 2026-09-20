/**
 * NAMING_CHAINS — multi-lens lineage of the 13 spiral substrates.
 *
 * Each spiral node has an immutable EnvVar (PYR, OCULUS, ...) keyed to
 * its icon shape. The same essence has been named through many traditions
 * across history. This file binds every EnvVar to its surface names in
 * each Lens (Greek-classical, Sanskrit-Vedic, Egyptian, Christian-mystical,
 * Jungian, modern-wellness, physics-elemental), so a single rendering
 * surface (`/lineage/[envvar]`) can show the chronological lineage AND a
 * future viewer can re-skin the whole spiral through any tradition by
 * filtering on Lens.
 *
 * Architecture:
 *   - EnvVar (immutable) is the structure. Owned in `hub.config.ts`.
 *   - SurfaceBinding pairs (envVar, lens) and supplies one period's name.
 *   - chainsFor(envVar)        -> chronological lineage of one node.
 *   - viewThroughLens(lens)    -> all 13 nodes named through one tradition.
 *
 * Sources are indicative, not exhaustive — entries can be expanded later
 * without schema change.
 */

import type { EnvVar } from './hub.config';
import type { Lens } from './lens-geometry';

// Single-source the structure types: EnvVar from hub.config, Lens from
// lens-geometry. Re-exported so existing `import { Lens } from './naming-chains'`
// consumers keep working without a second, drift-prone union definition here.
export type { EnvVar, Lens };

export interface SurfaceBinding {
  /** Immutable referent. */
  envVar: EnvVar;
  /** Tradition / discipline naming this essence. */
  lens: Lens;
  /** Approximate era for chronological sorting. Empty = atemporal. */
  era?: string;
  /** Numeric era anchor for stable sort (negative = BCE). */
  eraSort?: number;
  /** Surface name in this tradition. */
  name: string;
  /** Native script if applicable. */
  script?: string;
  /** One-line essence in this tradition's framing. */
  connotation: string;
  /** Source attribution where one is canonical. */
  source?: string;
}

export const NAMING_CHAINS: SurfaceBinding[] = [
  // ════════════════════════════════════════════════════════════════
  // PYR — primordial fire / radiance (Sunburst)
  // ════════════════════════════════════════════════════════════════
  {
    envVar: 'PYR',
    lens: 'egyptian',
    era: '~3000 BCE',
    eraSort: -3000,
    name: 'RA',
    script: '𓂋𓂝',
    connotation: 'Solar fire — the disk that births each dawn.',
    source: 'Old Kingdom solar theology',
  },
  {
    envVar: 'PYR',
    lens: 'sanskrit-vedic',
    era: '~1500 BCE',
    eraSort: -1500,
    name: 'Agni',
    script: 'अग्नि',
    connotation: 'Sacrificial fire — the messenger between worlds.',
    source: 'Rigveda, Mandala 1',
  },
  {
    envVar: 'PYR',
    lens: 'greek-classical',
    era: '~500 BCE',
    eraSort: -500,
    name: 'PYR',
    script: 'πῦρ',
    connotation: 'Ever-living fire — first principle, always being kindled.',
    source: 'Heraclitus, Fragment B30',
  },
  {
    envVar: 'PYR',
    lens: 'christian-mystical',
    era: '1st c CE',
    eraSort: 50,
    name: 'Pentecostal Flame',
    connotation: 'Divine fire — tongues that descend and ignite knowing.',
    source: 'Acts 2:3',
  },
  {
    envVar: 'PYR',
    lens: 'jungian',
    era: '20th c',
    eraSort: 1920,
    name: 'Solar Libido / Puer Aeternus',
    connotation: 'Radiant psychic energy — eternal-youth principle.',
    source: 'Jung, Symbols of Transformation',
  },
  {
    envVar: 'PYR',
    lens: 'physics-elemental',
    era: '20th c',
    eraSort: 1928,
    name: 'Plasma',
    connotation: 'Fourth state of matter — ionised, luminous, electromagnetic.',
    source: 'Langmuir, 1928',
  },
  {
    envVar: 'PYR',
    lens: 'modern-wellness',
    era: '21st c',
    eraSort: 2026,
    name: 'Feel Good First',
    connotation: 'The state-shift that precedes any real change.',
    source: 'admin, Sovereign Systems Spiral',
  },

  // ════════════════════════════════════════════════════════════════
  // OCULUS — eye / witness / perception
  // ════════════════════════════════════════════════════════════════
  {
    envVar: 'OCULUS',
    lens: 'egyptian',
    era: '~2400 BCE',
    eraSort: -2400,
    name: 'Eye of Horus / Eye of Ra',
    connotation: 'Protective seeing — restored wholeness made visible.',
    source: 'Pyramid Texts',
  },
  {
    envVar: 'OCULUS',
    lens: 'sanskrit-vedic',
    era: '~800 BCE',
    eraSort: -800,
    name: 'Drsti / Ajna',
    script: 'दृष्टि / आज्ञा',
    connotation:
      'The gaze that perceives — and the third-eye chakra of insight.',
    source: 'Upanishads',
  },
  {
    envVar: 'OCULUS',
    lens: 'greek-classical',
    era: '~400 BCE',
    eraSort: -400,
    name: 'Ophthalmos / Theoria',
    script: 'ὀφθαλμός / θεωρία',
    connotation:
      'Eye and seeing-as-contemplation — perception as participation.',
    source: 'Plato, Republic VII',
  },
  {
    envVar: 'OCULUS',
    lens: 'christian-mystical',
    era: '14th c',
    eraSort: 1370,
    name: 'All-Seeing Eye / Eye of Providence',
    connotation: 'Divine omniscience — the witness that misses nothing.',
    source: 'Medieval iconography',
  },
  {
    envVar: 'OCULUS',
    lens: 'jungian',
    era: '20th c',
    eraSort: 1935,
    name: 'Witnessing Self',
    connotation:
      'Meta-cognitive ego — the self that observes its own contents.',
    source: 'Jung, Aion',
  },
  {
    envVar: 'OCULUS',
    lens: 'physics-elemental',
    era: '20th c',
    eraSort: 1927,
    name: 'Observer / Measurement',
    connotation: 'The act of observation that collapses superposition.',
    source: 'Copenhagen interpretation',
  },
  {
    envVar: 'OCULUS',
    lens: 'modern-wellness',
    era: '21st c',
    eraSort: 2026,
    name: 'Awareness',
    connotation: 'See where you are — non-judgmental noticing as ground.',
    source: 'admin, Sovereign Systems Spiral',
  },

  // ════════════════════════════════════════════════════════════════
  // DYAD — polarity / pair / opposing balance
  // ════════════════════════════════════════════════════════════════
  {
    envVar: 'DYAD',
    lens: 'egyptian',
    era: '~2500 BCE',
    eraSort: -2500,
    name: 'Geb & Nut',
    connotation: 'Earth and sky — the held tension that births a world.',
    source: 'Heliopolitan cosmogony',
  },
  {
    envVar: 'DYAD',
    lens: 'sanskrit-vedic',
    era: '~1000 BCE',
    eraSort: -1000,
    name: 'Shiva-Shakti / Dvaita',
    script: 'शिव-शक्ति',
    connotation: 'Static and dynamic — consciousness and its energy.',
    source: 'Tantric tradition',
  },
  {
    envVar: 'DYAD',
    lens: 'greek-classical',
    era: '~530 BCE',
    eraSort: -530,
    name: 'DYAS',
    script: 'δυάς',
    connotation: 'The Two — first emanation from the Monad.',
    source: 'Pythagoras',
  },
  {
    envVar: 'DYAD',
    lens: 'christian-mystical',
    era: '~1100 CE',
    eraSort: 1100,
    name: 'Bride & Bridegroom',
    connotation: 'Mystical marriage — Christ and Church / soul and God.',
    source: 'Bernard of Clairvaux on Song of Songs',
  },
  {
    envVar: 'DYAD',
    lens: 'jungian',
    era: '20th c',
    eraSort: 1934,
    name: 'Anima / Animus',
    connotation: 'Contrasexual archetype — the system other to be integrated.',
    source: 'Jung, The Archetypes and the Collective Unconscious',
  },
  {
    envVar: 'DYAD',
    lens: 'physics-elemental',
    era: '18th c',
    eraSort: 1785,
    name: 'Charge Polarity (+/-)',
    connotation: 'Coulomb opposites — the field that animates matter.',
    source: 'Coulomb, 1785',
  },
  {
    envVar: 'DYAD',
    lens: 'modern-wellness',
    era: '21st c',
    eraSort: 2026,
    name: 'Regulation',
    connotation: 'Regulate before you optimize — balance opposing pulls.',
    source: 'admin, Sovereign Systems Spiral',
  },

  // ════════════════════════════════════════════════════════════════
  // PYRAMIS — pyramid / ascending volume
  // ════════════════════════════════════════════════════════════════
  {
    envVar: 'PYRAMIS',
    lens: 'egyptian',
    era: '~2600 BCE',
    eraSort: -2600,
    name: 'Benben / Pyramid',
    connotation: 'Primordial mound — the first land, sun-ray crystallised.',
    source: 'Old Kingdom monuments',
  },
  {
    envVar: 'PYRAMIS',
    lens: 'sanskrit-vedic',
    era: '~1000 BCE',
    eraSort: -1000,
    name: 'Meru',
    script: 'मेरु',
    connotation: 'Cosmic axis — the mountain that organises the worlds.',
    source: 'Vedas, Puranas',
  },
  {
    envVar: 'PYRAMIS',
    lens: 'greek-classical',
    era: '~360 BCE',
    eraSort: -360,
    name: 'PYRAMIS',
    script: 'πυραμίς',
    connotation: 'Geometric solid — fire-form, four faces ascending to point.',
    source: 'Plato, Timaeus',
  },
  {
    envVar: 'PYRAMIS',
    lens: 'christian-mystical',
    era: '16th c',
    eraSort: 1580,
    name: 'Holy Mountain / Sion',
    connotation: 'The ascent — where heaven touches and the soul is raised.',
    source: 'Psalms, John of the Cross',
  },
  {
    envVar: 'PYRAMIS',
    lens: 'jungian',
    era: '20th c',
    eraSort: 1944,
    name: 'Ascent toward the Self',
    connotation: 'Individuation as climb — narrowing focus toward apex.',
    source: 'Jung, Psychology and Alchemy',
  },
  {
    envVar: 'PYRAMIS',
    lens: 'physics-elemental',
    era: '17th c',
    eraSort: 1611,
    name: 'Tetrahedral Sphere-Packing',
    connotation: 'Densest local arrangement — the apex of efficiency.',
    source: 'Kepler conjecture',
  },
  {
    envVar: 'PYRAMIS',
    lens: 'modern-wellness',
    era: '21st c',
    eraSort: 2026,
    name: 'Elevate',
    connotation: 'Rise above the baseline — sustained climb past survival.',
    source: 'admin, Sovereign Systems Spiral',
  },

  // ════════════════════════════════════════════════════════════════
  // HYDOR — gateway / source / solvent
  // ════════════════════════════════════════════════════════════════
  {
    envVar: 'HYDOR',
    lens: 'egyptian',
    era: '~2400 BCE',
    eraSort: -2400,
    name: 'Nun',
    connotation: 'The primordial waters from which all forms rise.',
    source: 'Heliopolitan cosmogony',
  },
  {
    envVar: 'HYDOR',
    lens: 'sanskrit-vedic',
    era: '~1500 BCE',
    eraSort: -1500,
    name: 'Apah / Amrita',
    script: 'अप / अमृत',
    connotation: 'Gateway as life and as the deathless nectar of the gods.',
    source: 'Rigveda, Atharvaveda',
  },
  {
    envVar: 'HYDOR',
    lens: 'greek-classical',
    era: '~600 BCE',
    eraSort: -600,
    name: 'HYDOR',
    script: 'ὕδωρ',
    connotation: 'First principle — gateway as the substrate of all things.',
    source: 'Thales',
  },
  {
    envVar: 'HYDOR',
    lens: 'christian-mystical',
    era: '1st c CE',
    eraSort: 30,
    name: 'Living Gateway',
    connotation: 'Baptism and the well that springs up to eternal life.',
    source: 'Gospel of John 4:14',
  },
  {
    envVar: 'HYDOR',
    lens: 'jungian',
    era: '20th c',
    eraSort: 1934,
    name: 'The Unconscious as Ocean',
    connotation: 'The collective deep — fluid, pre-personal, generative.',
    source: 'Jung, Psychology and Alchemy',
  },
  {
    envVar: 'HYDOR',
    lens: 'physics-elemental',
    era: '18th c',
    eraSort: 1781,
    name: 'H₂O / Universal Solvent',
    connotation: 'Bent polar molecule — the medium in which biology happens.',
    source: 'Cavendish/Lavoisier composition of gateway',
  },
  {
    envVar: 'HYDOR',
    lens: 'modern-wellness',
    era: '21st c',
    eraSort: 2026,
    name: 'Root Healing',
    connotation: 'Heal from the root — start with what you drink.',
    source: 'admin, Sovereign Systems Spiral',
  },

  // ════════════════════════════════════════════════════════════════
  // MANDORLA — overlap / sacred gate / vesica piscis
  // ════════════════════════════════════════════════════════════════
  {
    envVar: 'MANDORLA',
    lens: 'egyptian',
    era: '~2000 BCE',
    eraSort: -2000,
    name: 'Akhet',
    connotation: 'Horizon — the gateway between worlds where sun is born.',
    source: 'Pyramid Texts',
  },
  {
    envVar: 'MANDORLA',
    lens: 'sanskrit-vedic',
    era: '~800 BCE',
    eraSort: -800,
    name: 'Yoni-Lingam',
    connotation: 'Generative gate — the union that produces creation.',
    source: 'Tantric / Shaiva tradition',
  },
  {
    envVar: 'MANDORLA',
    lens: 'greek-classical',
    era: '~300 BCE',
    eraSort: -300,
    name: 'Vesica Piscis',
    connotation: 'Two circles intersecting — the geometric birth of the new.',
    source: 'Euclid, Elements',
  },
  {
    envVar: 'MANDORLA',
    lens: 'christian-mystical',
    era: '~500 CE',
    eraSort: 500,
    name: 'Mandorla',
    connotation: 'The almond aureole — Christ in glory, world transfigured.',
    source: 'Byzantine iconography',
  },
  {
    envVar: 'MANDORLA',
    lens: 'jungian',
    era: '20th c',
    eraSort: 1958,
    name: 'Transcendent Function',
    connotation: 'The third born from the held tension of opposites.',
    source: 'Jung, The Transcendent Function',
  },
  {
    envVar: 'MANDORLA',
    lens: 'physics-elemental',
    era: '19th c',
    eraSort: 1801,
    name: 'Wave Interference',
    connotation: 'Two waves overlap — pattern that exists only in the meeting.',
    source: 'Young, double-slit experiment',
  },
  {
    envVar: 'MANDORLA',
    lens: 'modern-wellness',
    era: '21st c',
    eraSort: 2026,
    name: 'Responsibility (with Love)',
    connotation: 'Own your choices in the overlap of agency and grace.',
    source: 'admin, Sovereign Systems Spiral',
  },

  // ════════════════════════════════════════════════════════════════
  // KENOSIS — emptying / receptive vessel
  // ════════════════════════════════════════════════════════════════
  {
    envVar: 'KENOSIS',
    lens: 'egyptian',
    era: '~2200 BCE',
    eraSort: -2200,
    name: 'Nephthys',
    connotation: 'Lunar receptive — the vessel that lets the dying enter rest.',
    source: 'Funerary texts',
  },
  {
    envVar: 'KENOSIS',
    lens: 'sanskrit-vedic',
    era: '~200 BCE',
    eraSort: -200,
    name: 'Shunyata',
    script: 'शून्यता',
    connotation: 'Emptiness as fullness — the void that holds everything.',
    source: 'Mahayana Buddhism, Nagarjuna',
  },
  {
    envVar: 'KENOSIS',
    lens: 'greek-classical',
    era: '1st c CE',
    eraSort: 60,
    name: 'KENOSIS',
    script: 'κένωσις',
    connotation: 'Self-emptying — laying down what was held to receive more.',
    source: 'Philippians 2:7',
  },
  {
    envVar: 'KENOSIS',
    lens: 'christian-mystical',
    era: '~600 CE',
    eraSort: 600,
    name: 'Via Negativa',
    connotation: 'Apophatic emptying — God known by what is removed.',
    source: 'Pseudo-Dionysius',
  },
  {
    envVar: 'KENOSIS',
    lens: 'jungian',
    era: '20th c',
    eraSort: 1951,
    name: 'Shadow Integration',
    connotation: 'Releasing the false self so the true self can come forward.',
    source: 'Jung, Aion',
  },
  {
    envVar: 'KENOSIS',
    lens: 'physics-elemental',
    era: '20th c',
    eraSort: 1948,
    name: 'Vacuum State',
    connotation:
      'Quantum ground state — emptiness teeming with virtual fields.',
    source: 'Casimir effect',
  },
  {
    envVar: 'KENOSIS',
    lens: 'modern-wellness',
    era: '21st c',
    eraSort: 2026,
    name: 'Unbecoming',
    connotation: 'Release what was never yours — make room for what is.',
    source: 'admin, Sovereign Systems Spiral',
  },

  // ════════════════════════════════════════════════════════════════
  // SHATKONA — six-pointed union (hexagram)
  // ════════════════════════════════════════════════════════════════
  {
    envVar: 'SHATKONA',
    lens: 'egyptian',
    era: '~1500 BCE',
    eraSort: -1500,
    name: 'Star of Morning',
    connotation: 'The dawning union — heaven and earth in one figure.',
    source: 'Egyptian astronomical ceilings',
  },
  {
    envVar: 'SHATKONA',
    lens: 'sanskrit-vedic',
    era: '~600 BCE',
    eraSort: -600,
    name: 'Shatkona',
    script: 'षट्कोण',
    connotation: 'Six-pointed Shiva-Shakti union — anahata heart geometry.',
    source: 'Tantric yantras',
  },
  {
    envVar: 'SHATKONA',
    lens: 'greek-classical',
    era: '~300 BCE',
    eraSort: -300,
    name: 'Hexagram',
    connotation: 'Two interpenetrating triangles — earth and fire conjoined.',
    source: 'Greek geometry',
  },
  {
    envVar: 'SHATKONA',
    lens: 'christian-mystical',
    era: '~1000 CE',
    eraSort: 1000,
    name: "Star of David / Solomon's Seal",
    connotation: 'Heaven descending and earth rising — covenant geometry.',
    source: 'Medieval Jewish-Christian tradition',
  },
  {
    envVar: 'SHATKONA',
    lens: 'jungian',
    era: '20th c',
    eraSort: 1944,
    name: 'Coincidentia Oppositorum',
    connotation: 'Alchemical conjunction — the wedding of contraries.',
    source: 'Jung, Psychology and Alchemy',
  },
  {
    envVar: 'SHATKONA',
    lens: 'physics-elemental',
    era: '17th c',
    eraSort: 1611,
    name: 'Hexagonal Close-Pack',
    connotation: 'Densest 2D lattice — six neighbours, perfect cohesion.',
    source: 'Kepler, Strena Seu De Nive Sexangula',
  },
  {
    envVar: 'SHATKONA',
    lens: 'modern-wellness',
    era: '21st c',
    eraSort: 2026,
    name: 'Alignment',
    connotation: 'Come into coherence — interpenetrating axes locked.',
    source: 'admin, Sovereign Systems Spiral',
  },

  // ════════════════════════════════════════════════════════════════
  // PADMA — lotus / unfolding bloom
  // ════════════════════════════════════════════════════════════════
  {
    envVar: 'PADMA',
    lens: 'egyptian',
    era: '~3000 BCE',
    eraSort: -3000,
    name: 'Blue Lotus / Nymphaea',
    connotation: 'Daily resurrection — opens at dawn, closes at dusk.',
    source: 'Egyptian funerary art',
  },
  {
    envVar: 'PADMA',
    lens: 'sanskrit-vedic',
    era: '~1500 BCE',
    eraSort: -1500,
    name: 'Padma',
    script: 'पद्म',
    connotation:
      'Sacred bloom rising clean from muddy gateway — sahasrara crown.',
    source: 'Vedas, tantric yoga',
  },
  {
    envVar: 'PADMA',
    lens: 'greek-classical',
    era: '~700 BCE',
    eraSort: -700,
    name: 'Lotos',
    script: 'λωτός',
    connotation: "The fruit that dissolves return-home — Homer's lotus-eaters.",
    source: 'Homer, Odyssey IX',
  },
  {
    envVar: 'PADMA',
    lens: 'christian-mystical',
    era: '14th c',
    eraSort: 1320,
    name: 'Mystical Rose',
    connotation:
      "Dante's celestial rose — saints arranged as petals around God.",
    source: 'Dante, Paradiso XXX',
  },
  {
    envVar: 'PADMA',
    lens: 'jungian',
    era: '20th c',
    eraSort: 1955,
    name: 'Self as Mandala',
    connotation: 'Petalled wholeness — the centred unfolding of the Self.',
    source: 'Jung, Mysterium Coniunctionis',
  },
  {
    envVar: 'PADMA',
    lens: 'physics-elemental',
    era: '20th c',
    eraSort: 1937,
    name: 'Phase Bloom',
    connotation: 'Order parameter unfolding — symmetry breaking into form.',
    source: 'Landau theory of phase transitions',
  },
  {
    envVar: 'PADMA',
    lens: 'modern-wellness',
    era: '21st c',
    eraSort: 2026,
    name: 'The Becoming',
    connotation: 'Step into who you are — petals open from the inside out.',
    source: 'admin, Sovereign Systems Spiral',
  },

  // ════════════════════════════════════════════════════════════════
  // BODHI — awakened seeing (eye-in-triangle)
  // ════════════════════════════════════════════════════════════════
  {
    envVar: 'BODHI',
    lens: 'egyptian',
    era: '~2400 BCE',
    eraSort: -2400,
    name: 'Eye of Horus within the Triangle',
    connotation: 'Awakened sight crowned by ascending form.',
    source: 'Composite hieroglyphic motif',
  },
  {
    envVar: 'BODHI',
    lens: 'sanskrit-vedic',
    era: '~500 BCE',
    eraSort: -500,
    name: 'Bodhi',
    script: 'बोधि',
    connotation: 'Awakening — the moment recognition turns into knowing.',
    source: 'Buddhist Pali Canon',
  },
  {
    envVar: 'BODHI',
    lens: 'greek-classical',
    era: '~400 BCE',
    eraSort: -400,
    name: 'Gnosis / Nous',
    script: 'γνῶσις / νοῦς',
    connotation: 'Direct knowing — intellect that sees rather than reasons.',
    source: 'Plato, Aristotle',
  },
  {
    envVar: 'BODHI',
    lens: 'christian-mystical',
    era: '~1200 CE',
    eraSort: 1200,
    name: 'Beatific Vision',
    connotation: 'Direct sight of the divine — sight as union.',
    source: 'Aquinas, Summa Theologica',
  },
  {
    envVar: 'BODHI',
    lens: 'jungian',
    era: '20th c',
    eraSort: 1951,
    name: 'Realization of the Self',
    connotation: 'Ego–Self axis activated — knowing-from-the-centre.',
    source: 'Jung, Aion',
  },
  {
    envVar: 'BODHI',
    lens: 'physics-elemental',
    era: '20th c',
    eraSort: 1927,
    name: 'Coherent State',
    connotation: 'Wavefunction in phase — observation that crystallises.',
    source: 'Quantum mechanics',
  },
  {
    envVar: 'BODHI',
    lens: 'modern-wellness',
    era: '21st c',
    eraSort: 2026,
    name: 'Awakening',
    connotation: 'See clearly for the first time — recognition lands as fact.',
    source: 'admin, Sovereign Systems Spiral',
  },

  // ════════════════════════════════════════════════════════════════
  // TETRAD — fourfold cardinal order (solar cross)
  // ════════════════════════════════════════════════════════════════
  {
    envVar: 'TETRAD',
    lens: 'egyptian',
    era: '~2300 BCE',
    eraSort: -2300,
    name: 'Four Sons of Horus',
    connotation: 'Cardinal guardians — north/south/east/west kept whole.',
    source: 'Egyptian funerary tradition',
  },
  {
    envVar: 'TETRAD',
    lens: 'sanskrit-vedic',
    era: '~1200 BCE',
    eraSort: -1200,
    name: 'Chatura / Chatur-vyuha',
    script: 'चतुर्व्यूह',
    connotation: 'The four directions, four life stages, four divine forms.',
    source: 'Vedas, Pancharatra',
  },
  {
    envVar: 'TETRAD',
    lens: 'greek-classical',
    era: '~530 BCE',
    eraSort: -530,
    name: 'Tetraktys',
    script: 'τετρακτύς',
    connotation: 'The fourfold cosmos — 1+2+3+4 = 10, the perfect figure.',
    source: 'Pythagoras',
  },
  {
    envVar: 'TETRAD',
    lens: 'christian-mystical',
    era: '~200 CE',
    eraSort: 200,
    name: 'Four Evangelists / Four Living Creatures',
    connotation: 'Lion, ox, eagle, man — the cardinal witnesses of revelation.',
    source: 'Ezekiel 1, Revelation 4, Irenaeus',
  },
  {
    envVar: 'TETRAD',
    lens: 'jungian',
    era: '20th c',
    eraSort: 1921,
    name: 'Four Functions',
    connotation:
      'Thinking, feeling, sensation, intuition — the psyche squared.',
    source: 'Jung, Psychological Types',
  },
  {
    envVar: 'TETRAD',
    lens: 'physics-elemental',
    era: '17th c',
    eraSort: 1644,
    name: 'Cardinal-Direction Symmetry',
    connotation: 'Fourfold rotational invariance — the simplest stable cross.',
    source: 'Descartes, Principia Philosophiae',
  },
  {
    envVar: 'TETRAD',
    lens: 'modern-wellness',
    era: '21st c',
    eraSort: 2026,
    name: 'Integrate',
    connotation: 'Bring it all together — four pillars locked at the centre.',
    source: 'admin, Sovereign Systems Spiral',
  },

  // ════════════════════════════════════════════════════════════════
  // OKTAEDRON — eightfold crystalline form
  // ════════════════════════════════════════════════════════════════
  {
    envVar: 'OKTAEDRON',
    lens: 'egyptian',
    era: '~2300 BCE',
    eraSort: -2300,
    name: 'Hermopolitan Ogdoad',
    connotation: 'Eight primordial deities — the fullness before the One.',
    source: 'Hermopolis cosmogony',
  },
  {
    envVar: 'OKTAEDRON',
    lens: 'sanskrit-vedic',
    era: '~500 BCE',
    eraSort: -500,
    name: 'Ashtakona / Ashtanga',
    script: 'अष्टकोण / अष्टाङ्ग',
    connotation: 'Eightfold figure — the eightfold path made geometric.',
    source: 'Buddhist tradition, tantric yantras',
  },
  {
    envVar: 'OKTAEDRON',
    lens: 'greek-classical',
    era: '~360 BCE',
    eraSort: -360,
    name: 'OKTAEDRON',
    script: 'ὀκτάεδρον',
    connotation:
      "Plato's element of air — eight faces, perfect double-pyramid.",
    source: 'Plato, Timaeus',
  },
  {
    envVar: 'OKTAEDRON',
    lens: 'christian-mystical',
    era: '~400 CE',
    eraSort: 400,
    name: 'Baptismal Octagon',
    connotation: 'Eighth day — resurrection beyond the seven of creation.',
    source: 'Early Christian baptisteries',
  },
  {
    envVar: 'OKTAEDRON',
    lens: 'jungian',
    era: '20th c',
    eraSort: 1955,
    name: 'Crystallised Self',
    connotation: 'Wholeness given lattice form — durable system geometry.',
    source: 'Jung, Mysterium Coniunctionis',
  },
  {
    envVar: 'OKTAEDRON',
    lens: 'physics-elemental',
    era: '19th c',
    eraSort: 1850,
    name: 'Octahedral Coordination / FCC Lattice',
    connotation: 'Six bonds in three axes — the closest-packed crystal.',
    source: 'Crystallography, Bravais',
  },
  {
    envVar: 'OKTAEDRON',
    lens: 'modern-wellness',
    era: '21st c',
    eraSort: 2026,
    name: 'Authenticate',
    connotation: 'Prove it to yourself — durable form under your own pressure.',
    source: 'admin, Sovereign Systems Spiral',
  },

  // ════════════════════════════════════════════════════════════════
  // ANKH — eternal life / continuance
  // ════════════════════════════════════════════════════════════════
  {
    envVar: 'ANKH',
    lens: 'egyptian',
    era: '~3000 BCE',
    eraSort: -3000,
    name: 'Ankh',
    connotation: 'Life, breath, continuity — held in the hand of the gods.',
    source: 'Old Kingdom hieroglyphic',
  },
  {
    envVar: 'ANKH',
    lens: 'sanskrit-vedic',
    era: '~1500 BCE',
    eraSort: -1500,
    name: 'Amrta',
    script: 'अमृत',
    connotation: 'Deathless nectar — what continues past the body.',
    source: 'Vedas, churning of the ocean',
  },
  {
    envVar: 'ANKH',
    lens: 'greek-classical',
    era: '~300 BCE',
    eraSort: -300,
    name: 'Crux Ansata',
    connotation:
      'Handled cross — the symbol travels into the Hellenistic world.',
    source: 'Coptic transmission',
  },
  {
    envVar: 'ANKH',
    lens: 'christian-mystical',
    era: '~400 CE',
    eraSort: 400,
    name: 'Coptic Cross / Tree of Life',
    connotation:
      'Eternal life made cross-shaped — the continued through death.',
    source: 'Coptic Christianity',
  },
  {
    envVar: 'ANKH',
    lens: 'jungian',
    era: '20th c',
    eraSort: 1953,
    name: 'Archetype of the Eternal Self',
    connotation: 'The imperishable centre — what does not die with persona.',
    source: 'Jung, Answer to Job',
  },
  {
    envVar: 'ANKH',
    lens: 'physics-elemental',
    era: '19th c',
    eraSort: 1847,
    name: 'Conservation Law',
    connotation: 'Energy conserved — what changes form but never ends.',
    source: 'Helmholtz, conservation of energy',
  },
  {
    envVar: 'ANKH',
    lens: 'modern-wellness',
    era: '21st c',
    eraSort: 2026,
    name: 'Unlock',
    connotation: 'Freedom is the final layer — the continuance underneath.',
    source: 'admin, Sovereign Systems Spiral',
  },
];

/**
 * All bindings for one substrate, sorted chronologically (oldest first).
 * This is the lineage view — how this essence has been named across
 * traditions and centuries.
 */
export function chainsFor(envVar: EnvVar): SurfaceBinding[] {
  return NAMING_CHAINS.filter((b) => b.envVar === envVar).sort(
    (a, b) => (a.eraSort ?? 0) - (b.eraSort ?? 0),
  );
}

/**
 * All 13 substrates as named within one tradition. Returns one binding
 * per envVar (the first match in NAMING_CHAINS for that lens). This is
 * the "re-skin the spiral through Vedic eyes / Egyptian eyes / etc." view.
 */
export function viewThroughLens(lens: Lens): SurfaceBinding[] {
  const seen = new Set<EnvVar>();
  const out: SurfaceBinding[] = [];
  for (const binding of NAMING_CHAINS) {
    if (binding.lens === lens && !seen.has(binding.envVar)) {
      seen.add(binding.envVar);
      out.push(binding);
    }
  }
  return out;
}

/**
 * All distinct lenses present in NAMING_CHAINS, in canonical display order.
 */
export const LENSES_IN_DISPLAY_ORDER: Lens[] = [
  'egyptian',
  'sanskrit-vedic',
  'greek-classical',
  'christian-mystical',
  'jungian',
  'physics-elemental',
  'modern-wellness',
];
