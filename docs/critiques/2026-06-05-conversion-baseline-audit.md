# Conversion Baseline Audit — 2026-06-05

**Scope:** every conversion path on the live site — hub → quiz → capture,
the water funnel, business waitlist, decision board, branch/pillar/node/
research content pages, and the instrumentation layer that should measure
them all.
**Method:** five parallel source-level analyses + one live HTTP probe per
route on the production Worker (no POSTs submitted). This is the baseline
admin asked for on 2026-05-25 (GH issue 209); a re-run after her GHL pages
are dialed in remains available.
**Severity:** 🔴 Critical (conversion-breaking) · 🟡 Moderate ·
🟢 Minor.

## The headline

**No conversion signal reaches the studio today.** Leads land in a KV
namespace nobody reads (no GHL webhook — issue 211), the analytics beacon
is off (no token — issue 51), and every custom funnel event is a console
line with no sink. The funnel *collects* but cannot *report*. Fixing
measurement is the precondition for every optimization below being more
than a guess.

## Critical findings (cross-funnel)

| # | Finding | Where | Status |
| --- | --- | --- | --- |
| C1 | Quiz CTA below the fold — first "Take the Quiz" link sits ~78% down the rendered page; the hero's only CTA is a secondary-styled "Enter the Spiral" pointing at a non-converting exploratory page | `index.astro` hero | Decision needed (studio) |
| C2 | Quiz routes ALIGN/UNLOCK answers into locked "Coming Soon" nodes — 8 of 13 result destinations are contentless stubs; the user invests 5 questions and the payoff is a dead page | `quiz.astro` scoring × `hub.config.ts` locked nodes | Decision needed (studio) |
| C3 | Zero follow-up after capture — no webhook, no autoresponder; post-submit UX ends at "Connected ✓" while the copy promises "notes from admin" | `capture.ts` sinks × prod env | Client-gated (issue 211) + copy fix |
| C4 | Node pages are conversion cul-de-sacs — 10 of 13 node bodies offer nothing but "next node"; the template has no CTA block | `nodes/[id].astro` template | Decision needed (studio) |
| C5 | Write-only KV — decision answers and waitlist signups are never seen by anyone; no read surface, no notification | `wrangler.jsonc` (no vars) | Client-gated (issue 211) |
| C6 | `trackEvent` reaches no sink — the CF beacon is page-view-only and cannot ingest custom events even after the token lands; Logpush/tail not configured | `analytics.ts` | Studio infra decision |
| C7 | No denominator — KV holds conversions only; funnel-entry events never persist, so conversion *rate* is uncomputable | `capture.ts` + `analytics.ts` | Studio infra decision |

C6/C7 share one fix: route `[EA]` events to a durable sink. The cheap path
is POSTing funnel events to KV — but the SUBMISSIONS namespace also carries
captures and the rate-limit counters, and free-tier KV write quotas are
finite, so event rows need either sampling, a separate namespace, or
Logpush instead. That sizing decision is deliberately NOT made in this
pass.

## Per-funnel notes

### Hub → Quiz → Capture

- 🔴 C1, C2, C3 above.
- 🟡 The quiz funnel is unmeasured: `quiz_start` was defined but never
  emitted (fixed in this pass), and nothing reaches a sink (C6).
- 🟡 The result-panel dead end (no way to change answers once finished —
  the likely root of admin's "tried to send an email" report, issue 207)
  — **fixed in this pass** ("← Change my answers" on the result panel).
- 🟢 Result copy leaks internals — "Match: {score}% (phase +3, pillar
  +3…)" reads like a debug line; benefit-led copy would convert better.

### Water funnel

- 🟡 Empty affiliate tiers (anespa, k8 — issue 49) render CTA-less tier
  cards; the recommendation sequence is coherent but two tiers dead-end.
- 🟡 Demo-data fallback can erode trust when a real ZIP yields sample data
  (issue 62 context); the 3-state banner mitigates but the fluoride repro
  is still pending admin.

### Business waitlist + Decision board

