# Specification: Keystatic CMS (re-add post pricing)

**Issue:** #11 | **Phase:** γ | **Priority:** P3 | **Status:** SPEC

## Context

### Why This Matters
Keystatic CMS was removed during purification (added React + 3MB client JS). Re-adding should only happen when pricing is formalized, client needs it, and React is justified.

### Dependencies
- **Blocked by:** #5 (revenue agreement)
- **Blocks:** Self-service content editing for admin
- **Requires:** Pricing formalized, client demonstrates need

## Scope

### In-Scope
- Re-add Keystatic if criteria met
- GitHub OAuth setup for content editing
- Configure content collections

### Out-of-Scope
- Pricing implementation (future)
- Custom content types beyond existing

## Output

### Deliverable
CMS accessible at /keystatic with GitHub auth

### Success Criteria
- [ ] CMS accessible at /keystatic
- [ ] Client can edit content independently
- [ ] GitHub OAuth configured

### Verification Method
Login to /keystatic, attempt content edit

## Gate

**Gate Criterion:** CMS accessible at /keystatic, client can edit content independently

**Approver:** Studio + admin

**Evidence Required:**
- /keystatic loads
- Test content edit succeeds

## Execution Checklist

- [ ] Confirm #5 resolved (revenue agreement)
- [ ] Assess if client needs self-service editing
- [ ] Justify React dependency
- [ ] Re-add Keystatic to project
- [ ] Configure GitHub OAuth
- [ ] Test content editing
- [ ] Commit and deploy

## Tracking

| Field | Value |
|-------|-------|
| Spec Created | 2026-04-03 |
| Spec Complete | 2026-04-03 |
| Work Started | |
| Work Complete | |
| Gate Met | |
| Estimated Hours | 4 |
| Actual Hours | |

## Notes

### Re-Add Criteria
1. Pricing agreement formalized (#5)
2. Client demonstrates need for self-service editing
3. React dependency justified by usage

### Reference
IRF-APP-037 tracks OAuth setup steps.
