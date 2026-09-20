/**
 * spiral-postprocessing — bloom composer, dynamically imported.
 *
 * UnrealBloomPass + EffectComposer + their shaders are a meaningful slice of the
 * Three.js addon weight, and they are ONLY used on the immersive /spiral page
 * (the homepage hero renders without bloom). Keeping these as a STATIC import in
 * spiral.ts shipped the bloom code in the common chunk even though the homepage
 * never runs it. This module is loaded via dynamic import() so Vite splits it
 * into its own chunk that loads only when immersive bloom is actually needed.
 */
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

export interface BloomComposer {
  composer: EffectComposer;
  setSize: (w: number, h: number) => void;
  dispose: () => void;
}

/** Bloom knobs from the Spiral Parameter Registry (bloom.* element). */
export interface BloomParams {
  strength?: number;
  radius?: number;
  threshold?: number;
}

/**
 * Build the bloom post-processing chain. Defaults match the admin 2026-06-22
 * "a lil more glowwy" tuning (strength 0.5 amplifies chakra COLOR rather than
 * blowing out white, radius 0.4 soft halo, threshold 0.72 so only the emissive
 * cores bloom and the helix/ambient stay crisp) — overridable via the registry
 * (`?p.bloom.strength=…` etc.) through the `bloom` arg.
 */
export function createBloomComposer(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
  w: number,
  h: number,
  bloom: BloomParams = {},
): BloomComposer {
  const composer = new EffectComposer(renderer);
  composer.setSize(w, h);
  composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  composer.addPass(new RenderPass(scene, camera));
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(w, h),
    bloom.strength ?? 0.5,
    bloom.radius ?? 0.4,
    bloom.threshold ?? 0.72,
  );
  composer.addPass(bloomPass);
  composer.addPass(new OutputPass());

  const setSize = (nw: number, nh: number): void => {
    composer.setSize(nw, nh);
    bloomPass.setSize(nw, nh);
  };

  // EffectComposer.dispose() (three@0.184) frees only its two render targets +
  // copyPass — it does NOT iterate this.passes. UnrealBloomPass owns ~6 render
  // targets + materials that leak on every unmount unless disposed explicitly.
  const dispose = (): void => {
    for (const pass of composer.passes) {
      pass.dispose();
    }
    composer.dispose();
  };

  return { composer, setSize, dispose };
}
