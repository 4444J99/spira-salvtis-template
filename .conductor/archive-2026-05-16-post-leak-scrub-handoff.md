# Agent Handoff: post-content-leak-scrub continuation

**From:** Claude session (post-compact continuation), 2026-05-16 ~later UTC
**Date:** 2026-05-16
**Phase:** PROVE → HARVEST (content-leak scrub shipped + production verified clean)
**Repo:** `organvm-iii-ergon/sovereign-systems--spiral-template`
**Path:** `/Users/4jp/Code/organvm/sovereign-systems--spiral-template`

The prior CF-token-rotation handoff is archived at `.conductor/archive-2026-05-16-post-cf-rotation-handoff.md` — preserved for narrative continuity (it documented closure of GH#52 and PR #79). This file replaces it.

---

## Current State

- **Branch:** `main`. Working tree carries 3 items: `R .conductor/active-handoff.md → archive-...` (the rename producing this handoff), plus 2 pre-existing carry-forwards from parallel sessions (`D docs/admin/2026-04-25-message-spiral-feedback.pdf`, `?? docs/client-pdfs/2026-05-16-admin-imessage-responses.pdf`).
- **Main:** at `8afc6a4 feat(decisions): wire option clicks to /capture + capture studio suggestions (#88)`. Parity `origin/main..main = 0` / `main..origin/main = 0`. ✓ 1:1.
- **CI on main:** assumed green (last verified by post-merge runs for #84/#85/#86/#87/#88 — all squash-merged, auto-deploy live).
- **Live URL:** `https://sovereign-systems-spiral.pages.dev` — verified clean across `/water/{gut-hormones,athletic,fertility}/` + `/library` at session close.
- **Open PRs:** 0.
- **Vacuum gate:** `npm test` ✓ at last run before #84.
- **Uncommitted changes:** the `.conductor/active-handoff.md` rename + this new file's write are staged; require PR-cascade authorization to land per project CLAUDE.md `no direct push to main`.

## Completed Work (this session — content-leak-scrub slice)

- [x] Audited all client-facing content for leak risk: `src/content/branches/*.md`, `src/content/nodes/*.md`, `src/content/pillars/*.md`, `docs/admin/`, `docs/client-pdfs/`, `/library` catalog
- [x] Identified contamination in 3 branch files (`gut-hormones.md`, `athletic.md`, `fertility.md`) — all `## Research & Evidence` sections were raw ChatGPT exports containing intimate emotional messages, off-topic content (Bubble Butt cycle, cymatics, ebook outlines, grocery lists, Cheetos toxic breakdown, acupressure money-blockage routines, endometriosis fragment with `NCBI+3` crud, design palette quotes)
- [x] Deleted full `## Research & Evidence` sections (advisor: clean-template match, no surgical excision)
- [x] Verified clean via `npm run build` + grep on `dist/water/{slug}/index.html`
- [x] Regenerated 6 HTML exports via `scripts/extract-branch-html.mjs` + re-grepped — clean
- [x] Pulled `admin` and `client-pdfs` entries from `src/lib/docs-library.ts` (opt-in catalog principle)
- [x] Created `docs/internal/` (git-tracked, NOT gitignored) and `git mv`'d 4 sensitive analysis docs from `docs/admin/` + `docs/` + `docs/superpowers/intakes/`:
  - `2026-05-16-admin-imessage-transcript-and-signals.md`
  - `2026-05-16-branch-swap-proposal-analysis.md`
  - `admin-evidence-of-existence-audit-2026-04-27.md`
  - `2026-04-05-cross-session-github-board-alignment-transcript.md` (caught by wider defensive grep)
- [x] Wrote HOLD + CLEAR admin messages (`docs/admin/_hold-messages/2026-05-16-{HOLD,CLEAR}-html-exports.md`)
- [x] PR-cascade: #84 (scrub + relocate) → #85 (CLEAR message) → #86 (transcript relocate) — all squash-merged + branches deleted + local `main` synced
- [x] Production verified clean via `curl` against deployed URLs
- [x] Session memory written: `~/.claude/projects/.../memory/project_session_2026_05_16_content_leak_scrub.md`
- [x] Two durable feedback memories written: `feedback_build_pipeline_propagation.md`, `feedback_library_indexing_privacy.md`
- [x] Closeout doc written: `~/.claude/plans/closeout-2026-05-16-content-leak-scrub.md`
- [x] Both admin iMessage bodies delivered to user via SendUserFile for paste sequencing

## Key Decisions

| Decision                                                            | Rationale                                                                                                     |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Delete full `## Research & Evidence` section, not surgical excision | Cleaner diff, matches existing-clean `autoimmune.md` template, no leftover empty headers (advisor)            |
| `docs/internal/` (git-tracked), not `.private/` (gitignored)        | Universal Rule #2 nothing-local-only; defense-in-depth, not absolute removal (advisor)                        |
| Pull `/library` entries entirely, don't filter-allowlist            | Opt-in catalogs stay correct as `docs/` grows; allow-lists rot (advisor)                                      |
| Send HOLD message BEFORE cleaning, then CLEAR after                 | admin might be pasting HTML into GHL right now; HOLD-first prevents her shipping contaminated copy (advisor) |
| Trust `.md` edit but verify `dist/` after build                     | Build pipeline transforms whatever is present — could re-inject (advisor)                                     |
| PR-cascade (#84/#85/#86), not direct push                           | Project CLAUDE.md hard rule: no direct push to main on public ORGANVM repos                                   |

## Critical Context

- **Repo is PUBLIC** — `docs/internal/` only unlists from the deployed site; GitHub still serves all relocated files. True privacy requires git-history rewrite (destructive op, held).
- **Build pipeline doesn't sanitize** — `.md` source → `dist/water/{slug}/index.html` → `scripts/extract-branch-html.mjs` → HTML exports. Single source can contaminate 3+ downstream surfaces silently. Captured in `feedback_build_pipeline_propagation.md`.
- **`/library` is a privacy-impacting surface, not just a convenience index.** Captured in `feedback_library_indexing_privacy.md`.
- **CLAUDE.md autogen tail is 32 days stale** (`Last synced: 2026-04-14T21:31:57Z`). The freshness gate (`~/.local/bin/claude-md-autogen-gate`) is not installed on this host — no enforcement mechanism caught it. Flag for next refresh cycle (not blocking this handoff).

## Next Actions

1. **Land this handoff refresh** — if/when user authorizes:
   ```bash
   git checkout -b chore/refresh-active-handoff-post-leak-scrub
   git add .conductor/active-handoff.md .conductor/archive-2026-05-16-post-cf-rotation-handoff.md
   git commit -m "chore(conductor): refresh active handoff post-content-leak-scrub"
   git push -u origin chore/refresh-active-handoff-post-leak-scrub
   gh pr create --fill && gh pr merge --squash --delete-branch
   ```
2. **Paste admin messages** in sequence: HOLD first, then CLEAR after she acknowledges receipt.

## Hung items (carry-forward; not blocking)

1. **GitHub history still exposes 4 relocated `docs/internal/` files** — destructive git-rewrite held for explicit user authorization.
2. **"anesoa" quiz UX bug** — still needs admin clarification (from prior session).
3. **Dependabot pending** — `npm update astro @astrojs/cloudflare` (Task #19 still `pending`).
4. **IRF entry for this leak incident** — would close triple-reference law at workspace-meta as `IRF-CRP-*` or `IRF-OPS-*`. Not filed.
5. **CLAUDE.md autogen drift** — System Context block 32 days stale; gate script missing on host.
6. **Carry-forwards from CF-rotation handoff (still open):**
   - Pages:Edit-alone sufficiency test
   - Node 20 deprecation in CI (2026-06-02 default flip; 2026-09-16 removal)
   - `~/seed.yaml` stale-copy cleanup (IRF-OPS-040)
   - CF Pages GitHub App migration (Path 4)
7. **Two pre-existing parallel-session items in working tree:**
   - `D docs/admin/2026-04-25-message-spiral-feedback.pdf` (deletion not mine)
   - `?? docs/client-pdfs/2026-05-16-admin-imessage-responses.pdf` (duplicate at non-canonical path, not mine)

## Risks & Warnings

- **Don't conflate "clean from deployed site" with "removed from GitHub."** The 4 docs in `docs/internal/` are still public via the GitHub UI. If admin ever clicks the GitHub repo link directly, she will see them. The only mitigation that fully removes is git-history rewrite — destructive, held.
- **Build-pipeline propagation rule:** if you edit any `src/content/branches/*.md` going forward, regenerate the HTML exports AND re-grep them, even if you only changed one file. The `extract-branch-html.mjs` script re-bundles everything.
- **`/library` opt-in discipline:** when adding a new doc-category entry to `src/lib/docs-library.ts`, audit EVERY file in that directory for client-facing-appropriateness first. Don't add directories that mix deliverables with internal analysis — split them structurally instead.
- **Memory is hypothesis.** This handoff describes state as of 2026-05-16 session-close. Before acting on any path or claim: `git rev-list --count origin/main..main`, `gh run list --workflow CI --limit 3`, `curl -fsSI https://sovereign-systems-spiral.pages.dev`.

---

**Compression level:** Standard (~1700 tokens). Source-of-truth files:

- `~/.claude/projects/.../memory/project_session_2026_05_16_content_leak_scrub.md` — fullest record
- `~/.claude/projects/.../memory/feedback_build_pipeline_propagation.md` — durable rule (export-grep mandate)
- `~/.claude/projects/.../memory/feedback_library_indexing_privacy.md` — durable rule (opt-in catalog principle)
- `~/.claude/plans/closeout-2026-05-16-content-leak-scrub.md` — closeout summary
- `.conductor/archive-2026-05-16-post-cf-rotation-handoff.md` — prior handoff (CF rotation), preserved for context
