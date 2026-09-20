/**
 * Spiral — node geometry builders (extracted from spiral.ts, Phase 4a).
 *
 * Three families of icon-shape geometry, all pure (deterministic per nodeId /
 * envVar seed, no module state) so the rendered forms are byte-identical to the
 * in-file versions:
 *   - Variant A: `symbolGeometryFor` + the hand-built sacred-symbol `make*`
 *     family (sunburst, eye, yin-yang, …). Currently not wired into the live
 *     renderer, but kept intact and exported — it is the loved "each symbol
 *     from a different religion" reference admin may want resurfaced as a
 *     variant (see docs/IDEAL-FORMS-LEDGER.md). Do not delete.
 *   - Variant B: `generativeStarGeometry` — deterministic per-node star.
 *   - Proposal C: `makeGeometryFromPrimitives` — ideal-form (envVar) × lens ×
 *     math-primitive geometry, the path the live renderer uses.
 */

import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { mulberry32 } from '../../data/life-motion-laws';
import { primitiveFor, PHI } from '../../data/sacred-geometry-primitives';
import { type Lens, modulatePrimitive } from '../../data/lens-geometry';
import { type EnvVar } from '../../data/hub.config';

const EXTRUDE_DEFAULT = (
  outerR: number,
  depth: number,
  curveSegments = 16,
) => ({
  depth,
  bevelEnabled: true,
  bevelThickness: depth * 0.18,
  bevelSize: outerR * 0.06,
  bevelSegments: 4,
  curveSegments,
});

function extrudeShape(
  shape: THREE.Shape,
  outerR: number,
  depth: number,
  curveSegments = 8,
): THREE.ExtrudeGeometry {
  const geo = new THREE.ExtrudeGeometry(
    shape,
    EXTRUDE_DEFAULT(outerR, depth, curveSegments),
  );
  geo.center();
  return geo;
}

// N-point regular star (used for sunburst, hexagram, lotus rosette)
function makeStarShape(
  outerR: number,
  innerR: number,
  points: number,
): THREE.Shape {
  const shape = new THREE.Shape();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const a = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  return shape;
}

// 1. Sunburst — 12-ray solar emblem (Egyptian Ra / universal solar disc)
function makeSunburst(outerR: number, depth: number): THREE.ExtrudeGeometry {
  return extrudeShape(makeStarShape(outerR, outerR * 0.22, 12), outerR, depth);
}

// 2. Eye almond + pupil hole (Eye of Horus simplified — vesica almond + iris)
function makeEye(outerR: number, depth: number): THREE.ExtrudeGeometry {
  const w = outerR;
  const h = outerR * 0.55;
  const shape = new THREE.Shape();
  shape.moveTo(-w, 0);
  shape.quadraticCurveTo(-w * 0.5, h, 0, h);
  shape.quadraticCurveTo(w * 0.5, h, w, 0);
  shape.quadraticCurveTo(w * 0.5, -h, 0, -h);
  shape.quadraticCurveTo(-w * 0.5, -h, -w, 0);
  const pupil = new THREE.Path();
  pupil.absellipse(
    0,
    0,
    outerR * 0.18,
    outerR * 0.18,
    0,
    Math.PI * 2,
    false,
    0,
  );
  shape.holes.push(pupil);
  return extrudeShape(shape, outerR, depth, 12);
}

// 3. Yin-yang disc — circle with two small dot-holes (taegeuk dots)
function makeYinYang(outerR: number, depth: number): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  shape.absellipse(
    0,
    0,
    outerR * 0.95,
    outerR * 0.95,
    0,
    Math.PI * 2,
    false,
    0,
  );
  const yang = new THREE.Path();
  yang.absellipse(
    0,
    outerR * 0.4,
    outerR * 0.18,
    outerR * 0.18,
    0,
    Math.PI * 2,
    false,
    0,
  );
  const yin = new THREE.Path();
  yin.absellipse(
    0,
    -outerR * 0.4,
    outerR * 0.18,
    outerR * 0.18,
    0,
    Math.PI * 2,
    false,
    0,
  );
  shape.holes.push(yang, yin);
  return extrudeShape(shape, outerR, depth, 24);
}

