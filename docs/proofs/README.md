# Proofs Directory — Visible-Progress Cadence

This directory holds proof artifacts for closed IRF vacuums anchored in this repo. Per the Stream A handoff (2026-04-29), every visible-progress closure ships with **at least one** proof artifact committed alongside the code change. The artifact is what the Reconciliation Gate (Stream H) verifies the closure claim against.

## Naming convention

```
docs/proofs/{closure-area}/YYYY-MM-DD-{closure-id}-{variant}-{kind}.{png|md|json}
```

- **closure-area** — subdirectory matching the work area (e.g., `spiral-vessel-variants/`, `nav-variants/`, `quiz-flow/`)
- **YYYY-MM-DD** — ISO date the proof was captured
- **closure-id** — the IRF id being proved (e.g., `IRF-III-033`) plus optional GH ref (e.g., `GH#57`)
- **variant** — descriptor of which artifact this proves (e.g., `visible`, `refracted-star`, `pillar-first`, `step1`)
- **kind** — one of:
  - `screenshot` — local browser capture (`.png`)
  - `deploy-diff` — deployed URL comparison (`.md` referencing live URLs + screenshots)
  - `smoke-log` — curl/HTTP request and response log (`.md`)
  - `comparison` — multi-variant grid + admin-ask question (`.md`)

## Examples

```
docs/proofs/spiral-vessel-variants/2026-04-29-IRF-III-033-visible-screenshot.png
docs/proofs/spiral-vessel-variants/2026-04-29-IRF-III-033-comparison.md
docs/proofs/quiz-flow/2026-04-29-IRF-III-034-quiz-result-screenshot.png
docs/proofs/quiz-flow/2026-04-29-IRF-III-034-capture-smoke-log.md
docs/proofs/nav-variants/2026-04-29-IRF-III-032-spiral-first-deploy-diff.md
```

## Why proofs are committed alongside code

The Gate observes commit messages (format: `closes IRF-III-NNN GH#NN`) and walks the diff. Without a proof artifact in the same commit (or referenced from the closure commit), the Gate flags the closure as **overclaim** — closure language outrunning evidence. See the 2026-04-29 honor-the-dead session for the canonical incident (antigravity plan claimed 210 lines, actual 144).

## Proof rigor levels

| Closure type | Minimum proof | Stronger |
|---|---|---|
| Visual change (UI, color, geometry) | local screenshot | + deployed URL diff |
| Behavior change (form, logic, scoring) | smoke-log + screenshot of result state | + deploy-diff |
| Schema/data change | screenshot of rendered consequence | + smoke-log proving wire-through |

For admin-facing decisions (vessel mode, nav variant), include a `comparison.md` with all variants side-by-side and the explicit admin-ask question. These become the artifacts she reviews to make the call.
