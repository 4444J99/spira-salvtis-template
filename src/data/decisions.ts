/**
 * Decisions registry — every open question, hanging headache, and
 * binary/multi-option path that needs an answer to move the site forward.
 *
 * Source of truth for the `/decisions` page (`src/pages/decisions.astro`),
 * which is the client-us interaction surface — admin can browse the list,
 * see what affects what, see the system's recommendation, and signal her
 * answer via the per-option action.
 *
 * Each item carries:
 *   - title, category, ownerNeeded, urgencyHint  → header context
 *   - effects                                    → why this matters / what's blocked
 *   - suggestion                                 → system's recommended path
 *   - type + options                             → binary / multi-option / observation
 *   - progress 0-100                             → how close to a decision/resolution
 *   - status                                     → open / partial / resolved
 *   - links                                      → GH issues, docs, evidence
 *
 * v1 is static. v2 will hook option clicks into /capture with
 * source='decision-board' so admin's selections land in KV without leaving
 * the page.
 */

import { repoUrl, siteConfig, siteUrl } from './site.config';

export type DecisionStatus = 'open' | 'partial' | 'resolved';
export type DecisionType = 'binary' | 'multi' | 'observation' | 'free-text';
export type DecisionCategory =
  | 'urgent'
  | 'client-gated'
  | 'studio-internal'
  | 'strategic';
export type Owner = 'admin' | '4jp' | 'both' | 'system';

export interface DecisionOption {
  /** Short label shown on the button (1-4 words). */
  label: string;
  /** What choosing this means / what happens next. */
  description: string;
  /** Optional hint about consequences if chosen. */
  consequence?: string;
  /** Whether this is the system's recommended option. */
  recommended?: boolean;
}

export interface DecisionLink {
  label: string;
  url: string;
}

export interface DecisionItem {
  id: string;
  title: string;
  category: DecisionCategory;
  ownerNeeded: Owner;
  urgencyHint: string;
  /** What downstream things depend on this being decided/resolved. */
  effects: string;
  /** The system's recommended path (always present, even if just "needs admin input"). */
  suggestion: string;
  type: DecisionType;
  /** For binary/multi only. */
  options?: DecisionOption[];
  /** 0–100 — how close this is to being fully decided/resolved. */
  progress: number;
  status: DecisionStatus;
  links?: DecisionLink[];
  /** IDs of other decisions that must be resolved first. */
  blockedBy?: string[];
  /** Free-text notes for context/history. */
  notes?: string;
}