// 4. Upward triangle (Pythagorean fire / Hindu Manipura)
function makeUpwardTriangle(
  outerR: number,
  depth: number,
): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(a) * outerR;
    const y = Math.sin(a) * outerR;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  return extrudeShape(shape, outerR, depth);
}

// 5. Teardrop (water — Root Healing)
function makeTeardrop(outerR: number, depth: number): THREE.ExtrudeGeometry {
  const r = outerR * 0.7;
  const tip = outerR;
  const shape = new THREE.Shape();
  shape.moveTo(0, tip);
  shape.bezierCurveTo(r, tip * 0.4, r, -r * 0.6, 0, -r);
  shape.bezierCurveTo(-r, -r * 0.6, -r, tip * 0.4, 0, tip);
  return extrudeShape(shape, outerR, depth, 16);
}

// 6. Vesica piscis (mandorla — Christian/Hindu/Sufi mystical union, replaces generic heart)
function makeVesicaPiscis(
  outerR: number,
  depth: number,
): THREE.ExtrudeGeometry {
  const w = outerR * 0.55;
  const h = outerR;
  const shape = new THREE.Shape();
  shape.moveTo(0, h);
  shape.quadraticCurveTo(w, 0, 0, -h);
  shape.quadraticCurveTo(-w, 0, 0, h);
  return extrudeShape(shape, outerR, depth, 16);
}

// 7. Crescent moon (Islamic / lunar feminine)
function makeCrescent(outerR: number, depth: number): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  shape.absellipse(
    0,
    0,
    outerR * 0.95,
    outerR * 0.95,
    0,
    Math.PI * 2,
    false,
    0,
  );
  const bite = new THREE.Path();
  bite.absellipse(
    outerR * 0.35,
    0,
    outerR * 0.78,
    outerR * 0.78,
    0,
    Math.PI * 2,
    false,
    0,
  );
  shape.holes.push(bite);
  return extrudeShape(shape, outerR, depth, 24);
}

// 8. Hexagram (Star of David / Hindu Anahata — coherence)
function makeHexagram(outerR: number, depth: number): THREE.ExtrudeGeometry {
  return extrudeShape(makeStarShape(outerR, outerR * 0.55, 6), outerR, depth);
}

// 9. Lotus rosette (Buddhist Sahasrara — awakening) — 8-point flower
function makeLotus(outerR: number, depth: number): THREE.ExtrudeGeometry {
  return extrudeShape(
    makeStarShape(outerR, outerR * 0.62, 8),
    outerR,
    depth,
    12,
  );
}

// 10. Eye-in-triangle (Egyptian / Masonic Eye of Providence)
function makeEyeInTriangle(
  outerR: number,
  depth: number,
): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(a) * outerR;
    const y = Math.sin(a) * outerR;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  const eye = new THREE.Path();
  eye.absellipse(
    0,
    -outerR * 0.05,
    outerR * 0.22,
    outerR * 0.22,
    0,
    Math.PI * 2,
    false,
    0,
  );
  shape.holes.push(eye);
  return extrudeShape(shape, outerR, depth, 12);
}

// 11. Solar cross / sun-wheel (Celtic / pre-Christian — replaces generic equal-arm cross)
//     Disc with cross-shaped hole — silhouette reads as wheeled cross.
function makeSolarCross(outerR: number, depth: number): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  shape.absellipse(
    0,
    0,
    outerR * 0.95,
    outerR * 0.95,
    0,
    Math.PI * 2,
    false,
    0,
  );
  const armW = outerR * 0.18;
  const armL = outerR * 0.78;
  const crossHole = new THREE.Path();
  crossHole.moveTo(-armW, armW);
  crossHole.lineTo(-armW, armL);
  crossHole.lineTo(armW, armL);
  crossHole.lineTo(armW, armW);
  crossHole.lineTo(armL, armW);
  crossHole.lineTo(armL, -armW);
  crossHole.lineTo(armW, -armW);
  crossHole.lineTo(armW, -armL);
  crossHole.lineTo(-armW, -armL);
  crossHole.lineTo(-armW, -armW);
  crossHole.lineTo(-armL, -armW);
  crossHole.lineTo(-armL, armW);
  crossHole.closePath();
  shape.holes.push(crossHole);
  return extrudeShape(shape, outerR, depth, 32);
}

