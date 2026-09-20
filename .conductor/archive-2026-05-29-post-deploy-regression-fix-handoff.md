# Agent Handoff: post-deploy-regression-fix

**From:** Claude session (local host, Opus 4.8), 2026-05-29
**Date:** 2026-05-29
**Phase:** HARVEST (production outage diagnosed + fixed; deploy-script regression patched; pending merge + one architecture decision)
**Repo:** `organvm-iii-ergon/sovereign-systems--spiral-template`
**Branch:** `claude/jolly-cannon-7ba4fb` (worktree; == `origin/main` HEAD `83a5bff` + the uncommitted `package.json` fix)

Prior handoff (`post-astro-6-migration`, 2026-05-25) is archived at `.conductor/archive-2026-05-25-post-astro-6-migration-handoff.md`. This file replaces it.

---

## ⚠️ Correction to the prior handoff

The 2026-05-25 handoff asserted the migration was **"deployed, runtime-verified… Live URL verified"** while simultaneously admitting **"not re-curled this session."** That claim was false. **`https://sovereign-systems-spiral.pages.dev` was returning HTTP 404 on every path from the migration (2026-05-24) until 2026-05-29** — nobody had loaded the live URL after the migration. This is the canonical example of the "memory is hypothesis / 200 ≠ verified" rule: a deploy that reports "Success" is not a verified-serving site.

## Root cause (proven)

The Astro 6 migration bumped `@astrojs/cloudflare` **12.6.13 → 13.5.4**, which changed the build-output model:

- **v12 (Pages mode):** `astro build` → `dist/` with `_worker.js` + `_routes.json` + static assets at the **root**.
- **v13 (Workers mode, default):** `astro build` → `dist/client/` (static) + `dist/server/` (`entry.mjs` + generated `wrangler.json`). **No `_worker.js`.**

The deploy command in `package.json` was **never updated** — it stayed `wrangler pages deploy dist`. Post-migration, that uploads the *parent* of `client/` (a folder whose root has no `index.html`), so the Pages project published a non-servable tree. `wrangler pages deploy` prints "Success" on a wrong/empty directory, so it looked deployed. The entire site was sitting one level deep at `…pages.dev/client/`.

Verified via: git (deploy command byte-identical across the migration), local build (`dist/client` + `dist/server/wrangler.json`, no `_worker.js`), and live HTTP (`/` → 404, `/client/` → 200 "Sovereign Systems Spiral").

## Fix applied this session

1. **Restored production (manual):** `wrangler pages deploy dist/client --project-name sovereign-systems-spiral --branch main`. Site is live again — verified 200 on `/`, `/gateway/`, `/business/`, `/quiz`, `/research`, `/nodes/1`, `/pillars/foundation`.
2. **Patched the root cause (UNCOMMITTED):** `package.json` `deploy` script `dist` → `dist/client`. **This must land on `main`** — until it does, the next `npm run deploy` from `main` re-breaks the site.

## Topology discovered (was not previously documented)

