# Atomic Excavation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Decompose 127 source files into ~1,420 in-situ atomic ideas with full provenance, classification, and coverage metadata — producing a computed registry, coverage proof, and phase strike plans.

**Architecture:** Atoms are marked directly inside `docs/archive/extracted/**/*.md` using HTML comment fences (`<!-- ATM-*-* IN -->` / `<!-- ATM-*-* OUT -->`). Document envelopes sit at file tops. A parser script walks all files and generates `atom-registry.yaml`, coverage maps, and strike plans as computed artifacts. Single source of truth = the extracted files.

**Tech Stack:** Markdown + HTML comments (in-situ markers), Bash + grep/awk (parser), YAML (computed registry)

**Spec:** `docs/superpowers/specs/2026-04-03-atomic-content-registry-design.md`

---

## File Structure

### Modified (in-place atom marking)

```
docs/archive/extracted/
├── 1a-master-spiral-backend-breakdown.md     # ~50 atoms
├── 1b-spiral-dump-questionnaire.md           # ~150 atoms
├── 2a-sovereign-systems-branding.md          # NEW — extract from source-bundle, ~40 atoms
├── 2b-nodular-flow-refinement.md             # NEW — extract from source-bundle, ~30 atoms
├── health-hormones-and-healing.md            # ~25 atoms
├── mindset-rhythms-and-rituals.md            # ~20 atoms
├── water-learn-more-about-erw.md             # ~10 atoms
├── health/   (30 files, ~270 atoms)
├── mindset/  (38 files, ~330 atoms)
├── business/ (15 files, ~100 atoms)
├── water/    (15 files, ~140 atoms)
├── time-astro/ (9 files, ~50 atoms)
└── concepts/ (13 files, ~70 atoms)
```

### Created

```
docs/archive/extracted/2a-sovereign-systems-branding.md    # New extraction
docs/archive/extracted/2b-nodular-flow-refinement.md       # New extraction
scripts/build-atom-registry.sh                             # Parser
docs/archive/atom-registry.yaml                            # Computed
docs/archive/coverage/by-node.md                           # Computed
docs/archive/coverage/by-pillar.md                         # Computed
docs/archive/coverage/by-provenance.md                     # Computed
docs/archive/coverage/by-nature.md                         # Computed
docs/archive/coverage/proof.md                             # Computed
docs/archive/strikes/phase-1.md                            # Computed
docs/archive/strikes/phase-2.md                            # Computed
docs/archive/strikes/phase-3.md                            # Computed
docs/archive/strikes/phase-4.md                            # Computed
docs/archive/strikes/phase-5.md                            # Computed
docs/sops/SOP-SS-ATM-001_001-atomic-decomposition.md       # Process SOP
```

---

## Reference: Atom Marking Format

Every excavation task uses this exact format. Memorize it.

### Document Envelope (top of file, ABOVE existing frontmatter)

```markdown
<!-- DOC-ENVELOPE
id: DOC-{C}-{NN}
total_sections: {N}
total_atoms: {N}
dominant_provenance: {LOCAL|HYBRID|ALIEN}
dominant_nature: {most common nature type}
sections:
  - name: "{section name}"
    atoms: [{ATM-IDs}]
-->
```

### Atom IN fence (before the content)

```markdown
<!-- ATM-{C}-{NNN} IN
idea: "{one-line summary of the contained idea}"
section: "{section name this atom belongs to}"
position: {N}
of_total: {N}
prev: {ATM-ID or null}
context_above: "{one-line summary of previous atom's idea}"
provenance: {LOCAL|HYBRID|ALIEN}
nature: {CLAIM|FRAMEWORK|TOOL|SCRIPT|STATISTIC|PROTOCOL|NARRATIVE|CITATION|PRODUCT|MODEL|QUESTION|INSTRUCTION}
nodes: [{comma-separated node numbers 1-13}]
pillar: {Physical|Inner|Identity|Financial|Cross-cutting}
build_state: {EXISTS|PARTIAL|MISSING|N/A}
editorial: {CLEAN|UNVERIFIED|FLAGGED}
strike_phase: {1A|1B|1C|2A|2B|2C|2D|3A|3B|3C|4A|4B|4C}
-->
```

