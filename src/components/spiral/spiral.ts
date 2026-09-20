/**
 * Sovereign Systems Spiral — Three.js 3D Helix Renderer
 *
 * Tapered helix with 3D orb meshes that visibly spin, orbit their
 * helix anchor points, and breathe with emissive pulsing. Per-phase
 * procedural textures and normal maps. Per-orb particle auras and
 * ambient atmospheric particles create a fluid, gaseous, underwater
 * feel. Helix extends far beyond visible nodes and dissolves into
 * fog for a truly infinite illusion. Never-repeating motion via
 * layered sine waves at irrational frequency ratios.
 * Works on both desktop (mouse) and mobile (touch).
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// BVH acceleration for the per-frame icon-shape containment raycast. The materia
// field tests ~6% of every node's particles against the icon mesh each frame
// (~3,750 raycasts/frame across 13 nodes); stock three raycasting is O(triangles)
// with no spatial index, which measured at ~37–533 ms/frame per icon (the
// dominant "runs heavy" cost). A per-icon BVH makes each cast O(log triangles)
// for byte-identical hits (verified 5.6–50× faster, same inside/outside result),
// with a ~1 ms/icon one-time build. We attach the accelerated raycast only to the
// containment meshes (surgical — no global three.Mesh.prototype mutation).
import {
  computeBoundsTree,
  disposeBoundsTree,
  acceleratedRaycast,
} from 'three-mesh-bvh';
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
// Bloom post-processing is dynamically imported (see spiral-postprocessing.ts) so
// its addon code + shaders leave the common chunk and load only on the immersive
// page. Type-only import here is erased at build — no runtime weight.
import type { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import {
  type IconWorld,
  type ParticleBehavior,
  worldFor,
  CANONICAL_NODE_COUNT,
} from '../../data/icon-worlds';
import { trackEvent } from '../../lib/analytics';
import { resolveParams, type ResolvedParams } from '../../data/spiral-params';
// Re-exported so SpiralIsland's single dynamic import('./spiral.ts') can read
// URL param overrides (?p.<element>.<param>=…) without a second import.
export { resolveParams };
import { PHI } from '../../data/sacred-geometry-primitives';
import { type Lens } from '../../data/lens-geometry';
import {
  type LabelMode,
  type SpiralLayout,
  type VesselMode,
  type EnvVar,
} from '../../data/hub.config';
import {
  deriveLifeMotionLaw,
  envVarHash,
  lawRng,
  mulberry32,
  type LifeMotionLaw,
} from '../../data/life-motion-laws';
import {
  generatePhaseTexture,
  generatePhaseNormalMap,
  createSoftDotTexture,
} from './spiral-materials';
import {
  buildSpiralPath,
  nodePathIndex,
  type PathConfig,
} from './spiral-paths';
// Variant A (symbolGeometryFor + the sacred-symbol make* family) lives in the
// module too and is exported for resurfacing, but is intentionally NOT imported
// here — the live renderer uses only the generative + primitives paths.
import {
  generativeStarGeometry,
  makeGeometryFromPrimitives,
} from './spiral-geometry';

export type SpiralVariant = 'symbols' | 'stars';
export type { LabelMode, SpiralLayout, VesselMode };

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface NodeData {
  id: number;
  name: string;
  phase: string;
  pillarSlug: string;
  emoji: string;
  tagline: string;
  color: string;
  status: 'live' | 'locked';
  url: string;
  envVar: EnvVar;
  /** Spiral t-value (0..1) — computed from index at call site */
  t: number;
}

interface OrbAnimParams {
  breathFreq: number;
  breathAmp: number;
  breathPhase: number;
  emissiveBase: number;
  emissiveAmp: number;
  emissiveFreq: number;
  emissivePhase: number;
  rotRateX: number;
  rotRateY: number;
  rotRateZ: number;
  rotPhaseX: number;
  rotPhaseY: number;
  rotPhaseZ: number;
  orbitRadius: number;
  orbitSpeed: number;
  orbitPhase: number;
  orbitNormal: THREE.Vector3;
  orbitBinormal: THREE.Vector3;
  driftFreqs: [number, number, number, number, number, number];
  /** Structure-derived phase offset (from the node's LifeMotionLaw seed). */
  phaseSeed: number;
}

interface AuraParam {
  radiusBase: number;
  theta0: number;
  phi0: number;
  orbitSpeed: number;
  driftFreq: number;
  driftAmp: number;
  phase: number;
  brightnessBase: number;
  brightnessFreq: number;
}

interface HelixRail {
  line: THREE.Line;
  material: THREE.LineBasicMaterial;
  baseOpacity: number;
  phase: number;
  riseFreq: number;
  driftFreq: number;
  polarity: 1 | -1;
  rotationBase: number;
  rotationAmp: number;
}

interface AmbientParam {
  driftFreqX: number;
  driftFreqY: number;
  driftFreqZ: number;
  driftAmpX: number;
  driftAmpY: number;
  driftAmpZ: number;
  phase: number;
}

interface InnerParam {
  radiusBase: number;
  theta0: number;
  phi0: number;
  thetaSpeed: number;
  phiSpeed: number;
  breathFreq: number;
  breathAmp: number;
  twinkleFreq: number;
  twinklePhase: number;
  brightnessBase: number;
}

