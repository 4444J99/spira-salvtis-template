/**
 * LifeMotionLaw — first-class generative law layer.
 *
 * Sits between structure and renderer:
 *
 *   EnvVar (immutable metaphysical structure, `hub.config.ts`)
 *     × IconWorld (matter / palette / phase mix / gravity, `icon-worlds.ts`)
 *     → LifeMotionLaw (bounded motion coefficients, THIS file)
 *     → renderer (`spiral.ts` consumes laws; it must not invent
 *       per-node behavior inline by index)
 *
 * Every coefficient is deterministic (same EnvVar + world → same law,
 * forever) and bounded (see LAW_BOUNDS — the published contract that
 * `scripts/test.mjs` executes against). Per-render "infinite infinitesimal
 * variation" comes from `lawRng(law, salt)`: the law is the stable
 * physics of the world; the salt picks tonight's weather inside it.
 *
 * This module intentionally has ZERO runtime imports (type-only imports
 * are erased), so plain Node can execute it directly in the test suite
 * without a bundler.
 */

import type { EnvVar } from './hub.config';
import type { IconWorld, ParticleBehavior } from './icon-worlds';

// ---------------------------------------------------------------------------
// Seeded PRNG + structure hash (canonical home — renderer imports from here)
// ---------------------------------------------------------------------------

/** mulberry32 — fast 32-bit seeded PRNG, uniform in [0, 1). */
export function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * FNV-offset / Knuth-multiplier hash of an EnvVar's True Name → uint32.
 * The same hash the helix rails key off, so law structure and rail
 * signal share one lineage.
 */
export function envVarHash(envVar: string): number {
  return Array.from(envVar).reduce(
    (hash, char) => Math.imul(hash ^ char.charCodeAt(0), 2654435761) >>> 0,
    2166136261,
  );
}

// ---------------------------------------------------------------------------
// The law
// ---------------------------------------------------------------------------

/** Six layered drift oscillator rates (rad/s) — x/y/z each get a pair. */
export type DriftFreqs = [number, number, number, number, number, number];

export interface LifeMotionLaw {
  /** Structure this law was projected from. */
  envVar: EnvVar;
  /** Stable uint32 structure seed — unique per EnvVar. */
  seed: number;

  // --- Regime coefficients (all 0..1) ---------------------------------
  /** How firmly the boundary holds interior matter (spring scale). */
  containment: number;
  /** How much matter breathes past / presses at the membrane. */
  permeability: number;
  /** Damping of interior matter — syrup worlds vs. frictionless ones. */
  viscosity: number;
  /** Thermal-kick scale — plasma storms vs. crystal stillness. */
  turbulence: number;
  /** Particle-budget hint — renderer multiplies its caps by this. */
  density: number;

  /** Orbit / gyre direction. */
  polarity: 1 | -1;

  // --- Rare events ------------------------------------------------------
  /** Per-particle rare-kick probability scale (0..0.006). */
  burstChance: number;
  /** Seconds between burst windows (2..8). */
  burstCycle: number;

  // --- "What if" oscillators (LFO rates, all bounded) -------------------
  lfo: {
    /** Breathing rate (rad/s, 0.1..1.6). */
    breathFreq: number;
    /** Breathing depth (scale fraction, 0.01..0.12). */
    breathAmp: number;
    /** Emissive shimmer rate (rad/s, 0.2..2.4). */
    shimmerFreq: number;
    /** Layered positional drift rates (rad/s, 0.05..0.8 each). */
    driftFreqs: DriftFreqs;
    /** Burst-origin wander rates (rad/s, 0.05..0.3 each). */
    burstDrift: [number, number, number];
  };
}

/**
 * Published coefficient bounds — the contract `scripts/test.mjs`
 * executes against. Derivation clamps into these ranges, so the
 * invariant holds for ANY world a future session configures, not
 * just the current 13.
 */
export const LAW_BOUNDS = {
  containment: { min: 0, max: 1 },
  permeability: { min: 0, max: 1 },
  viscosity: { min: 0, max: 1 },
  turbulence: { min: 0, max: 1 },
  density: { min: 0, max: 1 },
  burstChance: { min: 0, max: 0.006 },
  burstCycle: { min: 2, max: 8 },
  breathFreq: { min: 0.1, max: 1.6 },
  breathAmp: { min: 0.01, max: 0.12 },
  shimmerFreq: { min: 0.2, max: 2.4 },
  driftFreq: { min: 0.05, max: 0.8 },
  burstDrift: { min: 0.05, max: 0.3 },
} as const;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * How strongly each particle-behavior archetype implies a held boundary.
 * Lattice/crystalline worlds are vaults; radial-emission worlds are
 * fountains that barely acknowledge their membrane.
 */
const BEHAVIOR_CONTAINMENT: Record<ParticleBehavior, number> = {
  lattice: 0.9,
  crystalline: 0.85,
  'dual-gyre': 0.6,
  tidal: 0.55,
  spiraling: 0.5,
  floaty: 0.45,
  rising: 0.4,
  'radial-emission': 0.3,
};

const SIZE_BIAS_DENSITY: Record<IconWorld['sizeBias'], number> = {
  micro: 0.95, // many tiny grains — full budget
  mixed: 0.75,
  macro: 0.55, // few large bodies — spend budget on size, not count
};

