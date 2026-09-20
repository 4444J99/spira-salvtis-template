/**
 * Narrative templates — ordered sequences of section builders that compose
 * into a coherent landing page rhythm.
 *
 * Slice 1: one template (ki-sho-ten-ketsu, the four-act Japanese narrative
 * frame). More templates land in slice 2+ once the schema proves stable.
 */

import type { SectionBuilderKey } from './sections';

export type NarrativeId = 'ki-sho-ten-ketsu';

export interface Narrative {
  id: NarrativeId;
  label: string;
  /** Brief description of when to use this template. */
  intent: string;
  /** Ordered list of section builders to invoke. */
  sequence: SectionBuilderKey[];
}

export const NARRATIVES: Record<NarrativeId, Narrative> = {
  'ki-sho-ten-ketsu': {
    id: 'ki-sho-ten-ketsu',
    label: 'Ki–Sho–Ten–Ketsu (introduce → develop → twist → resolve)',
    intent:
      "Default narrative for persona-targeted landing pages. Opens with the persona's hero, names the shape of their stuckness, twists into three concrete paths in, resolves with a single decisive CTA.",
    sequence: ['hero', 'problem', 'threePaths', 'cta'],
  },
};

export function getNarrative(id: NarrativeId): Narrative {
  const n = NARRATIVES[id];
  if (!n) throw new Error(`unknown narrative: ${id}`);
  return n;
}
