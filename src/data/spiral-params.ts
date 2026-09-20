/**
 * Spiral Parameter Registry — the single named, tweakable source of truth for
 * every visual element of the Sovereign Systems Spiral.
 *
 * Directive (Anthony, 2026-06-24): "essentially every element needs a name we
 * can point to and define and tweak (parameters) — so i can be specific in what
 * we are all talking about." This file is that vocabulary: each element has a
 * admin-facing label, and each knob a label + plain-language description +
 * bounded range. The spiral reads its live values from here; the `?tune` panel
 * and the /aesthetics glossary render FROM here; and any look is fully captured
 * by a shareable URL (`?p.<element>.<param>=<value>`).
 *
 * `wired: false` marks a knob that is NAMED + documented but not yet connected
 * to the live renderer — the tune panel renders it disabled so a slider never
 * lies about what it controls. Rollout flips these to wired element-by-element.
 */

export type ParamCategory = 'visual' | 'physics' | 'structure';
export type ParamControl = 'range' | 'color' | 'select' | 'toggle';

export interface SpiralParam {
  /** Stable dotted key — the URL-serialization + lookup key, e.g. 'bgStars.count'. */
  key: string;
  /** admin-facing name. */
  label: string;
  /** Code identifier this param owns (the const/uniform it replaces in spiral.ts). */
  technicalName: string;
  /** Current/default value. */
  value: number | string | boolean;
  /** One-sentence plain-language effect (tooltips + /aesthetics cards). */
  description: string;
  control: ParamControl;
  min?: number;
  max?: number;
  step?: number;
  /** Display unit suffix, e.g. 'px', 'rad/s'. */
  unit?: string;
  /** select controls: allowed values. */
  options?: string[];
  /** Source line in spiral.ts for traceability. */
  source?: string;
  /** False = named/documented but not yet connected to the live renderer. */
  wired?: boolean;
}

export interface SpiralElement {
  /** Group id — first segment of every child key, e.g. 'bgStars'. */
  id: string;
  label: string;
  technicalName: string;
  category: ParamCategory;
  description: string;
  params: SpiralParam[];
}