export const DECISIONS: DecisionItem[] = [
  {
    id: 'aesthetic-calibration',
    title: 'Aesthetic Calibration — Environmental Tone Parameters',
    category: 'client-gated',
    ownerNeeded: 'admin',
    urgencyHint: 'Before visual lock',
    effects:
      "The unified visual pass has established the baseline mathematical physics of the spiral. The system now requires aesthetic calibration. Provide specific parameters for glow language, particle velocity, and per-node atmospherics to finalize the environmental tone.",
    suggestion:
      "Audit the spatial knowledge graph and the gateway funnels. Note any tension in the baseline physics (velocity, luminescence, density). Explicit parameter changes are required to push the next refinement round.",
    type: 'multi',
    progress: 30,
    status: 'partial',
    options: [
      {
        label: 'Submit tuning parameters',
        description: 'Provide explicit vectors for color, velocity, and luminescence adjustments.',
        consequence: 'Feedback is ingested; the physics engine is recalibrated and redeployed.',
        recommended: true,
      },
      {
        label: 'Lock baseline physics',
        description: 'No adjustments necessary. Current mathematical baseline is locked.',
        consequence: 'Visual unification is complete. Issue is closed.',
      },
      {
        label: 'Defer calibration',
        description: 'Review deferred. Baseline physics remain in uncalibrated state.',
        consequence: 'Issue remains open. No state changes.',
      },
    ],
    links: [
      {
        label: 'GH#184 aesthetic calibration',
        url: 'https://github.com/4444J99/spira-salvtis-template/issues/184',
      },
    ],
    notes: 'Aesthetic tension must be resolved by the primary stakeholder. Baseline parameters will not be altered without explicit instruction.',
  },
  {
    id: 'ontological-mapping',
    title: 'Ontological Mapping — Sequence vs Categorization',
    category: 'client-gated',
    ownerNeeded: 'admin',
    urgencyHint: 'Before data migration',
    effects:
      "An ontological discrepancy exists between the temporal sequence (13 nodes) and the semantic categorization (4 foundations). A single authoritative mapping must be established to govern the spatial knowledge graph and dictate cross-linking topology and routing logic.",
    suggestion:
      "Review the architectural alignment between the temporal sequence and the foundations. A definitive assignment is required to resolve the topological tension.",
    type: 'free-text',
    progress: 10,
    status: 'open',
    options: [
      {
        label: 'Establish authoritative mapping',
        description: 'Provide the definitive structural assignment of nodes to foundations.',
        consequence: 'Routing logic is updated. Topological tension is resolved.',
        recommended: true,
      },
      {
        label: 'Retain legacy schema',
        description: 'Default to the pre-existing configuration mapping.',
        consequence: 'Legacy mapping becomes the locked standard.',
      },
      {
        label: 'Implement dynamic resolution',
        description: 'Allow runtime heuristic resolution based on session data.',
        consequence: 'Increases systemic complexity. Not recommended for V1.',
      },
    ],
    links: [
      {
        label: 'GH#206 ontological mapping',
        url: 'https://github.com/4444J99/spira-salvtis-template/issues/206',
      },
    ],
    notes: 'The discrepancy is between the initial architecture specification and the runtime configuration. Resolution requires stakeholder authority.',
  },
  {
    id: 'state-reset-anomaly',
    title: 'State-Reset Anomaly — Capture Flow Isolation',
    category: 'urgent',
    ownerNeeded: 'admin',
    urgencyHint: 'Awaiting environmental data',
    effects:
      "An anomalous state-reset occurs during capture flow deselection, inadvertently triggering the secondary fallback mechanism (mailto payload). Environmental parameters (device, viewport, node state) must be isolated to harden the event boundary.",
    suggestion:
      "Reproduce the deselection anomaly within the gateway funnel. Isolate the exact question index, viewport conditions, and resulting payload behavior to provide environmental context for a patch.",
    type: 'multi',
    progress: 40,
    status: 'partial',
    options: [
      {
        label: 'Execute active repro',
        description: 'Actively trigger the anomaly and record exact environmental parameters.',
        consequence: 'Event boundary is identified and hardened immediately.',
        recommended: true,
      },
      {
        label: 'Provide partial telemetry',
        description: 'Submit known variables (browser, device) without full reproduction.',
        consequence: 'Patch will rely on heuristic analysis of provided telemetry.',
      },
      {
        label: 'Unreproducible / Ghost event',
        description: 'Anomaly cannot be triggered. Likely a transient race condition.',
        consequence: 'Defensive fallbacks will be implemented to swallow future anomalous events.',
      },
    ],
    links: [
      {
        label: 'GH#207 state-reset anomaly',
        url: 'https://github.com/4444J99/spira-salvtis-template/issues/207',
      },
    ],
    notes: 'Three theoretical vectors exist for this anomaly: fallback leakage, unintended submission, or autocomplete interference. Telemetry is required to narrow the vector.',
  },
];

// ============ Helpers ============

export function decisionsByCategory(): Record<
  DecisionCategory,
  DecisionItem[]
> {
  const groups: Record<DecisionCategory, DecisionItem[]> = {
    urgent: [],
    'client-gated': [],
    strategic: [],
    'studio-internal': [],
  };
  for (const d of DECISIONS) groups[d.category].push(d);
  return groups;
}

export function overallProgress(): {
  count: number;
  sum: number;
  pct: number;
  resolved: number;
  partial: number;
  open: number;
} {
  const count = DECISIONS.length;
  const sum = DECISIONS.reduce((acc, d) => acc + d.progress, 0);
  const pct = Math.round(sum / count);
  const resolved = DECISIONS.filter((d) => d.status === 'resolved').length;
  const partial = DECISIONS.filter((d) => d.status === 'partial').length;
  const open = DECISIONS.filter((d) => d.status === 'open').length;
  return { count, sum, pct, resolved, partial, open };
}

export function categoryLabel(c: DecisionCategory): string {
  return {
    urgent: 'Urgent · Ship this week',
    'client-gated': 'Client-gated',
    strategic: 'Strategic',
    'studio-internal': 'Studio-internal',
  }[c];
}

export function ownerLabel(o: Owner): string {
  return {
    admin: 'admin',
    '4jp': '4jp / studio',
    both: 'admin + 4jp',
    system: 'System',
  }[o];
}
