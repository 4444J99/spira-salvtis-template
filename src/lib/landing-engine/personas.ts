export type PersonaId = 'the-builder' | 'the-visionary' | 'the-operator';
export type PillarId =
  | 'gateway'
  | 'system'
  | 'structure'
  | 'performance'
  | 'vision'
  | 'archetype-gamma';

export interface Persona {
  id: PersonaId;
  label: string;
  pain: string[];
  desire: string[];
  primaryPillar: PillarId;
  heroHook: string;
  ctaCommit: string;
}

export const PERSONAS: Record<PersonaId, Persona> = {
  'the-builder': {
    id: 'the-builder',
    label: 'The Builder',
    primaryPillar: 'gateway',
    pain: [
      'I am doing everything right but lack a cohesive foundational system.',
      "The individual parts work, but they don't integrate properly.",
      'Every new tool I add creates more friction instead of leverage.',
    ],
    desire: [
      'A streamlined architecture that scales without adding complexity.',
      'A clear baseline protocol I can trust.',
      'Measurable structural integrity across all my projects.',
    ],
    heroHook:
      'If your systems are fighting each other, the foundation is the conversation. This is where to start tuning it.',
    ctaCommit: 'Send me the architectural map.',
  },
  'the-visionary': {
    id: 'the-visionary',
    label: 'The Visionary',
    primaryPillar: 'system',
    pain: [
      'I see the end state, but the execution layer keeps breaking.',
      'My ideas outpace the infrastructure required to hold them.',
      'I spend too much time managing the machine instead of driving it.',
    ],
    desire: [
      'An operating system that runs seamlessly beneath my strategy.',
      'A way to integrate without losing the edge that got me here.',
      'Stop trading vision for maintenance. Start trading the work back.',
    ],
    heroHook:
      "You didn't get here by accident. You won't leave by accident either. This is the integration layer underneath what you've already built.",
    ctaCommit: 'Show me the integration layer.',
  },
  'the-operator': {
    id: 'the-operator',
    label: 'The Operator',
    primaryPillar: 'structure',
    pain: [
      'I track all the metrics but I am still blindsided by systemic failures.',
      'Every dashboard reads my data but tells me almost nothing.',
      'I want a cohesive practice, not another disconnected tool.',
    ],
    desire: [
      'A unified read across all my structural layers.',
      'Predictable rhythms tied to actual reality, not arbitrary targets.',
      'A practice that compounds across quarters, rather than resetting.',
    ],
    heroHook:
      'Your data, your systems, and your outcomes are already saying the same thing. The work is hearing them at the same volume.',
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
