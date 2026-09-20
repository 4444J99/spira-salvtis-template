// Cycle + personalization layer copy config (GH #30 / GH #156).
// The buildable slice ships cycle/moon guidance across branch surfaces.
// Birth-chart and Human Design computation stay consent-gated until the
// subscription/privacy decisions are made; this file only models the layer.

export interface CyclePhase {
  name: string;
  days: string;
  moon: string;
  moonEmoji: string;
  archetype: string;
  energy: string;
  bodyFocus: string;
  color: string;
  borderColor: string;
}

export const cycleSyncedBranchSlugs = [
  'gut-hormones',
  'fertility',
  'athletic',
  'autoimmune',
] as const;

export type CycleSyncedBranchSlug = (typeof cycleSyncedBranchSlugs)[number];

export interface BranchCycleProtocol {
  branchSlug: CycleSyncedBranchSlug;
  rhythmName: string;
  focus: string;
  trackingSignals: string[];
  protectiveBoundary: string;
  sourceRefs: string[];
}

export const branchGuidance: Record<string, string> = {
  'gut-hormones':
    'Use this as a monthly check-in: follicular for gut repair, ovulatory for expression, luteal for hormone steadiness, menstrual for release and restoration.',
  fertility:
    'Use this as a fertility map: build the internal terrain before ovulation, protect implantation conditions after ovulation, and track patterns without forcing them.',
  autoimmune:
    'Use this as a flare-awareness map: add more protection around menstrual and ovulatory windows, then rebuild gently when progesterone rises.',
  athletic:
    'Use this as a training-periodization map: push strength and intensity when energy rises, then taper toward recovery when the body asks for consolidation.',
  'cancer-support':
    'Use this as a kindness map during treatment: notice rhythm when it is present, but let medical care, fatigue, and recovery needs override any calendar.',
  sustainability:
    'Use this as a rhythm map for household change: install one stable water habit per phase instead of trying to overhaul everything at once.',
};

export const defaultGuidance =
  'Use this as a rhythm map: notice what your body asks for in each phase, then make the next supportive choice small enough to repeat.';

export const branchCycleProtocols: Record<
  CycleSyncedBranchSlug,
  BranchCycleProtocol
> = {
  'gut-hormones': {
    branchSlug: 'gut-hormones',
    rhythmName: 'Gut-hormone feedback loop',
    focus:
      'Match gut repair, estrogen clearance, mineral support, and cooked-food pacing to the cycle window instead of using one flat protocol all month.',
    trackingSignals: [
      'cycle day',
      'bloating',
      'bowel rhythm',
      'cravings',
      'sleep',
      'hydration consistency',
    ],
    protectiveBoundary:
      'Change one input at a time so the body can show which foods, water habits, and stressors are actually moving symptoms.',
    sourceRefs: [
      'docs/archive/extracted/time-astro/cycle-and-moon-comparison.md#ATM-T-072',
      'docs/archive/extracted/health/hormone-cycle-guide.md',
    ],
  },
  fertility: {
    branchSlug: 'fertility',
    rhythmName: 'Terrain before timing',
    focus:
      'Treat the whole cycle as fertility preparation: release, rebuild lining quality, support ovulation, then protect the implantation window.',
    trackingSignals: [
      'cycle day',
      'cervical fluid',
      'basal body temperature',
      'luteal length',
      'sleep',
      'stress',
    ],
    protectiveBoundary:
      'Do not reduce fertility to a single ovulation window; the planner should lower pressure, not turn the body into a project.',
    sourceRefs: [
      'docs/archive/extracted/time-astro/astrology-hormone-moon-planner.md#ATM-T-066',
      'docs/archive/extracted/time-astro/cycle-and-moon-comparison.md#ATM-T-075',
    ],
  },
  athletic: {
    branchSlug: 'athletic',
    rhythmName: 'Training periodization',
    focus:
      'Use rising-energy windows for strength and speed, then use luteal and menstrual windows for endurance, consolidation, mobility, and recovery.',
    trackingSignals: [
      'cycle day',
      'perceived exertion',
      'soreness',
      'sleep',
      'training readiness',
      'hydration consistency',
    ],
    protectiveBoundary:
      'Peak output does not mean reckless output; ovulation is a performance window and an injury-awareness window.',
    sourceRefs: [
      'docs/archive/extracted/time-astro/cycle-and-moon-comparison.md#ATM-T-116',
      'docs/archive/extracted/health/hormone-cycle-guide.md',
    ],
  },
  autoimmune: {
    branchSlug: 'autoimmune',
    rhythmName: 'Flare-awareness map',
    focus:
      'Watch menstrual and ovulatory immune activation windows, then use the progesterone-supported luteal phase for gentle rebuilding.',
    trackingSignals: [
      'cycle day',
      'flare intensity',
      'pain',
      'sleep',
      'stress',
      'hydration consistency',
    ],
    protectiveBoundary:
      'This is supportive pattern awareness only. Medical care, medication, fatigue, and flare management override any calendar.',
    sourceRefs: [
      'docs/archive/extracted/health/heroines-healing-journey.md#cycle-moon',
      'docs/archive/extracted/time-astro/cycle-and-moon-comparison.md#ATM-T-072',
    ],
  },
};

