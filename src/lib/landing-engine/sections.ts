/**
 * Section type registry — maps section IDs to typed prop shapes.
 *
 * Each section type has:
 *   - a string `type` identifier (used by the composer + dynamic renderer)
 *   - a typed `Props` shape (consumed by the matching .astro component)
 *
 * To add a new section type:
 *   1. Add entry to SectionType union below
 *   2. Define its Props interface
 *   3. Create matching component at src/components/landing/<Type>Section.astro
 *   4. Register in SectionRenderer.astro switch
 */

import type { Persona } from './personas';

export type SectionType = 'hero' | 'problem' | 'three-paths' | 'cta';

export interface HeroSectionProps {
  type: 'hero';
  heading: string;
  subhead: string;
  ctaLabel: string;
  ctaHref: string;
  pillarLabel?: string;
}

export interface ProblemSectionProps {
  type: 'problem';
  heading: string;
  painPoints: string[];
}

export interface ThreePathsSectionProps {
  type: 'three-paths';
  heading: string;
  paths: Array<{
    label: string;
    description: string;
    href: string;
  }>;
}

export interface CtaSectionProps {
  type: 'cta';
  heading: string;
  subhead: string;
  ctaLabel: string;
  ctaHref: string;
}

export type SectionData =
  | HeroSectionProps
  | ProblemSectionProps
  | ThreePathsSectionProps
  | CtaSectionProps;

/**
 * Builders — derive section props from a Persona. These are pure functions;
 * the narrative template (in narratives.ts) decides the order they're called.
 */
export const SectionBuilders = {
  hero(persona: Persona): HeroSectionProps {
    return {
      type: 'hero',
      pillarLabel: persona.primaryPillar.replace('-', ' '),
      heading: persona.label,
      subhead: persona.heroHook,
      ctaLabel: persona.ctaCommit,
      ctaHref: '#cta',
    };
  },
  problem(persona: Persona): ProblemSectionProps {
    return {
      type: 'problem',
      heading: 'The shape of being stuck',
      painPoints: persona.pain,
    };
  },
  threePaths(persona: Persona): ThreePathsSectionProps {
    // The three "doors" point at the persona's primary pillar plus two
    // adjacent surfaces. PillarId values (water/performance/cancer-support)
    // are persona-anchor concepts, not routable pillar slugs — the only
    // pillar pages are physical/inner/identity/financial. Map first, then
    // pick adjacency over real slugs so every door resolves to a live page.
    const pillarSlug: Record<string, string> = {
      water: 'physical',
      inner: 'inner',
      identity: 'identity',
      performance: 'physical',
      financial: 'financial',
      'cancer-support': 'physical',
    };
    const adjacency: Record<string, [string, string, string]> = {
      physical: ['physical', 'inner', 'identity'],
      inner: ['inner', 'identity', 'financial'],
      identity: ['identity', 'inner', 'financial'],
      financial: ['financial', 'identity', 'inner'],
    };
    const anchor = pillarSlug[persona.primaryPillar] ?? 'physical';
    const paths = (adjacency[anchor] ?? ['physical', 'inner', 'identity']).map(
      (slug) => ({
        label: slug.replace('-', ' '),
        description: `Enter through ${slug.replace('-', ' ')}.`,
        href: `/pillars/${slug}`,
      }),
    );
    return {
      type: 'three-paths',
      heading: 'Three roads in',
      paths: paths as ThreePathsSectionProps['paths'],
    };
  },
  cta(persona: Persona): CtaSectionProps {
    return {
      type: 'cta',
      heading: persona.desire[0] ?? 'Begin.',
      subhead: persona.desire.slice(1).join(' ') || persona.heroHook,
      ctaLabel: persona.ctaCommit,
      ctaHref: '/quiz',
    };
  },
} as const;

export type SectionBuilderKey = keyof typeof SectionBuilders;
