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
    text: 'Select initial topological vector:',
    subtitle: 'Input is arbitrary; the architecture auto-corrects.',
    answers: [
      {
        value: 'INITIATE',
        text: 'Baseline physical stabilization. Low entropy.',
      },
      {
        value: 'INTEGRATE',
        text: 'Systemic integration. Aligning structural nodes.',
      },
      {
        value: 'ACTIVATE',
        text: 'High-velocity execution. Expanding the boundary.',
      },
      {
        value: 'ALL',
        text: 'Complete topological synthesis.',
      },
    ],
  },
  {
    step: 2,
    axis: 'pillar',
    text: 'Select primary structural pillar:',
    subtitle: 'Identify the vector of least resistance.',
    answers: [
      {
        value: 'foundation',
        text: 'Foundation',
        sublabel: 'Prima Materia variables',
        emoji: '🌊',
      },
      {
        value: 'system',
        text: 'System',
        sublabel: 'Machina variables',
        emoji: '🕊️',
      },
      {
        value: 'structure',
        text: 'Structure',
        sublabel: 'Architectonica variables',
        emoji: '✨',
      },
      {
        value: 'vision',
        text: 'Vision',
        sublabel: 'Oculus variables',
        emoji: '💠',
      },
    ],
  },
  {
    step: 3,
    axis: 'theme',
    text: 'Determine current processing deficit:',
    subtitle: 'Isolate the highest-leverage operation.',
    answers: [
      {
        value: 'state-shifting,baseline,simple-pleasure',
        text: 'Reduction of systemic friction.',
      },
      {
        value: 'witness,awareness,signal-reading',
        text: 'Increased telemetry resolution.',
      },
      {
        value: 'release,reclaim,unwiring',
        text: 'Garbage collection. Purging legacy logic.',
      },
      {
        value: 'becoming,life-fueling,power',
        text: 'Compiling new structural paradigms.',
      },
    ],
  },
  {
    step: 4,
    axis: 'theme',
    text: 'Identify root constraint:',
    subtitle: 'Deep-layer dependencies.',
    answers: [
      {
        value: 'foundation,gateway,root-cause',
        text: 'Hardware optimization.',
      },
      {
        value: 'regulation,balance,calm',
        text: 'Bandwidth regulation.',
      },
      {
        value: 'ownership,gentleness,choice',
        text: 'Read/write access control.',
      },
      {
        value: 'clarity,intention,coherence',
        text: 'Algorithmic clarity.',
      },
    ],
  },
  {
    step: 5,
    axis: 'theme',
    text: 'Identify expansion boundary:',
    subtitle: 'Objective self-reporting required.',
    answers: [
      {
        value: 'integration,wholeness,pulling-together',
        text: 'Infinite loops detected in execution.',
      },
      {
        value: 'awakening,what-now,post-awakening',
        text: 'Read-only access to legacy patterns.',
      },
      {
        value: 'expression,structure,loud-pride',
        text: 'Idle state awaiting instruction set.',
      },
      {
        // Normalized to a single node's 3-theme bundle (node 13 — Activate:
        // freedom / gifts-amplified / full-flow) so every step-5 answer carries
        // the same 3 themes. The prior 6-theme bundle also pulled node 4's
        // INITIATE themes, buying double scoring weight for two funnel-end nodes.
        value: 'freedom,gifts-amplified,full-flow',
        text: 'Ready for execution.',
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
    'Telemetry ingestion active. Establish async connection. Pure signal, zero noise.',
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
