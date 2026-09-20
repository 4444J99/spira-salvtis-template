# Specification: Subscription boundary and gated content model

**Issue:** #7 | **Phase:** β | **Priority:** P2 | **Status:** GATED

## Context

### Why This Matters
The handoff makes subscription design an explicit content-boundary decision. Defining free vs email-gated vs paid boundaries is essential for building the correct gating infrastructure.

### Dependencies
- **Blocked by:** None
- **Blocks:** #6 (gating infrastructure), #9 (quiz routing)
- **Requires:** Decision from admin on what is free/paid per node

### Upstream / Downstream
- **Upstream:** Handoff
- **Downstream:** #6, #9

## Scope

### In-Scope
- Define what stays free: spiral hub, pillar overviews, hook-level content
- Define what is email-gated: node deep-dives, premium lead magnets
- Define what is paid: subscription hub, automated videos, recurring offers
- Create free/email-gated/paid matrix by page, pillar, node

### Out-of-Scope
- Implementation details

## Output

### Deliverable
Free/Email-gated/Paid matrix

### Success Criteria
- [ ] Matrix exists
- [ ] Implementation approach approved

### Verification Method
Matrix document with admin's sign-off

## Gate

**Gate Criterion:** Written free/email-gated/paid matrix exists and implementation approach is approved

**Approver:** admin

**Evidence Required:**
- Matrix document with approval

## Execution Checklist

- [ ] Draft initial matrix
- [ ] Review with admin
- [ ] Obtain approval
- [ ] Document in specs

## Tracking

| Field | Value |
|-------|-------|
| Spec Created | 2026-04-03 |
| Spec Complete | 2026-04-03 |
| Work Started | |
| Work Complete | |
| Gate Met | |
| Estimated Hours | 2 |
| Actual Hours | |

## Notes

### Matrix Template

| Content Type | Free | Email-Gated | Paid |
|--------------|------|-------------|------|
| Spiral Hub | ✓ | | |
| Pillar Overview | ✓ | | |
| Node Hook | ✓ | | |
| Node Deep-Dive | | ✓ | |
| Premium Lead Magnet | | ✓ | |
| Subscription Hub | | | ✓ |
| Automated Videos | | | ✓ |
