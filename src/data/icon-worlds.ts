/**
 * IconWorld — per-node themed environment.
 *
 * Each spiral node is its own complete world ("Halloween Town,
 * Tomorrowland, Christmas Tree Shop"): elements, phase mix, biology,
 * gravity vector, and a particle behavior pattern that flavors HOW
 * its physics regime expresses (cohesion for symbols / chaos for stars).
 *
 * Owned in this file so both the Three.js renderer (`spiral.ts`) and
 * the static node content pages (`/nodes/[id].astro`) can read the
 * same world definition. Theme propagation across surfaces is the
 * point — the world a particle inhabits is the world the content
 * inhabits.
 */

export type Element =
  | 'photon'
  | 'plasma'
  | 'fire'
  | 'lava'
  | 'smoke'
  | 'gateway'
  | 'ice'
  | 'vapor'
  | 'salt'
  | 'mist'
  | 'dew'
  | 'pollen'
  | 'petals'
  | 'dust'
  | 'regolith'
  | 'moonbeam'
  | 'quartz'
  | 'prism'
  | 'mineral'
  | 'gold'
  | 'shadow'
  | 'light'
  | 'ion'
  | 'air'
  | 'earth';

export type Biology =
  | 'organic'
  | 'mineral'
  | 'synthetic'
  | 'cosmic'
  | 'aquatic'
  | 'volcanic'
  | 'lunar';

export type ParticleBehavior =
  | 'floaty' // zero-g drift
  | 'crystalline' // 4-fold cardinal anchors
  | 'rising' // upward respawn loop
  | 'spiraling' // helical motion
  | 'lattice' // snap to grid points
  | 'tidal' // sin-wave bias
  | 'radial-emission' // radiate outward from center
  | 'dual-gyre'; // two counter-rotating populations

export interface IconWorld {
  id: number;
  themeName: string; // poetic — "Forge of Dawn", "Crystal Vault"
  elements: Element[];
  phaseMix: { gas: number; liquid: number; solid: number; plasma: number };
  biology: Biology;
  gravity: { x: number; y: number; z: number }; // local-frame vector
  particleBehavior: ParticleBehavior;
  accentPalette: number[]; // theme-specific accent (hex ints) layered over chakra base
  thermalAmpMul: number; // ×PHASE_THERMAL — Halloween hot, Christmas calm
  sizeBias: 'micro' | 'mixed' | 'macro';
}