// 12. Octahedron (sacred geometry — multifaceted truth)
function makeOctahedron(outerR: number): THREE.OctahedronGeometry {
  return new THREE.OctahedronGeometry(outerR * 1.05, 0);
}

// 13. Ankh (Egyptian "key of life") — loop + cross merged into one BufferGeometry.
// All three parts built in absolute coords (no auto-center), merged, then centered.
function makeAnkh(outerR: number, depth: number): THREE.BufferGeometry {
  // Loop sits above the cross with its center at y = +0.50
  const loopCY = outerR * 0.5;
  const loop = new THREE.Shape();
  loop.absellipse(
    0,
    loopCY,
    outerR * 0.42,
    outerR * 0.5,
    0,
    Math.PI * 2,
    false,
    0,
  );
  const loopHole = new THREE.Path();
  loopHole.absellipse(
    0,
    loopCY,
    outerR * 0.2,
    outerR * 0.26,
    0,
    Math.PI * 2,
    false,
    0,
  );
  loop.holes.push(loopHole);
  const loopGeo = new THREE.ExtrudeGeometry(
    loop,
    EXTRUDE_DEFAULT(outerR, depth, 20),
  );

  // Vertical bar below the loop
  const vert = new THREE.Shape();
  const vw = outerR * 0.13;
  const vTop = outerR * 0.05;
  const vBot = -outerR * 0.95;
  vert.moveTo(-vw, vTop);
  vert.lineTo(vw, vTop);
  vert.lineTo(vw, vBot);
  vert.lineTo(-vw, vBot);
  vert.closePath();
  const vertGeo = new THREE.ExtrudeGeometry(
    vert,
    EXTRUDE_DEFAULT(outerR, depth, 4),
  );

  // Horizontal cross-arms
  const horz = new THREE.Shape();
  const hw = outerR * 0.65;
  const hh = outerR * 0.13;
  const hY = -outerR * 0.2;
  horz.moveTo(-hw, hY + hh);
  horz.lineTo(hw, hY + hh);
  horz.lineTo(hw, hY - hh);
  horz.lineTo(-hw, hY - hh);
  horz.closePath();
  const horzGeo = new THREE.ExtrudeGeometry(
    horz,
    EXTRUDE_DEFAULT(outerR, depth, 4),
  );

  const merged = mergeGeometries([loopGeo, vertGeo, horzGeo], false);
  loopGeo.dispose();
  vertGeo.dispose();
  horzGeo.dispose();
  if (!merged) throw new Error('ankh merge failed');
  merged.center();
  return merged;
}

// Variant A — fixed sacred-symbol mapping per node id (1..13)
export function symbolGeometryFor(
  nodeId: number,
  outerR: number,
  depth: number,
): THREE.BufferGeometry {
  switch (nodeId) {
    case 1:
      return makeSunburst(outerR, depth);
    case 2:
      return makeEye(outerR, depth);
    case 3:
      return makeYinYang(outerR, depth);
    case 4:
      return makeUpwardTriangle(outerR, depth);
    case 5:
      return makeTeardrop(outerR, depth);
    case 6:
      return makeVesicaPiscis(outerR, depth); // less-generic replacement for heart
    case 7:
      return makeCrescent(outerR, depth);
    case 8:
      return makeHexagram(outerR, depth);
    case 9:
      return makeLotus(outerR, depth);
    case 10:
      return makeEyeInTriangle(outerR, depth);
    case 11:
      return makeSolarCross(outerR, depth); // less-generic replacement for plain cross
    case 12:
      return makeOctahedron(outerR);
    case 13:
      return makeAnkh(outerR, depth);
    default:
      return makeSunburst(outerR, depth);
  }
}

