# SOP-SS-PRC-001-001-ontology-meta-process

**Title:** Meta-Process: Issue Specification System Creation  
**Domain:** Sovereign Systems Process Engineering  
**Ordinal:** 001  
**Version:** 001  
**Status:** ACTIVE  
**Created:** 2026-04-03  
**Owner:** Orchestrator (AI Agent)

---

## Purpose

Document the process for creating standardized operational procedures (SOPs) for issue management. This meta-SOP captures the exact methodology used to research, design, and implement the issue specification system.

## Scope

This SOP applies to:
- Creation of new SOPs for this project
- Iteration on existing SOPs
- Process improvement initiatives

It does NOT apply to:
- Individual issue execution (see SOP-SS-ISS-001-001-ontology-issue-specification.md)
- Client communication workflows
- Content extraction and injection (see SOP-SS-CNT-001_001-content-extraction-and-node-injection.md)

## Input

- User prompt requesting process standardization
- Access to codebase (CLAUDE.md, AGENTS.md, package.json)
- GitHub Issues API access
- Handoff documentation (`docs/handoff-admin-spiral-path-2026-04-01.md`)
- Prior artifacts in `docs/superpowers/`

## Output

- Genesis SOP for issue specification
- Client decision tracker
- Tracking mechanism
- (Optionally) Issue specs for all 20 issues

## Process

### Phase 1: Discovery

**Step 1.1: Analyze Codebase**
- Read CLAUDE.md for project context
- Read AGENTS.md for development guidelines
- Review package.json for tech stack and commands
- Identify key files and their purposes

**Step 1.2: Fetch Issue Landscape**
- Execute: `gh issue list --state open`
- Parse each issue for:
  - Title and body content
  - Labels (phase, priority, type)
  - Gate criteria
  - Dependencies mentioned
- Classify issues by:
  - Phase (α, β, γ, ω, IRF)
  - Type (DECISION, WORK, BLOCKER)
  - Blocker status (P0 items)

**Step 1.3: Review Commit History**
- Execute: `git log --oneline -15`
- Identify recent patterns:
  - What types of changes are being committed?
  - What's the velocity?
  - Any recurring themes or technical decisions?

**Step 1.4: Examine Handoff Documentation**
- Read primary handoff (`docs/handoff-admin-spiral-path-2026-04-01.md`)
- Map issue scopes to source documents
- Identify authoritative references

### Phase 2: Pattern Recognition

**Step 2.1: Identify Issue Types**
From issue analysis, classify into:

| Type | Characteristics | Count |
|------|----------------|-------|
| DECISION | Requires external input; gate = client decision recorded | 14 |
| WORK | Can execute once specs complete; gate = artifact produced | 5 |
| BLOCKER | P0; blocks multiple downstream issues | 2 |

**Step 2.2: Identify Common Elements**
Extract from issue bodies:
- Decision points (### Decision sections)
- Scope statements (### Scope)
- Gate criteria (**Gate:** markers)
- Output requirements (### Output, ### Output needed)
- Dependencies (### Requires, ### Dependency)

**Step 2.3: Identify Anti-Patterns**
- "Requires admin's input" without specificity
- Gate criteria that are vague ("written confirmation")
- Missing verification methods
- No discrete execution steps

### Phase 3: Design

**Step 3.1: Determine SOP Structure**
- Naming convention: `SOP-{org}-{domain}-{ordinal}-{version}-{purpose}.md`
- Organization: `docs/sops/`
- Versioning: Incremental per change

**Step 3.2: Create Specification Template**
- Header: metadata (title, domain, ordinal, version, status, created, owner)
- Body sections: Purpose, Scope, Input, Output, Process, Gate Criteria, Template
- Tracking: Built into spec file

**Step 3.3: Design Tracking Mechanism**
- Markdown table format for simplicity
- Fields: Spec file, Issue #, Status, Gate Met, Notes
- Update frequency: After each spec completion

**Step 3.4: Address Client Decision Handling**
- Separate tracker file for visibility
- Status: PENDING → IN-REVIEW → RESOLVED
- Each entry: issue #, title, decision needed, linked context

### Phase 4: Implementation

**Step 4.1: Create Directory Structure**
```bash
mkdir -p docs/sops/tracking
```

**Step 4.2: Write Genesis SOP**
- Follow specification template
- Include full process description
- Document all phases and steps

**Step 4.3: Write Meta-Process SOP** (this document)
- Capture exact methodology
- Make it reproducible for future SOPs

**Step 4.4: Write Client Decision Tracker**
- List all 14 client-required issues
- Format for easy reading by non-technical stakeholder

**Step 4.5: Initialize Tracking Table**
- Empty table with columns ready for data

### Phase 5: Execution

**Step 4.6: Execute Issue Expansion**
(If requested by user)
- Batch by phase: α first (blocking), then β, γ, ω
- Follow Genesis SOP process for each

**Step 4.7: Commit and Verify**
- Commit all SOPs to repository
- Push to remote
- Update relevant documentation

## Gate Criteria

This meta-process is considered COMPLETE when:
- [ ] Genesis SOP (issue specification) written and committed
- [ ] Meta-Process SOP written and committed
- [ ] Client Decision Tracker written
- [ ] Tracking table initialized
- [ ] User confirms process meets needs

A subsequent issue expansion cycle is COMPLETE when:
- [ ] All target issues have specs in `docs/superpowers/specs/`
- [ ] Tracking table reflects all specs
- [ ] Commit history shows specs committed
- [ ] No unresolved questions in specs

## Process Metrics

| Metric | Target | Actual |
|--------|--------|--------|
| Time to create SOP | 30 min | TBD |
| Issues spec'd per hour | 3-4 | TBD |
| Spec completeness | 100% | TBD |
| Execution without error | 100% | TBD |

## Lessons Learned (To Be Updated)

_This section will be updated after the first iteration of using these SOPs in actual work execution._

---

## Related SOPs

- SOP-SS-ISS-001-001-ontology-issue-specification (what this process produces)
- SOP-SS-CLT-001-001-ontology-client-decisions (client decision tracker)
- SOP-SS-TRK-001-001-ontology-issue-tracking (tracking table)

---

**End of Meta-Process**
