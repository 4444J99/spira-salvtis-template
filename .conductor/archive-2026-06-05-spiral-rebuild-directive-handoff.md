# Agent Handoff: spiral-rebuild-directive-closeout

**From:** Codex session | **Date:** 2026-06-05 | **Phase:** handoff/closeout
**Repo:** `organvm-iii-ergon/sovereign-systems--spiral-template`
**Checkout:** `/Users/4jp/Code/organvm/sovereign-systems--spiral-template`
**Branch:** `codex/envvar-life-motion-laws`
**HEAD:** `66e8a7e docs: add spiral rebuild handoff directive`

Prior root handoff (`post-hover-motion-ship`, 2026-06-04) was superseded for this checkout by the
spiral rebuild directive. The detailed directive is committed at:

`.claude/plans/2026-06-05-handoff-spiral-rebuild-directive.md`

---

## Current State

- Working tree verified clean on 2026-06-05.
- Branch is synchronized with upstream: `origin/codex/envvar-life-motion-laws`, `0 behind / 0 ahead`.
- Latest branch commit is already pushed: `66e8a7e`.
- `origin/main` is at `31bae07 fix: enforce background token contract (#204)`.
- No current-session source edits were made beyond this active handoff and closeout bookkeeping.

## Completed Work

- PR #201: EnvVar-driven rail motion merged/deployed.
- PR #202: unified spiral background merged/deployed.
- PR #203: node matter fields generative merged/deployed.
- PR #204: background token contract merged/deployed.
- Branch `codex/envvar-life-motion-laws` now carries the durable next-agent directive:
  `.claude/plans/2026-06-05-handoff-spiral-rebuild-directive.md`.

## Key Decision

Do not keep patching the old spiral as if it only needs more effects. The next implementation pass
should introduce a first-class generative law layer that derives bounded renderer behavior from
`EnvVar` + `IconWorld` data, then lets `spiral.ts` consume those laws.

## Corrected Context

The committed directive says the branch had uncommitted exploratory edits in `src/data/icon-worlds.ts`
and `src/components/spiral/spiral.ts`. That was true when the directive text was authored, but this
closeout verified the current checkout is clean and pushed. Treat the committed directive's
"uncommitted exploratory edits" bullet as stale historical context, not current repo state.

## Next Actions

1. Start from `.claude/plans/2026-06-05-handoff-spiral-rebuild-directive.md`.
2. Inventory `src/data/hub.config.ts`, `src/data/icon-worlds.ts`, `src/components/spiral/spiral.ts`,
   and `src/pages/nodes/[id].astro`.
3. Add or refine a data-layer `LifeMotionLaw` projection from `EnvVar` + `IconWorld`.
4. Add focused tests in `scripts/test.mjs` for unique seeds and bounded coefficients across all 13 nodes.
5. Wire renderer behavior only after the law projection is stable.
6. Verify with `npm run test:all`, `git diff --check`, local screenshots, and live Worker proof after merge.

## Constraints

- Never commit generated `src/data/library-manifest.json` or `public/citations.json` churn.
- Do not re-litigate Pages vs Workers unless explicitly asked; the current live proof path is the Worker URL.
- Avoid hardcoded per-node renderer behavior in `spiral.ts` when it belongs in data/config.
- Keep particle and motion systems bounded; speed and frame stability are requirements.
- Do not push directly to `main` without explicit per-session authorization.