export const phaseData: CyclePhase[] = [
  {
    name: 'Menstrual',
    days: '1-5',
    moon: 'New Moon',
    moonEmoji: '\u{1F311}',
    archetype: 'Wise Woman',
    energy: 'Release & Reset',
    bodyFocus: 'Rest, warmth, minerals, symptom review',
    color: 'rgba(17, 154, 158, 0.15)',
    borderColor: 'rgba(17, 154, 158, 0.4)',
  },
  {
    name: 'Follicular',
    days: '6-13',
    moon: 'Waxing Moon',
    moonEmoji: '\u{1F312}',
    archetype: 'Maiden',
    energy: 'Build & Prepare',
    bodyFocus: 'Repair, fresh inputs, strength, new plans',
    color: 'rgba(140, 197, 211, 0.15)',
    borderColor: 'rgba(140, 197, 211, 0.4)',
  },
  {
    name: 'Ovulatory',
    days: '14-16',
    moon: 'Full Moon',
    moonEmoji: '\u{1F315}',
    archetype: 'Mother',
    energy: 'Peak & Express',
    bodyFocus: 'Visibility, connection, output, injury awareness',
    color: 'rgba(201, 169, 110, 0.15)',
    borderColor: 'rgba(201, 169, 110, 0.4)',
  },
  {
    name: 'Luteal',
    days: '17-28',
    moon: 'Waning Moon',
    moonEmoji: '\u{1F316}',
    archetype: 'Wild Woman',
    energy: 'Sustain & Nourish',
    bodyFocus: 'Cooked meals, boundaries, recovery, consolidation',
    color: 'rgba(61, 191, 196, 0.15)',
    borderColor: 'rgba(61, 191, 196, 0.4)',
  },
];

export type PersonalizationDimensionStatus =
  | 'live'
  | 'planner-ready'
  | 'consent-gated';

export interface PersonalizationDimension {
  id:
    | 'cycle'
    | 'moon'
    | 'astrology'
    | 'human-design'
    | 'thirteen-moon'
    | 'planner';
  label: string;
  status: PersonalizationDimensionStatus;
  role: string;
  dataBoundary: string;
  sourceRefs: string[];
}

export const personalizationDimensions: PersonalizationDimension[] = [
  {
    id: 'cycle',
    label: 'Cycle phase',
    status: 'live',
    role: 'Maps physical protocols to menstrual windows: rest, rise, peak, and ground.',
    dataBoundary:
      'Uses self-observed cycle day only; no sensitive profile data is stored in this slice.',
    sourceRefs: [
      'docs/archive/extracted/time-astro/cycle-and-moon-comparison.md#ATM-T-072',
    ],
  },
  {
    id: 'moon',
    label: 'Moon phase',
    status: 'live',
    role: 'Adds the symbolic rhythm layer: new, waxing, full, and waning.',
    dataBoundary:
      'Displayed as an interpretive overlay, not as a claim that every body must match the moon.',
    sourceRefs: [
      'docs/archive/extracted/time-astro/cycle-and-moon-comparison.md#ATM-T-075',
    ],
  },
  {
    id: 'astrology',
    label: 'Birth chart',
    status: 'consent-gated',
    role: 'Future lens for timing launches, messaging, relationships, and decision windows.',
    dataBoundary:
      'Requires birth date, birth time, and birth location; do not calculate or persist until the privacy posture is approved.',
    sourceRefs: [
      'docs/archive/extracted/time-astro/astrology-and-business-strategy.md#ATM-T-051',
    ],
  },
  {
    id: 'human-design',
    label: 'Human Design',
    status: 'consent-gated',
    role: 'Future lens for energy type, authority, digestion, and work cadence.',
    dataBoundary:
      'Requires birth data and explicit consent; current release only reserves the slot in the layer.',
    sourceRefs: [
      'docs/archive/extracted/time-astro/time-astrology-and-human-design.md',
      'docs/archive/extracted/health/heroines-healing-journey.md#human-design',
    ],
  },
  {
    id: 'thirteen-moon',
    label: '13-month calendar',
    status: 'planner-ready',
    role: 'Frames time as 13 repeatable 28-day containers for reflection, ritual, and planning.',
    dataBoundary:
      'Can ship as a general planner template before personal chart computation exists.',
    sourceRefs: [
      'docs/archive/extracted/time-astro/13-month-calendar-query.md#ATM-T-001',
    ],
  },
  {
    id: 'planner',
    label: 'Personal planner',
    status: 'planner-ready',
    role: 'Combines yearly, monthly, weekly, and daily pages with cycle, moon, and reflection prompts.',
    dataBoundary:
      'Template structure is safe now; fully personalized editions wait for payment and privacy decisions.',
    sourceRefs: [
      'docs/archive/extracted/time-astro/astrology-hormone-moon-planner.md#ATM-T-071',
    ],
  },
];

export interface BusinessRhythmStep {
  title: string;
  phase: string;
  action: string;
}

export const businessRhythmStrategy: BusinessRhythmStep[] = [
  {
    title: 'Reset',
    phase: 'Menstrual / New Moon',
    action:
      'Review the signal, simplify the pitch, and choose the one message worth repeating.',
  },
  {
    title: 'Build',
    phase: 'Follicular / Waxing Moon',
    action:
      'Create assets, clean the funnel, batch content, and prepare the next outreach sequence.',
  },
  {
    title: 'Pitch',
    phase: 'Ovulatory / Full Moon',
    action:
      'Run demos, host classes, pitch businesses, and use social proof while energy is visible.',
  },
  {
    title: 'Consolidate',
    phase: 'Luteal / Waning Moon',
    action:
      'Follow up, fulfill, organize leads, protect boundaries, and let the system carry more of the load.',
  },
];

export function hasCycleLayer(slug: string): boolean {
  return cycleSyncedBranchSlugs.includes(slug as CycleSyncedBranchSlug);
}

export function cycleGuidanceForBranch(slug: string): string {
  return hasCycleLayer(slug)
    ? branchGuidance[slug as CycleSyncedBranchSlug]
    : defaultGuidance;
}

export function cycleProtocolForBranch(
  slug: string,
): BranchCycleProtocol | undefined {
  return hasCycleLayer(slug)
    ? branchCycleProtocols[slug as CycleSyncedBranchSlug]
    : undefined;
}