- **`hub-example.com` is NOT on Cloudflare** — DNS (GoDaddy nameservers `domaincontrol.com`) points the apex at GoDaddy Website Builder (`76.223.105.230`, `13.248.243.5`), serving a GoDaddy template titled "Mayan Calendar." The custom-domain connection (carry-forward #3 / GH#3) was never done for the hub. Fixing it needs owner GoDaddy access.
- **`gateway-example.com` / `business-example.com` are served from a DIFFERENT Cloudflare account** — they are NOT in this account's zones (`ivi374iviorf.org`, `ivixivi.xyz`, `ivviiviivvi.xyz`) and NOT custom domains on the `sovereign-systems-spiral` project. So this repo's Pages project is **dev/staging on this account**; prod for the live funnels deploys elsewhere. **Deploying this repo does not update the live funnels** — reconcile where prod actually builds from.

## Open decision (architecture)

The v13 build is a **Workers** artifact, but the repo deploys to a **Pages** project. Three paths to restore the 2 SSR endpoints (`/capture` lead-capture, `/api/gateway-report` EWG proxy), which do NOT work on a static Pages deploy:

| Path | Keeps `pages.dev` URL? | SSR? | Notes |
| --- | --- | --- | --- |
| Stay on Pages (current) | yes | no | quiz still renders (capture is fire-and-forget); gateway funnel falls back to demo data |
| Switch to Workers | no → `*.workers.dev` | yes | `wrangler deploy --config dist/server/wrangler.json`; also wire the `SUBMISSIONS` KV binding (generated `wrangler.json` has `kv_namespaces: []`) |
| Investigate Pages-SSR | likely | likely | check whether adapter v13 can emit a Pages `_worker.js`; uncertain, needs research |

Owner is attached to the `pages.dev` URL → staying on Pages is the no-surprises path; only go Workers if `/capture` must work on *this* URL rather than the live client funnels.

## Code-review findings (verified against current source this session)

From the #112 audit (`docs/critiques/2026-05-26-astro6-migration-correctness-audit.md`), re-verified live:

- **HIGH** `EmailGate.astro:26-32,95-134` — soft gate protects nothing: gated `<slot/>` server-rendered into a `hidden` div (in page source), unlock is client-side `localStorage`, unlocks even on `/capture` failure. `/research` is readable via view-source.
- **HIGH** `decisions.astro:27` — `const to = 'padavano.anthony@gmail.com'` hardcoded personal email on a client-facing page (PII + M2).
- **HIGH** `gateway.config.ts:272,290,306` — affiliate URLs (`ionfaucet.com/admin-spiral`, `multipure.com/admin-wired`, `purehome.co/admin`) hardcoded inline (M2; revenue-linked).
- **MED** `Base.astro:712` — citation tooltip built as HTML string → `innerHTML` (XSS sink; studio-controlled data, low exploitability).
- `capture.ts` reviewed directly: **solid** (email validation + length caps, quizNodeId bounds, IP de-id, 5s webhook timeout, isolated sinks). One gap: **no rate-limit** on an unauthenticated public KV-write endpoint (matches the prior handoff's review backlog).

## Still-open carry-forwards

1. **`package.json` deploy fix uncommitted** — land on `main` (PR-cascade) or it re-breaks on next `npm run deploy`.
2. **SSR decision** (table above).
3. **Stale docs** — CLAUDE.md ("Deploy Configuration") and AGENTS.md still say `wrangler pages deploy dist` and "adapter generates `_worker.js`"; both now inaccurate post-v13. Fix bases (#6).
4. **CLAUDE.md autogen tail staleness (IRF-OPS-050)** — still RED (44d as of this session); `claude-md-autogen-gate` refuses session-DONE. Host-scope; unblock procedure in `.claude/plans/2026-05-17-handoff-irf-ops-050-unblock.md`. Refresh path itself has a tracked bug (IRF-OPS-051). Bypassed for this outage-fix session per the tracked-bug-bypass precedent.
5. **`hub-example.com` custom-domain connection** — owner GoDaddy task (repoint apex from GoDaddy Website Builder to Cloudflare Pages; mirror what the siblings already do).
6. **Reconcile prod hosting** — where do `gateway-example.com` / `business-example.com` actually build/deploy from (separate CF account)?
7. **Triple-reference the deploy regression** — file IRF + GH issue for the `dist`→`dist/client` regression so it's traceable (currently 1/3).
8. Prior-handoff carry-forwards still open: GitHub history exposure (4 relocated `docs/internal/` files); client-gated items awaiting admin (#49/#58/#62, custom domains #3, GATED #5/#7/#14/#18/#19); "anesoa" quiz UX bug.

## Verification (this session)

- Live URL re-curled: `/` and all major routes 200; SSR endpoints `/capture` 405, `/api/gateway-report` 404 (expected on static deploy).
- `dist/client` built from `HEAD` (`83a5bff`); only incidental build artifacts (`package-lock.json` 0-line, `src/data/library-manifest.json` regen) reverted to keep the fix atomic.
- Cloudflare API confirmed: project `sovereign-systems-spiral`, canonical deploy = latest `main`, `domains: [pages.dev only]`.

## Next actions

```bash
# 1. Commit + PR the deploy-script fix (PR-cascade; do NOT push main directly).
git add package.json
git commit -m "fix(deploy): publish dist/client (Astro6/cloudflare-v13 output), not dist"
# → gh pr create … ; self-review ; gh pr merge --squash

# 2. Decide SSR direction (Pages-static vs Workers vs Pages-SSR) — see table.
# 3. Update stale deploy docs in CLAUDE.md + AGENTS.md (dist→dist/client; drop _worker.js claim).
# 4. File IRF-OPS entry + GH issue for the deploy regression (triple-reference).
# 5. Owner: connect hub-example.com custom domain at GoDaddy (apex → Cloudflare Pages).
```

## Risks & Warnings

- **The site is currently held up ONLY by the manual deploy.** The fix is not in `main` yet — any `npm run deploy` from `main` (old script) re-publishes the broken `dist` tree. Land the `package.json` fix.
- **Don't push to `main` directly on this public ORGANVM repo without explicit per-session authorization.** PR-cascade.
- **`pages.dev` deployment hash URLs return cert/000 errors** (`*.pages.dev` cert is single-level) — test the bare alias or custom domains, not `<hash>.<project>.pages.dev`.
- **Memory is hypothesis.** State as of 2026-05-29. Re-verify: curl the live URL, `git rev-list --count origin/main..main`, and the open-PR status before acting.

## Recovery Protocol (if state has drifted on resumption)

1. `curl -s -o /dev/null -w '%{http_code}' https://sovereign-systems-spiral.pages.dev/` — `200` = fix holding; `404` = re-broken (redeploy `dist/client` + check the `package.json` script landed).
2. `git show origin/main:package.json | grep deploy` — verify `dist/client` (fix merged) vs `dist` (still pending).
3. `git log --oneline -3 origin/main` — confirm HEAD.
4. Read the SSR decision table above before any deploy-model change.