export const SPIRAL_PARAMS: SpiralElement[] = [
  {
    id: 'bgStars',
    label: 'Background Starfield',
    technicalName: 'AMBIENT_* (spiral.ts)',
    category: 'visual',
    description:
      'The drifting, twinkling field of teal/sky dots around the helix so the cosmos never reads as a vacuum — the field admin loved in the April builds, cut on a "near-empty void" rationale and restored 2026-06-24.',
    params: [
      {
        key: 'bgStars.count',
        label: 'Star Count',
        technicalName: 'AMBIENT_PARTICLE_COUNT',
        value: 1200,
        description: 'How many background stars exist. More = denser cosmos.',
        control: 'range',
        min: 0,
        max: 4000,
        step: 50,
        unit: '',
      },
      {
        key: 'bgStars.radius',
        label: 'Field Radius (Spread Width)',
        technicalName: 'AMBIENT_VOLUME_RADIUS',
        value: 26,
        description:
          'Horizontal radius of the star box. Larger = stars spread wider from the spiral.',
        control: 'range',
        min: 5,
        max: 60,
        step: 1,
        unit: '',
      },
      {
        key: 'bgStars.height',
        label: 'Field Height (Spread Tall)',
        technicalName: 'AMBIENT_VOLUME_HEIGHT',
        value: 40,
        description: 'Vertical extent of the starfield box.',
        control: 'range',
        min: 5,
        max: 80,
        step: 1,
        unit: '',
      },
      {
        key: 'bgStars.size',
        label: 'Star Size',
        technicalName: 'AMBIENT_PARTICLE_SIZE',
        value: 0.14,
        description:
          'On-screen size of each star. Too small = sub-pixel/invisible. (admin 2026-06-25: "stars could be a little bit bigger" — 0.1→0.14.)',
        control: 'range',
        min: 0.01,
        max: 0.5,
        step: 0.01,
        unit: '',
      },
      {
        key: 'bgStars.opacity',
        label: 'Starfield Brightness/Opacity',
        technicalName: 'AMBIENT_OPACITY',
        value: 0.7,
        description: 'Overall visibility of the whole starfield.',
        control: 'range',
        min: 0,
        max: 1,
        step: 0.05,
        unit: '',
      },
      {
        key: 'bgStars.brightnessMin',
        label: 'Dimmest-Star Floor',
        technicalName: 'AMBIENT_BRIGHTNESS_MIN',
        value: 0.55,
        description: 'Minimum brightness any star can have.',
        control: 'range',
        min: 0,
        max: 1,
        step: 0.05,
        unit: '',
      },
      {
        key: 'bgStars.brightnessRange',
        label: 'Twinkle Brightness Spread',
        technicalName: 'AMBIENT_BRIGHTNESS_RANGE',
        value: 0.45,
        description: 'How much star brightness varies above the floor.',
        control: 'range',
        min: 0,
        max: 1,
        step: 0.05,
        unit: '',
      },
      {
        key: 'bgStars.driftAmpX',
        label: 'Drift Amount (sideways)',
        technicalName: 'ambientParams.driftAmpX',
        value: 0.7,
        description: 'How far each star wanders sideways over time.',
        control: 'range',
        min: 0,
        max: 3,
        step: 0.1,
        unit: '',
      },
      {
        key: 'bgStars.driftAmpY',
        label: 'Drift Amount (vertical)',
        technicalName: 'ambientParams.driftAmpY',
        value: 0.5,
        description: 'How far each star wanders up/down over time.',
        control: 'range',
        min: 0,
        max: 3,
        step: 0.1,
        unit: '',
      },
      {
        key: 'bgStars.additive',
        label: 'Glowy Blend (additive)',
        technicalName: 'ambientMaterial.blending',
        value: true,
        description: 'On = stars add their light (glowy); off = flat/opaque.',
        control: 'toggle',
      },
    ],
  },
  {
    id: 'helix',
    label: 'Spiral Axis (Helix Shape)',
    technicalName: 'TURNS / HELIX_HEIGHT / PATH_* (spiral.ts)',
    category: 'structure',
    description:
      'The overall geometry of the helix curve itself — how many times it coils, how tall it is, and how far it runs into the fog past the visible nodes.',
    params: [
      {
        key: 'helix.turns',
        label: 'Number of Turns',
        technicalName: 'TURNS',
        value: 3.5,
        description:
          'How many times the helix wraps around. More = tighter, busier coil.',
        control: 'range',
        min: 1,
        max: 8,
        step: 0.5,
        unit: '',
      },
      {
        key: 'helix.height',
        label: 'Helix Height',
        technicalName: 'HELIX_HEIGHT',
        value: 14,
        description:
          'Total vertical span of the spiral. Taller = more stretched top-to-bottom.',
        control: 'range',
        min: 4,
        max: 30,
        step: 1,
        unit: '',
      },
      {
        key: 'helix.pathExtend',
        label: 'Infinite Extension (bottom)',
        technicalName: 'PATH_EXTEND',
        value: 0.85,
        description:
          'How far the helix runs BELOW the bottom node before dissolving in fog (the infinite-descent tail).',
        control: 'range',
        min: 0,
        max: 2,
        step: 0.05,
        unit: '',
      },
      {
        key: 'helix.pathExtendTop',
        label: 'Top Trim (above unlock star)',
        technicalName: 'PATH_EXTEND_TOP',
        value: 0.12,
        description:
          'How far the helix runs ABOVE the top (authenticate/unlock) node before dissolving. Low = the unlock star sits right at the top. (admin 2026-06-25: "top of the spiral could be shorter cause I want the authenticate/unlock star to be at the top".)',
        control: 'range',
        min: 0,
        max: 2,
        step: 0.05,
        unit: '',
      },
      {
        key: 'helix.pathSteps',
        label: 'Path Smoothness',
        technicalName: 'PATH_STEPS',
        value: 512,
        description: 'Resolution of the helix curve. Higher = smoother line.',
        control: 'range',
        min: 64,
        max: 1024,
        step: 32,
        unit: '',
      },
      {
        key: 'helix.constellationTail',
        label: 'Constellation Tail Length',
        technicalName: 'CONSTELLATION_TAIL',
        value: 4.6,
        description:
          'How far the constellation-layout path tails extend past the first/last star.',
        control: 'range',
        min: 0,
        max: 12,
        step: 0.2,
        unit: '',
      },
      {
        key: 'helix.railCount',
        label: 'Energy Rail Count',
        technicalName: 'HELIX_RAIL_COUNT',
        value: 7,
        description:
          'How many woven energy strands run along the helix giving it layered texture.',
        control: 'range',
        min: 0,
        max: 14,
        step: 1,
        unit: '',
      },
    ],
  },
  {
    id: 'helixLine',
    label: 'Core Spiral Thread',
    technicalName: 'helixLineMat (spiral.ts)',
    category: 'visual',
    description:
      'The vertex-colored line tracing the helix path (GPU-clamped to a 1px hairline — the Tube below carries the visible body).',
    params: [
      {
        key: 'helixLine.opacity',
        label: 'Thread Opacity',
        technicalName: 'helixLineMat.opacity',
        value: 0.92,
        description: 'Visibility of the core spiral thread.',
        control: 'range',
        min: 0,
        max: 1,
        step: 0.02,
        unit: '',
      },
    ],
  },
  {
    id: 'helixTube',
    label: 'Helix Tube (Bold Spiral Body)',
    technicalName: 'TubeGeometry / tubeMat (spiral.ts)',
    category: 'visual',
    description:
      'A real tube laid along the helix giving the spiral visible BODY and bloom glow (added because the raw line "doesnt appear as much").',
    params: [
      {
        key: 'helixTube.radius',
        label: 'Tube Radius (thickness)',
        technicalName: 'TubeGeometry.radius',
        value: 0.05,
        description: 'How thick the spiral reads. Thicker = bolder.',
        control: 'range',
        min: 0.005,
        max: 0.3,
        step: 0.005,
        unit: '',
      },
      {
        key: 'helixTube.opacity',
        label: 'Tube Opacity',
        technicalName: 'tubeMat.opacity',
        value: 0.55,
        description: 'Brightness of the glowing tube.',
        control: 'range',
        min: 0,
        max: 1,
        step: 0.05,
        unit: '',
      },
      {
        key: 'helixTube.radialSegs',
        label: 'Tube Roundness (segments)',
        technicalName: 'tubeRadialSegs',
        value: 8,
        description: 'Roundness of the tube cross-section.',
        control: 'range',
        min: 3,
        max: 16,
        step: 1,
        unit: '',
      },
      {
        key: 'helixTube.additive',
        label: 'Glowy Blend (additive)',
        technicalName: 'tubeMat.blending',
        value: true,
        description: 'On = adds light (glowy); off = opaque.',
        control: 'toggle',
      },
    ],
  },
  {
    id: 'materia',
    label: 'Materia Node-Field',
    technicalName: 'MATERIA_FIELD_* / fieldMat (spiral.ts)',
    category: 'physics',
    description:
      "The dense physics particle cloud filling each icon's interior — the 'little universe inside each node' admin loves. Heaviest visual + compute element.",
    params: [
      {
        key: 'materia.particles',
        label: 'Particles Per Node',
        technicalName: 'MATERIA_FIELD_PARTICLES',
        value: 1600,
        description:
          'How many particles fill each node. Higher = solid fill; big GPU cost.',
        control: 'range',
        min: 100,
        max: 3000,
        step: 50,
        unit: '',
      },
      {
        key: 'materia.sizeMin',
        label: 'Smallest Grain Size',
        technicalName: 'MATERIA_FIELD_SIZE_MIN',
        value: 0.006,
        description: 'Size of the tiniest interior particles.',
        control: 'range',
        min: 0.001,
        max: 0.05,
        step: 0.001,
        unit: '',
      },
      {
        key: 'materia.sizeMax',
        label: 'Largest Grain Size',
        technicalName: 'MATERIA_FIELD_SIZE_MAX',
        value: 0.032,
        description:
          'Size of the biggest interior particles. Larger closes gaps.',
        control: 'range',
        min: 0.005,
        max: 0.1,
        step: 0.002,
        unit: '',
      },
      {
        key: 'materia.pixelScale',
        label: 'Field Particle Screen Scale',
        technicalName: 'uPixelScale',
        value: 620,
        description: 'Master multiplier on on-screen particle size.',
        control: 'range',
        min: 100,
        max: 1500,
        step: 20,
        unit: '',
      },
      {
        key: 'materia.opacityLive',
        label: 'Live-Node Field Opacity',
        technicalName: 'uOpacity(live)',
        value: 0.95,
        description: 'Brightness of the interior cloud for unlocked nodes.',
        control: 'range',
        min: 0,
        max: 1,
        step: 0.05,
        unit: '',
      },
      {
        key: 'materia.breathFreq',
        label: 'Breath Cycle Speed',
        technicalName: 'IMPLODE_EXPLODE_FREQ',
        value: 0.32,
        description:
          'Speed of the slow implode/explode breathing of the cloud.',
        control: 'range',
        min: 0.05,
        max: 2,
        step: 0.05,
        unit: 'rad/s',
      },
      {
        key: 'materia.breathAmp',
        label: 'Breath Cycle Amount',
        technicalName: 'IMPLODE_EXPLODE_AMP',
        value: 0.06,
        description:
          'How much the cloud breathes in/out. Gentle so the form HOLDS.',
        control: 'range',
        min: 0,
        max: 0.4,
        step: 0.01,
        unit: '',
      },
      {
        key: 'materia.collisionFraction',
        label: 'Collision Check Fraction',
        technicalName: 'COLLISION_CHECK_FRACTION',
        value: 0.06,
        description:
          'Fraction of particles wall-tested each frame (containment vs perf).',
        control: 'range',
        min: 0.01,
        max: 0.5,
        step: 0.01,
        unit: '',
      },
    ],
  },
  {
    id: 'vessel',
    label: 'Node Vessel (Icon Shell)',
    technicalName: 'ORB_RADIUS / vesselMode (spiral.ts)',
    category: 'structure',
    description:
      "The 3D sacred-symbol shell that defines each node's shape and contains its particle universe. Size + smoothness are tweakable; the look mode is set via ?vessel=.",
    params: [
      {
        key: 'vessel.radius',
        label: 'Node Size',
        technicalName: 'ORB_RADIUS',
        value: 0.58,
        description: 'Base size of every node/icon. Larger = bigger icons.',
        control: 'range',
        min: 0.2,
        max: 1.5,
        step: 0.02,
        unit: '',
      },
      {
        key: 'vessel.segments',
        label: 'Icon Smoothness',
        technicalName: 'ORB_SEGMENTS',
        value: 32,
        description: 'Roundness/curve resolution of icon geometry.',
        control: 'range',
        min: 8,
        max: 64,
        step: 4,
        unit: '',
      },
      {
        key: 'vessel.mode',
        label: 'Vessel Mode',
        technicalName: 'vesselMode',
        value: 'invisible',
        description:
          'Shell look: invisible (only the universe shows), visible (glass icon), hybrid, or refracted-star. Settable here or via ?vessel=.',
        control: 'select',
        options: ['invisible', 'visible', 'hybrid', 'refracted-star'],
        source: 'spiral.ts:2036',
      },
      {
        key: 'vessel.visibleOpacity',
        label: 'Glass Shell Opacity (visible mode)',
        technicalName: 'meshVisible.opacity',
        value: 0.22,
        description:
          'Translucency of the icon glass when a visible/hybrid vessel mode is on (symbol nodes).',
        control: 'range',
        min: 0,
        max: 1,
        step: 0.02,
        source: 'spiral.ts:2586',
      },
    ],
  },
  {
    id: 'emissive',
    label: 'Node Glow & Material',
    technicalName: 'PHASE_MAT / PHASE_ANIM (spiral.ts)',
    category: 'visual',
    description:
      'The self-lit emissive glow of each node and its glass material (roughness, metalness, iridescence). What bloom amplifies into a halo. Live steady-state glow, color saturation, and hover-ignition are tunable; per-phase shimmer amp/freq stay code-side recipes.',
    params: [
      {
        key: 'emissive.liveSymbols',
        label: 'Symbol Node Glow (live)',
        technicalName: 'animParams.emissiveBase (symbols,live)',
        value: 0.38,
        description:
          'Steady-state self-glow of symbol nodes (drives emissiveBase in the loop). Too high blows out white spiky shapes; bloom adds the radiance.',
        control: 'range',
        min: 0,
        max: 2,
        step: 0.05,
        source: 'spiral.ts:3121',
      },
      {
        key: 'emissive.liveStars',
        label: 'Star Node Glow (live)',
        technicalName: 'animParams.emissiveBase (stars,live)',
        value: 0.38,
        description:
          'Steady-state self-glow of star-variant nodes (drives emissiveBase when ?vessel=refracted-star). Independent lever from symbol glow.',
        control: 'range',
        min: 0,
        max: 2,
        step: 0.05,
        source: 'spiral.ts:3121',
      },
      {
        key: 'emissive.saturation',
        label: 'Glow Color Saturation',
        technicalName: 'emissive lerp(white)',
        value: 0.3,
        description:
          'How chakra-colored vs washed-white the glowing core is (0 = full chakra color, 1 = pure white).',
        control: 'range',
        min: 0,
        max: 1,
        step: 0.05,
        source: 'spiral.ts:2529',
      },
      {
        key: 'emissive.hoverBoost',
        label: 'Hover Ignition Boost',
        technicalName: 'he * hoverBoost',
        value: 0.85,
        description:
          'Extra glow added when you hover a node (the world wakes).',
        control: 'range',
        min: 0,
        max: 2,
        step: 0.05,
        source: 'spiral.ts:3598',
      },
    ],
  },
  {
    id: 'bloom',
    label: 'Bloom Glow (Post-Processing)',
    technicalName: 'UnrealBloomPass (spiral-postprocessing.ts)',
    category: 'visual',
    description:
      'Amplifies the brightest emissive pixels into soft halos — what makes nodes read as actual stars. Immersive /spiral page only.',
    params: [
      {
        key: 'bloom.strength',
        label: 'Bloom Strength',
        technicalName: 'UnrealBloomPass.strength',
        value: 0.5,
        description: 'How intense the glow halo is. Too high blows to white.',
        control: 'range',
        min: 0,
        max: 3,
        step: 0.05,
        unit: '',
      },
      {
        key: 'bloom.radius',
        label: 'Bloom Radius',
        technicalName: 'UnrealBloomPass.radius',
        value: 0.4,
        description: 'How wide/soft the glow spreads.',
        control: 'range',
        min: 0,
        max: 1,
        step: 0.05,
        unit: '',
      },
      {
        key: 'bloom.threshold',
        label: 'Bloom Threshold',
        technicalName: 'UnrealBloomPass.threshold',
        value: 0.72,
        description:
          'Brightness cutoff above which pixels bloom. Lower = more things glow.',
        control: 'range',
        min: 0,
        max: 1,
        step: 0.02,
        unit: '',
      },
    ],
  },
  {
    id: 'fog',
    label: 'Fog / Depth & Background',
    technicalName: 'FOG_DENSITY / BG_COLOR (spiral.ts)',
    category: 'visual',
    description:
      'Exponential fog dissolving the helix endpoints into the background, creating the infinite-depth illusion, plus the deep base color of the void.',
    params: [
      {
        key: 'fog.density',
        label: 'Fog Density',
        technicalName: 'FOG_DENSITY',
        value: 0.05,
        description: 'How quickly things fade into background with distance.',
        control: 'range',
        min: 0,
        max: 0.3,
        step: 0.005,
        unit: '',
      },
      {
        key: 'fog.color',
        label: 'Background Color',
        technicalName: 'BG_COLOR',
        value: '#020b10',
        description:
          'The deep base color of the void and fog (matches page bg — no seam).',
        control: 'color',
      },
    ],
  },
  {
    id: 'camera',
    label: 'Camera',
    technicalName: 'PerspectiveCamera / OrbitControls (spiral.ts)',
    category: 'structure',
    description:
      'The perspective camera framing the spiral, its lens angle, and the slow idle auto-rotation.',
    params: [
      {
        key: 'camera.fov',
        label: 'Field of View',
        technicalName: 'PerspectiveCamera.fov',
        value: 60,
        description:
          'Lens angle. Wider = more dramatic perspective; narrower = flatter/zoomed.',
        control: 'range',
        min: 25,
        max: 100,
        step: 1,
        unit: '°',
      },
      {
        key: 'camera.autoRotate',
        label: 'Auto-Rotate',
        technicalName: 'controls.autoRotate',
        value: true,
        description: 'Whether the scene idles by slowly spinning.',
        control: 'toggle',
      },
      {
        key: 'camera.autoRotateSpeed',
        label: 'Auto-Rotate Speed',
        technicalName: 'controls.autoRotateSpeed',
        value: 0.4,
        description: 'How fast the scene spins on its own.',
        control: 'range',
        min: 0,
        max: 3,
        step: 0.1,
        unit: '',
      },
      {
        key: 'camera.damping',
        label: 'Drag Inertia',
        technicalName: 'controls.dampingFactor',
        value: 0.05,
        description: 'Glide/inertia of drag-rotate. Lower = more glide.',
        control: 'range',
        min: 0.01,
        max: 0.5,
        step: 0.01,
        source: 'spiral.ts:2269',
      },
    ],
  },
  {
    id: 'render',
    label: 'Render Pipeline (Exposure & Sharpness)',
    technicalName: 'renderer.* (spiral.ts)',
    category: 'visual',
    description:
      'Tone-mapping exposure (overall scene brightness) and the device-pixel-ratio cap (sharpness vs performance).',
    params: [
      {
        key: 'render.exposure',
        label: 'Exposure (Brightness)',
        technicalName: 'renderer.toneMappingExposure',
        value: 1.25,
        description:
          'Master scene brightness. Higher = brighter; lower = moodier.',
        control: 'range',
        min: 0.2,
        max: 3,
        step: 0.05,
        unit: '',
      },
      {
        key: 'render.dprCap',
        label: 'Resolution Cap (DPR)',
        technicalName: 'renderer.setPixelRatio cap',
        value: 2,
        description:
          'Max render resolution on Retina screens. Higher = sharper but heavier.',
        control: 'range',
        min: 1,
        max: 3,
        step: 0.5,
        unit: '×',
      },
    ],
  },
  {
    id: 'lighting',
    label: 'Lighting',
    technicalName: 'AmbientLight / PointLight (spiral.ts)',
    category: 'visual',
    description:
      'Scene lighting: a flat ambient fill plus a teal key light and a warm gold fill light that shape the icon glass.',
    params: [
      {
        key: 'lighting.ambient',
        label: 'Ambient Fill',
        technicalName: 'AmbientLight.intensity',
        value: 1.0,
        description:
          'Flat, even base illumination. Higher = brighter/flatter scene.',
        control: 'range',
        min: 0,
        max: 3,
        step: 0.1,
        unit: '',
      },
      {
        key: 'lighting.keyIntensity',
        label: 'Key Light (teal)',
        technicalName: 'keyLight.intensity',
        value: 2.2,
        description: 'Strength of the main teal light.',
        control: 'range',
        min: 0,
        max: 6,
        step: 0.1,
        unit: '',
      },
      {
        key: 'lighting.fillIntensity',
        label: 'Fill Light (gold)',
        technicalName: 'fillLight.intensity',
        value: 1.0,
        description: 'Strength of the warm gold fill light (opposite side).',
        control: 'range',
        min: 0,
        max: 6,
        step: 0.1,
        unit: '',
      },
    ],
  },
  {
    id: 'colors',
    label: 'Spiral Section Colors',
    technicalName: 'PHASE_HEX / CHAKRA_HEX (spiral.ts)',
    category: 'visual',
    description:
      'The two color systems: the 3 phase hues coloring the spiral path/ambient stars by section, and the 8-stop chakra rainbow mapped to nodes bottom-to-top.',
    params: [
      {
        key: 'colors.elevate',
        label: 'ELEVATE Color (bottom)',
        technicalName: 'PHASE_HEX.ELEVATE',
        value: '#119a9e',
        description:
          'Color of the bottom spiral section + a third of the ambient stars.',
        control: 'color',
      },
      {
        key: 'colors.align',
        label: 'ALIGN Color (middle)',
        technicalName: 'PHASE_HEX.ALIGN',
        value: '#8cc5d3',
        description: 'Color of the middle spiral section.',
        control: 'color',
      },
      {
        key: 'colors.unlock',
        label: 'UNLOCK Color (top)',
        technicalName: 'PHASE_HEX.UNLOCK',
        value: '#3dbfc4',
        description: 'Color of the top spiral section.',
        control: 'color',
      },
      {
        key: 'colors.accentBlend',
        label: 'Node Accent Blend',
        technicalName: 'chakra.lerp(accent)',
        value: 0.32,
        description:
          'How far each node shifts from pure chakra toward its icon-world accent.',
        control: 'range',
        min: 0,
        max: 1,
        step: 0.02,
        source: 'spiral.ts:2477',
      },
    ],
  },
];

