# 2026-04-30 Ingest, Digest, Implementation Log

## Scope

This pass refreshed the repo-wide annotated bibliography manifest, removed live quiz stubs where the repo already had a working local assessment, added a baseline test suite, and converted branch-level "coming soon" resource sections into usable next-action guidance.

Manifest outputs:

- `docs/manifests/2026-04-30-project-manifest-annotated-bibliography.md`
- `docs/manifests/2026-04-30-project-manifest-annotated-bibliography.json`

Current manifest census:

- Files indexed: see the latest generator output and manifest JSON for the exact live count
- Threads indexed: 174
- Ingest style: deterministic file IDs, thread IDs, title, tags, annotations, metadata, SHA-256
- Verification: JSON parses; Markdown contains no NUL bytes; generated artifact remains searchable text

## Implemented

- Added `npm run test` and `npm run test:all`.
- Added `scripts/test.mjs` to check content/config sync, 13-node spiral invariants, quiz serialization, capture validation, citation JSON parseability, and manifest parseability.
- Fixed `/quiz` client data by serializing `status: n.status` and typing it in the browser-side quiz contract.
- Replaced `/water/quiz` empty-GHL fallback waitlist with a direct path to the existing local node-placement assessment.
- Removed the unused waitlist script from `QuizEmbed.astro`.
- Made `CycleAwareness.astro` use `branchSlug` for branch-specific guidance instead of carrying generic future-tense copy.
- Converted all six water branch resource sections from "coming soon" placeholders into concrete start-here, evidence-anchor, boundary, and next-build guidance.
- Updated `VideoEmbed.astro` placeholder copy to name the reserved story slot rather than presenting a generic unfinished documentary message.
- Updated `CLAUDE.md` route table so `/water/quiz` no longer describes the old empty GHL placeholder state.

## Review Chain

### 1. Critique

Strengths: the repo now has a repeatable full-corpus manifest generator, live content for all pillars and branches, a functioning local quiz, capture persistence architecture, and build verification.

Weaknesses: some client-asset gaps remain because the final video assets and GHL URL are external inputs. Historical docs still describe older placeholder states, so current truth must be taken from source plus this dated report, not old walkthrough prose alone.

### 2. Logic Check

The previous `/water/quiz` logic was contradictory: the repo had a local quiz, but the water funnel still showed an "almost ready" fallback when `quizFormUrl` was empty. The fix routes users to the local assessment while preserving the optional GHL embed path if the URL is later provided.

### 3. Logos Review

The new test suite checks the project contracts that were actually at risk: node count, node themes, EnvVar uniqueness, content/config sync, quiz capture wiring, capture bounds, and manifest parseability. This is more useful than adding a generic test framework before the repo has component-level test conventions.

### 4. Pathos Review

User-facing branch copy now gives readers something to do today. The tone stays aligned with admin's health-and-sovereignty voice while avoiding fake completion claims.

### 5. Ethos Review

Medical-adjacent branches now keep care boundaries visible, especially fertility, autoimmune, and cancer-support content. The strongest public credibility still depends on keeping citations current and not overstating H2 claims beyond the cited evidence.

### 6. Blind Spots

- Historical docs still contain stale "coming soon" and "placeholder" claims.
- Video slots remain asset-gated.
- GHL URL remains empty by design, but no longer blocks the quiz path.
- The manifest count changed materially from the prior run; future closeout should compare why corpus size changed before making claims about drift.

### 7. Shatter Points

- If `config.nodes` changes without updating the quiz contract, node placement can drift. Covered by `scripts/test.mjs`.
- If content files and config slugs drift apart, pages can disappear or orphan. Covered by `scripts/test.mjs`.
- If generated manifests include NUL-containing previews, Markdown searchability breaks. Covered by manifest verification.
- If old reports are treated as current state, users may act on stale placeholder claims. Mitigation: cite this report and current source files for 2026-04-30 state.

### 8. Bloom

The natural next upgrade is not more placeholder removal by prose; it is a typed content-quality gate. Candidate checks:

- reject branch files with public "coming soon" resource sections unless explicitly marked asset-gated;
- reject route-table drift in `CLAUDE.md`;
- require every gated or external dependency to have owner, current fallback, and next action.

### 9. Evolve

The repo now has a baseline test and manifest loop:

1. Run `python3 scripts/generate_project_manifest.py` after material corpus changes.
2. Run `npm run test:all`.
3. Review `rg` placeholder/stub output against current source, not archive-only docs.
4. Log any remaining gated item with owner and fallback.

## Remaining Gated Items

| Item | Current fallback | Gate | Next action |
|---|---|---|---|
| Homepage story video | Reserved story slot with title | Final client video asset | Add `src` when asset is supplied |
| Water story video | Reserved story slot with title | Final client video asset | Add `src` when asset is supplied |
| Business story video | Reserved story slot with title | Final client video asset | Add `src` when asset is supplied |
| GHL quiz embed | Local `/quiz` node-placement assessment | admin's GHL URL | Set `config.ghl.quizFormUrl` only when provided |
| Business application | Static "Application opening soon" state | Offer/application intake decision | Replace with live capture or scheduling route when approved |

## Verification

- `python3 scripts/generate_project_manifest.py`
- `python3 -m json.tool docs/manifests/2026-04-30-project-manifest-annotated-bibliography.json`
- Markdown NUL scan on `docs/manifests/2026-04-30-project-manifest-annotated-bibliography.md`
- `npm run test:all`
