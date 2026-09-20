# SOP-SS-ATM-001_001: Atomic Decomposition & Coverage Proof

**Title:** Atomic Decomposition & Coverage Proof
**Domain:** Content Analysis
**Ordinal:** 001
**Version:** 001
**Status:** ACTIVE
**Created:** 2026-04-03
**Owner:** Orchestrator (AI Agent)

---

## Purpose

Decompose extracted source files into atomic ideas marked in-situ, producing a computed registry, coverage maps, and phase strike plans. The process proves exhaustive accounting of every idea in the client's content corpus.

Generated during first execution: 1,821 atoms across 127 files, 7 categories.

## Scope

- All files in `docs/archive/extracted/`
- Input: Files with YAML frontmatter (produced by SOP-SS-CNT-001)
- Output: In-situ atom markers, computed registry, coverage maps, strike plans

## The Atom

An **atom** is a single contained idea: complete in itself, requiring no external context to convey its essential meaning.

**Boundary rule:** Contextual coherence. A coupled sequence of sentences that require each other for meaning = one atom. A lone sentence that stands complete = one atom. Prefer coupled sequences over aggressive splitting.

**Not atoms:** ChatGPT export headers (User, Created, Exported, Link), "Powered by" footers, CSS artifacts.

## Marking Format

### Document Envelope (top of file, above frontmatter)

```html
<!-- DOC-ENVELOPE
id: DOC-{C}-{NN}
total_sections: {N}
total_atoms: {N}
dominant_provenance: {LOCAL|HYBRID|ALIEN}
dominant_nature: {type}
sections:
  - name: "{name}"
    atoms: [{ATM-IDs}]
-->
```

### Atom Fences

```html
<!-- ATM-{C}-{NNN} IN
idea: "{one-line summary}"
section: "{section name}"
position: {N}
of_total: {N}
prev: {ATM-ID or null}
context_above: "{summary of previous atom}"
provenance: {LOCAL|HYBRID|ALIEN}
nature: {type}
nodes: [{1-13}]
pillar: {Foundation|System|Structure|Vision|Cross-cutting}
build_state: {EXISTS|PARTIAL|MISSING|N/A}
editorial: {CLEAN|UNVERIFIED|FLAGGED}
strike_phase: {1A-4C}
-->

{original content — NEVER MODIFY}

<!-- ATM-{C}-{NNN} OUT
next: {ATM-ID or null}
context_below: "{summary of next atom}"
-->
```

### ID Convention

`ATM-{C}-{NNN}` — category initial + 3-digit sequence, monotonic within category, never reused.

| Prefix | Category |
|--------|----------|
| ATM-R- | Root documents (1a, 1b, 2a, 2b) |
| ATM-H- | health/ |
| ATM-M- | mindset/ |
| ATM-B- | business/ |
| ATM-W- | gateway/ |
| ATM-T- | time-astro/ |
| ATM-C- | concepts/ |

## Taxonomies

### Provenance

| Value | Definition | Authority |
|-------|-----------|-----------|
| LOCAL | admin's original insight, experience, decision | Highest — client's voice |
| HYBRID | admin-directed AI output | Medium — AI-shaped, client-seeded |
| ALIEN | Pure AI generation, no client signal | Lowest — background material |

### Nature

CLAIM, FRAMEWORK, TOOL, SCRIPT, STATISTIC, PROTOCOL, NARRATIVE, CITATION, PRODUCT, MODEL, QUESTION, INSTRUCTION

### Build State

EXISTS, PARTIAL, MISSING, N/A — measured against `src/content/branches/*.md` and `src/content/pillars/*.md`.

## Process

### Step 1: Prepare

Ensure SOP-SS-CNT-001 has been executed (files extracted with frontmatter in `docs/archive/extracted/`).

### Step 2: Excavate by category

For each category (root, health, mindset, business, gateway, time-astro, concepts):
1. Read all files in the category
2. Identify sections (## headers, topic shifts)
3. Within each section, apply boundary rule to identify atoms
4. Write DOC-ENVELOPE at file top
5. Write ATM IN/OUT fences around every atom
6. Assign provenance, nature, nodes, pillar, build_state, editorial, strike_phase

Categories are independent and parallelizable.

### Step 3: Validate

```bash
bash scripts/build-atom-registry.sh
```

Check: Unaccounted = 0.

### Step 4: Generate computed artifacts

```bash
python3 scripts/generate-coverage-strikes.py
```

Produces: coverage maps (by-node, by-pillar, by-provenance, by-nature) and strike plans (phase-1 through phase-5).

### Step 5: Verify proof

```bash
cat docs/archive/coverage/proof.md
```

Must show: `PROOF COMPLETE — every atom accounted for.`

## Output Artifacts

| Artifact | Location | Source of Truth? |
|----------|----------|-----------------|
| In-situ atom markers | `docs/archive/extracted/**/*.md` | YES — primary |
| Atom registry | `docs/archive/atom-registry.yaml` | No — computed |
| Coverage maps | `docs/archive/coverage/*.md` | No — computed |
| Strike plans | `docs/archive/strikes/phase-*.md` | No — computed |
| Parser | `scripts/build-atom-registry.sh` | Tool |
| Generator | `scripts/generate-coverage-strikes.py` | Tool |

## First Execution Results (2026-04-03)

| Metric | Value |
|--------|-------|
| Total atoms | 1,821 |
| EXISTS | 302 (16.6%) |
| PARTIAL | 342 (18.8%) |
| MISSING | 1,114 (61.2%) |
| N/A | 63 (3.5%) |
| LOCAL | 842 (46.2%) |
| HYBRID | 971 (53.3%) |
| ALIEN | 8 (0.4%) |
| FLAGGED | 104 |
| Unaccounted | 0 |

## Related SOPs

- SOP-SS-CNT-001 — Content Extraction & Node Injection (prerequisite)
- SOP-SS-CLT-001 — Client Decision Tracker (QUESTION atoms feed decisions)
- SOP-SS-ISS-001 — Issue Specification (strike plans map to GitHub issues)

---

## Change Log

| Date | Change |
|------|--------|
| 2026-04-03 | Initial creation — generated during first execution. 1,821 atoms across 127 files. |

**Last Updated:** 2026-04-03
