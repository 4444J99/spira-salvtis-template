/**
 * Audience archetypes carrying pain, desire, and language.
 *
 * The composer reads from this registry to build persona-targeted landing
 * pages. Add a persona here, then it appears at /for/<id> automatically
 * (via getStaticPaths in src/pages/for/[persona].astro).
 *
 * Slice 1: 3 hardcoded personas to prove the composer end-to-end.
 * A future slice may move these into a Pages CMS content collection
 * (the git-based editor that replaced Keystatic in the Astro 6 migration).
 */

export type PersonaId =
  | 'toxic-environment-seeker'
  | 'burnt-out-high-achiever'
  | 'cycle-syncing-practitioner';

export type PillarId =
  | 'water'
  | 'inner'
  | 'identity'
  | 'performance'
  | 'financial'
  | 'cancer-support';

export interface Persona {
  /** URL slug (must match PersonaId). */
  id: PersonaId;
  /** Human-facing label, used in CMS picker + page title. */
  label: string;
  /** 3–5 verbatim pain phrases, used in problem section. */
  pain: string[];
  /** 3–5 desired outcome statements, used in CTA + headline framing. */
  desire: string[];
  /** Anchor pillar this persona's content prioritizes. */
  primaryPillar: PillarId;
  /** Short hook line for hero subhead. */
  heroHook: string;
  /** Final-CTA line. */
  ctaCommit: string;
}

export const PERSONAS: Record<PersonaId, Persona> = {
  'toxic-environment-seeker': {
    id: 'toxic-environment-seeker',
    label: 'Toxic-Environment Seeker',
    primaryPillar: 'water',
    pain: [
      "I'm doing everything right and still feel toxic.",
      'My gut, my skin, my cycle — nothing is regulating.',
      "Every product I try lists 'natural' but reads like a chemistry textbook.",
      "I don't know which inputs to my body are actually clean.",
    ],
    desire: [
      'A short list of inputs I can actually trust.',
      "A way to check what's in something without becoming a chemist.",
      'Visible regulation — sleep, skin, cycle, mood — within months not years.',
    ],
    heroHook:
      'If your body keeps telling you something is off, the inputs are probably the conversation. This is where to start tuning them.',
    ctaCommit: 'Send me the inputs map.',
  },
  'burnt-out-high-achiever': {
    id: 'burnt-out-high-achiever',
    label: 'Burnt-Out High Achiever',
    primaryPillar: 'inner',
    pain: [
      "I'm performing at the level I trained for and dying inside it.",
      "Therapy gave me language but the loop hasn't actually moved.",
      'Every framework I touch becomes another to-do.',
      "I don't have time for a wellness practice. I need a wellness operating system.",
    ],
    desire: [
      'Something I can run between meetings, not instead of them.',
      'A way to integrate without losing the edge that got me here.',
      'Stop trading the body for the work. Start trading the work back.',
    ],
    heroHook:
      "You didn't get here by accident. You won't leave by accident either. This is the integration layer underneath what you've already built.",
    ctaCommit: 'Show me the integration layer.',
  },
  'cycle-syncing-practitioner': {
    id: 'cycle-syncing-practitioner',
    label: 'Cycle-Syncing Practitioner',
    primaryPillar: 'identity',
    pain: [
      'I track my cycle but I still get blindsided by it.',
      'Every app reads my data and tells me almost nothing.',
      'My astrology, my human design, my cycle — all in different tabs that never speak to each other.',
      'I want a practice, not another dashboard.',
    ],
    desire: [
      'A unified read across cycle, astrology, and HD layers.',
      'Predictable rituals tied to where I actually am, not where the app thinks I am.',
      'A practice that compounds across months, not resets every cycle.',
    ],
    heroHook:
      'Your body, your chart, and your design are already saying the same thing. The work is hearing them at the same volume.',
    ctaCommit: 'Tune me in.',
  },
};

export function listPersonas(): Persona[] {
  return Object.values(PERSONAS);
}

export function getPersona(id: PersonaId): Persona {
  const p = PERSONAS[id];
  if (!p) throw new Error(`unknown persona: ${id}`);
  return p;
}
