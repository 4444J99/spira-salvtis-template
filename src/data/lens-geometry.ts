/**
 * Lens-to-Geometry Parameters — how each lens transforms the ideal form.
 *
 * "We must look at the ideal form through all its lenses...
 * linguistics, social, political — every lens — and deduce what
 * governing laws confine or permit its existence, and that's how
 * each node will be different from one another."
 */

import type { EnvVar } from './hub.config';
import {
  type MathPrimitive,
  PHI,
  PRIMITIVES,
} from './sacred-geometry-primitives';

export type Lens =
  | 'egyptian'
  | 'sanskrit-vedic'
  | 'greek-classical'
  | 'christian-mystical'
  | 'jungian'
  | 'physics-elemental'
  | 'modern-wellness';

export interface LensModulation {
  /** Extra vertices from this lens (adds complexity) */
  vertexAddend: number;
  /** Modified symmetry — lens can transform the law */
  symmetryOverride?: 'radial' | 'bilateral' | 'crystalline' | 'fractal';
  /** Scale modifier from this lens's perspective */
  scaleMul: number;
  /** Inner radius shift (negative = darker/core, positive = brighter) */
  innerShift: number;
  /** Rotation offset from lens perspective */
  rotationOffset: number;
  /** Twist increase from lens interpretation */
  twistAdd: number;
  /** Depth multiplier through this lens */
  depthMul: number;
  /** Whether this lens introduces self-similarity */
  fractalDepth: number;
}

/** How each of the 7 lenses transforms a primitive.
 * Each lens adds its cultural/mathematical interpretation */
export const LENS_MODULATION: Record<Lens, LensModulation> = {
  // Egyptian — ancient, cosmic, hieroglyphic
  egyptian: {
    vertexAddend: 2, // adds cosmic order
    symmetryOverride: undefined, // inherits primitive
    scaleMul: 1.0,
    innerShift: 0,
    rotationOffset: 0,
    twistAdd: 0.05,
    depthMul: 1.0,
    fractalDepth: 0,
  },

  // Sanskrit/Vedic — mandala, chakra, unfolding
  'sanskrit-vedic': {
    vertexAddend: 4, // mandala petals
    symmetryOverride: 'fractal', // mandala nature
    scaleMul: 1.05,
    innerShift: -0.05,
    rotationOffset: Math.PI / 8,
    twistAdd: 0.15,
    depthMul: 1.1,
    fractalDepth: 2,
  },

  // Greek-classical — proportion, columnar, mathematical
  'greek-classical': {
    vertexAddend: 0, // pure geometry
    symmetryOverride: 'crystalline',
    scaleMul: 0.95,
    innerShift: 0.05,
    rotationOffset: 0,
    twistAdd: -0.03,
    depthMul: 0.9,
    fractalDepth: 0,
  },

  // Christian-mystical — sacred heart, redemption, transformation
  'christian-mystical': {
    vertexAddend: 1,
    symmetryOverride: 'bilateral',
    scaleMul: 1.02,
    innerShift: -0.08,
    rotationOffset: -Math.PI / 6,
    twistAdd: 0.08,
    depthMul: 1.05,
    fractalDepth: 1,
  },

  // Jungian — archetype, collective unconscious
  jungian: {
    vertexAddend: 0,
    symmetryOverride: undefined,
    scaleMul: 1.0,
    innerShift: 0,
    rotationOffset: Math.PI / 12,
    twistAdd: 0.1,
    depthMul: 1.0,
    fractalDepth: 0,
  },

  // Physics-elemental — matter, energy, force
  'physics-elemental': {
    vertexAddend: 0,
    symmetryOverride: 'radial',
    scaleMul: 1.08,
    innerShift: 0.1,
    rotationOffset: 0,
    twistAdd: -0.05,
    depthMul: 1.15,
    fractalDepth: 0,
  },

  // Modern-wellness — accessible, current language
  'modern-wellness': {
    vertexAddend: -1, // simplified for modern context
    symmetryOverride: undefined,
    scaleMul: 0.92,
    innerShift: 0.08,
    rotationOffset: 0,
    twistAdd: 0.12,
    depthMul: 0.85,
    fractalDepth: 0,
  },
};

/** All 7 lenses in display order */
export const LENSES: Lens[] = [
  'egyptian',
  'sanskrit-vedic',
  'greek-classical',
  'christian-mystical',
  'jungian',
  'physics-elemental',
  'modern-wellness',
];

/** Get the effective primitive after lens modulation */
export function modulatePrimitive(envVar: EnvVar, lens: Lens): MathPrimitive {
  const base = PRIMITIVES[envVar];
  const mod = LENS_MODULATION[lens];

  const sym = mod.symmetryOverride || base.symmetry;

  return {
    vertexCount: base.vertexCount + mod.vertexAddend,
    symmetry: sym,
    // φ-based scaling still applies; the lens modulates the *resulting scale*
    // multiplicatively. `scaleMul` is a scale factor, not an exponent — folding
    // it into the exponent (the old `base.phiExponent * mod.scaleMul`) made the
    // modulation dead whenever base.phiExponent was 0. Convert scaleMul to a
    // log_φ exponent delta so PHI^phiExponent === PHI^base.phiExponent * scaleMul
    // at the consumer, and the lens always shifts the scale.
    phiExponent: base.phiExponent + Math.log(mod.scaleMul) / Math.log(PHI),
    innerRatio: Math.max(0.1, Math.min(0.9, base.innerRatio + mod.innerShift)),
    rotationPerSegment: base.rotationPerSegment + mod.rotationOffset,
    twistFactor: Math.max(0, Math.min(1, base.twistFactor + mod.twistAdd)),
    hasCentralVoid: base.hasCentralVoid,
    depthRatio: base.depthRatio * mod.depthMul,
  };
}

/** All lenses for a given envVar - the full multi-perspective expression */
export function lensesFor(envVar: EnvVar): MathPrimitive[] {
  return LENSES.map((lens) => modulatePrimitive(envVar, lens));
}

/** The default lens for a node (used when no lens is selected) */
export function defaultLensForEnvVar(envVar: EnvVar): Lens {
  // Map envVar-based defaults:
  const defaultLensMap: Record<EnvVar, Lens> = {
    // Sun → physics (the source is energy)
    PYR: 'physics-elemental',
    // Eye → egyptian (Eye of Horus)
    OCULUS: 'egyptian',
    // Yin-Yang → greek (origins in I Ching / Eastern, but dualism is classical)
    DYAD: 'greek-classical',
    // Pyramid → physics (fire element)
    PYRAMIS: 'physics-elemental',
    // Water → physics
    HYDOR: 'physics-elemental',
    // Mandorla → sanskrit
    MANDORLA: 'sanskrit-vedic',
    // Crescent → egyptian
    KENOSIS: 'egyptian',
    // Hexagram → jewish-greek (shared symbol)
    SHATKONA: 'greek-classical',
    // Lotus → sanskrit
    PADMA: 'sanskrit-vedic',
    // Eye in Triangle → egyptian
    BODHI: 'egyptian',
    // Solar Cross → christian (cross)
    TETRAD: 'christian-mystical',
    // Octahedron → greek
    OKTAEDRON: 'greek-classical',
    // Ankh → egyptian
    ANKH: 'egyptian',
  };
  return defaultLensMap[envVar];
}
