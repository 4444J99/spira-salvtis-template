/**
 * analytics.ts — Lightweight, privacy-first event tracking
 *
 * Two independent layers (do not conflate them):
 *  1. The Cloudflare Web Analytics beacon (Base.astro, gated on
 *     CF_ANALYTICS_TOKEN) — collects PAGE VIEWS + Web Vitals only.
 *     It has no custom-event ingest and never reads these logs.
 *  2. trackEvent below — structured `[EA]` console lines. Today these
 *     reach NO durable sink: harvesting them requires Workers Logpush
 *     or a tail consumer (neither configured), or rerouting events to
 *     KV. See the 2026-06-05 conversion baseline audit (instrumentation
 *     section) for the completion plan.
 *
 * No cookies, no PII, no third-party scripts beyond the CF beacon.
 */

export type AnalyticsEvent =
  | { action: 'spiral_node_click'; nodeId: number; nodeName: string }
  | { action: 'quiz_start'; source: 'hub' | 'water' }
  | {
      action: 'quiz_complete';
      nodeId: number;
      score: number;
      source: 'hub' | 'water';
    }
  | { action: 'water_funnel_entry'; branch?: string }
  | { action: 'email_gate_submit'; page: string }
  | { action: 'branch_view'; branch: string }
  | { action: 'pillar_view'; pillar: string }
  | { action: 'cta_click'; label: string; href: string }
  | { action: 'waitlist_submit'; ok: boolean }
  | { action: 'dp_signup_interest_submit'; ok: boolean }
  | { action: 'personalized_plan_submit'; ok: boolean }
  | { action: 'nonprofit_interest_submit'; ok: boolean };

/**
 * Log a structured analytics event.
 *
 * Format: `[EA] action=<action> key=value ...`
 *
 * These are plain console.log calls. The CF Web Analytics beacon does
 * NOT capture them (it is page-view-only); they become a real event
 * stream only once a log drain (Workers Logpush / tail consumer) or a
 * KV-backed event sink exists. Until then they are a developer-console
 * convention, kept structured so the eventual sink needs no call-site
 * changes.
 */
export function trackEvent(event: AnalyticsEvent): void {
  const { action, ...data } = event;
  const pairs = Object.entries(data)
    .map(([k, v]) => `${k}=${v}`)
    .join(' ');

  // Structured prefix for easy filtering in log drains
  console.log(`[EA] action=${action}${pairs ? ' ' + pairs : ''}`);
}

/**
 * Auto-attach event listeners to annotated DOM elements.
 *
 * Call once from a `<script>` in Base.astro. Scans for elements
 * with `data-ea-*` attributes and wires up click handlers.
 *
 * Supported attributes:
 *   data-ea-action   — required, the event action name
 *   data-ea-*        — any other data-ea attribute becomes an event property
 *
 * Example:
 *   <a data-ea-action="cta_click" data-ea-label="Get Started" href="/quiz">
 */
export function initAutoTrack(): void {
  document.querySelectorAll<HTMLElement>('[data-ea-action]').forEach((el) => {
    el.addEventListener('click', () => {
      const action = el.dataset.eaAction;
      if (!action) return;

      const data: Record<string, string> = {};
      for (const [key, value] of Object.entries(el.dataset)) {
        if (key.startsWith('ea') && key !== 'eaAction' && value) {
          // Convert camelCase eaLabel -> label
          const prop = key.slice(2, 3).toLowerCase() + key.slice(3);
          data[prop] = value;
        }
      }

      // Include href for links
      if (el instanceof HTMLAnchorElement && el.href) {
        data.href = el.getAttribute('href') || el.href;
      }

      const pairs = Object.entries(data)
        .map(([k, v]) => `${k}=${v}`)
        .join(' ');
      console.log(`[EA] action=${action}${pairs ? ' ' + pairs : ''}`);
    });
  });
}
