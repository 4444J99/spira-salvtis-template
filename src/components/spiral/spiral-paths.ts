/**
 * Spiral — path builders (extracted from spiral.ts, Phase 4a).
 *
 * Pure functions that turn the boot-resolved geometry config into the helix /
 * constellation point arrays the renderer rides. The values that initSpiral
 * overwrites from the Spiral Parameter Registry (turns, height, steps, extend,
 * constellationTail) are passed in as a `PathConfig` at call time rather than
 * read from module globals — ES-module imports are read-only bindings, so the
 * registry could not reassign them across a module boundary. The config is
 * built at the call site immediately after the resolve block, so the produced
 * geometry is identical to the in-file version.
 */

import * as THREE from 'three';
import { type SpiralLayout } from '../../data/hub.config';

/** Boot-resolved helix/constellation geometry knobs (from spiral-params). */
export interface PathConfig {
  turns: number;
  height: number;
  steps: number;
  /** Extension BELOW the bottom node (the infinite-descent tail). */
  extend: number;
  /**
   * Extension ABOVE the top (activate) node. Optional; falls back to `extend`
   * for a symmetric helix. admin wanted the top short so the authenticate/
   * activate star sits at the very top while the bottom keeps falling into fog.
   */
  extendTop?: number;
  constellationTail: number;
}

function buildHelixPath(cfg: PathConfig): THREE.Vector3[] {
  const extBottom = cfg.extend;
  const extTop = cfg.extendTop ?? cfg.extend;
  const totalRange = 1 + extBottom + extTop;
  const totalSteps = Math.ceil(cfg.steps * totalRange);
  const points: THREE.Vector3[] = [];

  for (let i = 0; i <= totalSteps; i++) {
    const p = -extBottom + (i / totalSteps) * totalRange;
    const theta = p * Math.PI * 2 * cfg.turns;
    const r = 2.5 + Math.sin(Math.max(0, Math.min(1, p)) * Math.PI) * 3.5;
    points.push(
      new THREE.Vector3(
        r * Math.cos(theta),
        p * cfg.height - cfg.height / 2,
        r * Math.sin(theta),
      ),
    );
  }
  return points;
}

// "Sovereign Crown" projection: a fixed 13-point asterism that keeps node
// order readable while turning the helix into scattered constellation points.
// Coordinates stay in the same camera envelope as the helix, so existing
// orbit, hover, label, and click logic can keep using path-derived anchors.
const CONSTELLATION_ANCHORS: readonly [number, number, number][] = [
  [-5.6, -5.35, 0.7],
  [-3.35, -4.25, -0.85],
  [-4.75, -2.2, 0.25],
  [-1.75, -2.85, 1.1],
  [-0.15, -1.0, -0.55],
  [-2.35, 0.55, 0.85],
  [0.15, 1.15, 1.35],
  [2.05, 0.25, -0.9],
  [3.8, 1.85, 0.45],
  [1.35, 3.1, 1.0],
  [3.15, 4.15, -0.45],
  [5.45, 3.35, 0.8],
  [4.45, 6.05, -0.15],
];

function constellationAnchor(index: number, count: number): THREE.Vector3 {
  if (count === CONSTELLATION_ANCHORS.length) {
    return new THREE.Vector3(...CONSTELLATION_ANCHORS[index]!);
  }

  const t = count > 1 ? index / (count - 1) : 0.5;
  const scaled = t * (CONSTELLATION_ANCHORS.length - 1);
  const low = Math.floor(scaled);
  const high = Math.min(CONSTELLATION_ANCHORS.length - 1, low + 1);
  const mix = scaled - low;
  return new THREE.Vector3(...CONSTELLATION_ANCHORS[low]!).lerp(
    new THREE.Vector3(...CONSTELLATION_ANCHORS[high]!),
    mix,
  );
}

function buildConstellationPath(
  count: number,
  cfg: PathConfig,
): THREE.Vector3[] {
  const anchors = Array.from({ length: count }, (_, index) =>
    constellationAnchor(index, count),
  );
  if (anchors.length < 2) {
    return buildHelixPath(cfg);
  }

  const curve = new THREE.CatmullRomCurve3(anchors, false, 'centripetal', 0.36);
  const firstTangent = new THREE.Vector3()
    .subVectors(anchors[1]!, anchors[0]!)
    .normalize();
  const lastTangent = new THREE.Vector3()
    .subVectors(anchors[anchors.length - 1]!, anchors[anchors.length - 2]!)
    .normalize();
  const extBottom = cfg.extend;
  const extTop = cfg.extendTop ?? cfg.extend;
  const totalRange = 1 + extBottom + extTop;
  const totalSteps = Math.ceil(cfg.steps * totalRange);
  const points: THREE.Vector3[] = [];

  for (let i = 0; i <= totalSteps; i++) {
    const p = -extBottom + (i / totalSteps) * totalRange;
    if (p < 0) {
      points.push(
        anchors[0]!
          .clone()
          .addScaledVector(firstTangent, p * cfg.constellationTail),
      );
    } else if (p > 1) {
      points.push(
        anchors[anchors.length - 1]!.clone().addScaledVector(
          lastTangent,
          (p - 1) * cfg.constellationTail,
        ),
      );
    } else {
      points.push(curve.getPoint(p));
    }
  }

  return points;
}

export function buildSpiralPath(
  layout: SpiralLayout,
  count: number,
  cfg: PathConfig,
): THREE.Vector3[] {
  return layout === 'constellation'
    ? buildConstellationPath(count, cfg)
    : buildHelixPath(cfg);
}

export function nodePathIndex(
  t: number,
  pathLength: number,
  extendBottom: number,
  extendTop = extendBottom,
): number {
  const totalRange = 1 + extendBottom + extendTop;
  const normalized = (t + extendBottom) / totalRange;
  return Math.max(
    0,
    Math.min(Math.floor(normalized * (pathLength - 1)), pathLength - 1),
  );
}