export const ICON_WORLDS: Record<number, IconWorld> = {
  1: {
    id: 1,
    themeName: 'Forge of Dawn',
    elements: ['photon', 'plasma', 'fire'],
    phaseMix: { gas: 0.0, liquid: 0.0, solid: 0.05, plasma: 0.95 },
    biology: 'cosmic',
    gravity: { x: 0, y: 0, z: 0 }, // zero-g — pure radiance
    particleBehavior: 'radial-emission',
    accentPalette: [0xfff7d6, 0xffaa3c, 0xfff0aa, 0xff5e1a], // gold + white-hot
    thermalAmpMul: 1.6,
    sizeBias: 'micro',
  },
  2: {
    id: 2,
    themeName: 'Lunar Observatorium',
    elements: ['mist', 'light', 'gateway'],
    phaseMix: { gas: 0.3, liquid: 0.55, solid: 0.15, plasma: 0.0 },
    biology: 'aquatic',
    gravity: { x: 0, y: 0, z: 0 }, // zero-g — observation
    particleBehavior: 'floaty',
    accentPalette: [0xc9d4f5, 0x6c4cd6, 0xa0c8ff, 0x88a4c4],
    thermalAmpMul: 0.55,
    sizeBias: 'mixed',
  },
  3: {
    id: 3,
    themeName: 'Polarity Hall',
    elements: ['shadow', 'light', 'ion'],
    phaseMix: { gas: 0.35, liquid: 0.15, solid: 0.45, plasma: 0.05 },
    biology: 'synthetic',
    gravity: { x: 0, y: -0.04, z: 0 }, // very mild
    particleBehavior: 'dual-gyre',
    accentPalette: [0xffffff, 0x101018, 0xc97ce8, 0x9966cc],
    thermalAmpMul: 1.4,
    sizeBias: 'mixed',
  },
  4: {
    id: 4,
    themeName: 'Volcanic Pyre',
    elements: ['fire', 'lava', 'smoke'],
    phaseMix: { gas: 0.5, liquid: 0.15, solid: 0.3, plasma: 0.05 },
    biology: 'volcanic',
    gravity: { x: 0, y: 0.18, z: 0 }, // POSITIVE = rising (heat lift)
    particleBehavior: 'rising',
    accentPalette: [0xff3b3b, 0xff8a3c, 0x111111, 0xffaa44],
    thermalAmpMul: 1.5,
    sizeBias: 'mixed',
  },
  5: {
    id: 5,
    themeName: 'Aquarium',
    elements: ['gateway', 'ice', 'vapor', 'salt'],
    phaseMix: { gas: 0.25, liquid: 0.65, solid: 0.1, plasma: 0.0 },
    biology: 'aquatic',
    gravity: { x: 0, y: -0.1, z: 0 }, // mild downward (gateway settles)
    particleBehavior: 'tidal',
    accentPalette: [0x3da9f5, 0x4ed1c5, 0xa0e6f0, 0x5ab8d6],
    thermalAmpMul: 0.85,
    sizeBias: 'mixed',
  },
  6: {
    id: 6,
    themeName: 'Mandorla Garden',
    elements: ['pollen', 'dew', 'petals'],
    phaseMix: { gas: 0.3, liquid: 0.4, solid: 0.3, plasma: 0.0 },
    biology: 'organic',
    gravity: { x: 0, y: 0, z: 0 }, // zero-g — pollination drift
    particleBehavior: 'spiraling',
    accentPalette: [0xff9aaa, 0x88c878, 0xffd23b, 0xc97ce8],
    thermalAmpMul: 0.95,
    sizeBias: 'mixed',
  },
  7: {
    id: 7,
    themeName: 'Lunar Night',
    elements: ['dust', 'regolith', 'moonbeam'],
    phaseMix: { gas: 0.3, liquid: 0.15, solid: 0.55, plasma: 0.0 },
    biology: 'lunar',
    gravity: { x: 0, y: -0.05, z: 0 }, // 1/6 gravity
    particleBehavior: 'tidal',
    accentPalette: [0xc9d4f5, 0x9ba9d6, 0xa0c8ff, 0x6688aa],
    thermalAmpMul: 0.4,
    sizeBias: 'micro',
  },
  8: {
    id: 8,
    themeName: 'Crystal Cave',
    elements: ['quartz', 'prism', 'mineral'],
    phaseMix: { gas: 0.05, liquid: 0.1, solid: 0.85, plasma: 0.0 },
    biology: 'mineral',
    gravity: { x: 0, y: 0, z: 0 }, // lattice-locked
    particleBehavior: 'lattice',
    accentPalette: [0x6c4cd6, 0x4ed158, 0xffd23b, 0x3da9f5],
    thermalAmpMul: 0.5,
    sizeBias: 'micro',
  },
  9: {
    id: 9,
    themeName: 'Spring Bloom',
    elements: ['petals', 'dew', 'pollen'],
    phaseMix: { gas: 0.25, liquid: 0.4, solid: 0.35, plasma: 0.0 },
    biology: 'organic',
    gravity: { x: 0, y: 0.05, z: 0 }, // mild upward (bloom)
    particleBehavior: 'radial-emission',
    accentPalette: [0xff9aaa, 0x88c878, 0xfff0d6, 0xc97ce8],
    thermalAmpMul: 1.0,
    sizeBias: 'mixed',
  },
  10: {
    id: 10,
    themeName: 'Radiant Clarity',
    elements: ['photon', 'plasma', 'gold'],
    phaseMix: { gas: 0.7, liquid: 0.0, solid: 0.1, plasma: 0.2 },
    biology: 'cosmic',
    gravity: { x: 0, y: 0, z: 0 },
    particleBehavior: 'radial-emission',
    accentPalette: [0xffffff, 0xfff0aa, 0xffd23b, 0xc9a96e],
    thermalAmpMul: 1.2,
    sizeBias: 'micro',
  },
  11: {
    id: 11,
    themeName: 'Cardinal Forge',
    elements: ['fire', 'gateway', 'earth', 'air'],
    phaseMix: { gas: 0.25, liquid: 0.25, solid: 0.25, plasma: 0.25 },
    biology: 'synthetic',
    gravity: { x: 0, y: 0, z: 0 }, // 4-axis balanced
    particleBehavior: 'crystalline',
    accentPalette: [0xff3b3b, 0xffd23b, 0x4ed158, 0x6c4cd6],
    thermalAmpMul: 0.95,
    sizeBias: 'mixed',
  },
  12: {
    id: 12,
    themeName: 'Crystal Vault',
    elements: ['mineral', 'prism', 'photon'],
    phaseMix: { gas: 0.05, liquid: 0.05, solid: 0.85, plasma: 0.05 },
    biology: 'mineral',
    gravity: { x: 0, y: 0, z: 0 }, // anchored
    particleBehavior: 'lattice',
    accentPalette: [0x9be3ff, 0xc9a96e, 0xe4f0ff, 0xa0c8d6],
    thermalAmpMul: 0.45,
    sizeBias: 'macro',
  },
  13: {
    id: 13,
    themeName: 'Eternal Gold',
    elements: ['plasma', 'gold', 'photon'],
    phaseMix: { gas: 0.6, liquid: 0.0, solid: 0.1, plasma: 0.3 },
    biology: 'cosmic',
    gravity: { x: 0, y: 0.1, z: 0 }, // upward (ascending)
    particleBehavior: 'spiraling',
    accentPalette: [0xffd23b, 0xffaa66, 0xc9a96e, 0xc97ce8],
    thermalAmpMul: 1.1,
    sizeBias: 'mixed',
  },
};

