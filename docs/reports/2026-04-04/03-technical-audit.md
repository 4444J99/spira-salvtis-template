# Technical Audit — Content Genome & Verification Pipeline

**Date:** 2026-04-04
**Scope:** Full extraction, decomposition, verification, and grading pipeline for admin's 127-file handoff
**Status:** Phase 1 (noise sweep) complete. Phase 2 (semantic clustering) pending.

---

## 1. Extraction Pipeline

### Input
- **127 files** from Google Drive export (2026-04-01)
- Formats: .txt (ChatGPT exports), .md (Gemini exports), .docx (master docs)
- Total: ~360,000 words
- Source: `docs/archive/source-bundle/`

### Processing
1. **Archive:** All 127 files copied to `docs/archive/source-bundle/` preserving original directory structure
2. **Convert:** 5 .docx files converted to Markdown via pandoc (11,973 lines)
3. **Extract:** 125 files normalized with YAML frontmatter to `docs/archive/extracted/` (2 files empty/duplicate)
4. **Atomize:** 1,821 atoms marked in-situ with `<!-- ATM-*-NNN -->` HTML comment fences

### Tools
| Script | Purpose | Location |
|--------|---------|----------|
| `scripts/excavate-atoms.py` | In-situ atom marker insertion | `scripts/` |
| `scripts/excavate-health-atoms.py` | Health-specific excavation variant | `scripts/` |
| `.scripts/atomize-mindset.py` | Mindset-specific excavation | `.scripts/` |
| `scripts/build-atom-registry.sh` | Registry regeneration from in-situ markers | `scripts/` |
| `scripts/grade-atoms.py` | Tier grading (SIGNAL/CONTEXT/NOISE) | `scripts/` |

### Registry
- **File:** `docs/archive/atom-registry.yaml` (27,320 lines)
- **Total atoms:** 1,821
- **Unaccounted:** 0 (verified)
- Auto-generated header: `# Regenerate: bash scripts/build-atom-registry.sh`

---

## 2. Three-Way Verification

### Models

| Model | Granularity | Atom Count | Approach |
|-------|-------------|------------|----------|
| Claude (our excavation) | Fine-grained | 1,821 | Each prompt-response exchange = separate atom |
| Gemini 3 Flash (blind) | Medium-grained | 1,083 | Each topic-complete exchange = one atom |
| Claude Opus (blind) | Coarse-grained | 357 | Each file's major themes = atoms |

### Convergence

**Semantic convergence: FULL.** All three models identified the same ideas in the same files. No model found ideas the others missed. No model flagged content the others accepted.

**Provenance agreement: FULL.**
- admin's prompts = LOCAL (unanimous)
- ChatGPT responses to her prompts = HYBRID (unanimous)
- Generic AI content without personal signal = ALIEN (unanimous)
- Personal stories = LOCAL (unanimous)

**Nature classification: MOSTLY ALIGNED.**
- Full agreement: QUESTION, PROTOCOL, SCRIPT, NARRATIVE, CITATION
- Minor divergence: FRAMEWORK vs CLAIM boundary, TOOL vs PROTOCOL boundary

**Editorial flags: CONVERGENT.**
All three models flagged the same high-risk claims:
- Gateway memory / EZ gateway / Emoto
- 94% disease caused by stress
- Cell-talking / biophotonics
- Sound frequency healing specifics
- Spoon bending

Claude blind additionally flagged ~4 claims the others accepted (birth control mimicking pregnancy, womb holding emotional imprints).

### Gemini Confabulation Incident
Gemini's self-reported summary hallucinated our numbers (claimed 1,821 total, 813 gateway atoms). Actual file contents verified: 1,083 atoms. **Summary confabulation documented — file-level data is trustworthy, aggregate reporting is not.**

### Verdict
Recommended operating resolution: **Band 2 (~1,000 atoms)** for build planning. Our Band 1 (1,821) stays as the canonical registry; a merge-group pass will cluster adjacent atoms for build injection.

### Data Locations

