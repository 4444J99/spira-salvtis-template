# Atomic Verification: External Parallel Check Handoffs

**Purpose:** Independent agents decompose the same source material *blind* — without seeing our ATM-* markers. A reconciler then compares their decomposition against ours. Disagreements reveal missed atoms, over-splitting, under-splitting, or misclassification. Agreements are proven atoms.

**Architecture:** 3 prompt templates × N dispatches

```
ORIGINAL SOURCE FILES (from docs/archive/source-bundle/)
        │
        ├──→ [Segmenter Agent A] ──→ Independent atom list A
        ├──→ [Segmenter Agent B] ──→ Independent atom list B
        └──→ [Segmenter Agent C] ──→ Independent atom list C
                                           │
                                           ▼
                              [Reconciler Agent] ←── Our ATM-* registry
                                           │
                                           ▼
                              Verification Report
                              (agreements, splits, merges, misses)
```

**Key constraint:** Segmenters receive the ORIGINAL source files (from `source-bundle/`), NOT the extracted/marked files. They must never see the ATM-* fences.

---

## Prompt 1: SEGMENTER (Independent Decomposition)

Copy this prompt verbatim. Replace `{CATEGORY}`, `{FILE_LIST}`, and paste the file contents where indicated.

```markdown
# Task: Atomic Content Decomposition

You are analyzing content files from a client's Google Drive export for a health/wellness brand called "Sovereign Systems" (Spiral Template). Your job is to identify every discrete **idea** in these files.

## What Is an Atom

An **atom** is a single self-contained idea. It is the smallest unit of meaning that can exist independently without losing its essential point.

**Boundary rule:** If a sequence of sentences requires mutual presence for meaning — they cannot exist independently — they form ONE atom. A lone sentence that stands complete is also one atom.

**Examples:**

ONE atom (coupled sequence):
> "Cortisol operates on a 90-second metabolic cycle. If you can hold through 90 seconds of activation without reinforcing the stress response, the cortisol wave completes and your nervous system returns to baseline. Box breathing during this window is the intervention."

Three sentences, one idea. Removing any sentence breaks it.

TWO atoms (independent ideas):
> "Cortisol is the primary stress hormone produced by the adrenal cortex."
>
> "The Light & Fruit Test measures morning energy, hydration clarity, and digestive response."

Two unrelated ideas. Separate atoms.

**Prefer coupled sequences over aggressive splitting.** When 2-5 sentences share a single point, that's one atom. Don't split into individual sentences unless each truly stands alone.

## What Is NOT an Atom

- ChatGPT/Gemini export metadata (User, Created, Updated, Exported, Link lines)
- "Powered by ChatGPT Exporter" footers
- Transition phrases ("Let me break this down", "Here's what I recommend")
- Formatting instructions from AI ("I'll organize this as...")

## Classification

For each atom, provide:

### Provenance
- **LOCAL**: The human client's original words — personal stories, decisions, preferences, questions she asked
- **HYBRID**: AI-generated content that directly responds to the client's specific prompt/direction
- **ALIEN**: Generic AI-generated information with no personal signal from the client

### Nature (pick one)
| Type | Test |
|------|------|
| CLAIM | States something that could be verified or disputed |
| FRAMEWORK | Names a conceptual structure or system |
| TOOL | Provides an interactive instrument (quiz, tracker, checklist) |
| SCRIPT | Ready-to-use copy (social media, video, email) |
| STATISTIC | Cites a specific number with a claimed source |
| PROTOCOL | Step-by-step actionable instructions |
| NARRATIVE | Personal story or experience |
| CITATION | References published research, book, or study |
| PRODUCT | Describes a standalone product concept |
| MODEL | Describes a business/revenue model |
| QUESTION | An unanswered question from the client |
| INSTRUCTION | A build directive from the client to a developer |

### Editorial Flag
- **CLEAN**: No concerns
- **UNVERIFIED**: Claim or statistic without a cited source
- **FLAGGED**: Potentially false, misleading, or pseudoscientific claim

## Output Format

Return a numbered list of atoms in document order:

```
ATOM 1
Section: {which part of the document}
Idea: {one-line summary}
Provenance: {LOCAL|HYBRID|ALIEN}
Nature: {type}
Editorial: {CLEAN|UNVERIFIED|FLAGGED}
---
Content:
{the exact text that constitutes this atom — copy verbatim}
===

ATOM 2
...
```

## Files to Analyze

Category: {CATEGORY}

{PASTE EACH FILE'S CONTENT HERE, SEPARATED BY CLEAR DELIMITERS:}

--- FILE: {filename} ---
{content}
--- END FILE ---
```

