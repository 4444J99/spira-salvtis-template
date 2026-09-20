# Activation Audit: Ship Now - 2026-06-17

Issue: GH #221

## Scope

Activation pass for the actually-live Sovereign Systems Astro 6 + Cloudflare
Workers site. This pass focused on fixes that can ship without admin or
Anthony providing new external inputs.

Inputs reviewed:

- Current source and config
- `docs/critiques/2026-06-05-conversion-baseline-audit.md`
- `docs/reports/2026-06-05-debt-clearance-ledger.md`
- Homepage, quiz, node-page, and capture code paths

## Shipped Changes

1. Homepage hero now exposes `Take the Quiz` as the primary above-fold action
   and keeps `Enter the Spiral` as the secondary exploratory path.
2. `/quiz` now routes the visible result and capture payload to the strongest
   live node, instead of sending users into locked node dead ends.
3. `/quiz` preserves the strongest locked preview match as
   `quizPreviewNodeId` when rerouting to a live node, so follow-up data is not
   lost.
4. `/capture` bounds and persists `quizPreviewNodeId` the same way it bounds
   `quizNodeId`.
5. Node detail pages now render a pillar-aware activation CTA band:
   foundation nodes continue into `/gateway/quiz`, vision nodes into
   `/business/`, and system/structure nodes into the live quiz path.
6. The local assertion suite now covers the ship-now contracts above.

## Remaining Gated Items

These remain intentionally outside this pass because they need client or studio
infra inputs:

- `GHL_WEBHOOK_URL` and related automation wiring.
- A durable custom-event sink for `[EA]` analytics events.
- Affiliate/product URLs and bottled-gateway pricing inputs tracked in the
  existing admin pending-input docs.
- Custom domains for `hub-example.com`, `gateway-example.com`, and
  `business-example.com`.
- Payment rail decision for paid offers.

## Verification

Passed:

- `npm run test`
- `git diff --check`

Blocked by sandbox network/dependency state:

- `npm ci` failed on `getaddrinfo ENOTFOUND registry.npmjs.org`.
- `npm run check` could not run because `astro` is not installed in this
  worktree after the blocked install.
- `npm run build` was not run for the same dependency reason.

Verdict: source-level activation fixes are in place and covered by the local
assertion suite; full Astro check/build should be rerun once dependencies can be
installed from the committed lockfile.