/** Flat map of every param keyed by its dotted key, for O(1) override lookup. */
export const PARAM_INDEX: Record<string, SpiralParam> = Object.fromEntries(
  SPIRAL_PARAMS.flatMap((el) => el.params.map((p) => [p.key, p] as const)),
);

export type ResolvedParams = Record<string, number | string | boolean>;

function coerce(spec: SpiralParam, raw: string): number | string | boolean {
  if (spec.control === 'toggle') return raw === '1' || raw === 'true';
  if (spec.control === 'color' || spec.control === 'select') return raw;
  const n = Number(raw);
  if (Number.isNaN(n)) return spec.value;
  return Math.min(spec.max ?? n, Math.max(spec.min ?? n, n)); // clamp to bounds
}

/**
 * Build the live value table: registry defaults with any URL overrides
 * (`?p.<key>=<value>`) applied on top. Unknown keys are ignored (allowlist);
 * values are clamped to each param's bounds.
 */
export function resolveParams(search = ''): ResolvedParams {
  const out: ResolvedParams = {};
  for (const p of Object.values(PARAM_INDEX)) out[p.key] = p.value;
  if (!search) return out;
  let q: URLSearchParams;
  try {
    q = new URLSearchParams(search);
  } catch {
    return out;
  }
  for (const [rawKey, rawVal] of q.entries()) {
    if (!rawKey.startsWith('p.')) continue;
    const key = rawKey.slice(2);
    const spec = PARAM_INDEX[key];
    if (!spec) continue;
    out[key] = coerce(spec, rawVal);
  }
  return out;
}
