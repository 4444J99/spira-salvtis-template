# SOP-SS-REV-001_001: Evaluation-to-Growth Review Chain

**Title:** Evaluation-to-Growth Review Chain
**Domain:** Review and Refinement
**Ordinal:** 001
**Version:** 001
**Status:** ACTIVE
**Created:** 2026-04-30
**Owner:** Orchestrator (AI Agent)

---

## Purpose

Define a repeatable review protocol for strengthening content, arguments, plans, offers, and client-facing artifacts. The protocol moves from evaluation to reinforcement, risk analysis, and growth so feedback produces a clearer, more credible, more emotionally resonant final artifact.

## Scope

Use this SOP for:

- Client-facing copy, reports, walkthroughs, and deliverables
- Strategic plans, launch materials, and offer narratives
- Argument-heavy research, positioning, and educational content
- Internal process documents that need adversarial review before reuse

Do not use this SOP as a substitute for factual verification, legal review, medical review, or claim substantiation. When an artifact makes factual, health, financial, or legal claims, route those claims through the relevant evidence and citation process.

---

## Review Chain

| Step | Purpose | Desired Outcome |
|------|---------|-----------------|
| 1. Critique | Provide a comprehensive evaluation of strengths and weaknesses | A clear understanding of what works well and what needs improvement |
| 2. Logic Check | Ensure internal consistency and sound reasoning | Contradictions removed and logical coherence reinforced |
| 3. Logos Review | Assess the clarity and persuasiveness of rational arguments | Stronger intellectual, factual, and evidentiary appeal |
| 4. Pathos Review | Evaluate emotional resonance and audience appeal | A stronger emotional connection with the intended audience |
| 5. Ethos Review | Examine credibility, authority, and trustworthiness | Greater reliability, authority, and professional trust |
| 6. Blind Spot Identification | Reveal overlooked areas, hidden assumptions, or bias | Lower risk of missed issues or unchallenged assumptions |
| 7. Shatter Point Recognition | Pinpoint vulnerabilities or potential breaking points | Prevention or preparation for critical failure points |
| 8. Bloom | Highlight emergent ideas or growth opportunities | Fresh directions, new perspectives, and higher-leverage options |
| 9. Evolve | Integrate feedback through iterative refinement | A stronger, more resilient final product |

## Phase Flow

```text
[Evaluation]
   |- Critique -> Clear view of strengths and weaknesses
   |- Logos Review -> Stronger logical and factual appeal
   |- Ethos Review -> Greater reliability and trust
   `- Pathos Review -> Strong emotional connection
        |
[Reinforcement]
   `- Logic Check -> Contradictions removed and coherence reinforced
        |
[Risk Analysis]
   |- Identify Blind Spots -> Lower risk of missed or unchallenged issues
   `- Recognize Shatter Points -> Better prevention of critical failures
        |
[Growth]
   |- Bloom -> Fresh innovative directions
   `- Evolve -> Stronger, more resilient final product
```

The operating progression is: **Evaluate -> Reinforce -> Analyze Risks -> Grow**.

---

## Prompt Chain

### 1. Critique

**Prompt**

```text
Evaluate this content thoroughly. Identify its key strengths and weaknesses. Highlight which parts are effective and which need improvement, providing specific reasons.
```

**Expected output**

- Strengths: clear main argument, useful structure, distinctive insight, strong audience relevance
- Weaknesses: thin conclusion, unsupported claim, missing transition, unclear call to action

**Quality gate**

- Findings are specific enough to locate in the source artifact.
- Strengths and weaknesses are both present.

### 2. Logic Check

**Prompt**

```text
Examine the content for logical consistency. Identify contradictions, gaps in reasoning, or unsupported claims, and suggest how to strengthen coherence.
```

**Expected output**

- Logical gap: a claim lacks data, example, or mechanism.
- Fix: add a citation, clarify the premise, narrow the claim, or revise the sequence.

**Quality gate**

- Every contradiction or gap has a proposed correction.
- Corrections preserve the artifact's intended argument instead of replacing it with a different argument.

### 3. Logos Review

**Prompt**

```text
Assess the rational and factual appeal of this content. Are the arguments clear, well-supported, and persuasive? Suggest ways to enhance the logical impact.
```

**Expected output**

