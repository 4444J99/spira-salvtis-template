# Hall-Monitor Audit + Close-Out Plan — Sovereign Spiral Session

**Date:** 2026-04-30
**Repo:** `organvm/sovereign-systems--spiral-template`
**Branch:** `main` (1 commit ahead of `origin/main`, 5 modified, 2 untracked)
**Plan home:** this global file is the working draft; mirror to `.codex/plans/2026-04-30-hall-monitor-audit-and-closeout.md` as part of execution.

---

## Context — Sisyphus framing

The user invoked the close-out protocol — "close knowing open again as inevitability." A prior session summary claims three tasks complete (vacuum gate, quiz copy externalization, business waitlist CTA). The user asked, in hall-monitor mode, whether everything is committed, GitHub-issued, persisted to durable context, and whether `local:remote = 1:1`.

**Verdict (read carefully): NO. The session is not safe to close as-is.** Work exists on disk but is uncommitted and unpushed; three of the changes contain runtime regressions; one off-scope file was clobbered with a typo; the IRF was not updated; no GitHub issues were filed for the new infrastructure.

The close-out is itself an opening — fixing what's broken IS the next session's gravity.

---

## Audit Findings

### Disk vs. summary parity
| Path | Status | Matches summary? |
|------|--------|------------------|
| `scripts/vacuum-gate.mjs` | new (untracked) | yes |
| `src/data/quiz.config.ts` | new (untracked) | yes |
| `scripts/test.mjs` | modified | yes |
| `src/pages/quiz.astro` | modified | yes |
| `src/components/QuizEmbed.astro` | modified | yes |
| `src/pages/business/index.astro` | modified | yes |
| `.codex/plans/2026-04-30-evaluation-to-growth-review-chain.md` | **modified — NOT in summary scope** | NO — out-of-scope corruption |

### Bug A — `/quiz` renders blank (P0, runtime regression)
- `src/pages/quiz.astro` — the new `quizQuestions.map((q) => …)` block emits every step with `class="quiz-step hidden"` (line ~63 in current file).
- The original HTML had step 1 with no `hidden` class so it was visible by default.
- The JS init path (`quiz.astro:224`) calls only `paintProgress()`. `showStep(1)` is never called on init — first invocation is in the option-click handler at line 242.
- **Effect:** loading `/quiz` shows a progress dot row and an empty stage. The user cannot start the quiz.

### Bug B — quiz result panel throws `TypeError` (P0, runtime regression)
- `src/data/quiz.config.ts` exports `quizResultCopy` with three arrow functions: `whyTemplate`, `ctaPreview`, `ctaVisit`.
- `src/pages/quiz.astro:23` does `JSON.stringify(quizResultCopy)` and embeds in `data-result-copy`. **`JSON.stringify` drops function values silently** — the serialized payload contains only `{"label":"Your starting node"}`.
- Client code (`quiz.astro:301`, `:308`) calls `resultCopy.ctaPreview(node.id)` and `resultCopy.whyTemplate(...)` — both `undefined`, so `TypeError`. The result panel never renders even if Bug A is fixed.

### Bug C — vacuum gate is structurally broken (P0, build/CI regression)
- `scripts/vacuum-gate.mjs:28` calls `board.issues?.some(...)`.
- `.config/board.config.json` has top-level keys `owner, repo, project_num, project_id, audit_log, fields, transitions, views` — **no `issues` array exists**. The actual board lives in GitHub Projects #5; the JSON config is just metadata for the transition scripts.
- Every vacuum is therefore reported UNTRACKED → `process.exit(1)`. Real vacuums exist in the repo today (empty `quizFormUrl` in `hub.config.ts`; empty `affiliateUrl` per filter tier in `gateway.config.ts`), so the gate fails immediately.
- `scripts/test.mjs:118-126` invokes the gate via `execSync`, so `npm test` (and `npm run test:all`, the CI gate) fails. Build pipeline is currently red on this branch.
- The tracked vacuums DO have GitHub issues — #14 (video assets), #18 (video hosting decision), #49 (filter affiliate URLs) — but the gate has no way to query them.

