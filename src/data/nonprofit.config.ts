export type NonprofitStatus = 'arm-in-formation';
export type DonationRailStatus = 'held' | 'ready';
export type NonprofitCaptureSource = 'nonprofit-arm-interest';
export type NonprofitPathId =
  | 'donor'
  | 'host'
  | 'volunteer'
  | 'reset-candidate';
export type NonprofitGateStatus = 'ready' | 'needs-client-input' | 'planned';

export interface NonprofitPath {
  id: NonprofitPathId;
  label: string;
  summary: string;
  captureLabel: string;
}

export interface NonprofitGate {
  id: string;
  label: string;
  status: NonprofitGateStatus;
  detail: string;
}

export interface NonprofitPhase {
  step: string;
  title: string;
  detail: string;
}

export interface NonprofitConfig {
  route: '/nonprofit';
  name: string;
  parentBrand: string;
  status: NonprofitStatus;
  sourceIssue: 39;
  captureSource: NonprofitCaptureSource;
  donation: {
    status: DonationRailStatus;
    checkoutUrl: string;
    publicLabel: string;
    holdReason: string;
    starterModel: readonly string[];
  };
  farmReset: {
    durationLabel: string;
    exchangeLabel: string;
    baselineNeeds: readonly string[];
    candidateRegions: readonly string[];
    sourceDecision: string;
  };
  paths: readonly NonprofitPath[];
  phases: readonly NonprofitPhase[];
  gates: readonly NonprofitGate[];
}

export const nonprofitConfig: NonprofitConfig = {
  route: '/nonprofit',
  name: 'Cind & Sol Collective',
  parentBrand: 'Sovereign Systems',
  status: 'arm-in-formation',
  sourceIssue: 39,
  captureSource: 'nonprofit-arm-interest',
  donation: {
    status: 'held',
    checkoutUrl: '',
    publicLabel: 'Donation interest',
    holdReason:
      'Donation checkout waits for the fiscal sponsor or nonprofit payment rail so the site does not imply tax-deductible giving before the structure exists.',
    starterModel: [
      'donation interest',
      'Instagram community launch',
      'fiscal-sponsorship application',
    ],
  },
  farmReset: {
    durationLabel: '30-90 days',
    exchangeLabel: '20 hours/week',
    baselineNeeds: [
      'private room',
      'three meals a day',
      'stable Wi-Fi',
      'land-based work',
      'reintegration support',
    ],
    candidateRegions: ['Hudson Valley', 'Idaho', 'Eastern Tennessee'],
    sourceDecision:
      'docs/client-decisions/2026-04-17-atomized-wants.md#W-043',
  },
  paths: [
    {
      id: 'donor',
      label: 'Donor',
      summary:
        'Signal interest in funding reset stays, application costs, meals, supplies, and the first donation rail.',
      captureLabel: 'I want to donate when the rail opens',
    },
    {
      id: 'host',
      label: 'Farm / Host',
      summary:
        'Surface farms, community centers, or land-based hosts that can offer room, meals, Wi-Fi, and structured work exchange.',
      captureLabel: 'I may know a reset host',
    },
    {
      id: 'volunteer',
      label: 'Volunteer',
      summary:
        'Offer research, intake, admin, transport, grant writing, social content, or on-site help as the arm forms.',
      captureLabel: 'I want to help build this',
    },
    {
      id: 'reset-candidate',
      label: 'Reset Candidate',
      summary:
        'Join the early list for people who need a low-bureaucracy housing and nervous-system reset path.',
      captureLabel: 'I may need a reset path',
    },
  ],
  phases: [
    {
      step: '01',
      title: 'Start with donations + Instagram',
      detail:
        'Capture donor, volunteer, host, and candidate interest while the legal structure and public storytelling mature.',
    },
    {
      step: '02',
      title: 'Match people to safe reset stays',
      detail:
        'Prioritize room, meals, Wi-Fi, and 20 hours/week of land-based contribution before adding heavier programming.',
    },
    {
      step: '03',
      title: 'Reintegrate through Sovereign Systems',
      detail:
        'Use the spiral, water education, business systems, and community support to help each person rebuild after the reset window.',
    },
  ],
  gates: [
    {
      id: 'fiscal-sponsor',
      label: 'Fiscal sponsor / entity',
      status: 'needs-client-input',
      detail:
        'Needed before the public page accepts money or describes tax treatment.',
    },
    {
      id: 'donation-rail',
      label: 'Donation rail',
      status: 'planned',
      detail:
        'Stripe, GHL, fiscal-sponsor checkout, or external giving page can attach here once approved.',
    },
    {
      id: 'host-criteria',
      label: 'Host criteria',
      status: 'ready',
      detail:
        'The first operating criteria are defined: private room, meals, Wi-Fi, 20 hours/week, and reset-length stay.',
    },
    {
      id: 'impact-loop',
      label: 'Impact loop',
      status: 'planned',
      detail:
        'Outcome tracking can follow reset stays, reintegration needs, and ongoing community support.',
    },
  ],
};
