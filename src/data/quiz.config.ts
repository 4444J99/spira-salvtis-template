/**
 * Quiz Configuration — externalized copy and question definitions.
 *
 * Previously inline in src/pages/quiz.astro and src/components/QuizEmbed.astro.
 * All user-facing copy lives here for single-source editing and translation readiness.
 */

export interface QuizAnswer {
  value: string;
  text: string;
  /** Optional sublabel (used by pillar cards Q2) */
  sublabel?: string;
  emoji?: string;
}

export interface QuizQuestion {
  step: number;
  axis: 'phase' | 'pillar' | 'theme';
  text: string;
  subtitle: string;
  answers: QuizAnswer[];
}

export const quizQuestions: QuizQuestion[] = [
  {
    step: 1,
    axis: 'phase',
    text: 'Where does your energy want to start?',
    subtitle:
      "There's no wrong answer. Pick the one that feels truest right now.",
    answers: [
      {
        value: 'ELEVATE',
        text: 'I need to feel better in my body — physically grounded, energized, present.',
      },
      {
        value: 'ALIGN',
        text: "I'm ready to do the inner work — patterns, identity, alignment.",
      },
      {
        value: 'UNLOCK',
        text: "I'm ready for full expression and freedom — letting it all out.",
      },
      {
        value: 'ALL',
        text: 'All of it — I want to integrate everything at once.',
      },
    ],
  },
  {
    step: 2,
    axis: 'pillar',
    text: 'Which pillar feels most alive in you right now?',
    subtitle: 'The one that pulls you, not the one you think you should pick.',
    answers: [
      {
        value: 'physical',
        text: 'Physical',
        sublabel: 'body, energy, hydration, sleep',
        emoji: '🌊',
      },
      {
        value: 'inner',
        text: 'Inner',
        sublabel: 'emotions, regulation, awareness',
        emoji: '🕊️',
      },
      {
        value: 'identity',
        text: 'Identity',
        sublabel: 'who I am, how I show up',
        emoji: '✨',
      },
      {
        value: 'financial',
        text: 'Financial',
        sublabel: 'sovereignty over time + money',
        emoji: '💠',
      },
    ],
  },
  {
    step: 3,
    axis: 'theme',
    text: 'What does your system most need right now?',
    subtitle: 'If you could only do one thing for yourself this week.',
    answers: [
      {
        value: 'state-shifting,baseline,simple-pleasure',
        text: 'To feel good and at ease — just to taste that again.',
      },
      {
        value: 'witness,awareness,signal-reading',
        text: "To understand what's happening to me — read my own signals.",
      },
      {
        value: 'release,reclaim,unwiring',
        text: "To release patterns I'm tired of carrying.",
      },
      {
        value: 'becoming,life-fueling,power',
        text: "To step fully into who I'm becoming.",
      },
    ],
  },
  {
    step: 4,
    axis: 'theme',
    text: 'What feels foundational to address?',
    subtitle: 'The thing under the thing.',
    answers: [
      {
        value: 'foundation,hydration,root-cause',
        text: "Energy and absorption — my body's basic systems.",
      },
      {
        value: 'regulation,balance,calm',
        text: 'Calm and regulation — my nervous system.',
      },
      {
        value: 'ownership,gentleness,choice',
        text: 'Choice and ownership — taking responsibility, gently.',
      },
      {
        value: 'clarity,intention,coherence',
        text: 'Coherence and clarity — knowing what I want.',
      },
    ],
  },
  {
    step: 5,
    axis: 'theme',
    text: 'Where do you sense your growth edge?',
    subtitle: 'The honest one. Not the impressive one.',
    answers: [
      {
        value: 'integration,wholeness,pulling-together',
        text: "I keep doing things that don't serve me.",
      },
      {
        value: 'awakening,what-now,post-awakening',
        text: "I notice patterns but can't change them yet.",
      },
      {
        value: 'expression,identity,loud-pride',
        text: "I'm awake but unsure what to do with it.",
      },
      {
        // Normalized to a single node's 3-theme bundle (node 13 — Unlock:
        // freedom / gifts-amplified / full-flow) so every step-5 answer carries
        // the same 3 themes. The prior 6-theme bundle also pulled node 4's
        // ELEVATE themes, buying double scoring weight for two funnel-end nodes.
        value: 'freedom,gifts-amplified,full-flow',
        text: "I'm ready to act on what I know.",
      },
    ],
  },
];

/**
 * Copy used in the result panel (quiz.astro).
 *
 * Templates use {placeholder} tokens because this object is serialized to a
 * `data-*` attribute via JSON.stringify and rehydrated client-side. Function
 * values do not survive JSON serialization, so placeholders are substituted
 * at render time in the client script.
 */
export const quizResultCopy = {
  label: 'Your starting node',
  whyTemplate:
    'Your answers point toward {reasons}. Start here to work with {themes}.',
  whyReasonsFallback: 'theme alignment',
  lockedMatchTemplate:
    'Your strongest long-range match was Node {nodeId}, which is still in preview. This is the closest live doorway for now.',
  ctaPreviewTemplate: 'Preview Node {nodeId} →',
  ctaVisitTemplate: 'Visit Node {nodeId} →',
};
export type QuizResultCopy = typeof quizResultCopy;

/** Copy used in the optional email capture section (quiz.astro) */
export const quizCaptureCopy = {
  label: 'Stay connected (optional)',
  description:
    'Get notes from admin as your node deepens. No spam, only sovereignty.',
  namePlaceholder: 'Your name',
  emailPlaceholder: 'your@email.com',
  submitLabel: 'Stay connected',
  statusSending: 'Sending...',
  statusConnected: 'Connected ✓',
  statusWelcome: 'Welcome.',
  statusEmailNeeded: 'Email needed to stay connected.',
};
export type QuizCaptureCopy = typeof quizCaptureCopy;

/** Copy used in QuizEmbed.astro fallback UI */
export const quizEmbedCopy = {
  loading: 'Loading quiz...',
  heading: 'Your assessment is ready',
  description:
    'Five questions place you on the spiral first, then you can stay connected after you receive your result.',
  ctaLabel: 'Start the assessment',
  footnote: 'Result first. Email optional.',
};