/**
 * Get the IconWorld for a given node id, with sensible default for
 * out-of-range ids (returns world #1).
 */
export function worldFor(nodeId: number): IconWorld {
  return ICON_WORLDS[nodeId] || ICON_WORLDS[1];
}

/**
 * Canonical node count — the full ordered spiral (ids 1..N). Derived from
 * `ICON_WORLDS` so it cannot drift from the world definitions. Consumers
 * that must key per-node attributes by stable identity (e.g. the chakra
 * spectrum in `spiral.ts`) use `node.id` against this count rather than a
 * loop index, so a filtered or reordered node list never shifts identities.
 */
export const CANONICAL_NODE_COUNT = Object.keys(ICON_WORLDS).length;

/**
 * Convert an accent-palette hex int to a CSS hex string (#RRGGBB).
 * Useful for content surfaces that style with CSS variables.
 */
export function hexToCss(int: number): string {
  return '#' + int.toString(16).padStart(6, '0');
}

/**
 * WorldMotionTokens — the IconWorld projected into CSS space.
 *
 * The same world definition that drives a node's Three.js particle physics
 * also parameterizes the subtle ambient motion of its static surfaces
 * ("the world a particle inhabits is the world the content inhabits"):
 *
 *  - behaviorClass  one of 8 `mw-*` motion signatures (matches ParticleBehavior)
 *  - --mw-dur       animation period — calmer worlds (low thermalAmpMul) move
 *                   slower; hot worlds quicker. 14s baseline, clamped 7–26s.
 *  - --mw-dx/-dy    drift vector from the world's gravity (CSS y inverted:
 *                   rising worlds drift up, settling worlds sink)
 *  - --mw-a1..a3    accent palette as CSS colors
 *
 * Consumed by `WorldMotif.astro`. Deterministic: same nodeId → same tokens.
 */
export interface WorldMotionTokens {
  behaviorClass: string;
  style: string;
}

export function motionTokensFor(nodeId: number): WorldMotionTokens {
  const w = worldFor(nodeId);
  const dur = Math.min(26, Math.max(7, 14 / w.thermalAmpMul));
  const dx = w.gravity.x * 60;
  const dy = -w.gravity.y * 60; // CSS y grows downward; +y gravity = heat-lift
  const a = w.accentPalette;
  return {
    behaviorClass: `mw-${w.particleBehavior}`,
    style: [
      `--mw-dur: ${dur.toFixed(1)}s`,
      `--mw-dx: ${dx.toFixed(1)}px`,
      `--mw-dy: ${dy.toFixed(1)}px`,
      `--mw-a1: ${hexToCss(a[0])}`,
      `--mw-a2: ${hexToCss(a[1] ?? a[0])}`,
      `--mw-a3: ${hexToCss(a[2] ?? a[0])}`,
    ].join('; '),
  };
}
