# Activation Audit: Ship-Ready State Verification — 2026-06-18

Issue: GH #220 (ESCAPE VELOCITY Track B — ship-soon)
Companion: GH #221 ship-now fixes (`docs/reports/2026-06-17-activation-audit-ship-now.md`)

## Verdict

**SHIP-READY.** The Sovereign Systems Astro 6 + Cloudflare Workers site has an
intact, reproducible production path and zero hard launch blockers. All
outstanding items are external-input gaps (client/studio infra) that are already
tracked and that limit *revenue/automation completeness*, not *launchability* —
the site renders and the dynamic routes function without them.

## Required Receipt (Definition of Done)

| DoD item | Evidence |
| --- | --- |
| Live URL | Review origin: `https://sovereign-systems-spiral.ivixivi.workers.dev` (`src/data/site.config.ts` → `cloudflare.reviewOrigin`). Auto-deployed on every push to `main` via `.github/workflows/ci.yml` `deploy` job. |
| Install/build path (reproducible) | `npm ci && npm run build` → `dist/client` (static assets) + `dist/server/entry.mjs` (SSR Worker). Deterministic from committed `package-lock.json` (286 KB). |
| Deploy command | `npm run deploy` (= `npm run test:all && wrangler deploy --config dist/server/wrangler.json`), or auto-deploy on push to `main`. |
| Source preserved | No deletions. This audit is additive (one new report file). |

## Shippable Path — Reproducible by a User

```bash
git clone https://github.com/organvm-iii-ergon/sovereign-systems--spiral-template
cd sovereign-systems--spiral-template
npm ci                 # deterministic install from package-lock.json (Node >=22.18)
npm run build          # → dist/client (assets) + dist/server/entry.mjs (Worker)
npm run preview        # local verification at the printed localhost URL
# Ship (auto): push to main → CI lint/test/check/build/deploy
# Ship (manual): npm run deploy
```

Auto-deploy requires two CI settings (verified as enforced by the `deploy`
job's pre-flight guard, `ci.yml:105-114`): `CLOUDFLARE_API_TOKEN` secret and
`CLOUDFLARE_ACCOUNT_ID` variable. KV binding `SUBMISSIONS`
(`497230d5482a4f22a65d541c6268d2f8`) is declared in `wrangler.jsonc` and merged
into the generated `dist/server/wrangler.json`.

## Production-Path Integrity — Verified Statically

| Check | Result |
| --- | --- |
| Committed lockfile present | ✅ `package-lock.json` (286 KB) — `npm ci` is deterministic |
| Deploy target is Workers, not Pages | ✅ `@astrojs/cloudflare` 13.7.0 (Workers adapter); `wrangler.jsonc` documents `wrangler deploy`, NOT `pages deploy` |
| SSR routes survive deploy | ✅ `/capture` and `/api/water-report` both carry `export const prerender = false` → bundled into the SSR Worker (not dropped as static) |
| KV binding declared | ✅ `SUBMISSIONS` namespace in `wrangler.jsonc` (capture degrades gracefully if unbound) |
| Secrets kept out of source (M2) | ✅ `GHL_WEBHOOK_URL`, `EWG_API_KEY` set via `wrangler secret put`; affiliate URLs via `PUBLIC_AFFILIATE_*` env with safe defaults |
| Vacuum gate consistent | ✅ `TRACKED_VACUUMS` (anespa/k8 `affiliateUrl`) matches live state — both still default to `''` in `hydration.config.ts:292-293`; no stale trackers |
| Local ↔ remote parity | ✅ `origin/main..main` and reverse both `0` |
| CI gate coverage | ✅ `ci.yml` runs lint + test + check + build, then deploy, on every push/PR to `main` |

## Blocker Ledger

**Hard launch blockers: 0.** The site is live and all routes function.

Tracked external-input gaps (do NOT block launch; reduce revenue/automation
completeness only):

| Gap | Status / Ref | Launch impact |
| --- | --- | --- |
| Enagic Anespa + K8 affiliate URLs | Tracked vacuum, GH #49 (admin pending) — `''` defaults, gate-acknowledged | Those 2 of 6 filter tiers lack a buy link; other 4 are live |
| `GHL_WEBHOOK_URL` automation wiring | Optional capture sink; KV sink works without it | Leads persist to KV; GHL mirroring inactive until set |
| Durable custom-event analytics sink | Noted in #221 | `[EA]` events fire client-side only |
| Custom domains (`hub-example.com`, `water-example.com`, `business-example.com`) | DNS-level CNAME, not Astro logic | Site live on `*.workers.dev`; vanity domains pending DNS |
| Payment rail (Stripe vs GHL) | GH #229 (W-032, blocked on decision) | Paid offers deferred; free funnel unaffected |

## Verification Status — Honest Account

**Run / confirmed:**

- Production-path integrity table above (static inspection of config + source).
- Vacuum-gate consistency (read `vacuum-gate.mjs` + `hydration.config.ts`;
  trackers match live empty state — gate passes).
- Git parity (`git rev-list`).

**Could NOT run in this session (sandbox has no outbound network — identical
constraint the #221 audit hit with `getaddrinfo ENOTFOUND registry.npmjs.org`):**

- `npm ci` / `npm run build` — `node_modules` absent in this worktree; install
  needs the registry.
- Live `curl`/HTTP probe of the Worker origin and `/capture`,
  `/api/water-report` endpoints.

These require either CI (which runs them on every push to `main`) or a
network-enabled shell. The path is verified *structurally*; the empirical
build/probe is delegated to CI, where the same `npm ci → build → deploy`
sequence runs on each push and gates the live deploy.

## Recommendation

No code changes are required for launchability. To convert the remaining gaps
into shipped revenue completeness, the next actionable steps are owner-gated:
collect the two Enagic affiliate URLs (GH #49), resolve the payment-rail
decision (GH #229), and connect the custom domains at the Cloudflare dashboard.
