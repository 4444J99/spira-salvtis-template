/**
 * Compose a landing page from a Persona × Narrative.
 *
 * Pure function. Returns an ordered list of typed section props that the
 * dynamic renderer in src/pages/for/[persona].astro maps to components.
 */

import type { Persona, PersonaId } from './personas';
import { getPersona } from './personas';
import type { Narrative, NarrativeId } from './narratives';
import { getNarrative } from './narratives';
import type { SectionData } from './sections';
import { SectionBuilders } from './sections';

export interface ComposedLanding {
  persona: Persona;
  narrative: Narrative;
  sections: SectionData[];
}

export function composeLanding(opts: {
  personaId: PersonaId;
  narrativeId?: NarrativeId;
}): ComposedLanding {
  const persona = getPersona(opts.personaId);
  const narrative = getNarrative(opts.narrativeId ?? 'ki-sho-ten-ketsu');
  const sections = narrative.sequence.map((key) => {
    const builder = SectionBuilders[key];
    return builder(persona);
  });
  return { persona, narrative, sections };
}