- 🔴 C5 above (shared root with C3).
- 🟡 Waitlist success message showed even when the POST failed or was
  rate-limited — **fixed in this pass** (success gated on `resp.ok`, retry
  copy on failure, `waitlist_submit` event added).
- 🟡 The live mailto fallback on /decisions uses the synthetic
  `decisions@sovereign-systems.local` because `PUBLIC_DECISIONS_EMAIL` is
  unset in prod — set it via Cloudflare dashboard var (NOT committed
  config — the address is PII; see issue 126 history).
- 🟡 Waitlist value proposition is thin: email-only (capture supports
  `name`), no statement of what "applications" are or when they open.
- 🟢 One card showed `progress: 100` with `status: 'partial'` — **fixed
  in this pass** (75, matching its own 9-of-12 notes).
- The board itself is strong: progress bars, owner badges, two-way
  calibration capture all verified live.

### Content pages (branches / pillars / nodes / research)

- 🔴 C4 above (node template).
- 🟡 All 6 branch CTAs point at the bare `water-example.com` homepage —
  per-branch `ghlUrl` exists in the schema but is never populated
  (client-gated: needs admin's per-branch destinations; interim option:
  point at `/water/quiz`).
- 🟡 Branch markdown's own "Start with your water →" CTA renders inside
  the email gate — the content's natural next step is locked with the
  content. Consider branch-specific gate copy ("Get your inflammation
  water protocol") so the gate IS the conversion event.
- 🟡 /research unlock is a thin value exchange (a bibliography) and a dead
  end after unlock — no onward CTA. Reframe the asset or route
  post-unlock readers to the quiz.
- 🟢 Pillar pages: visible CTA is uniformly "Back to the spiral";
  identity/inner pillars route readers in circles while physical/financial
  route to funnels.

## What works well (verified live)

- The honest email gate on /research: bibliography genuinely absent from
  initial HTML, POST-only endpoint, no-store — a real value-exchange wall.
- `capture.ts` is defensively solid: validation, length caps, per-IP rate
  limiting that fails open, IP de-identification, isolated sinks.
- The source-string registry cleanly discriminates all five funnels in KV
  — the numerator half of measurement is already well-structured.
- /decisions is a genuinely strong client surface, honestly self-reporting
  its own backlog.
- Declarative `data-ea-action` click-tracking means the event pipe fix
  lights up existing annotations with no call-site changes.

## Fixed in this pass (shipped with this audit)

1. Quiz result-panel "← Change my answers" affordance (issue 207).
2. Waitlist success gated on `resp.ok` + retry copy + `waitlist_submit`
   event.
3. `quiz_start` now emitted on first quiz interaction.
4. `analytics.ts` docstring corrected (beacon ≠ event sink — it
   overclaimed).
5. Decision-board progress/status inconsistency (100/partial → 75).
6. Two new decision cards routed to admin's board: node→pillar mapping
   (issue 206) and the free/email/paid boundary approval (issue 7).

## Priority order (recommendation)

1. **Measurement first** — pick the event sink (KV-with-sampling vs
   Logpush), set `CF_ANALYTICS_TOKEN` + `GHL_WEBHOOK_URL` when admin
   sends them (issues 51/211). Without this, nothing else is measurable.
2. **Hero CTA** — make the quiz the primary above-fold action; keep
   "Enter the Spiral" secondary. One-file change, biggest single lever.
3. **Locked-node routing** — either clamp quiz results to live nodes with
   honest framing, or give locked nodes a waitlist capture. Decide, then
   ship.
4. **Node-template CTA block** — one template edit fixes 12 cul-de-sacs
   (derive target from `pillarSlug`, M2-clean).
5. **Post-capture next step** — even before automation: a "what happens
   next" line + booking link once `ghl-booking-url` resolves.

## Caveats

- Layout/contrast judgments (fold position, confirmation visibility) are
  marked from DOM order and need a rendered-viewport pass to be final.
- Items marked client-gated cannot move without admin's inputs — all are
  consolidated in `docs/admin/2026-06-05-final-pending-inputs.md`.
- This is the **baseline**; the offer of a re-run after her GHL pages are
  finalized stands (the delta against this document becomes the progress
  report).