### Atom OUT fence (after the content)

```markdown
<!-- ATM-{C}-{NNN} OUT
next: {ATM-ID or null}
context_below: "{one-line summary of next atom's idea}"
-->
```

### Provenance determination

1. If the file has a visible `## Prompt:` section — read the prompt
2. Atoms from the prompt itself → `LOCAL` (admin's words)
3. Atoms from the AI response that expand on admin's specific direction → `HYBRID`
4. Generic AI-generated facts/definitions with no personal signal → `ALIEN`
5. Personal anecdotes, first-person experience, named decisions → `LOCAL`
6. .docx files without AI prompts → default `LOCAL`

### Nature classification

| Value | Test |
|-------|------|
| `CLAIM` | States a fact that could be true or false? |
| `FRAMEWORK` | Names a conceptual structure or system? |
| `TOOL` | Provides an interactive instrument (quiz, tracker, checklist)? |
| `SCRIPT` | Ready-to-use copy (IG, caption, video, email)? |
| `STATISTIC` | Cites a specific number? |
| `PROTOCOL` | Gives step-by-step actionable instructions? |
| `NARRATIVE` | Tells a personal story? |
| `CITATION` | References published research? |
| `PRODUCT` | Describes a standalone product concept? |
| `MODEL` | Describes a business/revenue/funnel model? |
| `QUESTION` | Asks something that remains unanswered? |
| `INSTRUCTION` | Directs the developer to build something specific? |

### Build state determination

Read `src/content/branches/*.md` and `src/content/pillars/*.md`. For each atom:
- `EXISTS`: The specific idea is already in a build file
- `PARTIAL`: A related topic exists but doesn't cover this specific idea
- `MISSING`: No corresponding content in the build
- `N/A`: Empty/utility content with no build target

### Strike phase assignment

| Phase | Gate | Content |
|-------|------|---------|
| `1A` | Unblocked | Architecture atoms (FRAMEWORK, MODEL, INSTRUCTION from root docs) |
| `1B` | Unblocked | Editorial triage (FLAGGED atoms) |
| `1C` | Unblocked | Client decision extraction (QUESTION, INSTRUCTION atoms) |
| `2A` | GH#13 | Node 1-5 deep-dive content (Physical Sovereignty) |
| `2B` | GH#13, GH#17 | Water funnel atoms (Hydration Node) |
| `2C` | GH#13 | Branch enrichment (PARTIAL build_state atoms for existing branches) |
| `2D` | GH#13 | Standalone health tools (TOOL nature atoms) |
| `3A` | Phase 2 | Node 6-9 Inner Sovereignty |
| `3B` | Phase 2 | Node 10-12 Identity Sovereignty |
| `3C` | Phase 2 | Standalone mindset tools |
| `4A` | Phase 3 | Node 13 Financial Sovereignty |
| `4B` | Phase 3 | Standalone products (PRODUCT nature atoms) |
| `4C` | Phase 3 | Social content pipeline (SCRIPT nature atoms) |

### ID sequences by category

| Category | Prefix | Starting ID |
|----------|--------|-------------|
| Root docs (1a, 1b, 2a, 2b) | ATM-R- | ATM-R-001 |
| health/ | ATM-H- | ATM-H-001 |
| mindset/ | ATM-M- | ATM-M-001 |
| business/ | ATM-B- | ATM-B-001 |
| water/ | ATM-W- | ATM-W-001 |
| time-astro/ | ATM-T- | ATM-T-001 |
| concepts/ | ATM-C- | ATM-C-001 |

---

## Task 1: Build the parser script

**Files:**
- Create: `scripts/build-atom-registry.sh`

- [ ] **Step 1: Create the parser script**

```bash
#!/usr/bin/env bash
set -euo pipefail

# Walks docs/archive/extracted/**/*.md, parses ATM-*-* IN/OUT comment fences,
# and generates:
#   docs/archive/atom-registry.yaml
#   docs/archive/coverage/by-node.md
#   docs/archive/coverage/by-pillar.md
#   docs/archive/coverage/by-provenance.md
#   docs/archive/coverage/by-nature.md
#   docs/archive/coverage/proof.md

EXTRACTED_DIR="docs/archive/extracted"
OUTPUT_DIR="docs/archive"
COVERAGE_DIR="$OUTPUT_DIR/coverage"
STRIKES_DIR="$OUTPUT_DIR/strikes"

mkdir -p "$COVERAGE_DIR" "$STRIKES_DIR"

# --- Phase 1: Parse all ATM-* IN fences ---
echo "# AUTO-GENERATED — do not edit. Source of truth is the in-situ markers." > "$OUTPUT_DIR/atom-registry.yaml"
echo "# Regenerate: scripts/build-atom-registry.sh" >> "$OUTPUT_DIR/atom-registry.yaml"
echo "# Generated: $(date -u +%Y-%m-%dT%H:%M:%SZ)" >> "$OUTPUT_DIR/atom-registry.yaml"
echo "" >> "$OUTPUT_DIR/atom-registry.yaml"
echo "atoms:" >> "$OUTPUT_DIR/atom-registry.yaml"

TOTAL=0
TOTAL_EXISTS=0
TOTAL_PARTIAL=0
TOTAL_MISSING=0
TOTAL_NA=0

# Declare associative arrays for coverage maps
declare -A NODE_ATOMS PILLAR_ATOMS PROVENANCE_ATOMS NATURE_ATOMS STRIKE_ATOMS

find "$EXTRACTED_DIR" -name "*.md" -type f | sort | while IFS= read -r file; do
  # Extract all ATM-* IN blocks from this file
  grep -n "<!-- ATM-" "$file" 2>/dev/null | grep " IN$\| IN " | while IFS=: read -r line_num match; do
    # Parse the ATM ID from the line
    atm_id=$(echo "$match" | grep -oE 'ATM-[A-Z]-[0-9]+')
    if [ -z "$atm_id" ]; then continue; fi

    # Extract fields from the IN block (read until -->)
    rel_file="${file#$EXTRACTED_DIR/}"

    # Use awk to extract the full IN block
    block=$(awk "/<!-- $atm_id IN/,/-->/" "$file")

    idea=$(echo "$block" | grep '^idea:' | sed 's/^idea: *//' | sed 's/^"//' | sed 's/"$//')
    provenance=$(echo "$block" | grep '^provenance:' | awk '{print $2}')
    nature=$(echo "$block" | grep '^nature:' | awk '{print $2}')
    nodes=$(echo "$block" | grep '^nodes:' | sed 's/^nodes: *//')
    pillar=$(echo "$block" | grep '^pillar:' | sed 's/^pillar: *//')
    build_state=$(echo "$block" | grep '^build_state:' | awk '{print $2}')
    editorial=$(echo "$block" | grep '^editorial:' | awk '{print $2}')
    strike_phase=$(echo "$block" | grep '^strike_phase:' | awk '{print $2}')
    position=$(echo "$block" | grep '^position:' | awk '{print $2}')
    of_total=$(echo "$block" | grep '^of_total:' | awk '{print $2}')
    prev=$(echo "$block" | grep '^prev:' | awk '{print $2}')
    section=$(echo "$block" | grep '^section:' | sed 's/^section: *//' | sed 's/^"//' | sed 's/"$//')

    # Write to registry
    cat >> "$OUTPUT_DIR/atom-registry.yaml" <<ATOM
  - id: $atm_id
    source_file: "$rel_file"
    idea: "$idea"
    section: "$section"
    position: $position
    of_total: $of_total
    prev: $prev
    provenance: $provenance
    nature: $nature
    nodes: $nodes
    pillar: "$pillar"
    build_state: $build_state
    editorial: $editorial
    strike_phase: $strike_phase
ATOM

    TOTAL=$((TOTAL + 1))
    case "$build_state" in
      EXISTS) TOTAL_EXISTS=$((TOTAL_EXISTS + 1)) ;;
      PARTIAL) TOTAL_PARTIAL=$((TOTAL_PARTIAL + 1)) ;;
      MISSING) TOTAL_MISSING=$((TOTAL_MISSING + 1)) ;;
      N/A) TOTAL_NA=$((TOTAL_NA + 1)) ;;
    esac
  done
done

# --- Phase 2: Generate coverage proof ---
# Count atoms by grepping the generated registry
TOTAL=$(grep -c "^  - id:" "$OUTPUT_DIR/atom-registry.yaml" 2>/dev/null || echo 0)
TOTAL_EXISTS=$(grep -c "build_state: EXISTS" "$OUTPUT_DIR/atom-registry.yaml" 2>/dev/null || echo 0)
TOTAL_PARTIAL=$(grep -c "build_state: PARTIAL" "$OUTPUT_DIR/atom-registry.yaml" 2>/dev/null || echo 0)
TOTAL_MISSING=$(grep -c "build_state: MISSING" "$OUTPUT_DIR/atom-registry.yaml" 2>/dev/null || echo 0)
TOTAL_NA=$(grep -c "build_state: N/A" "$OUTPUT_DIR/atom-registry.yaml" 2>/dev/null || echo 0)
ACCOUNTED=$((TOTAL_EXISTS + TOTAL_PARTIAL + TOTAL_MISSING + TOTAL_NA))
UNACCOUNTED=$((TOTAL - ACCOUNTED))

cat > "$COVERAGE_DIR/proof.md" <<PROOF
# Coverage Proof

Generated: $(date -u +%Y-%m-%dT%H:%M:%SZ)
Source: docs/archive/extracted/**/*.md

## Summary

| Metric | Count |
|--------|-------|
| Total atoms registered | $TOTAL |
| EXISTS (fully in build) | $TOTAL_EXISTS |
| PARTIAL (partially in build) | $TOTAL_PARTIAL |
| MISSING (not in build) | $TOTAL_MISSING |
| N/A (no build target) | $TOTAL_NA |
| **Accounted** | **$ACCOUNTED** |
| **Unaccounted** | **$UNACCOUNTED** |

## Proof Status

$(if [ "$UNACCOUNTED" -eq 0 ]; then echo "**PROOF COMPLETE — every atom accounted for.**"; else echo "**PROOF INCOMPLETE — $UNACCOUNTED atoms unaccounted.**"; fi)
PROOF

echo ""
echo "=== Atom Registry Built ==="
echo "Total atoms: $TOTAL"
echo "EXISTS: $TOTAL_EXISTS | PARTIAL: $TOTAL_PARTIAL | MISSING: $TOTAL_MISSING | N/A: $TOTAL_NA"
echo "Unaccounted: $UNACCOUNTED"
echo "Registry: $OUTPUT_DIR/atom-registry.yaml"
echo "Proof: $COVERAGE_DIR/proof.md"
```

- [ ] **Step 2: Make it executable**

```bash
chmod +x scripts/build-atom-registry.sh
```

- [ ] **Step 3: Run it against current state (should find 0 atoms — nothing marked yet)**

Run: `bash scripts/build-atom-registry.sh`
Expected: `Total atoms: 0`

- [ ] **Step 4: Commit**

```bash
git add scripts/build-atom-registry.sh
git commit -m "feat: add atom registry parser script"
```

---

## Task 2: Extract root docs 2a and 2b

Root docs 2a (Sovereign Systems Branding, 2716 lines) and 2b (Nodular Flow Refinement, 1236 lines) exist in `source-bundle/` but were never extracted to `extracted/`. They need extraction with frontmatter before excavation.

**Files:**
- Create: `docs/archive/extracted/2a-sovereign-systems-branding.md`
- Create: `docs/archive/extracted/2b-nodular-flow-refinement.md`

- [ ] **Step 1: Extract 2a with frontmatter**

Read `docs/archive/source-bundle/2a. ChatGPT-Sovereign Systems Branding.txt`. Create `docs/archive/extracted/2a-sovereign-systems-branding.md` with:

```yaml
---
title: "Sovereign Systems Branding — Full ChatGPT Thread"
source_file: "2a. ChatGPT-Sovereign Systems Branding.txt"
source_folder: "root"
nodes: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
readiness: "Ready"
pillar: "Cross-cutting"
extracted: 2026-04-03
---
```

Followed by the verbatim source content.

- [ ] **Step 2: Extract 2b with frontmatter**

Read `docs/archive/source-bundle/2b. ChatGPT-Nodular Flow Refinement.txt`. Create `docs/archive/extracted/2b-nodular-flow-refinement.md` with:

```yaml
---
title: "Nodular Flow Refinement — 13-Node Definitive Structure"
source_file: "2b. ChatGPT-Nodular Flow Refinement.txt"
source_folder: "root"
nodes: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
readiness: "Ready"
pillar: "Cross-cutting"
extracted: 2026-04-03
---
```

Followed by the verbatim source content.

- [ ] **Step 3: Commit**

```bash
git add docs/archive/extracted/2a-sovereign-systems-branding.md docs/archive/extracted/2b-nodular-flow-refinement.md
git commit -m "feat: extract root docs 2a and 2b to extracted/"
```

---

## Task 3: Excavate root documents (1a, 1b, 2a, 2b)

The 4 root documents contain architecture-level atoms. Process in order: 2b (13-node structure — most critical), 1a (master blueprint), 2a (branding), 1b (questionnaire — largest).

**Files:**
- Modify: `docs/archive/extracted/1a-master-spiral-backend-breakdown.md`
- Modify: `docs/archive/extracted/1b-spiral-dump-questionnaire.md`
- Modify: `docs/archive/extracted/2a-sovereign-systems-branding.md`
- Modify: `docs/archive/extracted/2b-nodular-flow-refinement.md`

- [ ] **Step 1: Read each root document fully**

Read all 4 files. Understand their internal section structure.

- [ ] **Step 2: Identify sections and atoms in each file**

For each file:
1. Map sections (## headers, numbered divisions, topic shifts)
2. Within each section, apply the boundary rule: a coupled sequence of sentences requiring each other for contextual coherence = one atom
3. Assign provenance: prompts are LOCAL, AI responses expanding admin's direction are HYBRID, generic AI facts are ALIEN
4. Classify nature, assign nodes, determine build state and strike phase

- [ ] **Step 3: Write document envelopes and atom fences**

Add `<!-- DOC-ENVELOPE -->` at the top of each file (above frontmatter).
Add `<!-- ATM-R-NNN IN -->` and `<!-- ATM-R-NNN OUT -->` fences around every atom.
Use the ATM-R- prefix for all root doc atoms. Number sequentially across all 4 files (don't restart per file).

- [ ] **Step 4: Run parser to validate**

```bash
bash scripts/build-atom-registry.sh
```

Expected: Total atoms > 0, Unaccounted: 0

- [ ] **Step 5: Commit**

```bash
git add docs/archive/extracted/1a-* docs/archive/extracted/1b-* docs/archive/extracted/2a-* docs/archive/extracted/2b-*
git commit -m "feat: excavate root documents — ~270 atoms marked in-situ (ATM-R-*)"
```

---

## Task 4: Excavate health/ (31 files, ~300 atoms)

**Files:**
- Modify: All 30 files in `docs/archive/extracted/health/`
- Modify: `docs/archive/extracted/health-hormones-and-healing.md`

- [ ] **Step 1: Read all 31 health files**

Read each file. Note: `hormones-eating-cycles.md` is Empty (readiness: Empty) — create envelope with 0 atoms.

- [ ] **Step 2: For each file, identify sections and atoms**

Apply the boundary rule. Tag provenance by checking for `## Prompt:` sections. Classify nature. Assign nodes from existing frontmatter. Determine build state against `src/content/branches/{gut-hormones,fertility,autoimmune,athletic,cancer-support,sustainability}.md` and `src/content/pillars/physical.md`.

- [ ] **Step 3: Write DOC-ENVELOPE and ATM-H-NNN IN/OUT fences for every file**

Use ATM-H- prefix. Number sequentially across all 31 files. For Empty files, write envelope with `total_atoms: 0` and no atom fences.

- [ ] **Step 4: Run parser and validate**

```bash
bash scripts/build-atom-registry.sh
```

Check: ATM-H- count matches expected (~300). All have build_state assigned.

- [ ] **Step 5: Commit**

```bash
git add docs/archive/extracted/health/ docs/archive/extracted/health-hormones-and-healing.md
git commit -m "feat: excavate health/ — ~300 atoms marked in-situ (ATM-H-*)"
```

---

## Task 5: Excavate mindset/ (39 files, ~350 atoms)

**Files:**
- Modify: All 38 files in `docs/archive/extracted/mindset/`
- Modify: `docs/archive/extracted/mindset-rhythms-and-rituals.md`

- [ ] **Step 1: Read all 39 mindset files**

Note: `send-pdf-to-kindle.md` is N/A (utility). `inner-child-book-concept.md` is the IMPORTANT COMPONENT file — likely ~30 atoms (full book concept, 5 parts, 11 chapters).

- [ ] **Step 2: Identify sections and atoms per file**

Build state checks against `src/content/pillars/{inner,identity}.md`.

- [ ] **Step 3: Write DOC-ENVELOPE and ATM-M-NNN fences**

Use ATM-M- prefix. Number sequentially across all 39 files.

- [ ] **Step 4: Run parser and validate**

```bash
bash scripts/build-atom-registry.sh
```

- [ ] **Step 5: Commit**

```bash
git add docs/archive/extracted/mindset/ docs/archive/extracted/mindset-rhythms-and-rituals.md
git commit -m "feat: excavate mindset/ — ~350 atoms marked in-situ (ATM-M-*)"
```

---

## Task 6: Excavate business/ (15 files, ~100 atoms)

**Files:**
- Modify: All 15 files in `docs/archive/extracted/business/`

- [ ] **Step 1: Read all 15 business files**

Note: `instagram-grid-visualization.md` and `website-launch-and-app-timeline.md` are Empty.

- [ ] **Step 2: Identify sections and atoms per file**

Build state checks against `src/content/pillars/financial.md`.

- [ ] **Step 3: Write DOC-ENVELOPE and ATM-B-NNN fences**

Use ATM-B- prefix.

- [ ] **Step 4: Run parser and validate**

- [ ] **Step 5: Commit**

```bash
git add docs/archive/extracted/business/
git commit -m "feat: excavate business/ — ~100 atoms marked in-situ (ATM-B-*)"
```

---

## Task 7: Excavate water/ (16 files, ~150 atoms)

**Files:**
- Modify: All 15 files in `docs/archive/extracted/water/`
- Modify: `docs/archive/extracted/water-learn-more-about-erw.md`

- [ ] **Step 1: Read all 16 water files**

Build state checks against `src/content/branches/{gut-hormones,fertility,autoimmune,athletic,cancer-support,sustainability}.md` — these are the water-focused branch pages.

- [ ] **Step 2-5: Same pattern as above**

Use ATM-W- prefix. Commit message: `feat: excavate water/ — ~150 atoms marked in-situ (ATM-W-*)`

---

## Task 8: Excavate time-astro/ (9 files, ~50 atoms)

**Files:**
- Modify: All 9 files in `docs/archive/extracted/time-astro/`

Note: `time-astrology-and-human-design.md` is Empty.

Use ATM-T- prefix. Commit message: `feat: excavate time-astro/ — ~50 atoms marked in-situ (ATM-T-*)`

---

## Task 9: Excavate concepts/ (13 files, ~70 atoms)

**Files:**
- Modify: All 13 files in `docs/archive/extracted/concepts/`

Note: `idea-implementation-strategies-duplicate.md` is N/A (duplicate). `research.md` is Empty.

Use ATM-C- prefix. Commit message: `feat: excavate concepts/ — ~70 atoms marked in-situ (ATM-C-*)`

---

## Task 10: Generate coverage maps and strike plans

**Files:**
- Create: `docs/archive/coverage/by-node.md`
- Create: `docs/archive/coverage/by-pillar.md`
- Create: `docs/archive/coverage/by-provenance.md`
- Create: `docs/archive/coverage/by-nature.md`
- Create: `docs/archive/coverage/proof.md`
- Create: `docs/archive/strikes/phase-1.md` through `phase-5.md`

- [ ] **Step 1: Run the full parser**

```bash
bash scripts/build-atom-registry.sh
```

Verify: Unaccounted = 0. Total atoms in the expected ~1,200-1,500 range.

- [ ] **Step 2: Generate by-node coverage map**

For each node 1-13, grep `atom-registry.yaml` for atoms with that node. Write to `docs/archive/coverage/by-node.md`:

```markdown
# Coverage Map: By Node

## Node 1 — Feel Good First
Total atoms: {N}
- EXISTS: {N}
- PARTIAL: {N}
- MISSING: {N}

| ID | Idea | Provenance | Nature | Build State |
|...
```

- [ ] **Step 3: Generate by-pillar, by-provenance, by-nature maps**

Same pattern. Group atoms by pillar, provenance, nature respectively.

- [ ] **Step 4: Generate phase strike plans**

For each strike phase (1A through 4C), filter atoms from the registry. Write `docs/archive/strikes/phase-{N}.md`:

```markdown
# Phase 2: Physical Sovereignty

## Strike 2A: Node 1-5 Deep-Dive Content
Gate: GH#13 (node architecture locked)
Atoms: {N}

| ID | Source | Idea | Nature | Build State |
|...
```

- [ ] **Step 5: Verify proof**

Open `docs/archive/coverage/proof.md`. Confirm: **Unaccounted: 0**.

- [ ] **Step 6: Commit**

```bash
git add docs/archive/atom-registry.yaml docs/archive/coverage/ docs/archive/strikes/
git commit -m "feat: generate coverage maps + strike plans — proof complete"
```

---

## Task 11: Write SOP-SS-ATM-001

**Files:**
- Create: `docs/sops/SOP-SS-ATM-001_001-atomic-decomposition.md`
- Modify: `docs/sops/tracking/sop-registry.md`

- [ ] **Step 1: Write the SOP**

Document the exact process used in Tasks 1-10. Sections: Purpose, Scope, The Atom (definition + boundary rule + coupling principle), Provenance Taxonomy, Nature Taxonomy, Decomposition Method, Parser Usage, Coverage Proof Requirements, Reproduction Steps.

- [ ] **Step 2: Update the SOP registry**

Add `SOP-SS-ATM-001 | Atomic Decomposition & Coverage Proof | Content Analysis | 001 | ACTIVE | 2026-04-03` to the registry table. Add `ATM` to the domain prefix table.

- [ ] **Step 3: Commit**

```bash
git add docs/sops/SOP-SS-ATM-001_001-atomic-decomposition.md docs/sops/tracking/sop-registry.md
git commit -m "feat: SOP-SS-ATM-001 — atomic decomposition process + registry update"
```

---

## Task 12: Final push and verification

- [ ] **Step 1: Run parser one final time**

```bash
bash scripts/build-atom-registry.sh
```

- [ ] **Step 2: Verify git state**

```bash
git status  # should be clean
git log --oneline -12  # should show all excavation commits
```

- [ ] **Step 3: Push to remote**

```bash
git push origin main
```

- [ ] **Step 4: Verify proof**

```bash
cat docs/archive/coverage/proof.md
```

Expected: `PROOF COMPLETE — every atom accounted for.`

---

## Execution Notes

### Parallelization

Tasks 3-9 (excavation by category) are **fully independent** and can be dispatched as parallel subagents. Each operates on a different set of files with no overlap. Recommended dispatch:

- Agent 1: Task 3 (root docs — largest, most critical)
- Agent 2: Task 4 (health/)
- Agent 3: Task 5 (mindset/)
- Agent 4: Tasks 6+7 (business/ + water/ — smaller, combinable)
- Agent 5: Tasks 8+9 (time-astro/ + concepts/ — smallest, combinable)

Tasks 1-2 must complete before Tasks 3-9 begin.
Task 10 must wait for all of Tasks 3-9 to complete.
Tasks 11-12 are sequential after Task 10.

### Memory constraint

System has 16GB RAM. Do NOT dispatch more than 3 parallel subagents. Recommended: 2 parallel at a time, rotating as each completes.

### Atom count validation

After each category commit, run the parser. The running total should grow monotonically:
- After Task 3: ~270 atoms
- After Task 4: ~570 atoms
- After Task 5: ~920 atoms
- After Task 6: ~1,020 atoms
- After Task 7: ~1,170 atoms
- After Task 8: ~1,220 atoms
- After Task 9: ~1,290 atoms

Final expected range: 1,200 — 1,500 atoms.
