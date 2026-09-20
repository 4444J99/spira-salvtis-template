/**
 * Spiral — procedural texture generators (extracted from spiral.ts, Phase 4a).
 *
 * Pure CanvasTexture builders: per-phase surface texture + normal map for the
 * node materials, and a shared soft-dot sprite for particle systems. No module
 * state, no DOM beyond an offscreen <canvas> — deterministic given the seed, so
 * the rendered look is byte-identical to the in-file versions.
 */

import * as THREE from 'three';
import { mulberry32 } from '../../data/life-motion-laws';

// ---------------------------------------------------------------------------
// Procedural texture generators
// ---------------------------------------------------------------------------

export function generatePhaseTexture(
  phase: string,
  seed: number,
): THREE.CanvasTexture {
  const size = 256;
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d');
  // No 2D context (headless / blocked canvas) — return the blank canvas as a
  // texture so the material still binds something valid instead of crashing.
  if (!ctx) return new THREE.CanvasTexture(c);
  const rng = mulberry32(seed * 7919 + 13);

  ctx.fillStyle = '#d8d8d8';
  ctx.fillRect(0, 0, size, size);

  if (phase === 'INITIATE') {
    for (let i = 0; i < 40; i++) {
      const x = rng() * size;
      const y = rng() * size;
      const r = 8 + rng() * 40;
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, `rgba(255, 255, 255, ${0.08 + rng() * 0.12})`);
      grad.addColorStop(0.6, `rgba(200, 230, 230, ${0.04 + rng() * 0.06})`);
      grad.addColorStop(1, 'rgba(180, 220, 220, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    for (let i = 0; i < 15; i++) {
      const x = rng() * size;
      const y = rng() * size;
      const r = 2 + rng() * 5;
      ctx.fillStyle = `rgba(255, 255, 255, ${0.15 + rng() * 0.1})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (phase === 'INTEGRATE') {
    ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < 25; i++) {
      const cx = rng() * size;
      const cy = rng() * size;
      const r = 30 + rng() * 60;
      const startAngle = rng() * Math.PI * 2;
      const sweep = 0.5 + rng() * 2.5;
      ctx.strokeStyle = `rgba(220, 235, 245, ${0.06 + rng() * 0.08})`;
      ctx.lineWidth = 3 + rng() * 12;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(cx, cy, r, startAngle, startAngle + sweep);
      ctx.stroke();
    }
    for (let i = 0; i < 12; i++) {
      const x = rng() * size;
      const y = rng() * size;
      const r = 15 + rng() * 35;
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, `rgba(230, 240, 250, ${0.06 + rng() * 0.06})`);
      grad.addColorStop(1, 'rgba(200, 220, 240, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
  } else {
    for (let i = 0; i < 30; i++) {
      const x = rng() * size;
      const y = rng() * size;
      const angle = rng() * Math.PI * 2;
      const len = 20 + rng() * 60;
      ctx.strokeStyle = `rgba(240, 250, 255, ${0.06 + rng() * 0.1})`;
      ctx.lineWidth = 1 + rng() * 2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len);
      ctx.stroke();
    }
    for (let i = 0; i < 20; i++) {
      const x = rng() * size;
      const y = rng() * size;
      const r = 1 + rng() * 3;
      ctx.fillStyle = `rgba(255, 255, 255, ${0.2 + rng() * 0.2})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    for (let i = 0; i < 8; i++) {
      const cx = rng() * size;
      const cy = rng() * size;
      const sides = 3 + Math.floor(rng() * 4);
      const rad = 10 + rng() * 30;
      const startA = rng() * Math.PI * 2;
      ctx.strokeStyle = `rgba(220, 240, 250, ${0.04 + rng() * 0.06})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let s = 0; s <= sides; s++) {
        const a = startA + (s / sides) * Math.PI * 2;
        const px = cx + Math.cos(a) * rad;
        const py = cy + Math.sin(a) * rad;
        s === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
    }
  }

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

export function generatePhaseNormalMap(
  phase: string,
  seed: number,
): THREE.CanvasTexture {
  const size = 128;
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d');
  // No 2D context — return the blank canvas as a flat (neutral) normal map.
  if (!ctx) return new THREE.CanvasTexture(c);
  const rng = mulberry32(seed * 6271 + 37);

  ctx.fillStyle = 'rgb(128, 128, 255)';
  ctx.fillRect(0, 0, size, size);

  if (phase === 'INITIATE') {
    for (let i = 0; i < 20; i++) {
      const cx = rng() * size;
      const cy = rng() * size;
      const r = 5 + rng() * 15;
      const strength = 20 + rng() * 30;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      const hi = Math.round(128 + strength * 0.3);
      const lo = Math.round(128 - strength * 0.2);
      grad.addColorStop(0, `rgb(${hi}, ${hi}, 255)`);
      grad.addColorStop(0.7, `rgb(${lo}, ${lo}, 240)`);
      grad.addColorStop(1, 'rgb(128, 128, 255)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (phase === 'INTEGRATE') {
    for (let i = 0; i < 12; i++) {
      const y0 = rng() * size;
      const amplitude = 5 + rng() * 15;
      const freq = 0.02 + rng() * 0.04;
      const strength = 15 + rng() * 25;
      const width = 3 + rng() * 6;
      const phase0 = rng() * 6;
      for (let x = 0; x < size; x++) {
        const yOff = Math.sin(x * freq + phase0) * amplitude;
        const y = y0 + yOff;
        const nx = Math.round(
          128 + Math.cos(x * freq + phase0) * strength * 0.5,
        );
        const ny = Math.round(128 + Math.sin(x * freq + phase0) * strength);
        ctx.fillStyle = `rgb(${nx}, ${ny}, 245)`;
        ctx.fillRect(x, Math.round(y), 1, Math.round(width));
      }
    }
  } else {
    for (let i = 0; i < 18; i++) {
      const x0 = rng() * size;
      const y0 = rng() * size;
      const angle = rng() * Math.PI * 2;
      const len = 15 + rng() * 40;
      const strength = 25 + rng() * 35;
      const nx = Math.round(128 + Math.sin(angle) * strength);
      const ny = Math.round(128 - Math.cos(angle) * strength);
      ctx.strokeStyle = `rgb(${nx}, ${ny}, 235)`;
      ctx.lineWidth = 2 + rng() * 3;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x0 + Math.cos(angle) * len, y0 + Math.sin(angle) * len);
      ctx.stroke();
    }
  }

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

// ---------------------------------------------------------------------------
// Soft dot texture for particle systems (shared)
// ---------------------------------------------------------------------------

export function createSoftDotTexture(): THREE.CanvasTexture {
  const size = 32;
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d');
  // No 2D context — return the blank canvas as a (transparent) dot texture.
  if (!ctx) return new THREE.CanvasTexture(c);
  const grad = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  );
  grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
  grad.addColorStop(0.4, 'rgba(255, 255, 255, 0.5)');
  grad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(c);
}
