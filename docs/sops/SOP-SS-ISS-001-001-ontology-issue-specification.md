# SOP-SS-ISS-001-001-ontology-issue-specification

**Title:** Issue Specification Genesis  
**Domain:** Sovereign Systems Issue Management  
**Ordinal:** 001  
**Version:** 001  
**Status:** ACTIVE  
**Created:** 2026-04-03  
**Owner:** Orchestrator (AI Agent)

---

## Purpose

Define the standardized process for transforming a GitHub issue into a full-depth executable specification. This SOP ensures every issue receives sufficient context, scope, and success criteria to be completed without error.

## Scope

- All issues in `organvm-iii-ergon/sovereign-systems--spiral-template` repository
- Primary focus: 20 roadmap issues (phases α, β, γ, ω + IRF legacy)
- Extensions: Any future issues added to the project board

## Input

- GitHub issue (title, body, labels, milestone)
- Related handoff documentation (`docs/handoff-admin-spiral-path-2026-04-01.md`)
- Prior session artifacts in `docs/superpowers/`
- Codebase context (CLAUDE.md, AGENTS.md)

## Output

Specification file per issue, stored in `docs/superpowers/specs/` with naming convention:
```
YYYY-MM-DD-spec-{issue-slug}.md
```

Each spec contains:
1. **Header Metadata**: Issue #, phase, priority, labels, created date
2. **Context**: Why this matters, dependencies, upstream/downstream impacts
3. **Scope**: What's in-scope, out-of-scope, boundaries
4. **Output**: Deliverable definition, success criteria
5. **Gate**: What "done" looks like, who approves, acceptance criteria
6. **Execution Checklist**: Step-by-step tasks to complete the work
7. **Tracking**: Estimated hours, actual hours, status transitions

## Process

### Phase 1: Issue Analysis

1. **Parse issue body**
   - Extract decision points (marked with ### Decision)
   - Extract scope statements (marked with ### Scope)
   - Extract gate criteria (marked with **Gate:**)
   - Identify required outputs

2. **Identify dependencies**
   - Check for "Requires:", "Dependency:", "Blocks:" statements
   - Review upstream issues for blocking status
   - Map downstream issues that depend on this

3. **Classify issue type**
   - **DECISION**: Requires external input before work can begin
   - **WORK**: Can be executed once specs are complete
   - **BLOCKER**: P0 item blocking multiple downstream issues

### Phase 2: Context Extraction

4. **Gather related documentation**
   - Read relevant handoff sections
   - Review prior specs in `docs/superpowers/specs/`
   - Check `docs/design-decisions.md` for prior choices

5. **Map to source of truth**
   - Identify which handoff doc contains the authoritative scope
   - Note file paths and line references
   - Flag any ambiguous areas needing clarification

### Phase 3: Specification Construction

6. **Draft spec file**
   - Use template below
   - Fill all sections completely
   - Never leave "TBD" without explanation

7. **Define success criteria**
   - Specific, measurable, verifiable
   - Binary: done or not done
   - Include verification method

8. **Create execution checklist**
   - Break into discrete, completable tasks
   - Number each step
   - Include rollback/revert option for risky changes

### Phase 4: Review & Commit

9. **Self-review spec**
   - Can this be executed without asking additional questions?
   - Are all dependencies resolved?
   - Is the gate criterion explicit?

10. **Commit specification**
    - Save to `docs/superpowers/specs/`
    - Update issue with spec link
    - Update tracking table

## Gate Criteria

A specification is considered COMPLETE when:
- [ ] All sections filled (no empty TBDs)
- [ ] Execution checklist has discrete, numbered steps
- [ ] Success criteria are binary (verifiable yes/no)
- [ ] Related issues checked for dependencies
- [ ] Spec file committed to repository
- [ ] Tracking table updated

A WORK item is considered DONE when:
- [ ] All execution checklist items completed
- [ ] Verification method confirms success criteria
- [ ] Artifact produced (code, content, config change)
- [ ] Change committed and pushed
- [ ] Gate criterion met (e.g., "page is live")
- [ ] Tracking table updated with completion date

## Specification Template

```markdown
# Specification: {Issue Title}

**Issue:** #{number} | **Phase:** {phase} | **Priority:** {P0-P3} | **Status:** {SPEC|WIP|DONE|GATED}

## Context

### Why This Matters
{2-3 sentences on business/project value}

### Dependencies
- **Blocked by:** {issue #} - {reason}
- **Blocks:** {issue #s} - {reason}
- **Requires:** {external input needed}

### Upstream / Downstream
- **Upstream:** {issue that feeds this}
- **Downstream:** {issue that consumes this}

## Scope

### In-Scope
- {specific item}
- {specific item}

### Out-of-Scope
- {specific item}
- {specific item}

### Boundaries
- {edge case considerations}

## Output

### Deliverable
{What gets produced}

### Success Criteria
- [ ] {Criterion 1 - binary}
- [ ] {Criterion 2 - binary}
- [ ] {Criterion 3 - binary}

### Verification Method
{How to confirm success criteria are met}

## Gate

**Gate Criterion:** {explicit statement of what "done" looks like}

**Approver:** {who confirms completion}

**Evidence Required:**
- {specific artifact or confirmation}

## Execution Checklist

- [ ] Step 1: {action}
- [ ] Step 2: {action}
- [ ] Step 3: {action}
- [ ] Step N: {action}

## Tracking

| Field | Value |
|-------|-------|
| Spec Created | {YYYY-MM-DD} |
| Spec Complete | {YYYY-MM-DD} |
| Work Started | {YYYY-MM-DD} |
| Work Complete | {YYYY-MM-DD} |
| Gate Met | {YYYY-MM-DD} |
| Estimated Hours | {N} |
| Actual Hours | {N} |

## Notes

### Decisions Made During Spec
- {decision}: {rationale}

### Open Questions
- {question}: {what's needed}

### Related Files
- `{file path}`: {relevance}
```

## Tracking Mechanisms

### Issue Status Transitions

```
SPEC    → WIP     → DONE    → CLOSED
  │        │         │          │
  │        │         │          └── Gate met, artifact verified
  │        │         └────────────── All checklist items complete
  │        └────────────────────── Work actively in progress
  └──────────────────────────────── Full spec committed
```

### Client Decision Gating

For issues marked `client` label:
- Status remains GATED until external input received
- GATED → SPEC transition when decision recorded
- Track in `docs/sops/SOP-SS-CLT-001-001-ontology-client-decisions.md`

## Exceptions

- **Urgent hotfixes**: May skip spec, document in commit message
- **Multi-issueepic**: Create parent spec linking child specs
- **Scope creep**: New scope → new issue, don't expand current spec

## Related SOPs

- SOP-SS-PRC-001-001-ontology-meta-process (creation of this SOP system)
- SOP-SS-CLT-001-001-ontology-client-decisions (client decision tracker)
- SOP-SS-TRK-001-001-ontology-issue-tracking (tracking table)

---

**End of Specification**
