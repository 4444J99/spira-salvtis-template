/**
 * Sacred Geometry Primitives — mathematical foundation for generative node forms.
 *
 * "We need to break the ideals into their primitives and figure out the mathemogic of it."
 * — admin feedback 2026-04-26
 *
 * "I want to be bound by math... we fraction and factor"
 * — 13 nodes means 13 opportunities, prime-constrained
 */

import type { EnvVar } from './hub.config';

export const PHI = (1 + Math.sqrt(5)) / 2; // φ = 1.618033988749895
export const INV_PHI = 1 / PHI; // 1/φ = 0.618033988749895
export const SQRT2 = Math.sqrt(2);
export const SQRT3 = Math.sqrt(3);
export const PHI_SQUARED = PHI * PHI;

/** Symmetry types — the governing law that constrains each form */
export type SymmetryType =
  | 'radial' // rotational symmetry around center (sunburst, lotus)
  | 'bilateral' // mirror symmetry (yin-yang, ankh)
  | 'crystalline' // polyhedral / geometric crystal (octahedron, hexagram)
  | 'fractal'; // recursive self-similar (unfolding blooms)

export interface MathPrimitive {
  /** Fundamental vertex count base — the prime constraint */
  vertexCount: number;
  /** Symmetry governing this ideal form */
  symmetry: SymmetryType;
  /** Golden ratio scaling exponent */
  phiExponent: number;
  /** Inner radius ratio (between 0 and 1) */
  innerRatio: number;
  /** Rotation per segment in radians */
  rotationPerSegment: number;
  /** Twist factor for organic feel (0 = rigid, 1 = organic) */
  twistFactor: number;
  /** Whether this form has a central void/loop */
  hasCentralVoid: boolean;
  /** Depth to radius ratio for extrusion */
  depthRatio: number;
}

/** All 13 ideal forms — the Platonic essence of each node.
 * Not "what should it look like" but "what mathematical law generates it" */