// Variant B — generative star, deterministic per nodeId.
// Per-node: random point count (5–12), inner-radius ratio, twist, jitter, depth profile.
// All seeds are stable, so a given node always renders the same form across visits.
export function generativeStarGeometry(
  nodeId: number,
  outerR: number,
  depth: number,
): THREE.ExtrudeGeometry {
  const rng = mulberry32(nodeId * 9173 + 401);
  const points = 5 + Math.floor(rng() * 8); // 5..12 points
  const innerRatio = 0.28 + rng() * 0.32; // 0.28..0.60
  const twist = (rng() - 0.5) * 0.45; // -0.22..+0.22 rad full sweep
  const jitter = 0.18;
  const shape = new THREE.Shape();
  for (let i = 0; i < points * 2; i++) {
    const isOuter = i % 2 === 0;
    const baseR = isOuter ? outerR : outerR * innerRatio;
    const r = baseR * (1 + (rng() - 0.5) * jitter);
    const a =
      (i / (points * 2)) * Math.PI * 2 -
      Math.PI / 2 +
      twist * (i / (points * 2));
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: depth * (0.7 + rng() * 0.6),
    bevelEnabled: true,
    bevelThickness: depth * 0.22,
    bevelSize: outerR * 0.08,
    bevelSegments: 5,
    curveSegments: 16,
  });
  geo.center();
  return geo;
}

// -----------------------------------------------------------------------------
// Proposal C — Mathematical Primitives Generative
// "We need to break the ideals into their primitives and figure out the mathemogic of it."
// Each node = ideal form (envVar) × all lenses × mathematical constraints. NOT fixed, NOT random.
// -----------------------------------------------------------------------------

export function makeGeometryFromPrimitives(
  envVar: string,
  nodeId: number,
  outerR: number,
  depth: number,
  lens: Lens,
  hash: number,
): THREE.ExtrudeGeometry {
  const basePrim = primitiveFor(envVar as EnvVar);
  const modulated = modulatePrimitive(envVar as EnvVar, lens);
  const rng = mulberry32(hash);

  const vertexCount = Math.max(
    3,
    modulated.vertexCount + Math.floor((rng() - 0.5) * 4),
  );
  const innerRatio = Math.max(
    0.1,
    Math.min(0.9, modulated.innerRatio + (rng() - 0.5) * 0.25),
  );
  const twist = Math.max(
    0,
    Math.min(1, modulated.twistFactor + (rng() - 0.5) * 0.3),
  );
  // Lens-driven scale: phiExponent already incorporates the lens's scaleMul
  // (lens-geometry.ts — base.phiExponent + log_PHI(scaleMul), so PHI^modulated
  // equals PHI^base × scaleMul), so we re-derive a scale factor here. The
  // trailing jitter keeps node-to-node variation from looking mechanical.
  const scaleMul = Math.pow(PHI, modulated.phiExponent) * (0.85 + rng() * 0.3);
  const fractalDepth =
    modulated.symmetry === 'fractal' ? 1 + Math.floor(rng() * 2) : 1;

  const shape = new THREE.Shape();

  for (let ring = 0; ring <= fractalDepth; ring++) {
    const ringScale =
      ring === 0 ? scaleMul : scaleMul * 0.65 * Math.pow(PHI, -ring * 0.5);
    const ringOffset = ring * (Math.PI / vertexCount) * 0.3;

    for (let i = 0; i < vertexCount * 2; i++) {
      const isOuter = i % 2 === 0;
      const baseR = isOuter
        ? outerR * ringScale
        : outerR * innerRatio * ringScale;

      const t = i / (vertexCount * 2);
      const angle = t * Math.PI * 2 - Math.PI / 2 + twist * t + ringOffset;

      const jitter = ring > 0 ? 0.08 : 0.12;
      const r = baseR * (1 + (rng() - 0.5) * jitter);

      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;

      if (ring === 0 && i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
  }

  shape.closePath();

  const modulatedDepth = depth * (0.7 + modulated.depthRatio * 0.5);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: modulatedDepth,
    bevelEnabled: true,
    bevelThickness: depth * 0.18,
    bevelSize: outerR * 0.06,
    bevelSegments: 4,
    curveSegments: 12,
  });

  geo.center();
  return geo;
}
