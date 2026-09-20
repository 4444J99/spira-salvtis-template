import type { EnvVar } from './hub.config';

export type MatterPhase = 'gas' | 'liquid' | 'solid' | 'plasma';

export interface NodeGenerationLaw {
  createOrder: MatterPhase[];
  particleBudget: number;
  turbulence: number;
  orbitBias:
    | 'radial'
    | 'lens'
    | 'split'
    | 'rise'
    | 'threshold'
    | 'void'
    | 'lattice'
    | 'bloom'
    | 'axis';
}

export interface NodeVisualIntent {
  nodeId: number;
  envVar: EnvVar;
  profileClass: string;
  boundaryPrinciple: string;
  matterPrinciple: string;
  colorStory: string;
  containerRule: string;
  cssVars: Record<string, string>;
  generationLaw: NodeGenerationLaw;
}

export const NODE_VISUALS: Record<number, NodeVisualIntent> = {
  1: {
    nodeId: 1,
    envVar: 'PYR',
    profileClass: 'solar-forge',
    boundaryPrinciple:
      'A radiant ignition field that reads as a sunburst before it reads as a shell.',
    matterPrinciple:
      'White-hot plasma pushes outward; the edge is understood by flare pressure.',
    colorStory: 'Milk-white ignition, gold, ember orange, and red heat.',
    containerRule:
      'The boundary refracts like a forge aperture: hard points, soft interior burn.',
    cssVars: {
      '--v-refraction': '1.18',
      '--v-boundary-weight': '0.92',
      '--v-gas-scale': '0.72',
      '--v-liquid-depth': '0.2',
      '--v-solid-fracture': '0.28',
      '--v-plasma-reach': '1.25',
      '--v-rotation': '-4deg',
    },
    generationLaw: {
      createOrder: ['plasma', 'gas', 'solid', 'liquid'],
      particleBudget: 28,
      turbulence: 0.82,
      orbitBias: 'radial',
    },
  },
  2: {
    nodeId: 2,
    envVar: 'OCULUS',
    profileClass: 'lunar-lens',
    boundaryPrinciple:
      'A horizontal observing lens, like moonlight bending through water.',
    matterPrinciple:
      'Mist and liquid pool into an eye; the membrane reads by optical distortion.',
    colorStory: 'Moon silver, lavender, cold blue, and water-gray.',
    containerRule:
      'The vessel is shallow and elliptical; particles should feel suspended in a lens.',
    cssVars: {
      '--v-refraction': '1.34',
      '--v-boundary-weight': '0.56',
      '--v-gas-scale': '1.1',
      '--v-liquid-depth': '1.18',
      '--v-solid-fracture': '0.25',
      '--v-plasma-reach': '0.18',
      '--v-rotation': '0deg',
    },
    generationLaw: {
      createOrder: ['gas', 'liquid', 'plasma', 'solid'],
      particleBudget: 22,
      turbulence: 0.38,
      orbitBias: 'lens',
    },
  },
  3: {
    nodeId: 3,
    envVar: 'DYAD',
    profileClass: 'polarity-chamber',
    boundaryPrinciple:
      'A dual-current chamber where opposing populations define the edge.',
    matterPrinciple:
      'Ionized light and shadow braid in counter-rotation around a balanced core.',
    colorStory: 'White, near-black, violet, and electric mauve.',
    containerRule:
      'The boundary is read through mirrored pressure rather than a single outline.',
    cssVars: {
      '--v-refraction': '1.02',
      '--v-boundary-weight': '0.78',
      '--v-gas-scale': '1',
      '--v-liquid-depth': '0.45',
      '--v-solid-fracture': '0.8',
      '--v-plasma-reach': '0.38',
      '--v-rotation': '12deg',
    },
    generationLaw: {
      createOrder: ['solid', 'gas', 'plasma', 'liquid'],
      particleBudget: 24,
      turbulence: 0.62,
      orbitBias: 'split',
    },
  },
  4: {
    nodeId: 4,
    envVar: 'PYRAMIS',
    profileClass: 'volcanic-pyre',
    boundaryPrinciple:
      'An ascending mineral pyramid holding smoke, lava, and flame.',
    matterPrinciple:
      'Hot gas rises through molten seams; the solid wall is cracked by heat.',
    colorStory: 'Red flame, lava orange, black stone, and forge gold.',
    containerRule:
      'The exterior should feel like a heated vessel, not a decorative triangle.',
    cssVars: {
      '--v-refraction': '0.82',
      '--v-boundary-weight': '1',
      '--v-gas-scale': '1.22',
      '--v-liquid-depth': '0.52',
      '--v-solid-fracture': '0.9',
      '--v-plasma-reach': '0.48',
      '--v-rotation': '2deg',
    },
    generationLaw: {
      createOrder: ['solid', 'plasma', 'gas', 'liquid'],
      particleBudget: 24,
      turbulence: 0.78,
      orbitBias: 'rise',
    },
  },
  5: {
    nodeId: 5,
    envVar: 'HYDOR',
    profileClass: 'aquifer-drop',
    boundaryPrinciple:
      'A water-drop aquifer where the meniscus explains the container.',
    matterPrinciple:
      'Liquid mass settles low, vapor lifts at the shoulder, salt/ice catches light.',
    colorStory:
      'Aquifer blue, turquoise, pale mineral water, and glacial cyan.',
    containerRule:
      'The edge should refract like a thick droplet full of moving water.',
    cssVars: {
      '--v-refraction': '1.42',
      '--v-boundary-weight': '0.62',
      '--v-gas-scale': '0.72',
      '--v-liquid-depth': '1.34',
      '--v-solid-fracture': '0.3',
      '--v-plasma-reach': '0.08',
      '--v-rotation': '-2deg',
    },
    generationLaw: {
      createOrder: ['liquid', 'gas', 'solid', 'plasma'],
      particleBudget: 22,
      turbulence: 0.34,
      orbitBias: 'lens',
    },
  },
  6: {
    nodeId: 6,
    envVar: 'MANDORLA',
    profileClass: 'garden-threshold',
    boundaryPrinciple:
      'An overlapping gate where two fields create the container.',
    matterPrinciple:
      'Dew, pollen, and petals spiral through the shared middle space.',
    colorStory: 'Petal rose, leaf green, pollen yellow, and soft violet.',
    containerRule:
      'The edge is a threshold formed by overlap, not a single closed object.',
    cssVars: {
      '--v-refraction': '1.08',
      '--v-boundary-weight': '0.7',
      '--v-gas-scale': '0.96',
      '--v-liquid-depth': '0.78',
      '--v-solid-fracture': '0.58',
      '--v-plasma-reach': '0.12',
      '--v-rotation': '8deg',
    },
    generationLaw: {
      createOrder: ['liquid', 'solid', 'gas', 'plasma'],
      particleBudget: 26,
      turbulence: 0.5,
      orbitBias: 'threshold',
    },
  },
  7: {
    nodeId: 7,
    envVar: 'KENOSIS',
    profileClass: 'lunar-hollow',
    boundaryPrinciple:
      'A crescent hollow where absence is the active boundary.',
    matterPrinciple:
      'Regolith and moonbeam collect along the outer arc while the inner void stays quiet.',
    colorStory: 'Moon-blue, slate lavender, pale light, and cold gray.',
    containerRule:
      'The missing center must be legible; the material gathers around surrender.',
    cssVars: {
      '--v-refraction': '0.92',
      '--v-boundary-weight': '0.74',
      '--v-gas-scale': '0.82',
      '--v-liquid-depth': '0.32',
      '--v-solid-fracture': '0.94',
      '--v-plasma-reach': '0.08',
      '--v-rotation': '16deg',
    },
    generationLaw: {
      createOrder: ['solid', 'gas', 'liquid', 'plasma'],
      particleBudget: 18,
      turbulence: 0.28,
      orbitBias: 'void',
    },
  },
  8: {
    nodeId: 8,
    envVar: 'SHATKONA',
    profileClass: 'crystal-cave',
    boundaryPrinciple:
      'A six-point crystalline cave whose lattice defines the field.',
    matterPrinciple:
      'Quartz and prism fragments lock into geometry; liquid and gas are minimal.',
    colorStory:
      'Violet crystal, green refraction, yellow glints, and blue prism light.',
    containerRule:
      'The boundary should read as faceted mineral structure at every size.',
    cssVars: {
      '--v-refraction': '1.16',
      '--v-boundary-weight': '1.08',
      '--v-gas-scale': '0.28',
      '--v-liquid-depth': '0.26',
      '--v-solid-fracture': '1.28',
      '--v-plasma-reach': '0.12',
      '--v-rotation': '0deg',
    },
    generationLaw: {
      createOrder: ['solid', 'plasma', 'liquid', 'gas'],
      particleBudget: 20,
      turbulence: 0.24,
      orbitBias: 'lattice',
    },
  },
  9: {
    nodeId: 9,
    envVar: 'PADMA',
    profileClass: 'spring-bloom',
    boundaryPrinciple: 'A petal-star bloom where growth creates the perimeter.',
    matterPrinciple:
      'Dew and pollen radiate through organic folds; the edge is petal pressure.',
    colorStory: 'Rose petal, leaf green, cream light, and violet bloom.',
    containerRule:
      'The container opens while still holding; it should not collapse into a generic star.',
    cssVars: {
      '--v-refraction': '1',
      '--v-boundary-weight': '0.68',
      '--v-gas-scale': '0.86',
      '--v-liquid-depth': '0.82',
      '--v-solid-fracture': '0.72',
      '--v-plasma-reach': '0.1',
      '--v-rotation': '-8deg',
    },
    generationLaw: {
      createOrder: ['liquid', 'gas', 'solid', 'plasma'],
      particleBudget: 26,
      turbulence: 0.56,
      orbitBias: 'bloom',
    },
  },
  10: {
    nodeId: 10,
    envVar: 'BODHI',
    profileClass: 'clarity-prism',
    boundaryPrinciple:
      'An awakened triangular prism where seeing gathers into a beam.',
    matterPrinciple:
      'Photons and gold plasma sharpen into a clear inner aperture.',
    colorStory: 'White light, pale gold, deep yellow, and antique gold.',
    containerRule:
      'The triangle should feel optically active: focused, not flat.',
    cssVars: {
      '--v-refraction': '1.3',
      '--v-boundary-weight': '0.88',
      '--v-gas-scale': '1.22',
      '--v-liquid-depth': '0.08',
      '--v-solid-fracture': '0.48',
      '--v-plasma-reach': '0.78',
      '--v-rotation': '0deg',
    },
    generationLaw: {
      createOrder: ['gas', 'plasma', 'solid', 'liquid'],
      particleBudget: 20,
      turbulence: 0.42,
      orbitBias: 'axis',
    },
  },
  11: {
    nodeId: 11,
    envVar: 'TETRAD',
    profileClass: 'cardinal-cross',
    boundaryPrinciple:
      'A four-direction crucible where every element is present and balanced.',
    matterPrinciple:
      'Fire, water, earth, and air meet at a cardinal center without one phase winning.',
    colorStory: 'Red, yellow, green, and violet in equal dialogue.',
    containerRule:
      'The cross is an integrating instrument, not a generic plus sign.',
    cssVars: {
      '--v-refraction': '0.96',
      '--v-boundary-weight': '0.96',
      '--v-gas-scale': '0.82',
      '--v-liquid-depth': '0.62',
      '--v-solid-fracture': '0.82',
      '--v-plasma-reach': '0.62',
      '--v-rotation': '0deg',
    },
    generationLaw: {
      createOrder: ['plasma', 'liquid', 'solid', 'gas'],
      particleBudget: 24,
      turbulence: 0.46,
      orbitBias: 'axis',
    },
  },
  12: {
    nodeId: 12,
    envVar: 'OKTAEDRON',
    profileClass: 'crystal-vault',
    boundaryPrinciple:
      'An octahedral vault whose facets authenticate the inner light.',
    matterPrinciple: 'Mineral prism and photon are locked in hard symmetry.',
    colorStory: 'Ice blue, muted gold, white mineral light, and cool cyan.',
    containerRule:
      'The edge should be diamond-clear, angular, and materially dense.',
    cssVars: {
      '--v-refraction': '1.24',
      '--v-boundary-weight': '1.14',
      '--v-gas-scale': '0.24',
      '--v-liquid-depth': '0.16',
      '--v-solid-fracture': '1.42',
      '--v-plasma-reach': '0.28',
      '--v-rotation': '0deg',
    },
    generationLaw: {
      createOrder: ['solid', 'plasma', 'gas', 'liquid'],
      particleBudget: 18,
      turbulence: 0.18,
      orbitBias: 'lattice',
    },
  },
  13: {
    nodeId: 13,
    envVar: 'ANKH',
    profileClass: 'golden-current',
    boundaryPrinciple:
      'An ankh-shaped life-current where the loop and stem carry ascent.',
    matterPrinciple:
      'Gold plasma rises through the stem and circulates through the crown.',
    colorStory:
      'Solar yellow, warm orange, antique gold, and violet afterglow.',
    containerRule:
      'The container must read as eternal flow, not a trophy icon.',
    cssVars: {
      '--v-refraction': '1.12',
      '--v-boundary-weight': '0.86',
      '--v-gas-scale': '1.08',
      '--v-liquid-depth': '0.08',
      '--v-solid-fracture': '0.44',
      '--v-plasma-reach': '1.02',
      '--v-rotation': '0deg',
    },
    generationLaw: {
      createOrder: ['plasma', 'gas', 'solid', 'liquid'],
      particleBudget: 22,
      turbulence: 0.58,
      orbitBias: 'rise',
    },
  },
};

export function visualForNode(nodeId: number): NodeVisualIntent {
  return NODE_VISUALS[nodeId] ?? NODE_VISUALS[1];
}