### Dispatch Plan for Segmenters

| Dispatch | Category | Files | Send to | Notes |
|----------|----------|-------|---------|-------|
| S-1 | health (batch 1) | First 15 health/ files (alphabetical) | Agent A | ~150 atoms expected |
| S-2 | health (batch 2) | Remaining 16 health/ files + Hormones.docx | Agent B | ~220 atoms expected |
| S-3 | mindset (batch 1) | First 20 mindset/ files | Agent A | ~330 atoms expected |
| S-4 | mindset (batch 2) | Remaining 19 mindset/ files + Rhythms.docx | Agent B | ~334 atoms expected |
| S-5 | business | All 15 business/ files | Agent C | ~219 atoms expected |
| S-6 | water | All 16 water/ files + ERW.docx | Agent C | ~139 atoms expected |
| S-7 | time-astro + concepts | All 22 files | Agent A | ~282 atoms expected |
| S-8 | root docs | 1a, 1b, 2a, 2b | Agent B | ~145 atoms expected |

**Important:** Use the ORIGINAL files from `docs/archive/source-bundle/`, not `docs/archive/extracted/`. The extracted files contain our ATM-* markers which would bias the segmenter.

**Batching rationale:** Files are batched to keep each prompt under ~100K tokens. Health and mindset split in two due to size.

---

## Prompt 2: RECONCILER (Comparison & Reporting)

After all segmenters return their atom lists, dispatch the reconciler with both decompositions.

```markdown
# Task: Atomic Decomposition Verification

You are comparing two independent decompositions of the same source files:
- **OURS**: The project's official atom registry (ATM-* IDs with full metadata)
- **THEIRS**: An independent agent's blind decomposition (numbered atoms with classification)

Your job is to align the two decompositions and report every discrepancy.

## Discrepancy Types

| Type | Meaning | Action |
|------|---------|--------|
| **AGREEMENT** | Both decompositions identify the same idea as a single atom | Proven — no action needed |
| **OUR-SPLIT** | We split into 2+ atoms what they treated as one | Review: did we over-split? |
| **THEIR-SPLIT** | They split into 2+ atoms what we treated as one | Review: did we under-split? |
| **OUR-MISS** | They found an idea we didn't mark as an atom | Review: did we skip content? |
| **THEIR-MISS** | We found an idea they didn't mark | Review: is it real or noise? |
| **PROVENANCE-DIFF** | Same atom, different provenance tag | Review: who's right? |
| **NATURE-DIFF** | Same atom, different nature classification | Review: which fits better? |
| **EDITORIAL-DIFF** | Same atom, different editorial flag | Review: is it flagged or clean? |

## Alignment Method

1. Read both lists in document order
2. For each of our ATM-* atoms, find the corresponding atom(s) in their list by matching content
3. For each of their atoms, verify it maps to one of ours
4. Record the discrepancy type for each pair
5. Count agreements and each discrepancy type

## Output Format

### Summary

```
Category: {category}
Our atoms: {N}
Their atoms: {N}

| Type | Count | % |
|------|-------|---|
| AGREEMENT | {N} | {%} |
| OUR-SPLIT | {N} | {%} |
| THEIR-SPLIT | {N} | {%} |
| OUR-MISS | {N} | {%} |
| THEIR-MISS | {N} | {%} |
| PROVENANCE-DIFF | {N} | {%} |
| NATURE-DIFF | {N} | {%} |
| EDITORIAL-DIFF | {N} | {%} |

Agreement rate: {%}
```

### Detail (discrepancies only)

For each non-AGREEMENT result:

```
DISCREPANCY {N}: {TYPE}
Our atom(s): {ATM-ID(s)} — "{idea summary}"
Their atom(s): #{N} — "{idea summary}"
Analysis: {why the difference exists, which is more correct}
Recommendation: {KEEP-OURS | KEEP-THEIRS | MERGE | SPLIT | ADD | REMOVE}
```

## Inputs

### OUR ATOMS (from project registry)
{PASTE the relevant ATM-* entries from atom-registry.yaml for this category}

### THEIR ATOMS (from independent segmenter)
{PASTE the segmenter's numbered atom list for this category}
```

---

## Prompt 3: REPORT SYNTHESIZER (Cross-Category Findings)

After all reconcilers complete, synthesize findings across categories.

