---
title: Deploy paths — Sovereign Systems Spiral
date: 2026-05-16
context: The Astro 6 / Cloudflare adapter 13 build is Workers-model. Deploying `dist/client` to Pages serves static assets only and drops SSR routes. Current deploy path is Cloudflare Workers + Static Assets at `sovereign-systems-spiral.ivixivi.workers.dev`.
sibling: docs/runbooks/cf-token-rotation.md (path 3 detail)
---

# Deploy paths — Sovereign Systems Spiral

Four ways to ship changes from `origin/main` to the Worker review surface, `https://sovereign-systems-spiral.ivixivi.workers.dev`. Pick the one that matches your urgency + tolerance for setup cost.

| # | Path | Time today | Future cost | When it's right |
|---|---|---|---|---|
| 1 | **Merge open PRs, then `npm run deploy`** | ~5 min | recurs per deploy | You have multiple PRs queued; want them all live in one shot |
| 2 | **`npm run deploy` from current `main` now** | ~2 min | recurs per deploy | One thing on `main` is hot and you want it live *right now*; defer queued PRs |
| 3 | **Rotate the CF token (per runbook)** | ~10 min | one-off, until next expiry | CI deploy fails with Cloudflare auth/token errors |
| 4 | **Attach custom domains to the Worker** | ~10-30 min | one-off | You want `hub-example.com` / client-facing domains to serve SSR |

The current "always works" workaround is path 2 (and path 1 builds on it). Paths 3 and 4 are the structural fixes.

---

## Path 1 — Merge open PRs, then `npm run deploy`

**When:** Multiple PRs are queued and you want a single deploy that lands all of them.

```bash
# Verify the PRs you want to merge are mergeable + green
gh pr list --state open --json number,title,mergeable,statusCheckRollup

# Merge each in dependency order (PR-cascade convention from CLAUDE.md)
gh pr merge <N1> --squash --delete-branch
gh pr merge <N2> --squash --delete-branch
# ... etc

# Sync local main with origin
git checkout main
git pull --ff origin main

# Build + deploy
npm run deploy
# (= npm run test:all && wrangler deploy --config dist/server/wrangler.json)

# Verify
curl -s -o /dev/null -w "%{http_code}\n" https://sovereign-systems-spiral.ivixivi.workers.dev/<route>
```

**Notes:**
- If two open PRs touch the same file, merge order matters; pick the one whose diff doesn't need rebasing first.
- The deploy command runs `test:all` (including prebuild + build) → Workers upload. If tests, typecheck, or build fail, deploy aborts.
- Wrangler uses your local OAuth (whatever account `wrangler login` last authenticated). No GitHub secret needed.

---

## Path 2 — `npm run deploy` from current `main` now

**When:** Something on `main` is hot and needs to be live before other queued work. Skips PR review for queued items.

```bash
git checkout main
git pull --ff origin main
npm run deploy
```

**Notes:**
- This is what happened today (2026-05-16) to ship `/timeline` immediately after PRs #71–#74 merged but #75 + #76 were still in review.
- Queued PRs land in a *later* deploy (path 1 or 2 again).
- If `npm run dev` is running locally, kill it first (it can block the build step).

---

## Path 3 — Rotate the CF token (per runbook)

**When:** You're tired of manual `npm run deploy` and want CI's auto-deploy to start working again. Acceptable to do another rotation in 6-12 months when the new token expires (unless you set "No TTL" — see GH#52 fix steps).

```bash
# 1. Follow docs/runbooks/cf-token-rotation.md
#    (mint token in CF dashboard with Workers Scripts Edit, Workers Routes Edit,
#     Workers KV Storage Edit, and Account Settings Read; Account Resources:
#     All accounts; No TTL)

# 2. Set the new token as the GitHub repo secret
gh secret set CLOUDFLARE_API_TOKEN --repo organvm-iii-ergon/sovereign-systems--spiral-template

# 3. Re-trigger CI (empty commit on main, or just push your next real commit)
git checkout main
git commit --allow-empty -m "ci: re-trigger deploy after token rotation"
git push

# 4. Verify
gh run watch  # most recent run on main
```

**Notes:**
- The runbook has the verification loop and the gotchas (CF API error 8000069, Direct Upload vs Git-connected projects).
- CI still uses wrangler with the token; just with a fresh, non-expired token.
- After rotation, the `deploy` job in `.github/workflows/ci.yml` runs on every push to `main` instead of getting SKIPPED.

---

## Path 4 — Attach custom domains to the Worker

**When:** You want the client-facing domains to serve SSR instead of the temporary `workers.dev` review URL.

```text
1. Visit https://dash.cloudflare.com → Workers & Pages → sovereign-systems-spiral
2. Settings → Domains & Routes → Add → Custom domain
3. Add the target hostname, e.g. `hub-example.com`
4. Set registrar DNS records exactly as Cloudflare instructs
5. Verify static `/` returns 200 and POST `/capture` returns 200/400 on the custom domain
6. Remove or stop sharing the old Pages URL once the Worker domain is verified
```

**Notes:**
- The current account has no custom domains attached to the Pages project, and the known brand zones were not visible in the verified Wrangler account during the 2026-06-04 migration pass.
- `*.pages.dev` remains owned by the Pages project; do not treat it as an SSR acceptance target unless the project is changed back to a Pages-compatible SSR model.

---

## Picking quickly

If you just want **the page to be live in 2 minutes**: path 2.

If you want **the branded/client-facing URL to have SSR**: path 4.

If you want **CI auto-deploy to work again but you don't want to install a GH App**: path 3.

If you have **multiple PRs queued and they should all land together**: path 1.

## Decision-board entry

The path-3-vs-path-4 choice is also tracked on the `/decisions` board as `cf-token-rotation` (`src/data/decisions.ts`). Treat that card as the authoritative decision surface for the structural fix; this runbook documents the operational steps.

## Cross-references

- `docs/runbooks/cf-token-rotation.md` — full detail for path 3
- `docs/runbooks/ghl-webhook-secret.md` — post-deploy GHL lead-delivery secret wiring
- `package.json` `scripts.deploy` — the actual `npm run deploy` command
- `.github/workflows/ci.yml` — the Worker deploy job on pushes to `main`
- GH#52 — the original token-expiry issue
- `.conductor/active-handoff.md` — current operational handoff
- CLAUDE.md `## Deploy Configuration` section — the canonical short version