export const PRIMITIVES: Record<EnvVar, MathPrimitive> = {
  // 1 — PYR (Sun) — radial, 1-point, the source
  PYR: {
    vertexCount: 12, // 12 rays from center (zodiacal)
    symmetry: 'radial',
    phiExponent: 0,
    innerRatio: 0.35,
    rotationPerSegment: 0,
    twistFactor: 0.15,
    hasCentralVoid: false,
    depthRatio: 0.3,
  },

  // 2 — OCULUS (Eye) — bilateral/circular, the observer
  OCULUS: {
    vertexCount: 16,
    symmetry: 'radial',
    phiExponent: 1,
    innerRatio: 0.55,
    rotationPerSegment: 0,
    twistFactor: 0.08,
    hasCentralVoid: true, // the pupil
    depthRatio: 0.25,
  },

  // 3 — DYAD (Yin-Yang) — bilateral, the duality
  DYAD: {
    vertexCount: 2, // two interlaced halves
    symmetry: 'bilateral',
    phiExponent: -1,
    innerRatio: 0.5,
    rotationPerSegment: Math.PI,
    twistFactor: 0,
    hasCentralVoid: false,
    depthRatio: 0.4,
  },

  // 4 — PYRAMIS (Upward Triangle) — crystalline, the fire element
  PYRAMIS: {
    vertexCount: 3, // triangle vertex count
    symmetry: 'crystalline',
    phiExponent: 0,
    innerRatio: 0.4,
    rotationPerSegment: (Math.PI * 2) / 3,
    twistFactor: 0.05,
    hasCentralVoid: false,
    depthRatio: 0.5,
  },

  // 5 — HYDOR (Water/Teardrop) — radial, fluid, the flow
  HYDOR: {
    vertexCount: 8,
    symmetry: 'radial',
    phiExponent: 2,
    innerRatio: 0.15,
    rotationPerSegment: 0,
    twistFactor: 0.35,
    hasCentralVoid: false,
    depthRatio: 0.55,
  },

  // 6 — MANDORLA (Vesica Piscis) — fractal/intersecting, the bloom
  MANDORLA: {
    vertexCount: 16, // increased from 12 for complex bloom
    symmetry: 'fractal',
    phiExponent: 1,
    innerRatio: 0.42,
    rotationPerSegment: 0,
    twistFactor: 0.65, // increased from 0.45
    hasCentralVoid: true,
    depthRatio: 0.35,
  },

  // 7 — KENOSIS (Crescent) — bilateral, the receptive
  KENOSIS: {
    vertexCount: 6,
    symmetry: 'bilateral',
    phiExponent: 0,
    innerRatio: 0.65,
    rotationPerSegment: Math.PI / 3,
    twistFactor: 0.12,
    hasCentralVoid: true,
    depthRatio: 0.28,
  },

  // 8 — SHATKONA (Hexagram) — crystalline, 6-point unity
  SHATKONA: {
    vertexCount: 6,
    symmetry: 'crystalline',
    phiExponent: 1,
    innerRatio: 0.5,
    rotationPerSegment: (Math.PI * 2) / 6,
    twistFactor: 0.02,
    hasCentralVoid: true,
    depthRatio: 0.32,
  },

  // 9 — PADMA (Lotus) — fractal, blooming
  PADMA: {
    vertexCount: 12,
    symmetry: 'fractal',
    phiExponent: 2,
    innerRatio: 0.25,
    rotationPerSegment: 0,
    twistFactor: 0.55,
    hasCentralVoid: false,
    depthRatio: 0.4,
  },

  // 10 — BODHI (Eye in Triangle) — crystalline, the seeing
  BODHI: {
    vertexCount: 3 + 1, // triangle + center point
    symmetry: 'crystalline',
    phiExponent: 0,
    innerRatio: 0.3,
    rotationPerSegment: (Math.PI * 2) / 3,
    twistFactor: 0,
    hasCentralVoid: true,
    depthRatio: 0.45,
  },

  // 11 — TETRAD (Solar Cross) — bilateral, cardinal directions
  TETRAD: {
    vertexCount: 8, // increased from 4 for more intricate wheel
    symmetry: 'bilateral',
    phiExponent: 1,
    innerRatio: 0.45,
    rotationPerSegment: Math.PI / 4,
    twistFactor: 0.08,
    hasCentralVoid: true, // changed from false for stoic wheel structure
    depthRatio: 0.5,
  },

  // 12 — OKTAEDRON (Octahedron) — crystalline, 8-face
  OKTAEDRON: {
    vertexCount: 8,
    symmetry: 'crystalline',
    phiExponent: 0,
    innerRatio: 0.42,
    rotationPerSegment: 0,
    twistFactor: 0,
    hasCentralVoid: false,
    depthRatio: 0.65,
  },

  // 13 — ANKH (Key of Life) — bilateral, eternal
  ANKH: {
    vertexCount: 4, // loop + cross
    symmetry: 'bilateral',
    phiExponent: -1,
    innerRatio: 0.5,
    rotationPerSegment: 0,
    twistFactor: 0.08,
    hasCentralVoid: true,
    depthRatio: 0.38,
  },
};

/** Prime factorization — the constraint law.
 * 13 nodes, prime, so only 1×13 and 13×1 are valid factorings.
 * This bounds the space → "we fraction and factor" */
export function primeFactors(n: number): number[] {
  const factors: number[] = [];
  let d = 2;
  while (d * d <= n) {
    while (n % d === 0) {
      factors.push(d);
      n /= d;
    }
    d++;
  }
  if (n > 1) factors.push(n);
  return factors;
}

/** φ^k scaling — golden ratio proportions */
export function phiScale(k: number): number {
  return Math.pow(PHI, k);
}

/** φ-based radius scaling for natural proportions */
export function phiRadius(base: number, k: number): number {
  return base * phiScale(k);
}

/** Harmonic resonance — valid frequency ratios for 13 nodes */
export function harmonicResonance(
  fundamental: number,
  nodes: number,
): number[] {
  // Only ratios that are integer multiples of 13's factors produce resonance
  const ratios: number[] = [];
  for (let i = 1; i <= nodes; i++) {
    if (fundamental % i === 0 || i % fundamental === 0) {
      ratios.push(i / fundamental);
    }
  }
  return ratios;
}

/** Get primitive for an envVar */
export function primitiveFor(envVar: EnvVar): MathPrimitive {
  return PRIMITIVES[envVar] || PRIMITIVES.PYR;
}

/** All 13 envVars in order */
export const ALL_ENV_VARS: EnvVar[] = [
  'PYR',
  'OCULUS',
  'DYAD',
  'PYRAMIS',
  'HYDOR',
  'MANDORLA',
  'KENOSIS',
  'SHATKONA',
  'PADMA',
  'BODHI',
  'TETRAD',
  'OKTAEDRON',
  'ANKH',
];