// Each node = a mini solar system. Planets orbit the central star (orb) at
// distinct radii, inclinations, speeds, and phases. Composition (count, sizes,
// colors, ring) is seeded by node.id so every node is structurally distinct.
interface PlanetParam {
  semiMajor: number; // a — half longest axis of elliptical orbit
  eccentricity: number; // e — 0 = circle, 0.7 = highly elliptical
  argPeriapsis: number; // ω — orientation of ellipse in its plane
  orbitSpeed: number; // mean motion (rad/sec)
  orbitPhase: number; // mean anomaly at t=0
  inclination: number; // tilt of orbital plane (rad)
  ascendingNode: number; // longitude of ascending node (rad)
  size: number; // mesh scale
  spinSpeed: number; // self-rotation rate
  hasRing: boolean; // saturn-style ring around this planet
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

// NOTE: the following are `let`, not `const`, because initSpiral overwrites them
// from the Spiral Parameter Registry (src/data/spiral-params.ts) at boot — one
// assignment block at the top of initSpiral re-points every downstream reference
// (here AND in the buildHelix*/buildConstellation* helpers) to the resolved
// value, so a ?p.<element>.<param>= URL override drives the real geometry.
let TURNS = 3.5;
let HELIX_HEIGHT = 14;
let PATH_STEPS = 512;
let PATH_EXTEND = 0.85; // extra BELOW the bottom node — the infinite-descent tail
// Extension ABOVE the top (unlock) node. Short by default so the authenticate/
// unlock star sits at the very top (admin 2026-06-25), while the bottom keeps
// dissolving into fog. Registry knob: helix.pathExtendTop.
let PATH_EXTEND_TOP = 0.12;
let CONSTELLATION_TAIL = 4.6;
let BG_COLOR = 0x020b10; // matches --ss-page-bg / --color-ocean-900 (no seam with page)
let FOG_DENSITY = 0.05; // dissolves endpoints into background
let ORB_RADIUS = 0.58; // big enough that the contained universe reads at spiral framing
let ORB_SEGMENTS = 32;
const CLICK_THRESHOLD = 8; // px — drag vs. click (mouse)
const TAP_THRESHOLD = 30; // px — drag vs. tap (touch)

const PHASE_HEX: Record<string, number> = {
  ELEVATE: 0x119a9e,
  ALIGN: 0x8cc5d3,
  UNLOCK: 0x3dbfc4,
};

// Chakra-derived palette — root → crown — applied to nodes bottom-to-top via interpolation.
// 8 stops (was 7): added a second orange between root and sacral so the warm side gets
// more screen real estate, the indigo→violet stretch compresses to ~2 nodes instead of 3,
// and the crown is lightened (admin 2026-04-25: "another shade of orange instead of three
// purple, lighten the most top purple").
const CHAKRA_HEX: number[] = [
  0xff3b3b, // 1 root        — red
  0xff6a3c, // 2 root-sacral — red-orange (added)
  0xff9a3c, // 3 sacral      — orange
  0xffd23b, // 4 solar       — yellow
  0x4ed158, // 5 heart       — green
  0x3da9f5, // 6 throat      — sky blue
  0x6c4cd6, // 7 third eye   — indigo
  0xc97ce8, // 8 crown       — lightened violet
];

// Micro-motion amplitudes (3x increase — visible at camera distance 22)
const DRIFT_AMP = 0.18;
const DRIFT_AMP_Y = 0.12;

// Orbital motion
const ORBIT_RADIUS_MIN = 0.3;
const ORBIT_RADIUS_MAX = 0.55;
const ORBIT_SPEED_MIN = 0.25;
const ORBIT_SPEED_MAX = 0.55;

// Per-orb aura particles used to orbit as a scene-level layer. That broke the
// core rule: the node shape is the container, so no generated life may orbit
// outside it. Keep this disabled; the dense phase field below now carries the
// internal life.
const AURA_PARTICLES_PER_ORB = 0;
// Aura lives INSIDE the container now (was 0.5–1.2 — it flew outside the
// ORB_RADIUS 0.58 boundary). "The container contains all the life within" —
// nothing orbits outside the invisible shape. These are the larger glowing
// motes suspended among the materia.
const AURA_RADIUS_MIN = 0.06;
const AURA_RADIUS_MAX = 0.24;
const AURA_PARTICLE_SIZE = 0.045;

// Legacy scene-level shimmer is disabled for the same reason as aura: it was
// not clipped by the icon volume. The phase-particle field lives inside the
// vessel transform and supplies the visible interior motion.
const INNER_PARTICLES_PER_ORB = 0;
const INNER_RADIUS_MIN = 0.1;
const INNER_RADIUS_MAX = 0.32;
const INNER_PARTICLE_SIZE = 0.052;

let HELIX_RAIL_COUNT = 7; // registry-overwritten at boot (helix.railCount)

// Materia particle field — physics-driven phase particles bouncing off the
// icon's exterior substrate. User 2026-04-25: "stars contained by bouncing
// off their env exterior substrate; icons naturally reach edges and keep
// form like birds or magnets or electronics". Each particle has thermal
// jitter (Brownian-like life) + gentle outward pressure (gas-like fill) +
// continuous raycast boundary collision against the icon's actual mesh
// surface (distributed across frames for perf). The icon shape emerges as
// the container the particles fill, not as a constraint pinned to springs.
let MATERIA_FIELD_PARTICLES = 1600; // dense fill — "99% filled, no blank space"
let MATERIA_FIELD_SIZE_MIN = 0.006;
let MATERIA_FIELD_SIZE_MAX = 0.032; // larger grains close gaps so the form reads as a solid volume
// Phase physics: gas diffuses fastest + bounces hardest; solid is dense + sluggish.
const PHASE_THERMAL = { solid: 0.05, liquid: 0.2, gas: 0.55 };
const PHASE_DAMPING = { solid: 0.92, liquid: 0.97, gas: 0.992 };
const PHASE_BOUNCE = { solid: 0.5, liquid: 0.7, gas: 0.95 };
// Outward radial pressure — pushes particles toward edges (gas wants to fill
// container). Stronger for gas, weaker for solid. Combined with boundary
// collision = particles distribute throughout icon volume.
const PHASE_PRESSURE = { solid: 0.04, liquid: 0.12, gas: 0.4 }; // reduced — outward pressure was hollowing the center (blank space). Fill the volume uniformly; gas still drifts to a soft halo.
let IMPLODE_EXPLODE_FREQ = 0.32; // rad/sec — slow breath cycle
let IMPLODE_EXPLODE_AMP = 0.06; // gentle breath only — the form must HOLD, not bloat apart
// Continuous icon-shape collision — distributed across frames for perf.
// Each frame, COLLISION_CHECK_FRACTION of particles per node get raycast-
// tested against the actual icon mesh; particles outside get snapped back
// to their last known inside position with reflected velocity.
let COLLISION_CHECK_FRACTION = 0.06; // firmer home-spring keeps particles inside, so fewer raycasts needed (perf headroom for the denser field)

// Legacy planet-orbit system. It was sphere-bounded, not icon-bounded, so it
// could read as a separate solar system around the node. The current renderer
// uses the phase-particle field instead: the icon mesh is the law/boundary, and
// the universe is generated inside that exact volume.
const ENABLE_LEGACY_PLANETS = false;
// CONTAINMENT — the shape is the boundary; the universe cannot escape it.
const ORB_CONTAINMENT_R = 0.52; // ORB_RADIUS (0.58) - small margin
const PLANET_RADIUS_MIN = 0.012;
const PLANET_RADIUS_MAX = 0.038; // nano-to-macro spans 3.2x within bound
const PLANET_ORBIT_MIN = 0.04; // close-in orbit
const PLANET_ORBIT_MAX = 0.2; // raw max — clamped per-planet
const PLANET_ECCENTRICITY_MAX = 0.35; // moderate ellipse — apoapsis stays bound
const PLANET_COUNT_BONUS_MAX = 4; // RNG-jittered extra planets per system
const ORBIT_TRAIL_SEGMENTS = 96; // smoothness of visible orbit ellipse

// --- Per-node universe themes ---
// Each node's interior universe is tuned to its icon's symbolic meaning. The
// theme drives planet count, layout, palette, orbital speed, and ring chance.
// Themes are *iconological*: solid matter / fluid / fire / lunar / structure
// / bloom / cardinal / crystal — each one a phase of matter or weather that
// matches what the icon represents (sunburst → dawn, gateway teardrop → fluid,
// hexagram → structure, octahedron → crystal, ankh → eternal cycle, etc.).
type LayoutStyle = 'free' | 'pair' | 'cardinal' | 'sextet';
type InclinationStyle = 'random' | 'coplanar' | 'orthogonal' | 'cardinal';

// PHASE — gas, liquid, solid. Each particle in a node's universe carries
// one phase. The phase determines physics behavior:
//   solid  — heavy, settles toward bottom (gravity), low elasticity bounce
//   liquid — medium gravity, fluid-like flow, moderate bounce
//   gas    — low gravity, high diffusion, high-elasticity bounce, fills empty
// User 2026-04-25: "icons are gas liquids solid universes — gas is wherever
// liquid and land aint". Multi-phase coexists in each node; phase MIX per
// materia (e.g., gateway = mostly liquid + some gas vapor + few solid sediment).
type PhasePhase = 'solid' | 'liquid' | 'gas';

interface PhaseParticle {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  home: THREE.Vector3; // spawn position inside icon — spring pulls back
  phase: PhasePhase;
  size: number;
  baseColor: THREE.Color;
}

interface PhaseMix {
  solid: number;
  liquid: number;
  gas: number;
}

// Per-materia phase composition. Numbers are probabilities (sum to ~1.0).
const PHASE_MIX: Record<string, PhaseMix> = {
  plasma: { solid: 0.0, liquid: 0.05, gas: 0.95 }, // mostly ionised gas
  fire: { solid: 0.0, liquid: 0.1, gas: 0.9 }, // flame + sparks
  gateway: { solid: 0.05, liquid: 0.65, gas: 0.3 }, // gateway + vapor + sediment
  ice: { solid: 0.7, liquid: 0.2, gas: 0.1 }, // ice + meltwater + sublimation
  crystal: { solid: 0.85, liquid: 0.05, gas: 0.1 }, // mineral lattice + occlusion
  metal: { solid: 0.9, liquid: 0.05, gas: 0.05 }, // dense matter, slow drift
  gas: { solid: 0.0, liquid: 0.0, gas: 1.0 }, // pure diffusion
  organic: { solid: 0.3, liquid: 0.4, gas: 0.3 }, // balanced bloom mix
  lunar: { solid: 0.6, liquid: 0.1, gas: 0.3 }, // dust + thin vapor
};

function pickPhase(rng: () => number, mix: PhaseMix): PhasePhase {
  const r = rng();
  if (r < mix.solid) return 'solid';
  if (r < mix.solid + mix.liquid) return 'liquid';
  return 'gas';
}

// MATERIA — the *substance* the universe is made of. Each chakra icon
// governs its env logic (universe theme + materia). Materia maps to
// concrete material parameters (size distribution, emissive intensity,
// central-body scale, dust density) so each node FEELS made of different
// stuff: plasma is bright + small, gas is diffuse + huge, crystal is
// precise + medium, ice is cool + ringed, etc.
type Materia =
  | 'plasma' // high-energy ionised — brightest, smallest, hottest
  | 'fire' // combustion — bright, varied size, dense dust
  | 'gateway' // fluid — soft cyan, medium size, calm
  | 'ice' // crystalline H2O — cool tint, precise, more rings
  | 'crystal' // mineral — angular precision, big rings
  | 'metal' // dense reflective — large bodies, fewer dust, low emissive
  | 'gas' // diffuse — giant bodies, soft edges, lots of haze
  | 'organic' // bloom matter — varied warm sizes, balanced
  | 'lunar'; // silvery body matter — calm, medium, low energy

interface MateriaSpec {
  sizeMul: number; // overall size scaling for planets
  maxSizeMul: number; // boost for the largest planets (giants)
  emissiveMul: number; // emissive boost
  sunSize: number; // central sun scale relative to default 0.085
  ringChanceMul: number; // multiplier on universe.ringChance
  dustBoost: number; // multiplier on system-shimmer brightness
}

// Sizes are tuned so the LARGEST planet (size * sizeMul * maxSizeMul) plus
// its orbit apoapsis stays inside ORB_CONTAINMENT_R. Per-planet runtime
// clamp on semiMajor enforces this (so eccentric orbits adjust their
// semi-major axis inward when needed).
const MATERIA: Record<Materia, MateriaSpec> = {
  plasma: {
    sizeMul: 0.8,
    maxSizeMul: 1.0,
    emissiveMul: 1.6,
    sunSize: 1.5,
    ringChanceMul: 0.5,
    dustBoost: 1.6,
  },
  fire: {
    sizeMul: 0.85,
    maxSizeMul: 1.3,
    emissiveMul: 1.8,
    sunSize: 1.7,
    ringChanceMul: 0.3,
    dustBoost: 2.0,
  },
  gateway: {
    sizeMul: 1.05,
    maxSizeMul: 1.0,
    emissiveMul: 0.65,
    sunSize: 0.9,
    ringChanceMul: 1.2,
    dustBoost: 0.9,
  },
  ice: {
    sizeMul: 0.95,
    maxSizeMul: 1.0,
    emissiveMul: 0.85,
    sunSize: 0.9,
    ringChanceMul: 1.8,
    dustBoost: 1.3,
  },
  crystal: {
    sizeMul: 1.1,
    maxSizeMul: 1.0,
    emissiveMul: 0.55,
    sunSize: 0.7,
    ringChanceMul: 2.0,
    dustBoost: 0.5,
  },
  metal: {
    sizeMul: 1.25,
    maxSizeMul: 1.3,
    emissiveMul: 0.45,
    sunSize: 0.75,
    ringChanceMul: 0.5,
    dustBoost: 0.3,
  },
  gas: {
    sizeMul: 1.3,
    maxSizeMul: 1.5,
    emissiveMul: 0.5,
    sunSize: 1.3,
    ringChanceMul: 1.4,
    dustBoost: 1.4,
  },
  organic: {
    sizeMul: 1.05,
    maxSizeMul: 1.1,
    emissiveMul: 0.85,
    sunSize: 1.0,
    ringChanceMul: 0.8,
    dustBoost: 1.1,
  },
  lunar: {
    sizeMul: 1.05,
    maxSizeMul: 1.0,
    emissiveMul: 0.7,
    sunSize: 1.0,
    ringChanceMul: 1.0,
    dustBoost: 0.7,
  },
};

const WORLD_SIZE_BIAS: Record<IconWorld['sizeBias'], number> = {
  micro: 0.74,
  mixed: 1.0,
  macro: 1.28,
};

const PHASE_GRAVITY_SCALE: Record<PhasePhase, number> = {
  solid: 1.15,
  liquid: 0.9,
  gas: 0.55,
};

const COHESION_PULL: Record<PhasePhase, number> = {
  solid: 1.9,
  liquid: 1.5,
  gas: 1.1,
};

const CHAOS_REPULSION: Record<PhasePhase, number> = {
  solid: 0.65,
  liquid: 0.95,
  gas: 1.35,
};

function phaseMixForWorld(world: IconWorld): PhaseMix {
  const solid = world.phaseMix.solid + world.phaseMix.plasma * 0.08;
  const liquid = world.phaseMix.liquid + world.phaseMix.plasma * 0.04;
  const gas = world.phaseMix.gas + world.phaseMix.plasma * 0.88;
  const total = solid + liquid + gas || 1;

  return {
    solid: solid / total,
    liquid: liquid / total,
    gas: gas / total,
  };
}

function blendWorldPalette(
  basePalette: THREE.Color[],
  accentPalette: number[],
  nodeColor: THREE.Color,
): THREE.Color[] {
  return accentPalette.map((accentHex, idx) => {
    const accent = new THREE.Color(accentHex ?? 0xffffff);
    const base = basePalette[idx % basePalette.length] ?? nodeColor;
    return base.clone().lerp(accent, 0.68).lerp(nodeColor, 0.18);
  });
}

function respawnChaosParticle(part: PhaseParticle, world: IconWorld): void {
  const angle = Math.random() * Math.PI * 2;
  const radius = Math.random() * 0.08;
  const lift = (Math.random() - 0.5) * 0.12;
  const burst = (0.18 + Math.random() * 0.45) * world.thermalAmpMul;

  part.pos.set(Math.cos(angle) * radius, lift, Math.sin(angle) * radius);

  part.vel.set(
    Math.cos(angle) * burst + world.gravity.x * 0.15,
    lift * 1.6 + world.gravity.y * 0.25,
    Math.sin(angle) * burst + world.gravity.z * 0.15,
  );
}

function applyWorldBehaviorForce(
  behavior: ParticleBehavior,
  part: PhaseParticle,
  time: number,
  nodeIndex: number,
  partIndex: number,
  dt: number,
  motionScale: number,
  mode: 'cohesion' | 'chaos',
  excite = 1.0,
): void {
  // Hover excitement: every behavior force below scales by dt, so scaling dt
  // amplifies the world's OWN signature rather than overlaying a generic one —
  // crystals snap harder in their lattice, gyres counter-spin faster, tides
  // swell, emitters radiate. The node wakes as itself.
  dt *= excite;
  const modeMul = mode === 'cohesion' ? 1.0 : 1.45;

  switch (behavior) {
    case 'floaty': {
      part.vel.y +=
        Math.sin(time * 0.8 + partIndex * 0.17) *
        0.05 *
        dt *
        motionScale *
        modeMul;
      break;
    }
    case 'crystalline': {
      const targetX = Math.sign(part.home.x || 1) * 0.18;
      const targetY = Math.round(part.home.y / 0.14) * 0.14;
      const targetZ = Math.sign(part.home.z || 1) * 0.18;
      const snap = (mode === 'cohesion' ? 1.4 : 0.75) * dt * motionScale;
      part.vel.x += (targetX - part.pos.x) * snap;
      part.vel.y += (targetY - part.pos.y) * snap;
      part.vel.z += (targetZ - part.pos.z) * snap;
      break;
    }
    case 'rising': {
      part.vel.y += (mode === 'cohesion' ? 0.18 : 0.34) * dt * motionScale;
      break;
    }
    case 'spiraling': {
      const swirl = (mode === 'cohesion' ? 0.55 : 1.15) * dt * motionScale;
      part.vel.x += -part.pos.z * swirl;
      part.vel.z += part.pos.x * swirl;
      part.vel.y += 0.05 * swirl;
      break;
    }
    case 'lattice': {
      const cell = 0.11;
      const targetX = Math.round(part.home.x / cell) * cell;
      const targetY = Math.round(part.home.y / cell) * cell;
      const targetZ = Math.round(part.home.z / cell) * cell;
      const snap = (mode === 'cohesion' ? 1.8 : 0.95) * dt * motionScale;
      part.vel.x += (targetX - part.pos.x) * snap;
      part.vel.y += (targetY - part.pos.y) * snap;
      part.vel.z += (targetZ - part.pos.z) * snap;
      break;
    }
    case 'tidal': {
      const wave = Math.sin(time * 0.9 + nodeIndex * 0.73 + partIndex * 0.031);
      part.vel.x += wave * 0.06 * dt * motionScale * modeMul;
      part.vel.z +=
        Math.cos(time * 0.65 + partIndex * 0.029) *
        0.04 *
        dt *
        motionScale *
        modeMul;
      break;
    }
    case 'radial-emission': {
      const rr = Math.hypot(part.pos.x, part.pos.y, part.pos.z) || 1e-6;
      const radial = (mode === 'cohesion' ? 0.08 : 0.24) * dt * motionScale;
      part.vel.x += (part.pos.x / rr) * radial;
      part.vel.y += (part.pos.y / rr) * radial;
      part.vel.z += (part.pos.z / rr) * radial;
      break;
    }
    case 'dual-gyre': {
      const dir = part.home.x >= 0 ? 1 : -1;
      const gyre = (mode === 'cohesion' ? 0.7 : 1.3) * dt * motionScale * dir;
      part.vel.x += -part.pos.z * gyre;
      part.vel.z += part.pos.x * gyre;
      part.vel.y +=
        Math.sin(time * 1.1 + dir * partIndex * 0.05) * 0.03 * dt * motionScale;
      break;
    }
  }
}

interface NodeUniverse {
  theme: string;
  materia: Materia;
  planetCount: number;
  speedMul: number;
  palette: number[];
  ringChance: number;
  layout: LayoutStyle;
  inclination: InclinationStyle;
}

// Per-node palettes — each one a chromatic mood matching the icon's meaning.
const PAL = {
  DAWN: [0xff8a3c, 0xffd23b, 0xff6a3c, 0xffaa66], // warm sunrise
  COOL: [0x3da9f5, 0x6c4cd6, 0x4ed1c5, 0x5588ff], // cool observation
  DUALITY: [0xeeeeee, 0x222a44, 0x9ba9d6, 0xc97ce8], // light/dark contrast
  FIRE: [0xff3b3b, 0xff8a3c, 0xffd23b, 0xff5050], // hot plasma
  GATEWAY: [0x3da9f5, 0x4ed1c5, 0x66c8ff, 0x4dc7d6], // blue-cyan-aqua
  SPRING: [0x4ed158, 0xffaa66, 0xc97ce8, 0xff9aaa], // bloom pinks/greens
  LUNAR: [0xc9d4f5, 0x9ba9d6, 0xa0c8ff, 0x8896c4], // moonlit silvers
  STRUCTURE: [0x6c4cd6, 0x4ed158, 0xffd23b, 0x3da9f5], // 4 cardinal hues
  GOLD: [0xffd23b, 0xffaa66, 0xc9a96e, 0xfff0aa], // radiant golds
  CARDINAL: [0xff3b3b, 0xffd23b, 0x4ed158, 0x6c4cd6], // 4 element fires
  CRYSTAL: [0x9be3ff, 0xc9a96e, 0xe4f0ff, 0xa0c8d6], // mineral lights
  ETERNAL: [0xffd23b, 0xffaa66, 0xc9a96e, 0xc97ce8], // ankh-gold + violet
};

// Map node.id → universe theme. Aligned with symbolGeometryFor() switch:
//   1 sunburst → dawn        2 eye → observation       3 yin-yang → duality
//   4 up-triangle → fire     5 teardrop → gateway        6 vesica piscis → spring (intersection bloom)
//   7 crescent → lunar       8 hexagram → structure (6 nodes)
//   9 lotus → spring         10 eye-in-triangle → gold (radiant clarity)
//   11 solar cross → cardinal (4-direction)             12 octahedron → crystal
//   13 ankh → eternal
const NODE_UNIVERSES: Record<number, NodeUniverse> = {
  1: {
    theme: 'dawn',
    materia: 'plasma',
    planetCount: 4,
    speedMul: 1.2,
    palette: PAL.DAWN,
    ringChance: 0.15,
    layout: 'free',
    inclination: 'random',
  },
  2: {
    theme: 'observation',
    materia: 'ice',
    planetCount: 3,
    speedMul: 0.55,
    palette: PAL.COOL,
    ringChance: 0.35,
    layout: 'free',
    inclination: 'coplanar',
  },
  3: {
    theme: 'duality',
    materia: 'metal',
    planetCount: 2,
    speedMul: 0.9,
    palette: PAL.DUALITY,
    ringChance: 0.0,
    layout: 'pair',
    inclination: 'coplanar',
  },
  4: {
    theme: 'fire',
    materia: 'fire',
    planetCount: 5,
    speedMul: 1.65,
    palette: PAL.FIRE,
    ringChance: 0.05,
    layout: 'free',
    inclination: 'random',
  },
  5: {
    theme: 'gateway',
    materia: 'gateway',
    planetCount: 4,
    speedMul: 0.65,
    palette: PAL.GATEWAY,
    ringChance: 0.2,
    layout: 'free',
    inclination: 'coplanar',
  },
  6: {
    theme: 'intersection',
    materia: 'organic',
    planetCount: 2,
    speedMul: 0.8,
    palette: PAL.SPRING,
    ringChance: 0.0,
    layout: 'pair',
    inclination: 'coplanar',
  },
  7: {
    theme: 'lunar',
    materia: 'lunar',
    planetCount: 3,
    speedMul: 0.45,
    palette: PAL.LUNAR,
    ringChance: 0.45,
    layout: 'free',
    inclination: 'random',
  },
  8: {
    theme: 'structure',
    materia: 'crystal',
    planetCount: 6,
    speedMul: 0.95,
    palette: PAL.STRUCTURE,
    ringChance: 0.1,
    layout: 'sextet',
    inclination: 'coplanar',
  },
  9: {
    theme: 'spring',
    materia: 'organic',
    planetCount: 5,
    speedMul: 1.05,
    palette: PAL.SPRING,
    ringChance: 0.2,
    layout: 'free',
    inclination: 'random',
  },
  10: {
    theme: 'clarity',
    materia: 'gas',
    planetCount: 3,
    speedMul: 1.3,
    palette: PAL.GOLD,
    ringChance: 0.3,
    layout: 'free',
    inclination: 'coplanar',
  },
  11: {
    theme: 'cardinal',
    materia: 'metal',
    planetCount: 4,
    speedMul: 0.85,
    palette: PAL.CARDINAL,
    ringChance: 0.0,
    layout: 'cardinal',
    inclination: 'coplanar',
  },
  12: {
    theme: 'crystal',
    materia: 'crystal',
    planetCount: 4,
    speedMul: 1.0,
    palette: PAL.CRYSTAL,
    ringChance: 0.55,
    layout: 'free',
    inclination: 'orthogonal',
  },
  13: {
    theme: 'eternity',
    materia: 'plasma',
    planetCount: 5,
    speedMul: 1.1,
    palette: PAL.ETERNAL,
    ringChance: 0.4,
    layout: 'free',
    inclination: 'random',
  },
};
function universeFor(nodeId: number): NodeUniverse {
  return NODE_UNIVERSES[nodeId] || NODE_UNIVERSES[1];
}

const PLANET_ORBIT_SPEED_MIN = 0.45;
const PLANET_ORBIT_SPEED_MAX = 1.65;

// Background Starfield — the drifting backdrop so the cosmos isn't a vacuum.
// Its knobs (count, radius, height, size, opacity, brightness, drift, blend)
// now live in the Spiral Parameter Registry — src/data/spiral-params.ts (group
// 'bgStars') — read live in initSpiral and tweakable via ?p.bgStars.<knob>=.
// History: cut 700→160 ("near-empty void", 5728d7d 2026-06-03) = the "wrong
// stars disappeared I loved the other ones !!" admin reported 2026-06-24;
// restored + made visible, then promoted to named, point-at-able registry params.

// Phase-specific material overrides
const PHASE_MAT: Record<
  string,
  {
    roughness: number;
    metalness: number;
    clearcoatRoughness: number;
    iridescence: number;
    iridescenceIOR: number;
    sheen: number;
    sheenRoughness: number;
    normalStrength: number;
  }
> = {
  ELEVATE: {
    roughness: 0.2,
    metalness: 0.05,
    clearcoatRoughness: 0.15,
    iridescence: 0.15,
    iridescenceIOR: 1.3,
    sheen: 0,
    sheenRoughness: 0,
    normalStrength: 0.3,
  },
  ALIGN: {
    roughness: 0.1,
    metalness: 0.15,
    clearcoatRoughness: 0.05,
    iridescence: 0,
    iridescenceIOR: 1.3,
    sheen: 0.5,
    sheenRoughness: 0.3,
    normalStrength: 0.25,
  },
  UNLOCK: {
    roughness: 0.05,
    metalness: 0.25,
    clearcoatRoughness: 0.02,
    iridescence: 0.4,
    iridescenceIOR: 1.5,
    sheen: 0,
    sheenRoughness: 0,
    normalStrength: 0.4,
  },
};

// Phase-specific animation: per-axis rotation speeds
const PHASE_ANIM: Record<
  string,
  {
    breathFreq: number;
    breathAmp: number;
    emissiveAmpLive: number;
    emissiveAmpLocked: number;
    emissiveFreq: number;
    rotRateX: number;
    rotRateY: number;
    rotRateZ: number;
  }
> = {
  ELEVATE: {
    breathFreq: 0.3,
    breathAmp: 0.035,
    emissiveAmpLive: 0.15,
    emissiveAmpLocked: 0.04,
    emissiveFreq: 0.25,
    rotRateX: 0.15,
    rotRateY: 0.4,
    rotRateZ: 0.1,
  },
  ALIGN: {
    breathFreq: 0.45,
    breathAmp: 0.025,
    emissiveAmpLive: 0.12,
    emissiveAmpLocked: 0.03,
    emissiveFreq: 0.35,
    rotRateX: 0.35,
    rotRateY: 0.25,
    rotRateZ: 0.45,
  },
  UNLOCK: {
    breathFreq: 0.6,
    breathAmp: 0.015,
    emissiveAmpLive: 0.1,
    emissiveAmpLocked: 0.03,
    emissiveFreq: 0.5,
    rotRateX: 0.1,
    rotRateY: 1.2,
    rotRateZ: 0.08,
  },
};

// ---------------------------------------------------------------------------
// Seeded PRNG (mulberry32) + envVarHash live in `data/life-motion-laws.ts`
// (the canonical generative-law home) and are imported above.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Lineage hash — deterministic uniqueness across all structural dimensions.
// Each planet's structure derives from nodeId + phase + pillarSlug + planetIdx
// + loadSalt. "Math proofs win" — physics-derived, not aesthetic.
// ---------------------------------------------------------------------------

function lineageHash(
  nodeId: number,
  phase: string,
  pillarSlug: string,
  planetIdx: number,
  loadSalt: number,
): number {
  let h = Math.imul(nodeId, 1664525);
  h = Math.imul(
    h ^
      phase
        .split('')
        .reduce((a, c) => Math.imul(a ^ c.charCodeAt(0), 2654435761), 0),
    1664525,
  );
  h = Math.imul(
    h ^
      pillarSlug
        .split('')
        .reduce((a, c) => Math.imul(a ^ c.charCodeAt(0), 2654435761), 0),
    1664525,
  );
  h = Math.imul(h ^ Math.imul(planetIdx, 6271), 1664525);
  h = Math.imul(h ^ loadSalt, 1664525);
  return (h ^ (h >>> 16)) >>> 0;
}

// Lens sequence — 7 traditions spanning Egyptian → Sanskrit → Greek → Christian
// → Jungian → Physics → Modern. NodeIndex mod 7 selects primary lens, phase
// deepens uniqueness within the phase band. Each lens transforms the ideal
// form's mathematical constraints differently (vertexCount, twist, scale, etc.).
const LENS_SEQUENCE: Lens[] = [
  'egyptian',
  'sanskrit-vedic',
  'greek-classical',
  'christian-mystical',
  'jungian',
  'physics-elemental',
  'modern-wellness',
];

function primaryLensForNode(nodeIndex: number, phase: string): Lens {
  const idx = nodeIndex % 7;
  const baseLens = LENS_SEQUENCE[idx];
  if (phase === 'ELEVATE')
    return idx % 2 === 0 ? baseLens : 'physics-elemental';
  if (phase === 'UNLOCK') return idx % 3 === 0 ? baseLens : 'greek-classical';
  return baseLens;
}

// Creation/destruction physics derivation.
// "one creates and one destroys, both are spectacular" — determined by energy
// density (emissiveMul/sizeMul), not aesthetics. High energy/mass = creation
// (radiation, expansion). Low = destruction (collapse, endurance, dissolution).
// Gas and organic are physics exceptions: gas fills all space (expansion
// = creation), organic = bloom/growth (creation).
function isCreationMateria(materia: Materia): boolean {
  const spec = MATERIA[materia];
  if (!spec) return false;
  const epm = spec.emissiveMul / spec.sizeMul;
  if (epm > 1.0) return true;
  if (materia === 'gas') return true;
  if (materia === 'organic') return true;
  return false;
}

// Three near-orthogonal probe directions for the multi-ray inside-test below.
// A single ray (the classic even/odd parity test) mis-classifies points near
// beveled/holed icon geometry (eye pupil, yin-yang, crescent, ankh aperture):
// an edge-grazing or coplanar ray registers a doubled or missed intersection,
// flipping the parity. Casting several rays and taking a majority vote washes
// out those grazing artifacts. Non-axis-aligned so they rarely lie in a face
// plane.
const INSIDE_PROBE_DIRS: readonly THREE.Vector3[] = [
  new THREE.Vector3(1, 0, 0),
  new THREE.Vector3(0.37, 0.84, 0.4).normalize(),
  new THREE.Vector3(-0.62, 0.31, -0.72).normalize(),
];

/**
 * Robust point-in-mesh test via majority-vote ray casting.
 *
 * Casts `INSIDE_PROBE_DIRS.length` rays from `point` and counts how many give
 * an odd intersection count (the parity that means "inside"). Returns true
 * when the majority agree, which tolerates the edge-grazing / coplanar
 * artifacts that flip a single-ray test on non-watertight icon geometry.
 *
 * `raycaster` is passed in (reused across calls) to avoid per-test allocation.
 */
function isInsideMesh(
  raycaster: THREE.Raycaster,
  mesh: THREE.Object3D,
  point: THREE.Vector3,
): boolean {
  let insideVotes = 0;
  for (const dir of INSIDE_PROBE_DIRS) {
    raycaster.set(point, dir);
    const hits = raycaster.intersectObject(mesh, false);
    if (hits.length % 2 === 1) insideVotes++;
  }
  return insideVotes * 2 > INSIDE_PROBE_DIRS.length;
}

function envVarRailSignal(nodes: NodeData[], p: number, railIndex: number) {
  if (nodes.length === 0) {
    return { seed: 1, weight: 0.5 };
  }
  const clamped = Math.max(0, Math.min(1, p));
  const position = clamped * (nodes.length - 1);
  const low = Math.floor(position);
  const high = Math.min(nodes.length - 1, low + 1);
  const mix = position - low;
  const lowHash = envVarHash(nodes[low]!.envVar);
  const highHash = envVarHash(nodes[high]!.envVar);
  const seed = lowHash * (1 - mix) + highHash * mix + railIndex * 7919;
  return {
    seed,
    weight: 0.35 + ((Math.floor(seed) % 17) / 17) * 0.65,
  };
}

function buildHelixRail(
  path: THREE.Vector3[],
  nodes: NodeData[],
  railIndex: number,
): HelixRail {
  const points: THREE.Vector3[] = [];
  const colors = new Float32Array(path.length * 3);
  const totalRange = 1 + PATH_EXTEND + PATH_EXTEND_TOP;
  const railPhase =
    railIndex * PHI + (envVarHash(nodes[0]?.envVar ?? 'PYR') % 31);
  const polarity: 1 | -1 = railIndex % 2 === 0 ? 1 : -1;
  const hueA = new THREE.Color(railIndex % 3 === 0 ? 0x7de6e0 : 0xe6ca87);
  const hueB = new THREE.Color(railIndex % 3 === 1 ? 0xc4a0ff : 0xffffff);

  for (let i = 0; i < path.length; i++) {
    const rawP = -PATH_EXTEND + (i / Math.max(1, path.length - 1)) * totalRange;
    const p = Math.max(0, Math.min(1, rawP));
    const signal = envVarRailSignal(nodes, p, railIndex);
    const base = path[i]!;
    const radial = new THREE.Vector3(base.x, 0, base.z);
    if (radial.lengthSq() < 0.0001) radial.set(1, 0, 0);
    radial.normalize();
    const tangent = new THREE.Vector3(
      -radial.z,
      Math.sin((p + railIndex * 0.071) * Math.PI) * 0.16,
      radial.x,
    ).normalize();
    const harmonic =
      Math.sin(p * Math.PI * (2.4 + signal.weight * 2.1) + railPhase) *
      (0.08 + signal.weight * 0.18);
    const counter =
      Math.cos(p * Math.PI * (3.2 + railIndex * 0.37) + signal.seed * 0.0001) *
      0.045 *
      polarity;
    points.push(
      base
        .clone()
        .addScaledVector(radial, harmonic)
        .addScaledVector(tangent, counter),
    );

    const fade =
      rawP < 0
        ? Math.max(0, (rawP + PATH_EXTEND) / PATH_EXTEND)
        : rawP > 1
          ? PATH_EXTEND_TOP > 0
            ? Math.max(0, 1 - (rawP - 1) / PATH_EXTEND_TOP)
            : 0
          : 1;
    const color = hueA.clone().lerp(hueB, signal.weight * 0.42);
    colors[i * 3] = color.r * fade;
    colors[i * 3 + 1] = color.g * fade;
    colors[i * 3 + 2] = color.b * fade;
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const baseOpacity = 0.08 + (railIndex % 4) * 0.025;
  const material = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: baseOpacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const line = new THREE.Line(geometry, material);
  line.scale.setScalar(1 + (railIndex - (HELIX_RAIL_COUNT - 1) / 2) * 0.006);
  return {
    line,
    material,
    baseOpacity,
    phase: railPhase,
    riseFreq: 0.17 + railIndex * 0.031 + PHI * 0.021,
    driftFreq: 0.23 + railIndex * 0.037 + Math.SQRT2 * 0.013,
    polarity,
    rotationBase: (railIndex - (HELIX_RAIL_COUNT - 1) / 2) * 0.006,
    rotationAmp: 0.006 + railIndex * 0.0015,
  };
}

// ---------------------------------------------------------------------------
// Chakra color mapping — interpolates root→crown across N nodes (bottom→top)
// ---------------------------------------------------------------------------

function chakraColorForNode(i: number, total: number): THREE.Color {
  if (total <= 1) return new THREE.Color(CHAKRA_HEX[0]);
  const t = (i / (total - 1)) * (CHAKRA_HEX.length - 1); // 0..(CHAKRA_HEX.length-1)
  const lo = Math.floor(t);
  const hi = Math.min(lo + 1, CHAKRA_HEX.length - 1);
  const f = t - lo;
  const a = new THREE.Color(CHAKRA_HEX[lo]);
  const b = new THREE.Color(CHAKRA_HEX[hi]);
  return a.lerp(b, f);
}

// Continuous chakra sample: tFrac 0 (root/red, bottom) → 1 (crown/violet, top).
// Lets the ambient starfield ride the SAME root→crown gradient the nodes do, by
// height instead of by index (admin 2026-06-25: "colors of the stars match the
// chakra colors or variations of ... that follow the same gradient from top to
// bottom").
function chakraColorAt(tFrac: number): THREE.Color {
  const t = Math.max(0, Math.min(1, tFrac)) * (CHAKRA_HEX.length - 1);
  const lo = Math.floor(t);
  const hi = Math.min(lo + 1, CHAKRA_HEX.length - 1);
  return new THREE.Color(CHAKRA_HEX[lo]).lerp(
    new THREE.Color(CHAKRA_HEX[hi]),
    t - lo,
  );
}

// ---------------------------------------------------------------------------
// Node label sprite — minimal typographic identifier
// ---------------------------------------------------------------------------
// Replaces the emoji-sprite scheme. Sleek uppercase Inter w/ wide tracking,
// soft drop-shadow for legibility against the ocean-900 background, lower
// opacity for locked nodes. Always camera-facing (Sprite billboard).

function makeLabelSprite(name: string, locked: boolean): THREE.Sprite {
  const dpr = Math.min(window.devicePixelRatio, 2);
  const w = 720;
  const h = 100;
  const c = document.createElement('canvas');
  c.width = w * dpr;
  c.height = h * dpr;
  const ctx = c.getContext('2d');
  // No 2D context — return a blank (transparent) sprite so the caller still
  // receives a valid THREE.Sprite rather than a thrown null-deref.
  if (!ctx) {
    const blankTex = new THREE.CanvasTexture(c);
    const blankMat = new THREE.SpriteMaterial({
      map: blankTex,
      transparent: true,
      depthWrite: false,
      depthTest: false,
    });
    const blankSprite = new THREE.Sprite(blankMat);
    blankSprite.scale.set(2.2, 2.2 * (h / w), 1);
    return blankSprite;
  }
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, w, h);
  // Light typewriter (monospace) + a bit smaller — admin 2026-06-25:
  // "the hover words just a bit smaller & in light typewriter font would be
  // badass!". System monospace stack (no webfont dependency in the canvas);
  // the two-pass shadow below carries legibility at the thin 300 weight.
  ctx.font = '300 27px ui-monospace, "Courier New", Courier, monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.letterSpacing = '0.14em';
  // Two-pass shadow for legibility: first a wide soft halo, then a tight ink shadow.
  ctx.shadowColor = 'rgba(7, 30, 34, 0.95)';
  ctx.shadowBlur = 18;
  ctx.fillStyle = 'rgba(7, 30, 34, 0)';
  ctx.fillText(name.toUpperCase(), w / 2, h / 2);
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 1;
  ctx.fillStyle = locked
    ? 'rgba(232, 228, 223, 0.62)'
    : 'rgba(248, 244, 238, 0.96)';
  ctx.fillText(name.toUpperCase(), w / 2, h / 2);
  const tex = new THREE.CanvasTexture(c);
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.anisotropy = 4;
  const mat = new THREE.SpriteMaterial({
    map: tex,
    transparent: true,
    depthWrite: false,
    depthTest: false, // labels float above all geometry
  });
  const sprite = new THREE.Sprite(mat);
  // 2.2 → 2.0: a touch smaller on screen per admin's "just a bit smaller".
  const worldWidth = 2.0;
  sprite.scale.set(worldWidth, worldWidth * (h / w), 1);
  return sprite;
}

// ---------------------------------------------------------------------------
// Main entry
// ---------------------------------------------------------------------------

export function initSpiral(
  container: HTMLElement,
  nodes: NodeData[],
  variantParam: SpiralVariant = 'symbols',
  vesselMode: VesselMode = 'invisible',
  labelMode: LabelMode = 'hover',
  immersive = false,
  layout: SpiralLayout = 'helix',
  // Live, named, tweakable element parameters resolved from the Spiral Parameter
  // Registry (src/data/spiral-params.ts) + any ?p.<element>.<param>= URL overrides.
  // Defaults to all registry defaults so existing callers are unaffected.
  params: ResolvedParams = resolveParams(''),
): () => void {
  // Partial-disposal stack — heavy GPU/DOM resources register a teardown fn
  // here as they are allocated, so a throw anywhere mid-init releases what was
  // already created (the full cleanup closure is only returned on success).
  const partialDisposers: Array<() => void> = [];
  try {
    // Touch devices have no hover — names would be unreachable in 'hover'
    // mode, so coarse pointers always get permanent labels.
    const effLabelMode: LabelMode = window.matchMedia('(pointer: coarse)')
      .matches
      ? 'always'
      : labelMode;
    // VesselMode → derived flags. The mode controls (a) whether the icon
    // mesh is rendered, (b) whether the per-node particle field reads at
    // full opacity, and (c) whether the variant is forced to 'stars' for
    // the prismatic/refractive look. Querystring override happens upstream
    // in SpiralIsland.astro (?vessel=visible|refracted-star|hybrid|invisible).
    // The Spiral Parameter Registry / tune panel can ALSO set the mode via
    // ?p.vessel.mode=… — applied HERE, before the derived flags below, so the
    // override fully propagates to variant / meshVisible / particleOpacityMult.
    {
      const vm = params['vessel.mode'];
      if (
        typeof vm === 'string' &&
        ['invisible', 'visible', 'hybrid', 'refracted-star'].includes(vm)
      ) {
        vesselMode = vm as VesselMode;
      }
    }
    const variant: SpiralVariant =
      vesselMode === 'refracted-star' ? 'stars' : variantParam;
    const meshVisible = vesselMode !== 'invisible';
    const particleOpacityMult =
      vesselMode === 'invisible'
        ? 1.0
        : vesselMode === 'hybrid'
          ? 0.86
          : /* visible | refracted-star */ 0.72;

    // --- Apply the Spiral Parameter Registry -------------------------------
    // `params` (from src/data/spiral-params.ts + any ?p.<el>.<param>= override)
    // is the single source of truth for every named element. Module-level shape
    // constants are re-pointed here so the helix/path/rail helpers and all later
    // builders read the resolved value; inline element literals (tube, materia
    // uniforms, camera, lighting, bloom) read pNum/pBool/pHex directly below.
    const pNum = (k: string, d: number): number =>
      typeof params[k] === 'number' ? (params[k] as number) : d;
    const pBool = (k: string, d: boolean): boolean =>
      typeof params[k] === 'boolean' ? (params[k] as boolean) : d;
    const pHex = (k: string, d: number): number => {
      const v = params[k];
      if (typeof v === 'string') {
        const n = parseInt(v.replace('#', ''), 16);
        return Number.isNaN(n) ? d : n;
      }
      return d;
    };
    // Spiral axis (helix shape) + decorative rails
    TURNS = pNum('helix.turns', TURNS);
    HELIX_HEIGHT = pNum('helix.height', HELIX_HEIGHT);
    PATH_EXTEND = pNum('helix.pathExtend', PATH_EXTEND);
    PATH_EXTEND_TOP = pNum('helix.pathExtendTop', PATH_EXTEND_TOP);
    PATH_STEPS = Math.round(pNum('helix.pathSteps', PATH_STEPS));
    CONSTELLATION_TAIL = pNum('helix.constellationTail', CONSTELLATION_TAIL);
    HELIX_RAIL_COUNT = Math.round(pNum('helix.railCount', HELIX_RAIL_COUNT));
    // Fog / background
    FOG_DENSITY = pNum('fog.density', FOG_DENSITY);
    BG_COLOR = pHex('fog.color', BG_COLOR);
    // Node vessel size
    ORB_RADIUS = pNum('vessel.radius', ORB_RADIUS);
    ORB_SEGMENTS = Math.round(pNum('vessel.segments', ORB_SEGMENTS));
    // Materia node-field
    MATERIA_FIELD_PARTICLES = Math.round(
      pNum('materia.particles', MATERIA_FIELD_PARTICLES),
    );
    MATERIA_FIELD_SIZE_MIN = pNum('materia.sizeMin', MATERIA_FIELD_SIZE_MIN);
    MATERIA_FIELD_SIZE_MAX = pNum('materia.sizeMax', MATERIA_FIELD_SIZE_MAX);
    IMPLODE_EXPLODE_FREQ = pNum('materia.breathFreq', IMPLODE_EXPLODE_FREQ);
    IMPLODE_EXPLODE_AMP = pNum('materia.breathAmp', IMPLODE_EXPLODE_AMP);
    COLLISION_CHECK_FRACTION = pNum(
      'materia.collisionFraction',
      COLLISION_CHECK_FRACTION,
    );
    // Spiral section colors (mutate the shared palette object in place)
    PHASE_HEX.ELEVATE = pHex('colors.elevate', PHASE_HEX.ELEVATE);
    PHASE_HEX.ALIGN = pHex('colors.align', PHASE_HEX.ALIGN);
    PHASE_HEX.UNLOCK = pHex('colors.unlock', PHASE_HEX.UNLOCK);

    const scene = new THREE.Scene();
    scene.background = immersive ? new THREE.Color(BG_COLOR) : null;
    scene.fog = new THREE.FogExp2(BG_COLOR, FOG_DENSITY);

    // Guard against a zero-dimension container (display:none, not-yet-laid-out,
    // or a 0-height parent) — a 0 height would make camera aspect = w/0 = NaN
    // and corrupt the projection matrix for the whole session.
    const w = container.clientWidth || 1;
    const h = container.clientHeight || 1;

    // Viewport-aware camera Z. The vessel membrane pass made nodes physically
    // larger, so mobile needs a wider camera than the old star-dot framing.
    const cameraZForViewport = (): number =>
      window.innerWidth < 768 ? 16 : 18;

    const camera = new THREE.PerspectiveCamera(
      pNum('camera.fov', 60),
      w / h,
      0.1,
      1000,
    );
    camera.position.set(0, 0, cameraZForViewport());

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, pNum('render.dprCap', 2)),
    );
    renderer.setClearColor(BG_COLOR, immersive ? 1 : 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = pNum('render.exposure', 1.25);
    container.appendChild(renderer.domElement);
    renderer.domElement.style.cursor = 'grab';
    renderer.domElement.style.touchAction = 'none';
    partialDisposers.push(() => {
      renderer.dispose();
      renderer.domElement.remove();
    });

    // --- Post-processing: bloom for star-radiance ---
    // UnrealBloomPass amplifies the brightest emissive pixels (above threshold)
    // into a soft halo — what makes the nodes read as actual stars rather than
    // just colored shapes. Only the immersive page uses bloom, so the composer is
    // built from a dynamically-imported module (its addon code is a separate
    // chunk). `composer` is reassigned when that import resolves; the render loop
    // already falls back to renderer.render() until then, so the helix shows
    // immediately and bloom fades in a frame later. `bloomResize` lets onResize
    // resize the composer + bloom pass without holding a direct bloomPass ref.
    let composer: EffectComposer | null = null;
    let bloomResize: ((w: number, h: number) => void) | null = null;
    let disposeComposer: () => void = () => {};
    if (immersive) {
      import('./spiral-postprocessing')
        .then(({ createBloomComposer }) => {
          const built = createBloomComposer(renderer, scene, camera, w, h, {
            strength: pNum('bloom.strength', 0.5),
            radius: pNum('bloom.radius', 0.4),
            threshold: pNum('bloom.threshold', 0.72),
          });
          composer = built.composer;
          bloomResize = built.setSize;
          disposeComposer = built.dispose;
          // A resize may have fired before the import resolved — sync to current.
          built.setSize(
            container.clientWidth || w,
            container.clientHeight || h,
          );
        })
        .catch((err) => {
          // Non-fatal: bloom is an enhancement. Loop keeps using renderer.render().
          console.error('[spiral] bloom post-processing failed to load:', err);
        });
    }
    partialDisposers.push(() => disposeComposer());

    // --- Lighting ---
    scene.add(new THREE.AmbientLight(0xffffff, pNum('lighting.ambient', 1.0)));
    const keyLight = new THREE.PointLight(
      0x119a9e,
      pNum('lighting.keyIntensity', 2.2),
      60,
    );
    keyLight.position.set(8, 12, 15);
    scene.add(keyLight);
    const fillLight = new THREE.PointLight(
      0xc9a96e,
      pNum('lighting.fillIntensity', 1.0),
      40,
    );
    fillLight.position.set(-6, -4, -10);
    scene.add(fillLight);

    // --- Background substrate ---
    // Backside-facing sphere surrounds the camera. Base color is ocean-900
    // (matches scene.background, fog, and --color-ocean-900 page bg — no seam).
    // Three slow drifting aurora waves layered on top in subtle (~0.06 max)
    // amplitude paint endlessly-changing chromatic substrate. admin/user
    // 2026-04-25: "subtle layers of generative substrate colors that change
    // endlessly". Fog disabled on this material so the sky always reads as
    // the deep ocean the spiral hangs in, regardless of helix-line fog tinting.
    let bgUniforms: {
      uTime: { value: number };
      uBase: { value: THREE.Color };
    } | null = null;
    let bgGeometry: THREE.SphereGeometry | null = null;
    let bgMaterial: THREE.ShaderMaterial | null = null;

    if (immersive) {
      bgUniforms = {
        uTime: { value: 0 },
        uBase: { value: new THREE.Color(BG_COLOR) },
      };
      bgMaterial = new THREE.ShaderMaterial({
        uniforms: bgUniforms,
        side: THREE.BackSide,
        depthWrite: false,
        depthTest: false,
        fog: false,
        vertexShader: `
      varying vec2 vUv;
      varying vec3 vWorldDir;
      void main() {
        vUv = uv;
        vWorldDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
        fragmentShader: `
      uniform float uTime;
      uniform vec3 uBase;
      varying vec2 vUv;
      varying vec3 vWorldDir;

      // Subtle chakra-spectrum hues for substrate drift. Keep saturation low
      // so the base (ocean-900) reads as the dominant tone everywhere.
      const vec3 SACRAL  = vec3(1.00, 0.40, 0.24);   // warm orange
      const vec3 HEART   = vec3(0.31, 0.82, 0.35);   // green
      const vec3 THROAT  = vec3(0.24, 0.66, 0.96);   // sky blue
      const vec3 INDIGO  = vec3(0.42, 0.30, 0.84);   // indigo
      const vec3 CROWN   = vec3(0.79, 0.49, 0.91);   // soft violet

      void main() {
        // Three independent slow waves, different spatial freqs + drift speeds.
        float t = uTime;
        float w1 = 0.5 + 0.5 * sin(vUv.y * 5.2 + t * 0.040 + vUv.x * 1.1);
        float w2 = 0.5 + 0.5 * sin(vUv.x * 3.7 - t * 0.027 + vUv.y * 1.6);
        float w3 = 0.5 + 0.5 * sin((vUv.x + vUv.y) * 2.4 + t * 0.060);
        float w4 = 0.5 + 0.5 * cos(vUv.y * 1.8 + t * 0.018 - vUv.x * 0.7);

        // Layered aurora colors. Each layer is a chakra mix modulated by a
        // wave so the chromatic structure drifts endlessly (no exact repeat
        // because the wave frequencies are coprime).
        vec3 layerA = mix(THROAT, INDIGO, w1);
        vec3 layerB = mix(HEART,  CROWN,  w2);
        vec3 layerC = mix(SACRAL, INDIGO, w3);

        vec3 aurora = layerA * 0.010
                    + layerB * 0.007
                    + layerC * 0.006;
        // Pole/equator falloff so the substrate concentrates near the horizon
        // (where the eye lingers) and fades toward zenith/nadir.
        float poleFalloff = 1.0 - pow(abs(vWorldDir.y), 2.5);
        aurora *= (0.40 + 0.35 * poleFalloff) * (0.65 + 0.25 * w4);

        gl_FragColor = vec4(uBase + aurora, 1.0);
      }
    `,
      });
      bgGeometry = new THREE.SphereGeometry(80, 48, 24);
      const bgMesh = new THREE.Mesh(bgGeometry, bgMaterial);
      bgMesh.renderOrder = -1000; // before everything else
      scene.add(bgMesh);
    }

    // --- Controls ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = pNum('camera.damping', 0.05);
    controls.autoRotate = pBool('camera.autoRotate', true);
    controls.autoRotateSpeed = pNum('camera.autoRotateSpeed', 0.4);
    // The hero must keep a stable, composed scene frame while the page scrolls.
    // OrbitControls zoom turns ordinary wheel/trackpad scroll into camera dolly,
    // which lets node-world geometry fill and clip across the whole viewport.
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.minDistance = 8;
    controls.maxDistance = 40;
    partialDisposers.push(() => controls.dispose());

    // --- Build spatial path ---
    // Default helix remains the shipped surface; #99 adds an opt-in
    // constellation projection without changing node structure, materials, or
    // physics.
    // Boot-resolved geometry config (the registry-overwritten `let`s above) is
    // passed to the path builders by value — module imports are read-only, so
    // they can't read the reassigned globals across the file boundary.
    const pathCfg: PathConfig = {
      turns: TURNS,
      height: HELIX_HEIGHT,
      steps: PATH_STEPS,
      extend: PATH_EXTEND,
      extendTop: PATH_EXTEND_TOP,
      constellationTail: CONSTELLATION_TAIL,
    };
    const path = buildSpiralPath(layout, nodes.length, pathCfg);

    // Phase-colored line with vertex fade at extensions.
    // We retain BASE colors separately so the animation loop can multiply a
    // traveling-pulse mask on top — gives the spiral itself a sense of FLOW
    // (the connective tissue between nodes was previously inert; admin 2026-04-25
    // "the nodes & the spiral line i want it to have more life").
    const helixGeo = new THREE.BufferGeometry().setFromPoints(path);
    const helixBaseColors = new Float32Array(path.length * 3);
    const helixLiveColors = new Float32Array(path.length * 3);
    const phaseC = {
      ELEVATE: new THREE.Color(PHASE_HEX.ELEVATE),
      ALIGN: new THREE.Color(PHASE_HEX.ALIGN),
      UNLOCK: new THREE.Color(PHASE_HEX.UNLOCK),
    };
    const totalRange = 1 + PATH_EXTEND + PATH_EXTEND_TOP;
    for (let i = 0; i < path.length; i++) {
      const p = -PATH_EXTEND + (i / path.length) * totalRange;
      const c =
        p < 5 / 13
          ? phaseC.ELEVATE
          : p < 11 / 13
            ? phaseC.ALIGN
            : phaseC.UNLOCK;

      // Cubic fade at extensions — line dissolves before fog boundary
      let fade = 1.0;
      if (p < 0) {
        fade = Math.max(0, (p + PATH_EXTEND) / PATH_EXTEND);
        fade = fade * fade * fade;
      } else if (p > 1) {
        fade =
          PATH_EXTEND_TOP > 0 ? Math.max(0, 1 - (p - 1) / PATH_EXTEND_TOP) : 0;
        fade = fade * fade * fade;
      }

      helixBaseColors[i * 3] = c.r * fade;
      helixBaseColors[i * 3 + 1] = c.g * fade;
      helixBaseColors[i * 3 + 2] = c.b * fade;
      // Initialize live buffer at base; loop will modulate.
      helixLiveColors[i * 3] = helixBaseColors[i * 3];
      helixLiveColors[i * 3 + 1] = helixBaseColors[i * 3 + 1];
      helixLiveColors[i * 3 + 2] = helixBaseColors[i * 3 + 2];
    }
    helixGeo.setAttribute(
      'color',
      new THREE.BufferAttribute(helixLiveColors, 3),
    );
    const helixLineMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      // admin 2026-06-22 #17: "the spiral shape itself needs to be more
      // visually prominent — immediately recognizable on landing." Bumped
      // 0.7 -> 0.92 so the connecting spiral path reads boldly, not as a
      // faint thread behind the nodes.
      opacity: pNum('helixLine.opacity', 0.92),
    });
    const helixLine = new THREE.Line(helixGeo, helixLineMat);
    scene.add(helixLine);

    const helixRails = Array.from({ length: HELIX_RAIL_COUNT }, (_, i) =>
      buildHelixRail(path, nodes, i),
    );
    helixRails.forEach((rail) => scene.add(rail.line));

    // --- Bold spiral tube (admin 2026-06-23 "it doesnt appear as much") ---
    // The helix line above is a THREE.Line: its width is GPU-clamped to a 1px
    // hairline on virtually all platforms (the 0.92 opacity bump did nothing for
    // presence), so at spiral framing the shape barely read. A real TubeGeometry
    // gives the spiral visible BODY + bloom glow ("a lil more glowwy") WITHOUT
    // reintroducing the geometric node SHELLS (spiralVesselMode stays
    // 'invisible' — those shells were the white-spike "disaster"). Additive
    // blending + cubic end-fade-to-black make the tube glow and dissolve into
    // the cosmos exactly like the line, never a hard-cut stub.
    const tubeCurve = new THREE.CatmullRomCurve3(
      path,
      false,
      'catmullrom',
      0.0,
    );
    const tubeSegments = path.length - 1;
    const tubeRadialSegs = Math.round(pNum('helixTube.radialSegs', 8));
    const tubeGeo = new THREE.TubeGeometry(
      tubeCurve,
      tubeSegments,
      pNum('helixTube.radius', 0.05), // radius — ~1/12 of the smallest node, reads as a confident line
      tubeRadialSegs,
      false,
    );
    const tubeColors = new Float32Array(tubeGeo.attributes.position.count * 3);
    const ringStride = tubeRadialSegs + 1;
    for (let i = 0; i <= tubeSegments; i++) {
      const idx = Math.min(i, path.length - 1);
      // Reuse the exact phase color + extension fade computed for the line, so
      // the tube and core line agree segment-for-segment.
      const r = helixBaseColors[idx * 3]!;
      const g = helixBaseColors[idx * 3 + 1]!;
      const b = helixBaseColors[idx * 3 + 2]!;
      for (let j = 0; j < ringStride; j++) {
        const v = (i * ringStride + j) * 3;
        tubeColors[v] = r;
        tubeColors[v + 1] = g;
        tubeColors[v + 2] = b;
      }
    }
    tubeGeo.setAttribute('color', new THREE.BufferAttribute(tubeColors, 3));
    const tubeMat = new THREE.MeshBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: pNum('helixTube.opacity', 0.55),
      blending: pBool('helixTube.additive', true)
        ? THREE.AdditiveBlending
        : THREE.NormalBlending,
      depthWrite: false,
    });
    const spiralTube = new THREE.Mesh(tubeGeo, tubeMat);
    scene.add(spiralTube);

    // --- Orb meshes ---
    // Per admin's 2026-04-25 feedback, two variants ship side-by-side:
    //   variant='symbols'  →  13 unique sacred symbols spanning 8+ traditions
    //   variant='stars'    →  generative star structures with refracted-light material
    // Both honour the chakra-spectrum coloring (root→crown, bottom→top).
    // Perf instrumentation + A/B toggle (internal, URL-gated — harmless in prod,
    // like ?tune). ?perf=1 logs avg materia-loop ms/frame to the console every
    // 120 frames; ?legacyContainment=1 skips the per-icon BVH build so the
    // brute-force-raycast cost can be measured against the accelerated default.
    const PERF_LOG = new URLSearchParams(location.search).get('perf') === '1';
    const LEGACY_CONTAINMENT =
      new URLSearchParams(location.search).get('legacyContainment') === '1';

    const variantGeometries: THREE.BufferGeometry[] = [];
    const orbMeshes: THREE.Mesh[] = [];
    const boundaryMeshes: THREE.Mesh[] = [];
    const vesselGroups: THREE.Group[] = [];
    const containmentMeshes: THREE.Mesh[] = [];
    const orbGroups: THREE.Group[] = [];
    const labelSprites: THREE.Sprite[] = [];
    // Per-node hover excitement (0..1, eased) — drives label fade, scale
    // swell, emissive ignition, thermal/behavior amplification, extra spin.
    const hoverEnergy: number[] = [];
    // Accumulated extra Y-rotation while excited (additive — no snap when
    // hover starts/ends, unlike multiplying the absolute t-based rotation).
    const hoverSpinY: number[] = [];
    const basePositions: THREE.Vector3[] = [];
    const disposables: THREE.Material[] = [];
    const texturesToDispose: THREE.Texture[] = [];
    const animParams: OrbAnimParams[] = [];
    const nodeColorList: THREE.Color[] = [];
    const UP = new THREE.Vector3(0, 1, 0);

    // Per-node phase particle systems — each node gets its own list of
    // physics-simulated PhaseParticles plus geometry buffers for rendering.
    const nodePhaseParticles: PhaseParticle[][] = [];
    const nodePhasePositions: Float32Array[] = [];
    const nodePhaseColors: Float32Array[] = [];
    const nodePhaseSizes: Float32Array[] = [];
    const nodePhaseGeometries: THREE.BufferGeometry[] = [];
    const nodeWorlds: IconWorld[] = [];

    // Legacy planet arrays — kept declared (empty) so animation loop's
    // forEach iterations are safe no-ops while the planet-system code is
    // disabled in favour of the phase-particle physics.
    const planetMeshes: THREE.Mesh[][] = [];
    const planetParams: PlanetParam[][] = [];
    const planetRingMeshes: (THREE.Mesh | null)[][] = [];
    const sharedPlanetGeo = new THREE.SphereGeometry(1, 8, 6);
    const sharedRingGeo = new THREE.RingGeometry(1.0, 1.2, 8);

    // Hoisted soft-dot texture — used by aura AND the per-node phase field.
    const softDotTex = createSoftDotTexture();
    texturesToDispose.push(softDotTex);

    // loadSalt fixed at init so every page load gives a fresh but stable unique
    // manifestation. Used by lineageHash for both icon geometry and planet RNG.
    const loadSalt = Math.floor(performance.now() * 1000) & 0xfffff;

    // Life-motion laws — the generative law layer. EnvVar (structure) ×
    // IconWorld (matter) → bounded motion coefficients. The renderer
    // CONSUMES these; it must not invent per-node behavior inline by index.
    const nodeLaws: LifeMotionLaw[] = nodes.map((node) =>
      deriveLifeMotionLaw(node.envVar, worldFor(node.id)),
    );

    nodes.forEach((node, i) => {
      const t = nodes.length > 1 ? i / (nodes.length - 1) : 0;
      const idx = nodePathIndex(t, path.length, PATH_EXTEND, PATH_EXTEND_TOP);
      const pos = path[idx].clone();

      const live = node.status === 'live';
      const world = worldFor(node.id);
      nodeWorlds.push(world);
      const law = nodeLaws[i]!;
      const accentLeadHex =
        world.accentPalette[i % world.accentPalette.length] ??
        world.accentPalette[0] ??
        0xffffff;
      // Key the chakra color off the stable node.id (canonical 1..N order),
      // NOT the loop index `i` — the world/universe below are keyed by
      // `node.id`, so a filtered or reordered node list must not give a node
      // its color by spiral position while its world stays bound to structure.
      const nodeColor = chakraColorForNode(
        node.id - 1,
        CANONICAL_NODE_COUNT,
      ).lerp(new THREE.Color(accentLeadHex), pNum('colors.accentBlend', 0.32));
      nodeColorList.push(nodeColor);
      const phase = node.phase;
      const pm = PHASE_MAT[phase] || PHASE_MAT.ELEVATE;
      const pa = PHASE_ANIM[phase] || PHASE_ANIM.ELEVATE;

      // Per-node geometry — symbol mapping or generative star, depending on variant.
      // Depth bumped 0.18 → 0.45 so the icon has real 3D INTERIOR volume — the
      // container that holds the universe. User 2026-04-25: "icon and inside
      // that 3dimensional perimeter a universe — the materia cant pass the icon's
      // substrate". Materia field below uses raycast inside-test against this
      // mesh so particles physically cannot escape the icon outline.
      //
      // PROPOSAL C (2026-04-26): Each node = ideal form (envVar) × lens × lineage
      // hash. Lens (structural position) transforms the mathematical constraints;
      // hash provides per-node unique jitter. NOT fixed shapes, NOT random.
      // "We fraction and factor" — 13 prime × 7 lenses = bounded possibility space.
      const nodeLens = primaryLensForNode(i, node.phase);
      const nodeHash = lineageHash(
        node.id,
        node.phase,
        node.pillarSlug,
        0,
        loadSalt,
      );
      const geo =
        variant === 'stars'
          ? generativeStarGeometry(node.id, ORB_RADIUS, ORB_RADIUS * 0.45)
          : makeGeometryFromPrimitives(
              node.envVar,
              node.id,
              ORB_RADIUS,
              ORB_RADIUS * 0.9, // deeper extrude — a dimensional volume to fill, not a flat prism that smears edge-on
              nodeLens,
              nodeHash,
            );
      variantGeometries.push(geo);

      const sheenColor = nodeColor.clone().lerp(new THREE.Color(0xffffff), 0.4);
      // Two emissive recipes:
      //   starsEmissive   — chakra color stays SATURATED (lerp 0.30) so each star
      //                     reads as its own distinct color even after bloom whitens
      //                     the core. admin 2026-04-25: "make the colors super
      //                     distinct / brighter" — was 0.55 (too washed).
      //   symbolsEmissive — chakra-forward core with only a light white lift.
      //                     Was 0.55 (admin 2026-06-22: near-camera nodes blew
      //                     out as big WHITE spiky shapes — "disaster"). Dropped to
      //                     0.30 so every node reads as its own glowing colored
      //                     universe at any depth, matching the small far stars she
      //                     loves ("the lil universe ones"), not a white smear.
      const starsEmissive = nodeColor
        .clone()
        .lerp(new THREE.Color(0xffffff), pNum('emissive.saturation', 0.3));
      const symbolsEmissive = nodeColor
        .clone()
        .lerp(new THREE.Color(0xffffff), pNum('emissive.saturation', 0.3));

      let mat: THREE.MeshPhysicalMaterial;
      if (variant === 'stars') {
        // Refracted-light-on-gateway aesthetic — admin's visual reference. Each star
        // is a translucent prism: light passes through, refracts at gateway-IOR, with
        // chromatic dispersion + iridescence painting per-node optical signatures.
        // Per-node param jitter (seeded by node.id) keeps every star optically distinct.
        const opticRng = mulberry32(node.id * 4513 + 211);
        mat = new THREE.MeshPhysicalMaterial({
          color: nodeColor,
          emissive: starsEmissive, // saturated chakra core (was washed white)
          emissiveIntensity: live ? pNum('emissive.liveStars', 0.38) : 0.5, // base glow; live value overwritten by emissiveBase in loop
          metalness: 0.0,
          roughness: 0.06 + opticRng() * 0.08,
          transparent: true,
          opacity:
            vesselMode === 'refracted-star'
              ? live
                ? 0.42
                : 0.24
              : live
                ? 0.95
                : 0.78,
          transmission: 0.45 + opticRng() * 0.2,
          thickness: 0.45 + opticRng() * 0.5,
          ior: 1.33 + opticRng() * 0.2,
          dispersion: 0.6 + opticRng() * 1.8,
          attenuationColor: nodeColor,
          attenuationDistance: 1.2 + opticRng() * 1.4,
          clearcoat: 1.0,
          clearcoatRoughness: 0.03 + opticRng() * 0.06,
          iridescence: 0.55 + opticRng() * 0.3,
          iridescenceIOR: 1.3 + opticRng() * 0.4,
          sheen: 0.7,
          sheenColor: sheenColor,
          sheenRoughness: 0.25,
        });
      } else {
        // Variant A — sacred symbols: keep the V3 chakra-orb material with
        // phase-driven texture maps so each tradition reads at silhouette + close-up.
        const albedoTex = generatePhaseTexture(phase, i);
        const normalTex = generatePhaseNormalMap(phase, i);
        texturesToDispose.push(albedoTex, normalTex);
        mat = new THREE.MeshPhysicalMaterial({
          color: nodeColor,
          map: albedoTex,
          normalMap: normalTex,
          normalScale: new THREE.Vector2(pm.normalStrength, pm.normalStrength),
          emissive: symbolsEmissive, // mostly white core with chakra tint
          emissiveIntensity: live ? pNum('emissive.liveSymbols', 0.38) : 0.3, // base glow; live value overwritten by emissiveBase in loop
          metalness: pm.metalness,
          roughness: pm.roughness,
          transparent: true,
          opacity: meshVisible
            ? live
              ? pNum('vessel.visibleOpacity', 0.22)
              : 0.12
            : live
              ? 0.92
              : 0.7,
          clearcoat: 1.0,
          clearcoatRoughness: pm.clearcoatRoughness,
          iridescence: pm.iridescence,
          iridescenceIOR: pm.iridescenceIOR,
          transmission: meshVisible ? 0.52 : 0.0,
          thickness: meshVisible ? 0.58 : 0.0,
          ior: 1.36,
          attenuationColor: nodeColor,
          attenuationDistance: 1.1,
          sheen: pm.sheen,
          sheenColor: sheenColor,
          sheenRoughness: pm.sheenRoughness,
          depthWrite: !meshVisible,
          side: THREE.DoubleSide,
        });
      }
      disposables.push(mat);

      const mesh = new THREE.Mesh(geo, mat);
      mesh.userData = node;
      // Vessel visibility — driven by the VesselMode the caller passed.
      // The filled mesh remains the raycast/click target and spawn-volume
      // reference. In hybrid mode it does not color-write: the boundary is
      // known by the echo-line membrane, while the generated world is the
      // contained matter inside that line.
      mat.colorWrite = vesselMode !== 'hybrid';
      mesh.visible = meshVisible;
      const boundaryMat = new THREE.MeshBasicMaterial({
        color: nodeColor.clone().lerp(new THREE.Color(0xffffff), 0.08),
        transparent: true,
        opacity: vesselMode === 'invisible' ? 0 : live ? 0.42 : 0.2,
        wireframe: true,
        depthWrite: false,
        depthTest: false,
        blending: THREE.NormalBlending,
      });
      disposables.push(boundaryMat);
      const boundaryMesh = new THREE.Mesh(geo, boundaryMat);
      boundaryMesh.visible = meshVisible;
      boundaryMesh.renderOrder = 7;
      boundaryMesh.scale.setScalar(1.035);

      const vesselGroup = new THREE.Group();
      vesselGroup.add(mesh);
      vesselGroup.add(boundaryMesh);

      // Collision/probe mesh stays in local icon coordinates. Runtime particles
      // are also simulated in this local frame, then the vesselGroup transform
      // rotates/breathes both matter and boundary together.
      const containmentMesh = new THREE.Mesh(geo, mat);
      containmentMesh.matrixWorld.identity();
      containmentMesh.updateMatrixWorld(true);
      // Accelerate the per-frame containment raycast with a per-icon BVH. The
      // `indirect` BVH keeps its own triangle ordering, so the shared rendered
      // `geo` index is never mutated — identical pixels, just O(log n) casts.
      // Only this probe mesh gets acceleratedRaycast; the visible mesh + hover
      // picking are untouched. ?legacyContainment=1 skips it for A/B timing.
      if (!LEGACY_CONTAINMENT) {
        geo.computeBoundsTree({ indirect: true });
        containmentMesh.raycast = acceleratedRaycast;
      }

      const group = new THREE.Group();
      group.position.copy(pos);
      group.add(vesselGroup);

      const label = makeLabelSprite(node.name, !live);
      label.position.set(0, -(ORB_RADIUS + 0.55), 0);
      const labelMat = label.material as THREE.SpriteMaterial;
      if (labelMat.map) texturesToDispose.push(labelMat.map);
      disposables.push(labelMat);
      // 'hover' mode: names materialize with hoverEnergy (start hidden);
      // 'always' mode: permanent labels (prior ship state / touch fallback).
      labelMat.opacity = effLabelMode === 'hover' ? 0 : 1;
      labelSprites.push(label);
      group.add(label);

      // --- Planet system for this node ---
      // Per-node universe: iconologically themed character determines WHAT each
      // universe IS (materia, palette, layout, inclination). Lineage hash
      // determines HOW each planet manifests within that universe — unique per
      // planet via physics-seeded RNG. "one creates and one destroys, both are
      // spectacular" — physics (emissiveMul/sizeMul) determines which is which.
      const universe = universeFor(node.id);
      const materia = MATERIA[universe.materia];
      const creationSystem = isCreationMateria(universe.materia);
      const basePalette: THREE.Color[] = universe.palette.map(
        (hex) => new THREE.Color(hex),
      );
      const palette: THREE.Color[] = blendWorldPalette(
        basePalette,
        world.accentPalette,
        nodeColor,
      );

      // (No central sun — it dominated bloom and obscured the system. The
      // contained particles ARE the universe.)

      const planetCount = ENABLE_LEGACY_PLANETS ? universe.planetCount : 0;
      const nodePlanets: THREE.Mesh[] = [];
      const nodePlanetParams: PlanetParam[] = [];
      const nodeRings: (THREE.Mesh | null)[] = [];

      for (let p = 0; p < planetCount; p++) {
        // Per-planet lineage RNG — unique seed from structural position.
        // nodeId + phase + pillarSlug + planetIdx + loadSalt = deterministic,
        // per-load, maximally unique. Every planet in every system is different.
        const planetHash = lineageHash(
          node.id,
          node.phase,
          node.pillarSlug,
          p,
          loadSalt,
        );
        const planetRng = mulberry32(planetHash);

        // Stagger semi-major axis across the available range — system + outer
        // planets give the system visible depth.
        const tRad = planetCount > 1 ? p / (planetCount - 1) : 0.5;
        const jitter = 1.0 + (planetRng() - 0.5) * 0.3;
        const semiMajorRaw =
          (PLANET_ORBIT_MIN + tRad * (PLANET_ORBIT_MAX - PLANET_ORBIT_MIN)) *
          jitter;
        // Eccentricity 0..PLANET_ECCENTRICITY_MAX; outer orbits tend more elliptical.
        const eccentricity =
          planetRng() *
          planetRng() *
          PLANET_ECCENTRICITY_MAX *
          (0.4 + tRad * 0.6);
        const argPeriapsis = planetRng() * Math.PI * 2;
        const orbitSpeedRaw =
          PLANET_ORBIT_SPEED_MIN +
          planetRng() * (PLANET_ORBIT_SPEED_MAX - PLANET_ORBIT_SPEED_MIN);
        // Kepler-ish: system planets faster, outer planets slower (a^-3/2 hand-wave).
        const keplerBoost = Math.pow(0.55 / Math.max(0.1, semiMajorRaw), 0.5);
        const orbitSpeed = orbitSpeedRaw * universe.speedMul * keplerBoost;
        // Nano-to-macro size range — power-law biases toward smaller sizes;
        // outermost planet gets the materia's maxSizeMul boost for "giant" bodies.
        const sizeT = Math.pow(planetRng(), 1.6);
        const isGiant = p === planetCount - 1 && planetRng() < 0.55;
        const giantBoost = isGiant ? materia.maxSizeMul : 1.0;
        const sizeBase =
          (PLANET_RADIUS_MIN +
            sizeT * (PLANET_RADIUS_MAX - PLANET_RADIUS_MIN)) *
          materia.sizeMul *
          giantBoost;

        // CONTAINMENT CLAMP — apoapsis + planet body must stay inside ORB_CONTAINMENT_R.
        const safeSize = sizeBase * 1.45;
        const maxSemiMajor = Math.max(
          0.025,
          (ORB_CONTAINMENT_R - safeSize) / (1 + eccentricity),
        );
        const semiMajor = Math.min(semiMajorRaw, maxSemiMajor);

        // Unique color per planet: palette rotation + per-planet hue jitter so
        // no two planets in the same system are exact duplicates.
        const baseColor = palette[p % palette.length].clone();
        const hsl = { h: 0, s: 0, l: 0 };
        baseColor.getHSL(hsl);
        const planetColor = new THREE.Color().setHSL(
          (hsl.h + (planetRng() - 0.5) * 0.05 + 1) % 1,
          Math.min(1, hsl.s * (0.85 + planetRng() * 0.3)),
          Math.min(0.85, hsl.l * (0.85 + planetRng() * 0.3)),
        );

        // Creation/destruction material — physics determines role, not aesthetics.
        // "one creates and one destroys, both are spectacular." Creation (high
        // energy density) glows additively; destruction (collapse/endurance) is
        // dark and absorbing. Physics derivation: emissiveMul/sizeMul > 1.0, plus
        // gas (fills space = expansion = creation) and organic (bloom = creation).
        let planetMat: THREE.Material;
        if (creationSystem) {
          planetMat = new THREE.MeshBasicMaterial({
            color: planetColor.clone().lerp(new THREE.Color(0xffffff), 0.2),
            transparent: true,
            opacity: Math.min(1.0, (live ? 0.95 : 0.55) * materia.emissiveMul),
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          });
        } else {
          // Destruction: dark, absorbing, complementary hue. The void consuming light.
          const destHsl = { h: 0, s: 0, l: 0 };
          planetColor.getHSL(destHsl);
          const darkColor = new THREE.Color().setHSL(
            (destHsl.h + 0.5) % 1,
            Math.max(0, destHsl.s - 0.3),
            Math.max(0.05, destHsl.l - 0.4),
          );
          planetMat = new THREE.MeshStandardMaterial({
            color: darkColor,
            emissive: darkColor.clone().multiplyScalar(0.15),
            emissiveIntensity: live ? 0.3 : 0.1,
            roughness: 0.3,
            metalness: 0.4,
            transparent: true,
            opacity: Math.min(1.0, (live ? 0.85 : 0.45) * materia.emissiveMul),
            depthWrite: false,
          });
        }
        disposables.push(planetMat);

        const planet = new THREE.Mesh(sharedPlanetGeo, planetMat);
        planet.scale.setScalar(sizeBase);
        planet.position.set(semiMajor * (1 - eccentricity), 0, 0);
        planet.renderOrder = 5;
        vesselGroup.add(planet);
        nodePlanets.push(planet);

        // Orbital geometry: inclination + ascending node from universe character.
        // Inclination styles: coplanar (disk), random (3D chaos), orthogonal
        // (0/90° alternating), cardinal (each planet on different cardinal plane).
        let incl = 0;
        let asc = 0;
        if (universe.inclination === 'random') {
          incl = (planetRng() - 0.5) * Math.PI * 0.7;
          asc = planetRng() * Math.PI * 2;
        } else if (universe.inclination === 'orthogonal') {
          incl = p % 2 === 0 ? 0 : Math.PI / 2;
        } else if (universe.inclination === 'cardinal') {
          asc = (p / Math.max(1, planetCount)) * Math.PI * 2;
        }
        // Retrograde suppression for structured layouts (pair/cardinal/sextet).
        const allowRetrograde = universe.layout === 'free';
        const direction = allowRetrograde && planetRng() < 0.4 ? -1 : 1;

        // Initial orbital phase: pair (180° apart), cardinal/sextet (even spread),
        // free (random from lineage hash).
        let orbitPhase = planetRng() * Math.PI * 2;
        if (universe.layout === 'pair' && planetCount === 2) {
          orbitPhase = p === 0 ? 0 : Math.PI;
        }

        const params: PlanetParam = {
          semiMajor,
          eccentricity,
          argPeriapsis,
          orbitSpeed: orbitSpeed * direction,
          orbitPhase,
          inclination: incl,
          ascendingNode: asc,
          size: sizeBase,
          spinSpeed: (0.8 + planetRng() * 2.2) * (planetRng() < 0.5 ? -1 : 1),
          hasRing: planetRng() < universe.ringChance * materia.ringChanceMul,
        };
        nodePlanetParams.push(params);

        // --- Visible orbital trail ---
        // Elliptical orbit path as an additive line. All orbits show trails
        // (math: trail is precomputed from stable orbital parameters, not from
        // real-time position — always visible regardless of eccentricity).
        const trailPts: THREE.Vector3[] = [];
        const b =
          semiMajor * Math.sqrt(Math.max(0, 1 - eccentricity * eccentricity));
        const cosWp = Math.cos(argPeriapsis);
        const sinWp = Math.sin(argPeriapsis);
        const ci0 = Math.cos(incl);
        const si0 = Math.sin(incl);
        const ca0 = Math.cos(asc);
        const sa0 = Math.sin(asc);
        for (let s = 0; s <= ORBIT_TRAIL_SEGMENTS; s++) {
          const ang = (s / ORBIT_TRAIL_SEGMENTS) * Math.PI * 2;
          const xe = semiMajor * (Math.cos(ang) - eccentricity);
          const ye = b * Math.sin(ang);
          const xr = xe * cosWp - ye * sinWp;
          const yr = xe * sinWp + ye * cosWp;
          const lx = xr;
          const ly = yr * si0;
          const lz = yr * ci0;
          trailPts.push(
            new THREE.Vector3(lx * ca0 - lz * sa0, ly, lx * sa0 + lz * ca0),
          );
        }
        const trailGeo = new THREE.BufferGeometry().setFromPoints(trailPts);
        // Trail color: creation = bright additive; destruction = dark subtle trace.
        const trailColor = creationSystem
          ? planetColor.clone().lerp(new THREE.Color(0xffffff), 0.3)
          : planetColor.clone().lerp(new THREE.Color(0x000000), 0.4);
        const trailMat = new THREE.LineBasicMaterial({
          color: trailColor,
          transparent: true,
          opacity: live ? 0.18 + sizeT * 0.2 : 0.08,
          blending: creationSystem
            ? THREE.AdditiveBlending
            : THREE.NormalBlending,
          depthWrite: false,
        });
        disposables.push(trailMat);
        const trail = new THREE.LineLoop(trailGeo, trailMat);
        trail.renderOrder = 4;
        vesselGroup.add(trail);
        variantGeometries.push(trailGeo);

        // Saturn-style ring — same creation/destruction style as planet.
        if (params.hasRing) {
          const ringColor = creationSystem
            ? planetColor.clone().lerp(new THREE.Color(0xffffff), 0.45)
            : planetColor.clone().lerp(new THREE.Color(0x000000), 0.35);
          const ringMat = new THREE.MeshBasicMaterial({
            color: ringColor,
            transparent: true,
            opacity: live
              ? creationSystem
                ? 0.85
                : 0.7
              : creationSystem
                ? 0.4
                : 0.25,
            side: THREE.DoubleSide,
            blending: creationSystem
              ? THREE.AdditiveBlending
              : THREE.NormalBlending,
            depthWrite: false,
          });
          disposables.push(ringMat);
          const ring = new THREE.Mesh(sharedRingGeo, ringMat);
          ring.rotation.x = Math.PI / 2 + (planetRng() - 0.5) * 0.4;
          ring.renderOrder = 5;
          planet.add(ring);
          nodeRings.push(ring);
        } else {
          nodeRings.push(null);
        }
      }
      planetMeshes.push(nodePlanets);
      planetParams.push(nodePlanetParams);
      planetRingMeshes.push(nodeRings);

      // --- Phase-particle physics field ---
      // Each particle has phase (gas/liquid/solid) drawn from the materia's
      // PHASE_MIX. Initial position is sampled INSIDE the icon's actual mesh
      // via raycast inside-test, so particles spawn within the substrate.
      // Per-frame physics (loop below): gravity by phase, central
      // implode/explode oscillation, container reflection bounce.
      const fieldRng = lawRng(law, loadSalt ^ 0x9907);
      const phaseMix = phaseMixForWorld(world);
      const worldSizeMul = WORLD_SIZE_BIAS[world.sizeBias];
      // Particle budget scaled by the law's density hint — vault worlds
      // spend their budget on fewer, larger bodies; micro worlds fill up.
      const fieldBudget = Math.max(
        1,
        Math.round(MATERIA_FIELD_PARTICLES * (0.55 + 0.45 * law.density)),
      );

      // Raycast setup for inside-test (mesh-local frame, mesh not yet in scene)
      containmentMesh.matrixWorld.identity();
      containmentMesh.updateMatrixWorld(true);
      geo.computeBoundingBox();
      const bbox = geo.boundingBox!;
      const bboxMin = bbox.min;
      const bboxRange = new THREE.Vector3().subVectors(bbox.max, bbox.min);
      const insideRaycaster = new THREE.Raycaster();
      const candidatePos = new THREE.Vector3();

      const particles: PhaseParticle[] = [];
      const fieldPositions = new Float32Array(MATERIA_FIELD_PARTICLES * 3);
      const fieldColors = new Float32Array(MATERIA_FIELD_PARTICLES * 3);
      const fieldSizes = new Float32Array(MATERIA_FIELD_PARTICLES);

      let kept = 0;
      let attempts = 0;
      const maxAttempts = fieldBudget * 12;
      while (kept < fieldBudget && attempts < maxAttempts) {
        candidatePos.set(
          bboxMin.x + fieldRng() * bboxRange.x,
          bboxMin.y + fieldRng() * bboxRange.y,
          bboxMin.z + fieldRng() * bboxRange.z,
        );
        attempts++;
        // Multi-ray majority vote — single-ray parity flips on beveled/holed
        // icon geometry, scattering or trapping spawned particles.
        if (!isInsideMesh(insideRaycaster, containmentMesh, candidatePos)) {
          continue;
        }

        const phase = pickPhase(fieldRng, phaseMix);
        // Size: solids small+dense (stone-like), liquids medium, gases tiny+sparse
        const phaseSizeMul =
          phase === 'solid' ? 1.1 : phase === 'liquid' ? 0.85 : 0.55;
        const sizeT = Math.pow(fieldRng(), 1.6);
        const size =
          (MATERIA_FIELD_SIZE_MIN +
            sizeT * (MATERIA_FIELD_SIZE_MAX - MATERIA_FIELD_SIZE_MIN)) *
          materia.sizeMul *
          phaseSizeMul *
          worldSizeMul;

        // Color: palette + per-phase tint so phases READ distinctly inside one
        // node — Earth vs Saturn metaphor. Gas = brighter + desaturated (luminous
        // vapor). Solid = darker + more saturated (stone). Liquid = neutral mid.
        const baseCol = palette[kept % palette.length];
        const hsl = { h: 0, s: 0, l: 0 };
        baseCol.getHSL(hsl);
        const phaseLit =
          phase === 'gas' ? 0.18 : phase === 'solid' ? -0.18 : 0.02;
        const phaseSat =
          phase === 'gas' ? 0.65 : phase === 'solid' ? 1.1 : 0.95;
        const tinted = new THREE.Color().setHSL(
          (hsl.h + (fieldRng() - 0.5) * 0.06 + 1) % 1,
          Math.min(1, hsl.s * phaseSat * (0.85 + fieldRng() * 0.3)),
          Math.max(
            0.05,
            Math.min(0.95, (hsl.l + phaseLit) * (0.8 + fieldRng() * 0.4)),
          ),
        );

        // Initial velocity: small bias so particles have life from frame 1.
        // Phase determines magnitude (gas energetic, solid still).
        const vMag = phase === 'gas' ? 0.3 : phase === 'liquid' ? 0.15 : 0.04;
        const homePos = candidatePos.clone();
        particles.push({
          pos: candidatePos.clone(),
          vel: new THREE.Vector3(
            (fieldRng() - 0.5) * 2 * vMag + world.gravity.x * 0.12,
            (fieldRng() - 0.5) * 2 * vMag + world.gravity.y * 0.12,
            (fieldRng() - 0.5) * 2 * vMag + world.gravity.z * 0.12,
          ),
          home: homePos,
          phase,
          size,
          baseColor: tinted,
        });
        fieldPositions[kept * 3] = candidatePos.x;
        fieldPositions[kept * 3 + 1] = candidatePos.y;
        fieldPositions[kept * 3 + 2] = candidatePos.z;
        fieldColors[kept * 3] = tinted.r;
        fieldColors[kept * 3 + 1] = tinted.g;
        fieldColors[kept * 3 + 2] = tinted.b;
        fieldSizes[kept] = size * 5.5;
        kept++;
      }
      // Pad unused slots (raycast rejection couldn't fill — thin shape edges)
      for (let f = kept; f < MATERIA_FIELD_PARTICLES; f++) {
        particles.push({
          pos: new THREE.Vector3(),
          vel: new THREE.Vector3(),
          home: new THREE.Vector3(),
          phase: 'gas',
          size: 0,
          baseColor: new THREE.Color(0, 0, 0),
        });
        fieldSizes[f] = 0;
      }

      const fieldGeo = new THREE.BufferGeometry();
      fieldGeo.setAttribute(
        'position',
        new THREE.BufferAttribute(fieldPositions, 3),
      );
      fieldGeo.setAttribute('color', new THREE.BufferAttribute(fieldColors, 3));
      fieldGeo.setAttribute('aSize', new THREE.BufferAttribute(fieldSizes, 1));

      const fieldMat = new THREE.ShaderMaterial({
        uniforms: {
          uOpacity: {
            value:
              (live ? pNum('materia.opacityLive', 0.95) : 0.55) *
              particleOpacityMult,
          },
          uPixelScale: { value: pNum('materia.pixelScale', 620) },
        },
        vertexColors: true,
        transparent: true,
        depthWrite: false,
        blending: THREE.NormalBlending,
        vertexShader: `
          attribute float aSize;
          uniform float uPixelScale;
          varying vec3 vColor;
          void main() {
            vColor = color;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = max(0.0, aSize * uPixelScale / max(1.0, -mvPosition.z));
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          uniform float uOpacity;
          varying vec3 vColor;
          void main() {
            vec2 p = gl_PointCoord - vec2(0.5);
            float d = length(p);
            float core = smoothstep(0.5, 0.08, d);
            float edge = smoothstep(0.5, 0.30, d) * 0.35;
            float alpha = clamp(core + edge, 0.0, 1.0) * uOpacity;
            if (alpha < 0.025) discard;
            gl_FragColor = vec4(vColor, alpha);
          }
        `,
      });
      disposables.push(fieldMat);
      const fieldPoints = new THREE.Points(fieldGeo, fieldMat);
      fieldPoints.renderOrder = 4;
      vesselGroup.add(fieldPoints);
      variantGeometries.push(fieldGeo);

      nodePhaseParticles.push(particles);
      nodePhasePositions.push(fieldPositions);
      nodePhaseColors.push(fieldColors);
      nodePhaseSizes.push(fieldSizes);
      nodePhaseGeometries.push(fieldGeo);

      scene.add(group);
      orbMeshes.push(mesh);
      boundaryMeshes.push(boundaryMesh);
      vesselGroups.push(vesselGroup);
      containmentMeshes.push(containmentMesh);
      orbGroups.push(group);
      hoverEnergy.push(0);
      hoverSpinY.push(0);
      basePositions.push(pos);

      // Helix tangent, normal, binormal for orbital plane
      const idxPrev = Math.max(0, idx - 1);
      const idxNext = Math.min(path.length - 1, idx + 1);
      const tangent = new THREE.Vector3()
        .subVectors(path[idxNext], path[idxPrev])
        .normalize();
      const normal = new THREE.Vector3().crossVectors(tangent, UP).normalize();
      const binormal = new THREE.Vector3()
        .crossVectors(tangent, normal)
        .normalize();

      // Per-node animation parameters.
      // `personality` walks 0..1 root→crown so each node has a chakra-coherent
      // motion signature visible at glance distance: root nodes feel rooted
      // (small orbit, slow rotation, gentle breath); crown nodes feel ethereal
      // (wide orbit, lively rotation, deeper breath). This is the missing piece
      // of "each node has its own environment & physics" — the per-node *physics
      // parameters* were already RNG-jittered, but uniformly. The personality
      // factor adds a *monotonic* gradient so the ascent up the spiral reads as
      // an evolution from grounded → ethereal.
      // Law-salted RNG: the law fixes this world's physics; the per-load
      // salt picks tonight's expression within it — never the exact same
      // loop twice, never a different world.
      const nodeRng = lawRng(law, loadSalt);
      const personality = nodes.length > 1 ? i / (nodes.length - 1) : 0.5;
      const turbo = 0.55 + 1.0 * personality; // 0.55 (root) → 1.55 (crown)
      const breathTurbo = 0.65 + 0.7 * personality; // 0.65 → 1.35
      animParams.push({
        breathFreq: law.lfo.breathFreq * (0.9 + nodeRng() * 0.2),
        breathAmp: Math.min(0.12, law.lfo.breathAmp * breathTurbo),
        breathPhase: nodeRng() * Math.PI * 2,
        emissiveBase: live
          ? variant === 'stars'
            ? pNum('emissive.liveStars', 0.38)
            : pNum('emissive.liveSymbols', 0.38)
          : 0.18,
        emissiveAmp: live ? pa.emissiveAmpLive : pa.emissiveAmpLocked,
        emissiveFreq: law.lfo.shimmerFreq * (0.9 + nodeRng() * 0.2),
        emissivePhase: nodeRng() * Math.PI * 2,
        rotRateX: pa.rotRateX * (0.85 + nodeRng() * 0.3) * turbo,
        rotRateY: pa.rotRateY * (0.85 + nodeRng() * 0.3) * turbo * law.polarity,
        rotRateZ: pa.rotRateZ * (0.85 + nodeRng() * 0.3) * turbo,
        rotPhaseX: nodeRng() * Math.PI * 2,
        rotPhaseY: nodeRng() * Math.PI * 2,
        rotPhaseZ: nodeRng() * Math.PI * 2,
        orbitRadius:
          (ORBIT_RADIUS_MIN +
            nodeRng() * (ORBIT_RADIUS_MAX - ORBIT_RADIUS_MIN)) *
          turbo,
        orbitSpeed:
          (ORBIT_SPEED_MIN + nodeRng() * (ORBIT_SPEED_MAX - ORBIT_SPEED_MIN)) *
          law.polarity,
        orbitPhase: nodeRng() * Math.PI * 2,
        orbitNormal: normal,
        orbitBinormal: binormal,
        driftFreqs: law.lfo.driftFreqs,
        phaseSeed: (law.seed % 6283) / 1000,
      });
    });

    // --- Per-orb aura particles (single Points object, 1 draw call) ---
    // (softDotTex is hoisted earlier — shared with materia field + system shimmer)
    const TOTAL_AURA = nodes.length * AURA_PARTICLES_PER_ORB;
    const auraPositions = new Float32Array(TOTAL_AURA * 3);
    const auraColors = new Float32Array(TOTAL_AURA * 3);
    const auraGeometry = new THREE.BufferGeometry();
    auraGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(auraPositions, 3),
    );
    auraGeometry.setAttribute(
      'color',
      new THREE.BufferAttribute(auraColors, 3),
    );

    const auraParams: AuraParam[] = [];

    nodes.forEach((node, i) => {
      const particleRng = mulberry32(i * 7919 + 41);
      const live = node.status === 'live';
      const visibleCount = live
        ? AURA_PARTICLES_PER_ORB
        : Math.floor(AURA_PARTICLES_PER_ORB / 2);

      for (let j = 0; j < AURA_PARTICLES_PER_ORB; j++) {
        const visible = j < visibleCount;
        auraParams.push({
          radiusBase: visible
            ? AURA_RADIUS_MIN +
              particleRng() * (AURA_RADIUS_MAX - AURA_RADIUS_MIN)
            : 0,
          theta0: particleRng() * Math.PI * 2,
          phi0: particleRng() * Math.PI,
          orbitSpeed: 0.15 + particleRng() * 0.4,
          driftFreq: 0.3 + particleRng() * 0.5,
          driftAmp: 0.1 + particleRng() * 0.2,
          phase: particleRng() * Math.PI * 2,
          brightnessBase: live
            ? 0.7 + particleRng() * 0.3
            : 0.25 + particleRng() * 0.15,
          brightnessFreq: 0.4 + particleRng() * 0.6,
        });

        // Hide excess particles for locked orbs
        if (!visible) {
          const bufIdx = (i * AURA_PARTICLES_PER_ORB + j) * 3;
          auraPositions[bufIdx + 1] = -1000;
        }
      }
    });

    const auraMaterial = new THREE.PointsMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      map: softDotTex,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
      size: AURA_PARTICLE_SIZE,
    });
    disposables.push(auraMaterial);
    scene.add(new THREE.Points(auraGeometry, auraMaterial));

    // --- System shimmer particles (drift INSIDE each node — the "star core" effect) ---
    // 6 particles per orb, swirling on per-particle spherical paths inside the
    // node's local volume, additive-blended bright dots that twinkle. Bloom
    // amplifies these into shimmering star cores.
    const TOTAL_INNER = nodes.length * INNER_PARTICLES_PER_ORB;
    const innerPositions = new Float32Array(TOTAL_INNER * 3);
    const innerColors = new Float32Array(TOTAL_INNER * 3);
    const innerGeometry = new THREE.BufferGeometry();
    innerGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(innerPositions, 3),
    );
    innerGeometry.setAttribute(
      'color',
      new THREE.BufferAttribute(innerColors, 3),
    );

    const innerParams: InnerParam[] = [];
    nodes.forEach((node, i) => {
      const innerRng = mulberry32(node.id * 6131 + 53);
      const live = node.status === 'live';
      for (let j = 0; j < INNER_PARTICLES_PER_ORB; j++) {
        innerParams.push({
          radiusBase:
            INNER_RADIUS_MIN +
            innerRng() * (INNER_RADIUS_MAX - INNER_RADIUS_MIN),
          theta0: innerRng() * Math.PI * 2,
          phi0: innerRng() * Math.PI,
          thetaSpeed: (0.8 + innerRng() * 1.4) * (innerRng() < 0.5 ? -1 : 1),
          phiSpeed: (0.5 + innerRng() * 0.9) * (innerRng() < 0.5 ? -1 : 1),
          breathFreq: 0.6 + innerRng() * 1.0,
          breathAmp: 0.04 + innerRng() * 0.05,
          twinkleFreq: 1.2 + innerRng() * 2.4,
          twinklePhase: innerRng() * Math.PI * 2,
          brightnessBase: live
            ? 1.0 + innerRng() * 0.6
            : 0.35 + innerRng() * 0.2,
        });
      }
    });

    const innerMaterial = new THREE.PointsMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      map: softDotTex,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
      size: INNER_PARTICLE_SIZE,
    });
    disposables.push(innerMaterial);
    scene.add(new THREE.Points(innerGeometry, innerMaterial));

    // --- Ambient atmosphere (second Points object, 1 draw call) ---
    // Background Starfield — live values from the Spiral Parameter Registry
    // (group 'bgStars'); overridable via ?p.bgStars.<knob>= on the URL.
    const ambCount = params['bgStars.count'] as number;
    const ambRadius = params['bgStars.radius'] as number;
    const ambHeight = params['bgStars.height'] as number;
    const ambSize = params['bgStars.size'] as number;
    const ambOpacity = params['bgStars.opacity'] as number;
    const ambBrightMin = params['bgStars.brightnessMin'] as number;
    const ambBrightRange = params['bgStars.brightnessRange'] as number;
    const ambDriftX = params['bgStars.driftAmpX'] as number;
    const ambDriftY = params['bgStars.driftAmpY'] as number;
    const ambAdditive = params['bgStars.additive'] as boolean;
    const ambientPositions = new Float32Array(ambCount * 3);
    const ambientBasePositions = new Float32Array(ambCount * 3);
    const ambientColors = new Float32Array(ambCount * 3);
    // Per-star drift parameters, baked once and consumed by the vertex shader
    // (Step 1 GPU migration) — the drift that used to run on the CPU per frame.
    const ambientDriftFreq = new Float32Array(ambCount * 3);
    const ambientDriftAmp = new Float32Array(ambCount * 3);
    const ambientPhase = new Float32Array(ambCount);
    const ambientGeometry = new THREE.BufferGeometry();
    const ambientRng = mulberry32(9999);

    for (let j = 0; j < ambCount; j++) {
      const idx = j * 3;
      ambientBasePositions[idx] = (ambientRng() - 0.5) * 2 * ambRadius;
      ambientBasePositions[idx + 1] = (ambientRng() - 0.5) * 2 * ambHeight;
      ambientBasePositions[idx + 2] = (ambientRng() - 0.5) * 2 * ambRadius;
      ambientPositions[idx] = ambientBasePositions[idx];
      ambientPositions[idx + 1] = ambientBasePositions[idx + 1];
      ambientPositions[idx + 2] = ambientBasePositions[idx + 2];

      // Chakra gradient by height — root/red at the bottom → crown/violet at
      // the top — plus a small per-star band jitter so the field has variety
      // (more stars than chakra stops). Mapped over the HELIX height (not the
      // much-taller star box) so the gradient aligns with the node colors at the
      // same height and actually reads top→bottom in frame; stars beyond the
      // helix span clamp to root below / crown above. The jitter consumes
      // exactly ONE ambientRng() call, the same budget the old random
      // phase-color pick used, so star positions and the per-star drift seeded
      // below stay identical.
      const yFrac = ambientBasePositions[idx + 1] / HELIX_HEIGHT + 0.5;
      const jitter = (ambientRng() - 0.5) * 0.14; // ≈ ±half a chakra stop
      const pc = chakraColorAt(yFrac + jitter);
      const dim = ambBrightMin + ambientRng() * ambBrightRange;
      ambientColors[idx] = pc.r * dim;
      ambientColors[idx + 1] = pc.g * dim;
      ambientColors[idx + 2] = pc.b * dim;

      // Bake per-star drift into attributes for the vertex shader (Step 1).
      // RNG call order preserved EXACTLY so the starfield layout is identical.
      ambientDriftFreq[idx] = 0.02 + ambientRng() * 0.04;
      ambientDriftFreq[idx + 1] = 0.01 + ambientRng() * 0.02;
      ambientDriftFreq[idx + 2] = 0.02 + ambientRng() * 0.04;
      ambientDriftAmp[idx] = 0.3 + ambientRng() * ambDriftX;
      ambientDriftAmp[idx + 1] = 0.2 + ambientRng() * ambDriftY;
      ambientDriftAmp[idx + 2] = 0.3 + ambientRng() * ambDriftX;
      ambientPhase[j] = ambientRng() * Math.PI * 2;
    }

    ambientGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(ambientPositions, 3),
    );
    ambientGeometry.setAttribute(
      'color',
      new THREE.BufferAttribute(ambientColors, 3),
    );
    ambientGeometry.setAttribute(
      'aDriftFreq',
      new THREE.BufferAttribute(ambientDriftFreq, 3),
    );
    ambientGeometry.setAttribute(
      'aDriftAmp',
      new THREE.BufferAttribute(ambientDriftAmp, 3),
    );
    ambientGeometry.setAttribute(
      'aPhase',
      new THREE.BufferAttribute(ambientPhase, 1),
    );

    const ambientMaterial = new THREE.PointsMaterial({
      vertexColors: true,
      transparent: true,
      opacity: ambOpacity,
      map: softDotTex,
      blending: ambAdditive ? THREE.AdditiveBlending : THREE.NormalBlending,
      depthWrite: false,
      sizeAttenuation: true,
      size: ambSize,
    });
    // Step 1 GPU migration: the per-star drift that used to run on the CPU every
    // frame (a sin/sin/cos + full position re-upload over every star) now runs in
    // the vertex shader. We inject it into the stock PointsMaterial program via
    // onBeforeCompile so size-attenuation, soft-dot texture, vertex colors, and
    // blending stay byte-identical — only the drift moved to the GPU. A denser
    // cosmos (more stars) becomes effectively free: richness scales without
    // per-frame CPU cost, matching the anti-reduction direction.
    const ambientUniforms = { uTime: { value: 0 } };
    ambientMaterial.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = ambientUniforms.uTime;
      shader.vertexShader =
        'uniform float uTime;\n' +
        'attribute vec3 aDriftFreq;\n' +
        'attribute vec3 aDriftAmp;\n' +
        'attribute float aPhase;\n' +
        shader.vertexShader.replace(
          '#include <begin_vertex>',
          [
            'vec3 transformed = position + vec3(',
            '  sin(uTime * aDriftFreq.x + aPhase) * aDriftAmp.x,',
            '  sin(uTime * aDriftFreq.y + aPhase * 1.3) * aDriftAmp.y,',
            '  cos(uTime * aDriftFreq.z + aPhase * 0.7) * aDriftAmp.z',
            ');',
          ].join('\n'),
        );
    };
    disposables.push(ambientMaterial);
    scene.add(new THREE.Points(ambientGeometry, ambientMaterial));

    // --- Cartographic Coordinate Layer (The Fossil Record) ---
    // A subtle, low-opacity point cloud representing a global coordinate grid.
    // This satisfies the "literal map of earth history" directive.
    const COORD_COUNT = 800;
    const coordPositions = new Float32Array(COORD_COUNT * 3);
    const coordRng = mulberry32(7777);
    for (let j = 0; j < COORD_COUNT; j++) {
      const idx = j * 3;
      const r = ambRadius * 1.2;
      const theta = coordRng() * Math.PI * 2;
      const phi = Math.acos(2 * coordRng() - 1);
      coordPositions[idx] = r * Math.sin(phi) * Math.cos(theta);
      coordPositions[idx + 1] = r * Math.cos(phi) * 0.8; // slightly flattened
      coordPositions[idx + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    const coordGeo = new THREE.BufferGeometry();
    coordGeo.setAttribute(
      'position',
      new THREE.BufferAttribute(coordPositions, 3),
    );
    const coordMat = new THREE.PointsMaterial({
      color: 0xd4c4a8, // Parchment / Old-world gold
      transparent: true,
      opacity: 0.15,
      size: 0.05,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    disposables.push(coordMat);
    const coordPoints = new THREE.Points(coordGeo, coordMat);
    scene.add(coordPoints);

    // --- Tooltip ---
    const tip = document.createElement('div');
    tip.style.cssText = `
    position:absolute;display:none;padding:6px 12px;
    background:rgba(2,11,16,0.88);color:#e8e4df;
    border:1px solid rgba(17,154,158,0.3);border-radius:6px;
    font:13px/1.3 Inter,system-ui,sans-serif;pointer-events:none;
    'z-index':100;backdrop-filter:blur(6px);
    'box-shadow':0 4px 12px rgba(0,0,0,0.3);
  `;
    container.style.position = 'relative';
    container.appendChild(tip);

    // --- Raycaster & interaction ---
    const ray = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let hovered: THREE.Mesh | null = null;
    let downX = 0;
    let downY = 0;
    let downPointerType = 'mouse';

    function setPointer(ex: number, ey: number): void {
      const r = renderer.domElement.getBoundingClientRect();
      pointer.x = ((ex - r.left) / r.width) * 2 - 1;
      pointer.y = -((ey - r.top) / r.height) * 2 + 1;
    }

    function onPointerMove(e: PointerEvent): void {
      if (e.pointerType === 'touch') return;

      setPointer(e.clientX, e.clientY);
      ray.setFromCamera(pointer, camera);
      const hits = ray.intersectObjects(orbMeshes);
      const rect = renderer.domElement.getBoundingClientRect();

      if (hits.length > 0) {
        const hitMesh = hits[0].object as THREE.Mesh;
        if (hovered !== hitMesh) {
          hovered = hitMesh;
          const data = hitMesh.userData as NodeData;
          // Two-tier disclosure on hover: the NAME label materializes under
          // the node (hoverEnergy fade in the loop — admin 2026-04-19:
          // "stars/nodes and name when you hover"), while the tooltip
          // surfaces the tagline (or lock state). Scale/glow/physics
          // excitement are driven per-frame by hoverEnergy, not set here —
          // no snap, the world wakes smoothly.
          tip.textContent =
            data.status === 'locked'
              ? `${data.tagline} — locked`
              : data.tagline;
          tip.style.display = 'block';
        }
        tip.style.left = e.clientX - rect.left + 15 + 'px';
        tip.style.top = e.clientY - rect.top - 10 + 'px';
        renderer.domElement.style.cursor = 'pointer';
      } else if (hovered) {
        hovered = null;
        tip.style.display = 'none';
        renderer.domElement.style.cursor = 'grab';
      }
    }

    function onPointerDown(e: PointerEvent): void {
      downX = e.clientX;
      downY = e.clientY;
      downPointerType = e.pointerType;
      if (e.pointerType !== 'touch') {
        renderer.domElement.style.cursor = 'grabbing';
      }
    }

    function onPointerUp(e: PointerEvent): void {
      if (e.pointerType !== 'touch') {
        renderer.domElement.style.cursor = hovered ? 'pointer' : 'grab';
      }
      const threshold =
        downPointerType === 'touch' ? TAP_THRESHOLD : CLICK_THRESHOLD;
      if (Math.abs(e.clientX - downX) + Math.abs(e.clientY - downY) > threshold)
        return;

      setPointer(e.clientX, e.clientY);
      ray.setFromCamera(pointer, camera);
      const hits = ray.intersectObjects(orbMeshes);
      if (hits.length > 0) {
        const data = hits[0].object.userData as NodeData;
        if (data.status === 'live') {
          trackEvent({
            action: 'spiral_node_click',
            nodeId: data.id,
            nodeName: data.name,
          });
          window.location.href = data.url;
        }
      }
    }

    function onResize(): void {
      const ww = container.clientWidth || 1;
      const hh = container.clientHeight || 1;
      camera.aspect = ww / hh;
      camera.position.z = cameraZForViewport();
      camera.updateProjectionMatrix();
      renderer.setSize(ww, hh);
      bloomResize?.(ww, hh);
    }

    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);
    window.addEventListener('resize', onResize);

    // --- Animation loop ---
    // Reduced-motion: dampen all animation for vestibular accessibility.
    // Live-tracked — toggling the OS setting mid-session updates motionScale +
    // autoRotate immediately (the query is read once at init AND on 'change').
    const reducedMotionQuery = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    );
    let prefersReducedMotion = reducedMotionQuery.matches;
    let motionScale = prefersReducedMotion ? 0.05 : 1.0;
    controls.autoRotate = !prefersReducedMotion;

    const onReducedMotionChange = (e: MediaQueryListEvent): void => {
      prefersReducedMotion = e.matches;
      motionScale = prefersReducedMotion ? 0.05 : 1.0;
      controls.autoRotate = !prefersReducedMotion;
    };
    reducedMotionQuery.addEventListener('change', onReducedMotionChange);

    const clock = new THREE.Clock();
    let frame = 0;
    // Monotonic frame counter — DISTINCT from `frame` (the rAF handle id, which
    // is implementation-defined and not guaranteed sequential). Used wherever a
    // steadily-incrementing tick is needed (round-robin particle sweeps).
    let frameCount = 0;

    // Render-on-demand (perf): the RAF loop is a continuous GPU/CPU cost. Pause
    // it when the tab is backgrounded (document.hidden) or the canvas is fully
    // scrolled off-screen, and resume when it comes back. `running` gates the
    // loop; `isOnScreen` tracks the IntersectionObserver (defaults true so a
    // browser without IO simply always runs).
    let running = false;
    let isOnScreen = true;
    const cameraDir = new THREE.Vector3();

    // Reusable raycast helpers for per-frame icon-shape collision (used in
    // phase-particle physics). Allocated once outside the loop to avoid GC.
    const icRaycaster = new THREE.Raycaster();
    const icCandidatePos = new THREE.Vector3();
    let perfMateriaMs = 0;
    let perfRaycastCalls = 0;

    // Variant-driven physics divergence — user 2026-04-25: "icons and stars
    // act opposite, to display a difference".
    //   symbols variant → spring force toward home (particles HOLD the icon
    //                     outline; rigid, structured, formal — like sculpture)
    //   stars variant   → no spring (particles bounce freely; explosive,
    //                     diffuse, gas-like — like a stellar nebula)
    const SYMBOL_SPRING_K = { solid: 10.0, liquid: 6.0, gas: 3.0 }; // firmer hold — particles keep their sampled positions so the dense form prevails ("birds or magnets keep form")
    const useSpring = variant === 'symbols';

    function loop(): void {
      if (!running) return;
      frame = requestAnimationFrame(loop);
      frameCount++;
      const t = clock.getElapsedTime();

      // Immersive pages own their substrate; embedded pages inherit the shared
      // page field so the canvas cannot leave a hard rectangular seam.
      if (bgUniforms) bgUniforms.uTime.value = t;

      orbGroups.forEach((group, i) => {
        const ap = animParams[i];
        const mesh = orbMeshes[i]!;
        const vessel = vesselGroups[i]!;
        const mat = mesh.material as THREE.MeshPhysicalMaterial;
        const seed = ap.phaseSeed;
        const df = ap.driftFreqs;
        const nc = nodeColorList[i];

        // Hover excitement — eased toward 1 while this node is hovered.
        // Fast attack, slow decay: the world wakes quickly and settles
        // gently (switch-like snaps read as UI; easing reads as alive).
        const heTarget = mesh === hovered ? 1 : 0;
        hoverEnergy[i] +=
          (heTarget - hoverEnergy[i]) *
          (heTarget > hoverEnergy[i] ? 0.12 : 0.05);
        const he = hoverEnergy[i];

        // 1. Orbital motion + layered drift (scaled by reduced-motion preference)
        const orbitAngle = t * ap.orbitSpeed * motionScale + ap.orbitPhase;
        const orbX = Math.cos(orbitAngle) * ap.orbitRadius * motionScale;
        const orbY = Math.sin(orbitAngle) * ap.orbitRadius * motionScale;

        group.position.x =
          basePositions[i].x +
          ap.orbitNormal.x * orbX +
          ap.orbitBinormal.x * orbY +
          Math.sin(t * df[0] + seed) * DRIFT_AMP +
          Math.sin(t * df[1] + seed * 1.7) * DRIFT_AMP * 0.4;
        group.position.y =
          basePositions[i].y +
          ap.orbitNormal.y * orbX +
          ap.orbitBinormal.y * orbY +
          Math.sin(t * df[2] + seed * 1.3) * DRIFT_AMP_Y +
          Math.sin(t * df[3] + seed * 2.1) * DRIFT_AMP_Y * 0.3;
        group.position.z =
          basePositions[i].z +
          ap.orbitNormal.z * orbX +
          ap.orbitBinormal.z * orbY +
          Math.cos(t * df[4] + seed * 0.7) * DRIFT_AMP +
          Math.cos(t * df[5] + seed * 1.1) * DRIFT_AMP * 0.4;

        // 2. Breathing scale + hover swell — unified (hoverEnergy eases, so
        // there is no snap; replaces the old hard 1.2× set in the handler)
        const breath =
          1.0 + Math.sin(t * ap.breathFreq + ap.breathPhase) * ap.breathAmp;
        vessel.scale.setScalar(breath * (1 + 0.22 * he));
        const boundary = boundaryMeshes[i];
        if (boundary) {
          boundary.scale.setScalar(1.035 + 0.05 * he);
        }

        // 3. Emissive pulsing + hover ignition (bloom turns this into glow)
        mat.emissiveIntensity =
          ap.emissiveBase +
          Math.sin(t * ap.emissiveFreq + ap.emissivePhase) * ap.emissiveAmp +
          he * pNum('emissive.hoverBoost', 0.85);

        // 4. Multi-axis rotation (VISIBLE spinning, dampened for reduced-motion)
        // + accumulated hover spin (additive so engagement quickens the turn
        // without a positional jump when hover starts/ends)
        hoverSpinY[i] += (1 / 60) * he * 1.1 * motionScale;
        vessel.rotation.x = t * ap.rotRateX * motionScale + ap.rotPhaseX;
        vessel.rotation.y =
          t * ap.rotRateY * motionScale + ap.rotPhaseY + hoverSpinY[i];
        vessel.rotation.z = t * ap.rotRateZ * motionScale + ap.rotPhaseZ;

        // 5. Label sprite: subtle vertical bob; in 'hover' label-mode the
        // NAME materializes with hoverEnergy (fade + slight swell) — admin
        // 2026-04-19 "stars/nodes and name when you hover". 'always' mode
        // (touch fallback / ?labels=always) keeps it at full opacity.
        const label = labelSprites[i];
        if (label) {
          const bob = Math.sin(t * 0.5 + seed * 1.2) * 0.02;
          label.position.y = -(ORB_RADIUS + 0.55) + bob;
          const lMat = label.material as THREE.SpriteMaterial;
          lMat.opacity = effLabelMode === 'hover' ? he : 1;
          const lw = 2.2 * (1 + 0.1 * he);
          label.scale.set(lw, lw * (100 / 720), 1);
        }

        // 6. Per-orb aura particles
        for (let j = 0; j < AURA_PARTICLES_PER_ORB; j++) {
          const pIdx = i * AURA_PARTICLES_PER_ORB + j;
          const pp = auraParams[pIdx];
          if (pp.radiusBase === 0) continue;

          const bufIdx = pIdx * 3;
          const r =
            pp.radiusBase + Math.sin(t * pp.driftFreq + pp.phase) * pp.driftAmp;
          const theta = pp.theta0 + t * pp.orbitSpeed;
          const phi = pp.phi0 + t * pp.orbitSpeed * 0.37;

          auraPositions[bufIdx] =
            group.position.x + r * Math.sin(phi) * Math.cos(theta);
          auraPositions[bufIdx + 1] = group.position.y + r * Math.cos(phi);
          auraPositions[bufIdx + 2] =
            group.position.z + r * Math.sin(phi) * Math.sin(theta);

          const bright =
            pp.brightnessBase +
            Math.sin(t * pp.brightnessFreq + pp.phase) * 0.3;
          auraColors[bufIdx] = nc.r * bright;
          auraColors[bufIdx + 1] = nc.g * bright;
          auraColors[bufIdx + 2] = nc.b * bright;
        }

        // 6.5. Per-orb PLANETS — local space, follow the parent group.
        // Each planet rides a tilted Keplerian-style circular orbit:
        //   x = r cos(θ)
        //   y = r sin(θ) sin(i)
        //   z = r sin(θ) cos(i)
        // then yaw by the ascending-node angle. The orbital plane is *stable*
        // per planet (so motion reads as orbit, not drift), but distinct per
        // planet so each "solar system" looks like a real system rather than
        // co-planar rings.
        const nodePlanetList = planetMeshes[i];
        const nodePlanetParamList = planetParams[i];
        for (let p = 0; p < nodePlanetList.length; p++) {
          const planet = nodePlanetList[p];
          const pp = nodePlanetParamList[p];
          // Elliptical orbit (focus at origin). True angle from periapsis:
          //   x = a (cos E - e),  y = b sin E
          // Use mean-anomaly approximation (theta = E directly) — visually
          // indistinguishable from solving Kepler's equation, much cheaper.
          const theta = pp.orbitPhase + t * pp.orbitSpeed * motionScale;
          const b =
            pp.semiMajor *
            Math.sqrt(Math.max(0, 1 - pp.eccentricity * pp.eccentricity));
          const xe = pp.semiMajor * (Math.cos(theta) - pp.eccentricity);
          const ye = b * Math.sin(theta);
          // Rotate by argument of periapsis (orientation in orbital plane)
          const cosWp = Math.cos(pp.argPeriapsis);
          const sinWp = Math.sin(pp.argPeriapsis);
          const xr = xe * cosWp - ye * sinWp;
          const yr = xe * sinWp + ye * cosWp;
          // Apply inclination (tilt) + ascending node (yaw)
          const ci = Math.cos(pp.inclination);
          const si = Math.sin(pp.inclination);
          const ca = Math.cos(pp.ascendingNode);
          const sa = Math.sin(pp.ascendingNode);
          const lx = xr;
          const ly = yr * si;
          const lz = yr * ci;

          planet.position.set(lx * ca - lz * sa, ly, lx * sa + lz * ca);

          // Self-rotation so planets visibly spin (especially ringed ones).
          planet.rotation.y += pp.spinSpeed * 0.016 * motionScale;
        }

        // 7. Per-orb SYSTEM shimmer particles (drift inside the star's local volume)
        for (let j = 0; j < INNER_PARTICLES_PER_ORB; j++) {
          const pIdx = i * INNER_PARTICLES_PER_ORB + j;
          const ip = innerParams[pIdx];
          const bufIdx = pIdx * 3;
          const tScaled = t * motionScale;

          const r =
            ip.radiusBase +
            Math.sin(tScaled * ip.breathFreq + ip.twinklePhase) * ip.breathAmp;
          const theta = ip.theta0 + tScaled * ip.thetaSpeed;
          const phi = ip.phi0 + tScaled * ip.phiSpeed;

          innerPositions[bufIdx] =
            group.position.x + r * Math.sin(phi) * Math.cos(theta);
          innerPositions[bufIdx + 1] = group.position.y + r * Math.cos(phi);
          innerPositions[bufIdx + 2] =
            group.position.z + r * Math.sin(phi) * Math.sin(theta);

          // Twinkle: brightness oscillates per-particle so dots flicker like real stars
          const twinkle =
            ip.brightnessBase +
            Math.sin(tScaled * ip.twinkleFreq + ip.twinklePhase) * 0.45;
          const tint = Math.max(0.5, twinkle);
          innerColors[bufIdx] = nc.r * tint;
          innerColors[bufIdx + 1] = nc.g * tint;
          innerColors[bufIdx + 2] = nc.b * tint;
        }

        // 8. Per-orb PHASE-PARTICLE PHYSICS — gas/liquid/solid filling the icon
        // shape via thermal motion + outward pressure + boundary collision.
        // Icon shape emerges naturally because the icon mesh IS the container
        // (raycast collision against actual mesh, distributed across frames).
        const perfT0 = PERF_LOG ? performance.now() : 0;
        const phaseList = nodePhaseParticles[i];
        const phasePos = nodePhasePositions[i];
        const phaseCol = nodePhaseColors[i];
        const phaseMesh = containmentMeshes[i]; // local icon-volume probe
        const node = nodes[i]!;
        const world = nodeWorlds[i] ?? worldFor(node.id);
        const law = nodeLaws[i] ?? deriveLifeMotionLaw(node.envVar, world);
        const dt = 1 / 60;
        // Implode/explode oscillation per node — different phase so they don't pulse in unison
        const ieT = t * IMPLODE_EXPLODE_FREQ + i * 0.45;
        const centralForce = Math.sin(ieT) * IMPLODE_EXPLODE_AMP;

        // Continuous icon-shape collision: rotate through particles ~8% per frame
        // so each particle is checked roughly every 12 frames (~5 Hz at 60fps).
        const collCount = Math.max(
          1,
          Math.floor(phaseList.length * COLLISION_CHECK_FRACTION),
        );
        const collStart = (frameCount * 7919) % phaseList.length; // pseudo-random rotation
        // Ensure mesh.matrixWorld matches the orb group's transform for raycast
        // (matrix has been updated by Three.js' render — we just need the inverse)
        // Actually the raycast probe will be in mesh-local space because we
        // construct the ray from local positions and intersect against the mesh
        // (Three.js handles matrixWorld inverse automatically).
        let solidX = 0;
        let solidY = 0;
        let solidZ = 0;
        let solidCount = 0;
        let liquidX = 0;
        let liquidY = 0;
        let liquidZ = 0;
        let liquidCount = 0;
        let gasX = 0;
        let gasY = 0;
        let gasZ = 0;
        let gasCount = 0;

        for (let j = 0; j < phaseList.length; j++) {
          const part = phaseList[j];
          if (part.size === 0) continue;
          switch (part.phase) {
            case 'solid':
              solidX += part.pos.x;
              solidY += part.pos.y;
              solidZ += part.pos.z;
              solidCount++;
              break;
            case 'liquid':
              liquidX += part.pos.x;
              liquidY += part.pos.y;
              liquidZ += part.pos.z;
              liquidCount++;
              break;
            case 'gas':
              gasX += part.pos.x;
              gasY += part.pos.y;
              gasZ += part.pos.z;
              gasCount++;
              break;
          }
        }

        const solidCX = solidCount ? solidX / solidCount : 0;
        const solidCY = solidCount ? solidY / solidCount : 0;
        const solidCZ = solidCount ? solidZ / solidCount : 0;
        const liquidCX = liquidCount ? liquidX / liquidCount : 0;
        const liquidCY = liquidCount ? liquidY / liquidCount : 0;
        const liquidCZ = liquidCount ? liquidZ / liquidCount : 0;
        const gasCX = gasCount ? gasX / gasCount : 0;
        const gasCY = gasCount ? gasY / gasCount : 0;
        const gasCZ = gasCount ? gasZ / gasCount : 0;

        // Burst behavior comes from the node's LifeMotionLaw — cycle
        // length, window offset, origin wander, and reach are all
        // structure-derived and bounded (no node.id arithmetic here).
        const burstCycle = law.burstCycle;
        const burstPhase =
          (t + ((law.seed % 4096) / 4096) * burstCycle) % burstCycle;
        const burstWindow =
          !useSpring && burstPhase < 0.32 ? 1 - burstPhase / 0.32 : 0;
        const bd = law.lfo.burstDrift;
        const burstSeedPhase = (law.seed % 6283) / 1000;
        const burstOriginX = Math.sin(burstSeedPhase + t * bd[0]) * 0.12;
        const burstOriginY = Math.cos(burstSeedPhase * 2 + t * bd[1]) * 0.1;
        const burstOriginZ = Math.sin(burstSeedPhase * 3 + t * bd[2]) * 0.12;
        const burstRadius = 0.2 + 0.18 * law.turbulence;

        for (let j = 0; j < phaseList.length; j++) {
          const part = phaseList[j];
          if (part.size === 0) continue;
          const dampBase = useSpring
            ? PHASE_DAMPING[part.phase]
            : Math.min(0.998, PHASE_DAMPING[part.phase] + 0.012);
          // Viscous worlds drink velocity; frictionless ones keep it.
          const damp = dampBase - 0.02 * law.viscosity;
          const bounce = useSpring
            ? PHASE_BOUNCE[part.phase]
            : Math.min(0.98, PHASE_BOUNCE[part.phase] + 0.08);
          // Hover quickens the weather THROUGH the law's turbulence —
          // hot worlds (Forge, Pyre) flare, calm worlds (Lunar Night,
          // Crystal Vault) only stir. Thematic, not uniform. The
          // 0.4..1.6 span matches the old thermalAmpMul range.
          const thermalAmp =
            PHASE_THERMAL[part.phase] *
            (0.4 + 1.2 * law.turbulence) *
            (useSpring ? 1.0 : 2.8) *
            (1 + he * 1.6);
          // Permeable membranes let matter press outward at the edge;
          // sealed vaults suppress it.
          const pressure =
            PHASE_PRESSURE[part.phase] *
            (useSpring ? 0.55 : 1.1) *
            (0.5 + law.permeability);
          const gravityScale =
            PHASE_GRAVITY_SCALE[part.phase] *
            (useSpring ? 1.0 : 1.35) *
            dt *
            motionScale;
          const centroidX =
            part.phase === 'solid'
              ? solidCX
              : part.phase === 'liquid'
                ? liquidCX
                : gasCX;
          const centroidY =
            part.phase === 'solid'
              ? solidCY
              : part.phase === 'liquid'
                ? liquidCY
                : gasCY;
          const centroidZ =
            part.phase === 'solid'
              ? solidCZ
              : part.phase === 'liquid'
                ? liquidCZ
                : gasCZ;

          part.vel.x += world.gravity.x * gravityScale;
          part.vel.y += world.gravity.y * gravityScale;
          part.vel.z += world.gravity.z * gravityScale;

          let neighborForceX = 0;
          let neighborForceY = 0;
          let neighborForceZ = 0;
          let alignX = 0;
          let alignY = 0;
          let alignZ = 0;
          let samples = 0;

          for (let s = 0; s < 4; s++) {
            const candidateIdx =
              (j + (s + 1) * (17 + i * 3) + frameCount * (s + 2)) %
              phaseList.length;
            const candidate = phaseList[candidateIdx];
            if (!candidate || candidate === part || candidate.size === 0)
              continue;

            const dx = candidate.pos.x - part.pos.x;
            const dy = candidate.pos.y - part.pos.y;
            const dz = candidate.pos.z - part.pos.z;
            const distSq = dx * dx + dy * dy + dz * dz + 0.0025;
            const affinity = candidate.phase === part.phase ? 1.15 : 0.6;
            const weight = affinity / (0.025 + distSq * (useSpring ? 12 : 7));

            if (useSpring) {
              neighborForceX += dx * weight;
              neighborForceY += dy * weight;
              neighborForceZ += dz * weight;
              alignX += candidate.vel.x;
              alignY += candidate.vel.y;
              alignZ += candidate.vel.z;
            } else {
              neighborForceX -= dx * weight;
              neighborForceY -= dy * weight;
              neighborForceZ -= dz * weight;
            }

            samples++;
          }

          if (useSpring) {
            part.vel.x +=
              (centroidX - part.pos.x) *
              COHESION_PULL[part.phase] *
              0.7 *
              dt *
              motionScale;
            part.vel.y +=
              (centroidY - part.pos.y) *
              COHESION_PULL[part.phase] *
              0.7 *
              dt *
              motionScale;
            part.vel.z +=
              (centroidZ - part.pos.z) *
              COHESION_PULL[part.phase] *
              0.7 *
              dt *
              motionScale;

            if (samples > 0) {
              part.vel.x +=
                neighborForceX *
                COHESION_PULL[part.phase] *
                0.22 *
                dt *
                motionScale;
              part.vel.y +=
                neighborForceY *
                COHESION_PULL[part.phase] *
                0.22 *
                dt *
                motionScale;
              part.vel.z +=
                neighborForceZ *
                COHESION_PULL[part.phase] *
                0.22 *
                dt *
                motionScale;

              part.vel.x +=
                (alignX / samples - part.vel.x) * 0.18 * dt * motionScale;
              part.vel.y +=
                (alignY / samples - part.vel.y) * 0.18 * dt * motionScale;
              part.vel.z +=
                (alignZ / samples - part.vel.z) * 0.18 * dt * motionScale;
            }
          } else if (samples > 0) {
            part.vel.x +=
              neighborForceX *
              CHAOS_REPULSION[part.phase] *
              0.16 *
              dt *
              motionScale;
            part.vel.y +=
              neighborForceY *
              CHAOS_REPULSION[part.phase] *
              0.16 *
              dt *
              motionScale;
            part.vel.z +=
              neighborForceZ *
              CHAOS_REPULSION[part.phase] *
              0.16 *
              dt *
              motionScale;
          }

          // Variant-driven divergence:
          // SYMBOLS variant — spring force to home (rigid icon, sculpted form)
          // STARS   variant — no spring, only thermal+pressure (free, explosive)
          if (useSpring) {
            // Containment scales the home-spring: vault worlds (lattice,
            // crystalline) hold their form firmly; fountain worlds
            // (radial-emission) let matter range before pulling back.
            const k = SYMBOL_SPRING_K[part.phase] * (0.5 + law.containment);
            const hx = part.home.x - part.pos.x;
            const hy = part.home.y - part.pos.y;
            const hz = part.home.z - part.pos.z;
            part.vel.x += hx * k * dt * motionScale;
            part.vel.y += hy * k * dt * motionScale;
            part.vel.z += hz * k * dt * motionScale;
          }

          applyWorldBehaviorForce(
            world.particleBehavior,
            part,
            t,
            i,
            j,
            dt,
            motionScale,
            useSpring ? 'cohesion' : 'chaos',
            1 + he * 1.2,
          );

          // Thermal kick — Brownian-like jitter giving life. Gas jitters most.
          part.vel.x +=
            (Math.random() - 0.5) * 2 * thermalAmp * dt * motionScale;
          part.vel.y +=
            (Math.random() - 0.5) * 2 * thermalAmp * dt * motionScale;
          part.vel.z +=
            (Math.random() - 0.5) * 2 * thermalAmp * dt * motionScale;

          // Outward radial pressure — pushes particles toward the icon's edges
          // (gas wants to fill its container). Suppressed for symbols (spring
          // already holds them; double force = jitter without form).
          const rr =
            Math.sqrt(
              part.pos.x * part.pos.x +
                part.pos.y * part.pos.y +
                part.pos.z * part.pos.z,
            ) || 1e-6;
          const rNorm = Math.min(1, rr / ORB_CONTAINMENT_R);
          const pmag =
            (useSpring ? 0.25 : 1.0) *
            pressure *
            (1.0 - rNorm) *
            dt *
            motionScale;
          part.vel.x += (part.pos.x / rr) * pmag;
          part.vel.y += (part.pos.y / rr) * pmag;
          part.vel.z += (part.pos.z / rr) * pmag;

          // Implode/explode central oscillation — node-wide breath
          const cf = centralForce * dt * motionScale;
          part.vel.x += (-part.pos.x / rr) * cf;
          part.vel.y += (-part.pos.y / rr) * cf;
          part.vel.z += (-part.pos.z / rr) * cf;

          if (!useSpring && burstWindow > 0) {
            const bdx = part.pos.x - burstOriginX;
            const bdy = part.pos.y - burstOriginY;
            const bdz = part.pos.z - burstOriginZ;
            const burstDist = Math.hypot(bdx, bdy, bdz) || 1e-6;
            const burstReach = Math.max(0, 1 - burstDist / burstRadius);
            const burstKick = burstWindow * burstReach * 3.2 * dt * motionScale;
            part.vel.x += (bdx / burstDist) * burstKick;
            part.vel.y += (bdy / burstDist) * burstKick;
            part.vel.z += (bdz / burstDist) * burstKick;
          }

          if (!useSpring && Math.random() < law.burstChance) {
            const rareKick = 0.1 + 0.18 / Math.max(0.12, Math.random());
            part.vel.x += (Math.random() - 0.5) * 2 * rareKick * motionScale;
            part.vel.y += (Math.random() - 0.5) * 2 * rareKick * motionScale;
            part.vel.z += (Math.random() - 0.5) * 2 * rareKick * motionScale;
          }

          // Integrate
          part.pos.x += part.vel.x * dt * motionScale;
          part.pos.y += part.vel.y * dt * motionScale;
          part.pos.z += part.vel.z * dt * motionScale;

          // Outer sphere safety — never let particles escape the bounding sphere
          const r2 = Math.sqrt(
            part.pos.x * part.pos.x +
              part.pos.y * part.pos.y +
              part.pos.z * part.pos.z,
          );
          const limit = ORB_CONTAINMENT_R - part.size;
          if (r2 > limit) {
            if (useSpring) {
              const nx = part.pos.x / r2;
              const ny = part.pos.y / r2;
              const nz = part.pos.z / r2;
              const vDotN = part.vel.x * nx + part.vel.y * ny + part.vel.z * nz;
              if (vDotN > 0) {
                part.vel.x -= (1 + bounce) * vDotN * nx;
                part.vel.y -= (1 + bounce) * vDotN * ny;
                part.vel.z -= (1 + bounce) * vDotN * nz;
              }
              part.pos.x = nx * limit;
              part.pos.y = ny * limit;
              part.pos.z = nz * limit;
            } else {
              respawnChaosParticle(part, world);
            }
          }

          // Damping
          part.vel.x *= damp;
          part.vel.y *= damp;
          part.vel.z *= damp;

          // Continuous icon-shape collision — distributed across frames.
          // If this particle is up for raycast this frame, test it against
          // the icon mesh. If outside, snap to home + reflect velocity.
          const collIdx = (j - collStart + phaseList.length) % phaseList.length;
          if (collIdx < collCount && phaseMesh) {
            icCandidatePos.copy(part.pos);
            // Multi-ray majority vote — single-ray parity flips on grazing hits
            // and lets particles flicker/escape the icon outline. The raycast is
            // BVH-accelerated (see initSpiral): identical hits, ~5–50× cheaper,
            // unless ?legacyContainment=1 skipped the BVH build for A/B timing.
            if (PERF_LOG) perfRaycastCalls++;
            if (!isInsideMesh(icRaycaster, phaseMesh, icCandidatePos)) {
              if (useSpring) {
                // Outside icon — snap back to home + reflect velocity inward
                part.pos.copy(part.home);
                const toCenter = part.pos.length() || 1;
                const inwardX = -part.pos.x / toCenter;
                const inwardY = -part.pos.y / toCenter;
                const inwardZ = -part.pos.z / toCenter;
                const vMag = Math.sqrt(
                  part.vel.x * part.vel.x +
                    part.vel.y * part.vel.y +
                    part.vel.z * part.vel.z,
                );
                const inwardSpeed = vMag * 0.6 * bounce;
                part.vel.x =
                  inwardX * inwardSpeed + (Math.random() - 0.5) * 0.05;
                part.vel.y =
                  inwardY * inwardSpeed + (Math.random() - 0.5) * 0.05;
                part.vel.z =
                  inwardZ * inwardSpeed + (Math.random() - 0.5) * 0.05;
              } else {
                respawnChaosParticle(part, world);
              }
            }
          }

          const bi = j * 3;
          phasePos[bi] = part.pos.x;
          phasePos[bi + 1] = part.pos.y;
          phasePos[bi + 2] = part.pos.z;
          const speed = Math.sqrt(
            part.vel.x * part.vel.x +
              part.vel.y * part.vel.y +
              part.vel.z * part.vel.z,
          );
          const glowBase = useSpring
            ? 0.88 + Math.min(0.32, speed * 0.45)
            : 0.95 + Math.min(0.75, speed * 0.55 + burstWindow * 0.55);
          // Hover brightens the materia itself (channel clamp below keeps it sane)
          const glow = glowBase * (1 + he * 0.4);
          phaseCol[bi] = Math.min(1, part.baseColor.r * glow);
          phaseCol[bi + 1] = Math.min(1, part.baseColor.g * glow);
          phaseCol[bi + 2] = Math.min(1, part.baseColor.b * glow);
        }
        nodePhaseGeometries[i].attributes.position.needsUpdate = true;
        nodePhaseGeometries[i].attributes.color.needsUpdate = true;
        if (PERF_LOG) perfMateriaMs += performance.now() - perfT0;
      });

      if (PERF_LOG && frameCount % 120 === 0) {
        const mode = LEGACY_CONTAINMENT ? 'legacy-raycast' : 'bvh';
        console.log(
          `[spiral perf] materia ${(perfMateriaMs / 120).toFixed(2)} ms/frame ` +
            `(${mode}) · containment tests ${Math.round(perfRaycastCalls / 120)}/frame`,
        );
        perfMateriaMs = 0;
        perfRaycastCalls = 0;
      }

      // Flush aura + system buffers — only when those layers actually have
      // particles. Both are currently disabled (count 0); flagging empty
      // geometries dirty every frame is wasted GPU sync. (Step 0 perf cleanup.)
      if (AURA_PARTICLES_PER_ORB > 0) {
        auraGeometry.attributes.position.needsUpdate = true;
        auraGeometry.attributes.color.needsUpdate = true;
      }
      if (INNER_PARTICLES_PER_ORB > 0) {
        innerGeometry.attributes.position.needsUpdate = true;
        innerGeometry.attributes.color.needsUpdate = true;
      }

      // Helix line traveling pulse — two phase-staggered waves walk the path
      // from bottom (root) → top (crown), modulating brightness so the spiral
      // reads as a flowing current rather than a static drawn line. Pulse
      // multiplier oscillates between ~0.55 and ~1.45 of base color.
      const pulseSpeed = 0.85;
      const waveK = 0.045; // spatial frequency along path index
      for (let i = 0; i < path.length; i++) {
        const phase = t * pulseSpeed - i * waveK;
        const pulse =
          1.0 + 0.4 * Math.sin(phase) + 0.18 * Math.sin(phase * 2.3 + 1.7);
        const idx = i * 3;
        helixLiveColors[idx] = helixBaseColors[idx] * pulse;
        helixLiveColors[idx + 1] = helixBaseColors[idx + 1] * pulse;
        helixLiveColors[idx + 2] = helixBaseColors[idx + 2] * pulse;
      }
      helixGeo.attributes.color.needsUpdate = true;
      helixRails.forEach((rail) => {
        const rise = Math.sin(t * rail.riseFreq + rail.phase);
        const counterRise = Math.cos(t * (rail.riseFreq * PHI) + rail.phase);
        const drift = Math.sin(t * rail.driftFreq + rail.phase * 0.37);
        rail.line.rotation.z =
          rail.rotationBase + drift * rail.rotationAmp * motionScale;
        rail.line.position.y =
          (rise * 0.045 + counterRise * 0.026) * rail.polarity * motionScale;
        rail.line.position.x =
          Math.cos(t * (rail.driftFreq * Math.SQRT2) + rail.phase) *
          0.024 *
          motionScale;
        rail.line.position.z =
          Math.sin(t * (rail.driftFreq * 0.73) + rail.phase) *
          0.032 *
          motionScale;
        rail.material.opacity =
          rail.baseOpacity +
          (0.035 + rail.baseOpacity * 0.35) *
            (0.5 + 0.5 * Math.sin(t * (rail.riseFreq * 2.7) + rail.phase));
      });

      // Ambient atmosphere drift — now computed on the GPU (vertex shader).
      // We only push the time uniform: no per-star CPU math, no position
      // re-upload. (Step 1 GPU migration.)
      ambientUniforms.uTime.value = t;

      controls.update();
      renderFrame();
    }

    // Single render path, composer-aware. Reading `composer` (a let reassigned
    // when the bloom module resolves) inside a function narrows correctly — at
    // the synchronous one-shot call site below, composer is provably still null.
    function renderFrame(): void {
      if (composer) {
        composer.render();
      } else {
        renderer.render(scene, camera);
      }
    }

    function startLoop(): void {
      if (running || document.hidden || !isOnScreen) return;
      running = true;
      // Resetting oldTime so the next clock delta is ~one frame, not the whole
      // paused interval — otherwise getElapsedTime() jumps and the animation
      // pops. elapsedTime itself is frozen while paused (no getElapsedTime calls).
      if (typeof performance !== 'undefined') clock.oldTime = performance.now();
      frame = requestAnimationFrame(loop);
    }

    function stopLoop(): void {
      running = false;
      cancelAnimationFrame(frame);
    }

    const onVisibilityChange = (): void => {
      if (document.hidden) stopLoop();
      else startLoop();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    // Pause when the canvas scrolls fully out of view; resume when it returns.
    // Distinct from SpiralIsland's load-gating observer — this one pauses an
    // already-booted loop. No IntersectionObserver → isOnScreen stays true.
    let loopObserver: IntersectionObserver | null = null;
    if (typeof IntersectionObserver === 'function') {
      loopObserver = new IntersectionObserver((entries) => {
        isOnScreen = entries.some((e) => e.isIntersecting);
        if (isOnScreen) startLoop();
        else stopLoop();
      });
      loopObserver.observe(renderer.domElement);
    }

    // Always paint one frame immediately, independent of visibility. rAF is
    // suspended while a tab is backgrounded, so a page booted in a background
    // tab (cmd-click / restored session) would otherwise show a blank canvas
    // with the static field already hidden. This guarantees the initial pose is
    // drawn; startLoop() then drives the continuous animation when visible.
    controls.update();
    renderFrame();

    startLoop();

    // --- Cleanup ---
    return () => {
      stopLoop();
      cancelAnimationFrame(frame);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      loopObserver?.disconnect();
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('resize', onResize);
      controls.dispose();
      disposables.forEach((m) => m.dispose());
      texturesToDispose.forEach((tex) => tex.dispose());
      // Free the per-icon containment BVHs before disposing their geometries.
      containmentMeshes.forEach((m) => m.geometry.disposeBoundsTree());
      variantGeometries.forEach((g) => g.dispose());
      helixGeo.dispose();
      helixLineMat.dispose();
      tubeGeo.dispose();
      tubeMat.dispose();
      helixRails.forEach((rail) => {
        rail.line.geometry.dispose();
        rail.material.dispose();
      });
      auraGeometry.dispose();
      innerGeometry.dispose();
      ambientGeometry.dispose();
      coordGeo.dispose();
      bgGeometry?.dispose();
      bgMaterial?.dispose();
      sharedPlanetGeo.dispose();
      sharedRingGeo.dispose();
      disposeComposer();
      renderer.dispose();
      // JS-reference hygiene: drop the scene graph so retained meshes/lights
      // don't pin GPU-freed objects until GC (GPU memory is already released
      // via the dispose arrays above; this clears the JS-side references).
      scene.clear();
      reducedMotionQuery.removeEventListener('change', onReducedMotionChange);
      tip.remove();
      renderer.domElement.remove();
    };
  } catch (err) {
    console.error('[spiral] initSpiral failed:', err);
    // Release whatever was allocated before the throw — the success-path
    // cleanup closure is never returned, so without this the renderer /
    // composer / controls leak on a mid-init failure.
    for (const dispose of partialDisposers.reverse()) {
      try {
        dispose();
      } catch (disposeErr) {
        console.error('[spiral] partial dispose failed:', disposeErr);
      }
    }
    throw err;
  }
}