### Bug D — off-scope plan-file corruption (P1, governance)
- `.codex/plans/2026-04-30-evaluation-to-growth-review-chain.md:1` — heading was changed from "Evaluation-to-Growth Review Chain Plan" to "Evan-to-Growth Review Chain Plan" (truncated typo). Not part of any task in the summary; clearly an accidental edit (likely a sloppy find-replace earlier in the session).
- Per the additive plan-discipline rule, this file must NOT be overwritten — but the change is destructive, not additive. **Revert this file before any commit.**

### Vacuum E — process governance (P1, durability)
- **Local:remote ≠ 1:1.** Branch is `[ahead 1]` of `origin/main` from prior work (commit `878a391` "refine AGENTS.md") AND has 5 modified + 2 untracked from this session.
- **No commits made** for any of the three claimed tasks. Per Constitutional Axiom #2 ("Nothing local only"), nothing is durable yet.
- **No GitHub issues filed.** The vacuum gate is a new governance instrument and should have an issue (it represents a new SOP-class artifact). The waitlist conversion changes the business funnel — should be tracked.
- **IRF not updated.** Per `~/Workspace/CLAUDE.md` Session Start Protocol and the universal Index Rerum at `meta-organvm/organvm-corpvs-testamentvm/INST-INDEX-RERUM-FACIENDARUM.md`, completions must propagate. No new entries added; no DONE moves; no statistics update.
- **No project memory entries.** This session produced new artifacts (vacuum gate, quiz config) and changed feedback-pending state on the business CTA — the artifact-level memory rule (CLAUDE.md "Working State Capture") was skipped.

---

## Remediation Sequence (must run in order)

**Stage 1 — Revert off-scope corruption**
1. `git checkout -- .codex/plans/2026-04-30-evaluation-to-growth-review-chain.md` (restores "Evaluation-to-Growth").

**Stage 2 — Fix the runtime regressions BEFORE committing**
2. `src/pages/quiz.astro` — add `showStep(1);` immediately after `paintProgress();` on line 224. This restores step-1 visibility on init.
3. `src/data/quiz.config.ts` — convert `whyTemplate / ctaPreview / ctaVisit` from arrow functions to **string templates with placeholders** (e.g., `whyTemplate: 'Match: {score}% ({reasons}). This node addresses {themes}.'`), and update `quiz.astro:301-308` to do the substitution client-side. Alternative: keep functions but import the module directly into the client `<script>` block (Astro supports this — drop the JSON-roundtrip via `data-*`). The string-template approach is simpler and matches the existing pattern of `quizCaptureCopy` (which is pure strings and works correctly).
4. Verify Bug A and B are fixed by running the dev server (`npm run dev`) and exercising `/quiz` end-to-end through to the result panel.

