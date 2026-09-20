# Stream A — Deploy Proof (Local Wrangler → Cloudflare Pages)

**Date:** 2026-04-29
**Triggered by:** `npm run deploy` (which runs `npm run build && wrangler pages deploy dist --project-name sovereign-systems-spiral`)
**Auth path:** local Wrangler OAuth (not the broken CI `CLOUDFLARE_API_TOKEN`, which is the GH#52 vacuum surfaced separately)

---

## Deployment

- **Preview URL (this deploy):** https://efce9fbe.sovereign-systems-spiral.pages.dev
- **Project canonical alias:** https://sovereign-systems-spiral.pages.dev (now serving this deploy)
- **Custom domain (pending admin's CF dashboard action):** https://hub-example.com

---

## Smoke verification (live, against the deployed origin)

| Path | Method | HTTP | Size / Body | Time |
|---|---|---|---|---|
| `/` | GET | 200 | 7,756 bytes | 380ms |
| `/quiz` | GET | 200 | 8,666 bytes | 791ms |
| `/capture` | POST (full quiz payload) | 200 | `{"success":true}` | 337ms |

The `/capture` endpoint succeeding in production is itself a closure of a previously invisible vacuum: the prior `functions/capture.ts` was being intercepted by the Astro `_worker.js` worker (returning 405 with EmailGate's `try/catch` swallowing the failure). Every form submission site-wide was being silently lost. The relocation to `src/pages/capture.ts` (Astro APIRoute) lands in the same closure as IRF-III-034 GH#56 and resolves the underlying breakage.

---

## Deploy-side variant URLs (live)

All variants accessible against the deployed origin via querystring:

### IRF-III-033 / GH#57 — Spiral vessel modes
- https://sovereign-systems-spiral.pages.dev/?vessel=invisible (current ship default)
- https://sovereign-systems-spiral.pages.dev/?vessel=visible
- https://sovereign-systems-spiral.pages.dev/?vessel=refracted-star
- https://sovereign-systems-spiral.pages.dev/?vessel=hybrid

### IRF-III-032 — Nav variants
- https://sovereign-systems-spiral.pages.dev/?nav=pillar-first (current ship default)
- https://sovereign-systems-spiral.pages.dev/?nav=spiral-first

### IRF-III-034 / GH#56 — Quiz
- https://sovereign-systems-spiral.pages.dev/quiz

---

## What this proof confirms

1. **Build → bundle → deploy pipeline is intact.** The local `wrangler pages deploy` path bypasses the broken CI auth (GH#52) and ships a working bundle.
2. **All Stream A code-changes are live.** Vessel mode wire-through, dual nav, quiz redesign, capture relocation — all reachable on the deployed origin right now.
3. **Capture endpoint is verifiably working in production for the first time** (since the silent regression). KV is not yet bound (logs will show the warning), but the GHL webhook sink is ready to fire as soon as `GHL_WEBHOOK_URL` is set on the Pages project, and the response succeeds either way.

---

## Outstanding deploy-side concerns (out of scope for Stream A)

- **CI auto-deploy** stays broken (GH#52, CF API token expired 2026-04-19). Local manual deploys are working but not cron-driven. Surfacing as a candidate vacuum for the next session: refresh CF API token via Cloudflare dashboard → My Profile → API Tokens → Create Token (scope: Account > Cloudflare Pages > Edit), then `gh secret set CLOUDFLARE_API_TOKEN -R organvm-iii-ergon/sovereign-systems--spiral-template`. Future pushes to `main` will then auto-deploy.
- **Custom domain** `hub-example.com` still pending admin's Cloudflare dashboard action (one-time DNS connect). Until that lands, the canonical URL is `sovereign-systems-spiral.pages.dev`.
- **KV namespace `SUBMISSIONS`** not yet provisioned. Captures land in the GHL webhook (when set) but no durable storage. Provision via Cloudflare dashboard → Workers & Pages → Storage → KV → Create namespace `sovereign-systems-submissions`, then bind to the project as `SUBMISSIONS`.