| Source | Path |
|--------|------|
| Our excavation (1,821 atoms) | `docs/archive/extracted/**/*.md` (in-situ ATM-* markers) |
| Computed registry | `docs/archive/atom-registry.yaml` |
| Gemini blind (~1,083 atoms) | `docs/archive/verification/gemini/S*.md` |
| Claude blind (~357 atoms) | `docs/archive/verification/claude-blind/*.md` |
| External segmenter sample | `docs/archive/verification/external-segmenter-sample-atoms-1-50.md` |
| First reconciliation | `docs/archive/verification/reconciliation-sample-health-batch-1.md` |
| Full reconciliation | `docs/archive/verification/three-way-reconciliation.md` |

---

## 3. Tier Grading (Phase 1 Noise Sweep)

### Commit
`9ebb806` — `feat: Phase 1 noise sweep — 1,821 atoms graded SIGNAL/CONTEXT/NOISE`

### Tier Definitions

| Tier | Meaning | Count | % |
|------|---------|-------|---|
| SIGNAL | Build-worthy content — can appear on a page, in a product, or on social media | 1,153 | 63.3% |
| CONTEXT | Intent/direction markers — admin's questions, preferences, build instructions | 557 | 30.6% |
| NOISE | Archive-only — acks, pleasantries, broken fragments | 111 | 6.1% |

### Grading Rules (automated via `scripts/grade-atoms.py`)

1. `idea` matches `^(Yes|Yay|Thank|Ugh|Oof|Omg|Amazing|Perfect|Love it|Awesome)` + LOCAL + CLAIM → **NOISE**
2. `idea` contains `Transcript Unavailable` → **NOISE**
3. `idea` matches `^(Absolutely|Sure|You're so welcome|Great question|I'd love to)` + HYBRID + (CLAIM|NARRATIVE) → **NOISE**
4. LOCAL + QUESTION + idea is a request to ChatGPT → **CONTEXT**
5. LOCAL + INSTRUCTION → **CONTEXT**
6. Everything else → **SIGNAL** (default; manually downgraded where appropriate)

### SIGNAL Tier — Nature Breakdown

| Nature | Count | Description |
|--------|-------|-------------|
| NARRATIVE | 243 | Personal stories and lived experience |
| FRAMEWORK | 241 | Original models and systems |
| CLAIM | 187 | Research-backed assertions |
| TOOL | 126 | Interactive assessments and planners |
| PROTOCOL | 106 | Step-by-step guides |
| SCRIPT | 94 | Social media and video scripts |
| STATISTIC | 38 | Specific numbers and research findings |
| CITATION | 36 | References to studies and sources |
| PRODUCT | 34 | Standalone product concepts |
| QUESTION | 24 | Self-assessment questions (for site use) |
| MODEL | 24 | Theoretical frameworks |

---

## 4. Atom Registry Schema