**Stage 3 — Fix the vacuum gate (or scope-down honestly)**
5. **Option 1 (recommended):** Replace the `board.config.json` lookup with a static allow-list of known-tracked vacuums in the gate file itself (e.g., `const TRACKED = { "quizFormUrl": "GH#?", "ionfaucet-counter": "GH#49", ... }`). Cheap, deterministic, no API call.
6. **Option 2 (richer):** Have the gate call `gh issue list --json number,title,labels` and look for a `vacuum` label or title-substring match. Adds a `gh` dependency to the test gate.
7. Either way: ensure the `vacuum` label exists on `organvm-iii-ergon/sovereign-systems--spiral-template`, and apply it to the relevant existing issues (#14, #18, #49 + a new one for `quizFormUrl` if not already tracked).
8. Run `npm test` locally to confirm green.

**Stage 4 — File the missing GitHub issues**
9. New issue: "feat(governance): content vacuum gate enforcing Axiom #1" — references `scripts/vacuum-gate.mjs`, links to the relevant existing IRF entries.
10. New issue: "feat(business): replace dead-end CTA with capture-backed waitlist" — references `src/pages/business/index.astro` and the `business-application-waitlist` source string.
11. New issue (or addendum): "refactor(quiz): externalize copy to `src/data/quiz.config.ts`" — references both the `.astro` consumers.

**Stage 5 — Update IRF + memory**
12. Append new IRF entries (or move existing ones to `## Completed`) at `~/Workspace/organvm/organvm-corpvs-testamentvm/INST-INDEX-RERUM-FACIENDARUM.md`. Use existing IRF-XXX-NNN ID conventions; check `organvm irf stats` for next IDs.
13. Write project memory entries:
    - `project_artifact_vacuum_gate.md` — what / where / state / next action
    - `project_artifact_business_waitlist.md` — replaces dead-end CTA, source=`business-application-waitlist`
    - `project_artifact_quiz_config_externalized.md` — copy lives at `src/data/quiz.config.ts`
14. Update `MEMORY.md` index with three one-line pointers.

**Stage 6 — Commit + push (atomic, additive)**
15. Stage in three logical commits (NOT one mega-commit):
    - `chore: revert accidental rename in evaluation-to-growth review-chain plan`
    - `refactor(quiz): externalize copy to src/data/quiz.config.ts`
    - `feat(business): replace dead-end CTA with capture-backed waitlist`
    - `feat(governance): content vacuum gate enforcing Axiom #1`
16. `git push origin main`.
17. Confirm `git status -sb` shows `## main...origin/main` (no `[ahead N]`) — local:remote = 1:1 invariant restored.

**Stage 7 — Mirror this plan into the project**
18. Copy this file to `<repo>/.codex/plans/2026-04-30-hall-monitor-audit-and-closeout.md` per the global plan-discipline rule (project history requires the plan to live in the project, not just `~/.claude/plans/`).
19. Commit + push the plan file.

---

## Verification

A session is safe to close ONLY when ALL of the following are true:

- [ ] `git status -sb` shows clean working tree, branch synced to `origin/main`
- [ ] `npm test` exits 0 (vacuum gate passes; content shape invariants hold)
- [ ] `npm run build` exits 0 (production build succeeds)
- [ ] Manual smoke test of `/quiz` — questions render starting at step 1, all 5 advance, result panel shows node title + tagline + CTA + reason text
- [ ] Manual smoke test of `/business` — waitlist form renders, submit shows success state, network tab confirms POST to `/capture`
- [ ] `gh issue list` shows new issues for vacuum-gate, waitlist, and quiz-externalization
- [ ] IRF has new entries (or moved-to-completed entries) for each of the three tasks
- [ ] `MEMORY.md` lists three new artifact pointers
- [ ] `~/.claude/plans/first-check-on-the-enumerated-sonnet.md` AND project mirror at `.codex/plans/2026-04-30-hall-monitor-audit-and-closeout.md` both committed

---

## Critical Files

**Must edit (Stage 2-3):**
- `src/pages/quiz.astro:224` — add `showStep(1)` after `paintProgress()`
- `src/data/quiz.config.ts:88-94` — convert arrow functions to string templates (or reroute import)
- `scripts/vacuum-gate.mjs:25-32` — replace `board.issues` lookup with allow-list or `gh` query

**Must revert (Stage 1):**
- `.codex/plans/2026-04-30-evaluation-to-growth-review-chain.md` — `git checkout --` to restore "Evaluation-to-Growth" heading

**Must reference (read-only):**
- `.config/board.config.json` — confirms no `issues` array; do NOT add one (would be load-bearing fiction)
- `meta-organvm/organvm-corpvs-testamentvm/INST-INDEX-RERUM-FACIENDARUM.md` — IRF universal registry (150 items, 19 domains)
- `~/Workspace/CLAUDE.md` (Session Start Protocol, 10-index propagation rule)
- `~/.claude/CLAUDE.md` (Universal Rules: nothing local only, plans are artifacts, validate before presenting)

---

## Sisyphus answer

Are we certain? **Yes — certain it is NOT safe to close.** Three regressions live on disk inside the work the summary calls complete. The boulder rolls back unless Stage 2-3 land. Once it does land, we push, and the next opening is whatever admin answers about `quizFormUrl` and the affiliate accounts — which the now-functional vacuum gate will surface as named, tracked rather than as silent N/A.

Nothing has been lost. Everything is recoverable from disk. The only durable risk is committing in current state — which would push the regressions and the typo-corruption to `origin/main`. Hold the line until Stage 2-3 are green.