/**
 * Project (EnvVar × IconWorld) → LifeMotionLaw.
 *
 * Pure and deterministic: the seeded RNG only jitters WITHIN the
 * physically-derived value's neighborhood, so two worlds with similar
 * phase mixes still get distinct laws (structure hash differs) while
 * every coefficient stays inside LAW_BOUNDS by construction.
 */
export function deriveLifeMotionLaw(
  envVar: EnvVar,
  world: IconWorld,
): LifeMotionLaw {
  const seed = envVarHash(envVar);
  const rng = mulberry32(seed);
  const mix = world.phaseMix;
  // Normalized heat: thermalAmpMul spans 0.4 (Lunar Night) .. 1.6 (Forge).
  const heat = clamp((world.thermalAmpMul - 0.4) / 1.2, 0, 1);

  const containment = clamp(
    0.45 * BEHAVIOR_CONTAINMENT[world.particleBehavior] +
      0.45 * (mix.solid + 0.4 * mix.liquid) +
      rng() * 0.1,
    LAW_BOUNDS.containment.min,
    LAW_BOUNDS.containment.max,
  );
  const permeability = clamp(
    0.15 + 0.55 * mix.gas + 0.35 * mix.plasma - 0.25 * mix.solid + rng() * 0.08,
    LAW_BOUNDS.permeability.min,
    LAW_BOUNDS.permeability.max,
  );
  const viscosity = clamp(
    0.15 + 0.6 * mix.liquid + 0.25 * mix.solid - 0.25 * heat + rng() * 0.06,
    LAW_BOUNDS.viscosity.min,
    LAW_BOUNDS.viscosity.max,
  );
  const turbulence = clamp(
    0.3 * mix.plasma + 0.2 * mix.gas + 0.4 * heat + rng() * 0.08,
    LAW_BOUNDS.turbulence.min,
    LAW_BOUNDS.turbulence.max,
  );
  const density = clamp(
    SIZE_BIAS_DENSITY[world.sizeBias] + (rng() - 0.5) * 0.1,
    LAW_BOUNDS.density.min,
    LAW_BOUNDS.density.max,
  );

  // Direction: worlds with strong vertical gravity move WITH it (heat
  // rises, gateway settles); zero-g worlds take their handedness from
  // structure — a stable coin flip on the seed.
  const polarity: 1 | -1 =
    world.gravity.y > 0.01
      ? 1
      : world.gravity.y < -0.01
        ? -1
        : seed % 2
          ? 1
          : -1;

  const burstChance = clamp(
    0.0004 + 0.0035 * mix.plasma + 0.002 * heat + rng() * 0.0004,
    LAW_BOUNDS.burstChance.min,
    LAW_BOUNDS.burstChance.max,
  );
  const burstCycle = clamp(
    2 + 5.5 * (1 - turbulence) + rng() * 0.5,
    LAW_BOUNDS.burstCycle.min,
    LAW_BOUNDS.burstCycle.max,
  );

  const breathFreq = clamp(
    (0.18 + 0.55 * heat) * (0.85 + rng() * 0.3),
    LAW_BOUNDS.breathFreq.min,
    LAW_BOUNDS.breathFreq.max,
  );
  const breathAmp = clamp(
    0.02 + 0.06 * permeability + rng() * 0.01,
    LAW_BOUNDS.breathAmp.min,
    LAW_BOUNDS.breathAmp.max,
  );
  const shimmerFreq = clamp(
    (0.4 + 1.5 * turbulence) * (0.85 + rng() * 0.3),
    LAW_BOUNDS.shimmerFreq.min,
    LAW_BOUNDS.shimmerFreq.max,
  );

  const driftSpan = LAW_BOUNDS.driftFreq.max - LAW_BOUNDS.driftFreq.min;
  const driftFreqs = Array.from({ length: 6 }, () =>
    clamp(
      LAW_BOUNDS.driftFreq.min +
        driftSpan * (0.15 + 0.7 * rng()) * (0.5 + 0.5 * heat),
      LAW_BOUNDS.driftFreq.min,
      LAW_BOUNDS.driftFreq.max,
    ),
  ) as DriftFreqs;
  const burstDrift = Array.from({ length: 3 }, () =>
    clamp(
      0.05 + 0.25 * rng(),
      LAW_BOUNDS.burstDrift.min,
      LAW_BOUNDS.burstDrift.max,
    ),
  ) as [number, number, number];

  return {
    envVar,
    seed,
    containment,
    permeability,
    viscosity,
    turbulence,
    density,
    polarity,
    burstChance,
    burstCycle,
    lfo: { breathFreq, breathAmp, shimmerFreq, driftFreqs, burstDrift },
  };
}

/**
 * Per-render variation WITHIN a stable law. Mix the law's structure seed
 * with a runtime salt (e.g. the renderer's per-load salt) to get a fresh
 * but reproducible expression of the same physics — never the exact same
 * loop twice, never a different world.
 */
export function lawRng(law: LifeMotionLaw, salt = 0): () => number {
  const mixed = (law.seed ^ Math.imul(salt | 0, 0x9e3779b1)) >>> 0;
  return mulberry32(mixed);
}