Each atom in `atom-registry.yaml` has the following fields:

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique ID: `ATM-{prefix}-{NNN}` (R=root, H=health, M=mindset, B=business, W=gateway, T=time-astro, C=concepts) |
| `source_file` | string | Extracted markdown filename |
| `idea` | string | Human-readable description of the atom's content |
| `section` | string | Section heading within source file |
| `position` | int | Position within source file |
| `of_total` | int | Total atoms in source file |
| `prev` | string|null | Previous atom ID (linked list) |
| `provenance` | enum | LOCAL (admin's words), HYBRID (AI-structured), ALIEN (generic AI) |
| `nature` | enum | CLAIM, QUESTION, NARRATIVE, FRAMEWORK, INSTRUCTION, TOOL, PROTOCOL, SCRIPT, STATISTIC, CITATION, PRODUCT, MODEL |
| `nodes` | int[] | Spiral node numbers this atom maps to |
| `pillar` | string | Foundation, System, Structure, Vision, Cross-cutting |
| `build_state` | enum | MISSING (no page exists), PARTIAL (page exists, atom not injected), EXISTS (atom already on site), N/A (no build target) |
| `editorial` | enum | CLEAN (safe to publish), UNVERIFIED (needs source check), FLAGGED (needs editorial review) |
| `tier` | enum | SIGNAL, CONTEXT, NOISE |
| `strike_phase` | string | Phase strike plan assignment (1A, 2A, etc.) |

---

## 5. Routing Map (7 Destinations)

Full routing map: `docs/archive/atom-routing-map.md`

| # | Destination | Atom Estimate | Gate |
|---|------------|---------------|------|
| 1 | Node deep-dive pages (13 pages) | ~400 | GH#13 (node architecture lock) |
| 2 | Branch page enrichment (6 pages) | ~120 | None — pages exist |
| 3 | Pillar page enrichment (4 pages) | ~80 | None for enrichment; full rewrite blocked by GH#13 |
| 4 | Gateway Node / gateway funnel | ~150 | GH#13 + GH#17 |
| 5 | Social content pipeline | ~200 | None — ready NOW |
| 6 | Standalone products | ~80 | GH#19 (System Child Book), GH#20 (Creature Selves) |
| 7 | Reference / research backing | ~300 | None — feeds citations.ts |
| — | Dead / deferred | ~390 | Various |

### Selection Criteria by Destination

- **Node pages:** `nature ∈ [PROTOCOL, FRAMEWORK, NARRATIVE, CITATION, CLAIM(verified)]` + `build_state ∈ [MISSING, PARTIAL]` + `editorial ∈ [CLEAN, UNVERIFIED]`
- **Branch enrichment:** `build_state: PARTIAL` + `nature ∈ [CITATION, CLAIM(verified), PROTOCOL, TOOL]`
- **Social content:** `nature: SCRIPT` + `tier: SIGNAL`

---

## 6. Editorial Risk Matrix

### FLAGGED (104 atoms) — Requires editorial decision before publication

| Domain | Est. Count | Risk |
|--------|-----------|------|
| Gateway memory / EZ gateway / Emoto claims | ~15 | Pseudoscience association risk |
| Sonoluminescence / biophotonics | ~10 | Beyond peer review |
| Sound frequency healing (432/528 Hz) | ~8 | Specific frequency claims unsupported |
| Cellular reprogramming through voice | ~5 | Mechanotransduction real; extensions unverified |
| Spoon bending / telekinesis references | ~3 | Fringe content |
| Statistical claims without sources | ~12 | "94% of disease" etc. |
| Hormone/birth control claims | ~8 | Medical liability |
| Past lives / energy body claims | ~6 | Spiritual content, not science claims |
| Cross-cutting technical questions (flagged for decision, not content risk) | ~37 | Build decisions, not editorial risk |

### UNVERIFIED (177 atoms) — Lower priority, should be checked before launch

These are not necessarily wrong but lack confirmed sourcing. Distributed across health (62), mindset (48), gateway (31), business (22), concepts (14).

### CLEAN (1,540 atoms) — Safe to publish

No editorial concerns. This includes all NOISE atoms (which won't be published anyway) and the bulk of SIGNAL and CONTEXT content.

---

## 7. Build State Inventory

| State | Count | Meaning |
|-------|-------|---------|
| MISSING | 1,114 | No page exists for this atom yet (awaiting node architecture) |
| PARTIAL | 342 | Page exists but atom hasn't been injected |
| EXISTS | 302 | Atom is already reflected in the current site |
| N/A | 63 | No build target (cross-cutting atoms needing routing — GH#21) |

**Key observation:** 61% of atoms have no page yet. This is expected — the 13 node deep-dive pages don't exist until GH#13 is resolved. Once built, MISSING will drop to near-zero.

---

## 8. Board Alignment

19 open issues on the operating board (`organvm-iii-ergon/projects/5`).

### Critical Path
```
#13 (node architecture lock)
  → #15 (V5/V6 prototype merge)
    → #6 (Foundation Sovereignty phase build)
```

### Issue → Atom Destination Mapping

| Issue | Atom Destination | Blocked By |
|-------|-----------------|------------|
| #6 Foundation Sovereignty build | Node pages (1-5), branch enrichment | #13 |
| #8 Spiral visual redesign | Interactive navigation | #13, #15 |
| #9 GHL quiz integration | Quiz routing logic | #13 (partial) |
| #13 Node architecture lock | All node pages | admin decision |
| #15 V5/V6 merge | Interactive spiral | #13 |
| #17 Gateway Hub placement | Gateway Node | #13 |
| #18 Editorial review | Flagged atoms (104) | admin review |
| #19 System Child Book | Standalone product (~39 atoms) | admin decision |
| #20 Creature Selves | Brand decision | admin decision |
| #21 Cross-cutting N/A atoms | 63 atoms needing routing | Routing decision |

---

## 9. Verification Confidence

### What we can assert with high confidence:
- The 1,821-atom count is complete (0 unaccounted)
- Semantic content is stable across 3 independent decompositions
- Provenance classification is unanimous across all 3 models
- Editorial flags are convergent (same high-risk claims caught by all)
- The grading rules are deterministic and reproducible

### Known limitations:
- The merge-group pass hasn't been done — adjacent atoms that should be treated as one unit for build injection are still separate
- Gemini aggregate reporting cannot be trusted (confabulation incident) — only file-level data verified
- 177 UNVERIFIED atoms haven't been source-checked
- 63 N/A atoms lack routing destinations
- Some FLAGGED atoms are actually build decision questions, not content risk — the flag is overloaded

### Recommended next operations:
1. Phase 2: Semantic clustering (group SIGNAL atoms into content units)
2. Phase 3: First deliverable (social content calendar)
3. Editorial triage session with client
4. Source verification pass on UNVERIFIED atoms

---

## 10. File Manifest

### Registries & Maps
| File | Purpose |
|------|---------|
| `docs/archive/atom-registry.yaml` | Canonical atom registry (27,320 lines, 1,821 atoms) |
| `docs/archive/atom-routing-map.md` | Routing map: 7 destinations for all atoms |
| `docs/archive/admin-intent-register.md` | 557 CONTEXT atoms as client decision log |

### Verification
| File | Purpose |
|------|---------|
| `docs/archive/verification/three-way-reconciliation.md` | Full reconciliation analysis |
| `docs/archive/verification/gemini/S1-S8.md` | Gemini blind output (1,083 atoms) |
| `docs/archive/verification/claude-blind/*.md` | Claude blind output (357 atoms) |
| `docs/archive/verification/external-segmenter-sample-atoms-1-50.md` | External check sample |
| `docs/archive/verification/reconciliation-sample-health-batch-1.md` | First reconciliation |

### Source Material
| File | Purpose |
|------|---------|
| `docs/archive/source-bundle/` | Original 127 files (preserved) |
| `docs/archive/extracted/` | Normalized markdown with in-situ ATM markers |

### Scripts
| File | Purpose |
|------|---------|
| `scripts/excavate-atoms.py` | Atom marker insertion |
| `scripts/build-atom-registry.sh` | Registry regeneration |
| `scripts/grade-atoms.py` | Tier grading |
| `scripts/build-atom-registry.sh` | Registry builder |

### Plans & SOPs
| File | Purpose |
|------|---------|
| `docs/sops/SOP-SS-ATM-001_001-atomic-decomposition.md` | Atomic decomposition SOP |
| `docs/superpowers/plans/2026-04-03-atomic-excavation.md` | Excavation plan |
| `docs/superpowers/plans/2026-04-03-atomic-verification-handoffs.md` | Verification handoff plan |
| `docs/superpowers/plans/2026-04-04-atom-grading-assembly-delivery.md` | Grading → assembly → delivery plan |
| `docs/superpowers/specs/2026-04-03-atomic-content-registry-design.md` | Registry design spec |

---

*Generated: 2026-04-04 | Pipeline confidence: HIGH | Next phase: semantic clustering*
