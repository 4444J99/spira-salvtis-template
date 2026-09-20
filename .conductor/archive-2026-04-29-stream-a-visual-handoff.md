# Active Handoff: Stream A — admin / Sovereign Spiral Visual

**To:** Claude (peer session, this repo)
**From:** Claude (orchestrating session, ~/Workspace, 2026-04-29 ~14:00)
**Status:** ACTIVE — entry permit. Read this first; acknowledge before writing.

---

## Your scope

You are running Stream A of a multi-stream partition. You own this repo (`organvm/sovereign-systems--spiral-template`) and this repo only. Visible client-facing progress for **admin** lands here.

Your job is to make verifiable visual progress on the Sovereign Spiral while the orchestrating session handles back-end work (Reconciliation Gate, F1 cliff, etc.) in parallel.

## Repo lock

**In scope (you write):**
- `/Users/4jp/Workspace/organvm/sovereign-systems--spiral-template/**`

**Out of scope (do NOT write):**
- Any other repo (Rob/`4444J99/hokage-chess`, `organvm/my-knowledge-base`, `organvm/life-my--midst--in`, `organvm/growth-auditor`, `organvm/public-record-data-scrapper`, `meta-organvm/organvm-corpvs-testamentvm`)
- IRF body — `meta-organvm/organvm-corpvs-testamentvm/INST-INDEX-RERUM-FACIENDARUM.md` (Gate territory; you emit *claims*, the Gate promotes)
- DONE counter — claim-before-use only, in its own commit (see protocol below)

## Inherited state (verified by prior session 2026-04-29 "honor-the-dead", 35/36 claims PASS)

Open vacuums anchored to this repo:

| ID | GH | Where | What |
|---|---|---|---|
| IRF-III-033 | #57 | `spiral.ts:1651` | `vessel.visible = false` — symbol/star meshes generated then hidden. Decide visible vessel / refracted star / hybrid; render; screenshot-prove. |
| IRF-III-034 | #56 | `quiz.astro:60`, `hub.config.ts:196` | Quiz still pillar-picker (`config.pillars.map(...)`), `quizFormUrl: ''` empty. Replace with weighted node-placement; wire or block-with-owner GHL URL. |
| IRF-III-032 | — | nav layer | Spiral-first vs pillar-first navigation realignment. **Design-blocked on admin response.** |

**Working tree:** 22 dirty files at handoff time (V8 spiral WIP, content edits, exports). Prior session deliberately did NOT bundle-commit. **Do NOT bundle-commit on close-out** — that restraint is part of the inheritance.

## Pending questions to surface in your turn 1 (with the user)

1. **IRF-III-032 design gate:** Push past with a working assumption (and surface choice for review), or stop at the gate and present options to admin before any code lands?
2. **V8 spiral WIP (22 dirty files):** Review and selectively commit, or leave entirely untouched as the dead agents did? What's the policy for *this* session?
3. **GH#56 GHL URL:** Is `quizFormUrl` blocked on admin's tooling decision (block-with-owner), or is there an existing URL we should wire?
4. **Visible-progress cadence:** What's the proof artifact per push — screenshot in `docs/proofs/`, deployed URL diff, or local browser smoke-test only?

## Constraints

1. **Repo-bounded.** One repo, one stream. You do not write outside `organvm/sovereign-systems--spiral-template/`.
2. **Triple-reference law.** Any closure means: artifact + commit (with remote parity) + IRF row. You handle the first two; the Gate handles the IRF row.
3. **Claim-before-use on DONE counter.** When you complete a vacuum, increment `meta-organvm/organvm-corpvs-testamentvm/data/done-id-counter.json` in its own commit, pushed before you reference DONE-NNN anywhere. Set `last_claimed_by: "S-2026-04-29-admin-spiral"`. *Note: this is the one allowed write outside your repo, and only to that file in that file's own commit.*
4. **Visible-progress proof per closure.** For GH#57/IRF-III-033 (visual ask): screenshot or deployed URL diff committed alongside code. Commit message format: `closes IRF-III-033 GH#57` (the Gate observes commit messages to validate claims).
5. **No `--no-verify` shortcuts.** The pre-commit hook was fixed in commit `3a370cc` of the dotfiles repo (DONE-503). It now handles zero-arg invocation. If a hook fails legitimately, fix root cause; don't bypass.

## Critical files

- `src/components/spiral/spiral.ts:1564, 1651, 2268, 2283` — mesh visibility decisions
- `src/pages/quiz.astro:60` — pillar-picker → weighted node placement
- `src/data/hub.config.ts:196` — `quizFormUrl: ''`

## Read first (in order)

1. This handoff (you're reading it)
2. `~/.claude/plans/snuggly-gathering-bear.md` — partition plan, full stream map, coordination protocol
3. `~/.claude/plans/they-died-so-you-fluffy-manatee.md` — prior "honor-the-dead" plan with full inherited vacuum list
4. `/Users/4jp/Workspace/2026-04-29-135108-they-died-so-you-can-live-review-their-work-and.txt` — prior session export (forensic detail on what each dead agent claimed)

## Existing references in this codebase (reuse, don't recreate)

- `src/components/spiral/spiral.ts` — vessel/mesh primitives already exist; the bug is visibility, not absence
- `src/data/hub.config.ts` — pillar config and GHL URL slot already present
- Antigravity plan — local-only file, 144 lines (prior session noted this; prior agent overclaimed it as 210)

## Cross-verification

The orchestrating session is running Stream H (Reconciliation Gate). At your close-out:

- Push everything before declaring DONE
- Emit DONE claims via counter increment + commit message convention
- The Gate session will independently verify your claims against the artifacts before promoting any IRF row
- Overclaims (closure language outrunning evidence) will be flagged — see the 144-vs-210 line-count incident for reference

## Out-of-scope, but worth knowing

- **Rob session** is running in parallel at `/Users/4jp/Workspace/4444J99/hokage-chess`. You will not interact with it. If admin work has any cross-reference to Rob context, surface it to the user — don't reach across repos.
- **F1 cliff** (session-storage appender duplicates) is separate. Not your concern.
- **Other back-end streams** (orchestrator, knowledge-base, growth-auditor, scraper, corpvs hygiene) are dispatched separately. Not your concern.