- Observation: arguments are clear but need stronger evidence.
- Recommendation: add a relevant study, concrete example, metric, mechanism, or comparison.

**Quality gate**

- Evidence recommendations are appropriate to the claim's risk level.
- Health, legal, financial, and scientific claims are flagged for source verification.

### 4. Pathos Review

**Prompt**

```text
Analyze the emotional tone and resonance of this content. Does it create an emotional connection with its intended audience? Recommend adjustments to increase engagement.
```

**Expected output**

- Observation: tone is informative but emotionally flat.
- Recommendation: add a lived-example bridge, audience-specific pain point, relief moment, or concrete transformation.

**Quality gate**

- Emotional recommendations do not manipulate, shame, or overpromise.
- Tone remains aligned with the brand and audience.

### 5. Ethos Review

**Prompt**

```text
Evaluate the credibility and authority of this content. Does it reflect expertise and trustworthiness? Suggest ways to reinforce its reliability and professional tone.
```

**Expected output**

- Observation: author sounds knowledgeable but lacks visible authority markers.
- Recommendation: reference credentials, cite authoritative sources, clarify experience, or tighten professional language.

**Quality gate**

- Authority is earned through specificity, evidence, or provenance.
- No invented credentials, unsupported authority claims, or inflated certainty.

### 6. Blind Spot Identification

**Prompt**

```text
Identify any areas in this content that may be overlooked, biased, or based on hidden assumptions. Provide suggestions to address these gaps or risks.
```

**Expected output**

- Blind spot: assumes the reader already understands the framework.
- Fix: add a brief primer, define key terms, or include a grounding example.

**Quality gate**

- At least one audience, context, access, equity, or implementation assumption is tested.
- "No blind spots" requires a short rationale, not silence.

### 7. Shatter Point Recognition

**Prompt**

```text
Analyze the content for potential vulnerabilities or weak points that could cause failure or serious criticism. Recommend preventive measures or reinforcements.
```

**Expected output**

- Vulnerability: over-reliance on one source or one unverified premise.
- Fix: diversify references, narrow the claim, add caveats, or restructure the argument.

**Quality gate**

- Shatter points distinguish between minor polish issues and failure-critical risks.
- Each risk includes a preventive action.

### 8. Bloom

**Prompt**

```text
From the reviewed content, generate innovative ideas, new directions, or insights that could enhance or expand its impact.
```

**Expected output**

- Insight: convert the framework into a visual, checklist, worksheet, short-form sequence, or decision tool.
- Opportunity: expand the artifact for a new persona, channel, product, or workflow.

**Quality gate**

- Emergent ideas build from the artifact rather than drifting into unrelated brainstorming.
- Each idea names a practical next form or use case.

### 9. Evolve

**Prompt**

```text
Incorporate all feedback and refinements to create a polished, stronger, and more resilient final version of the content.
```

**Expected output**

- A revised artifact with improved structure, coherence, emotional engagement, credibility, and risk resilience.
- A short change log naming the major improvements.

**Quality gate**

- The revision addresses the highest-risk issues first.
- The final artifact remains faithful to the source intent.

---

## Operating Rules

1. Preserve source intent before optimizing expression.
2. Separate evaluation from rewriting; diagnose before revising.
3. Treat claims differently by risk level; higher-risk claims require stronger evidence.
4. Review through multiple lenses, but resolve feedback into one coherent artifact.
5. Keep a short change log when producing the evolved version.
6. Do not flatten distinctive voice unless it creates confusion, risk, or loss of trust.

## Output Template

```markdown
## Critique
- Strengths:
- Weaknesses:

## Logic Check
- Gaps or contradictions:
- Fixes:

## Logos
- Rational appeal:
- Evidence improvements:

## Pathos
- Emotional resonance:
- Engagement improvements:

## Ethos
- Credibility markers:
- Trust improvements:

## Blind Spots
- Hidden assumptions:
- Corrections:

## Shatter Points
- Failure-critical risks:
- Preventive actions:

## Bloom
- Emergent insights:
- Expansion opportunities:

## Evolve
- Revised version:
- Change log:
```

## Related SOPs

- SOP-SS-CNT-001_001-content-extraction-and-node-injection.md
- SOP-SS-ATM-001_001-atomic-decomposition.md
- SOP-SS-PRC-001_001-ontology_meta_process.md

---

**End of SOP**