```markdown
# Task: Atomic Verification Synthesis

You have reconciliation reports from {N} category-level comparisons between our project's atomic decomposition and independent blind decompositions.

## Inputs

{PASTE all reconciler reports}

## Required Output

### 1. System-Wide Agreement Rate

| Category | Our Atoms | Their Atoms | Agreements | Agreement Rate |
|----------|-----------|-------------|------------|----------------|
| health | | | | |
| mindset | | | | |
| business | | | | |
| water | | | | |
| time-astro | | | | |
| concepts | | | | |
| root docs | | | | |
| **Total** | | | | |

### 2. Systematic Patterns

Are there patterns in the discrepancies?
- Do we consistently over-split in certain file types?
- Do we consistently under-split in others?
- Are provenance disagreements clustered (e.g., all in ChatGPT response sections)?
- Are nature disagreements clustered (e.g., CLAIM vs FRAMEWORK confusion)?
- Are editorial flags more conservative or more aggressive than the independent check?

### 3. Atoms to Add (OUR-MISS)

List every atom the independent check found that we missed. For each:
- Source file
- The idea
- Recommended ATM-ID (next in sequence for that category)
- Recommended classification

### 4. Atoms to Review (SPLIT/MERGE candidates)

List every case where split/merge is recommended. For each:
- Our ATM-ID(s) involved
- The independent agent's atom(s)
- Recommendation: MERGE our atoms / SPLIT our atom / KEEP AS-IS

### 5. Classification Corrections

List every provenance, nature, or editorial discrepancy where the independent check appears more accurate than ours. For each:
- ATM-ID
- Our classification → Recommended correction
- Reasoning

### 6. Confidence Assessment

Based on the agreement rates and discrepancy patterns:
- Is the decomposition trustworthy for build planning? (>85% agreement = yes)
- Which categories need re-excavation? (<70% agreement)
- Which categories are proven? (>90% agreement)
```

---

## Execution Sequence

```
Phase 1: Dispatch 8 Segmenter prompts (parallelizable)
   └── Each receives ORIGINAL source files (source-bundle/)
   └── Each returns numbered atom list with classification

Phase 2: Dispatch 7 Reconciler prompts (parallelizable per category)
   └── Each receives: our ATM-* entries + independent atom list
   └── Each returns: discrepancy report with recommendations

Phase 3: Dispatch 1 Synthesizer prompt
   └── Receives all reconciler reports
   └── Returns: system-wide findings, corrections, confidence assessment

Phase 4: Apply corrections (manual)
   └── Add missed atoms (update in-situ markers)
   └── Fix misclassifications (update in-situ markers)
   └── Regenerate registry: bash scripts/build-atom-registry.sh
   └── Regenerate coverage: python3 scripts/generate-coverage-strikes.py
```

## Platform Recommendations

| Agent Role | Recommended Platform | Reasoning |
|------------|---------------------|-----------|
| Segmenter A | Claude (Opus/Sonnet) | Strong at semantic boundary detection |
| Segmenter B | GPT-4o / o3 | Different model = different biases = better verification |
| Segmenter C | Gemini 2.5 Pro | Third perspective, good at structured output |
| Reconciler | Claude Opus | Needs precision for alignment and discrepancy typing |
| Synthesizer | Claude Opus | Needs to hold all reports + identify cross-category patterns |

Using the SAME model for all segmenters defeats the purpose — the value is in diverse decomposition biases revealing our blind spots.

---

## SOP Integration

This verification process extends SOP-SS-ATM-001 as an optional quality gate:

```
SOP-SS-ATM-001 Phase 5 (Verify Proof)
  └── OPTIONAL: Run atomic verification handoffs
      └── Phase 1: Segmenters (8 dispatches)
      └── Phase 2: Reconcilers (7 dispatches)
      └── Phase 3: Synthesizer (1 dispatch)
      └── Phase 4: Apply corrections
      └── Regenerate all computed artifacts
```

If agreement rate > 85% system-wide, the decomposition is verified.
If any category < 70%, re-excavate that category with reconciler findings as guidance.

---

## Quick-Start: Single Category Test

To test this process before full deployment, run it on ONE category:

1. Pick `business/` (smallest: 15 files, 219 atoms)
2. Copy the 15 original files from `docs/archive/source-bundle/Spiral!!/business/`
3. Paste into Segmenter prompt with `{CATEGORY} = business`
4. Send to a different AI platform than the one that did the excavation
5. Take the response and paste into Reconciler prompt alongside our ATM-B-* entries
6. Review the discrepancy report

If the test shows >85% agreement, the process validates. If not, refine the segmenter prompt before full deployment.
