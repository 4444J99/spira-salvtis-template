# Specification: B-106 citation correction

**Issue:** #12 | **Phase:** ω | **Priority:** P3 | **Status:** SPEC

## Context

### Why This Matters
McAdams 'A new Big Five' is from 1995, not 2006. The 2006 date in corpus-canon.md conflates the paper with his book 'The Redemptive Self.' This is a factual error that must be corrected.

### Dependencies
- **Blocked by:** None
- **Blocks:** Citation accuracy
- **Requires:** None (can proceed immediately)

## Scope

### In-Scope
- Fix B-106 date in docs/corpus-canon.md
- Regenerate citations.json

### Out-of-Scope
- Other citation corrections (unless found)

## Output

### Deliverable
B-106 date corrected, citations.json regenerated

### Success Criteria
- [ ] B-106 date corrected to 1995
- [ ] citations.json regenerated
- [ ] Changes committed

### Verification Method
Check corpus-canon.md for correct date

## Gate

**Gate Criterion:** B-106 date corrected, citations.json regenerated

**Approver:** Studio

**Evidence Required:**
- Updated corpus-canon.md
- Regenerated citations.json

## Execution Checklist

- [ ] Find B-106 in corpus-canon.md
- [ ] Change date from 2006 to 1995
- [ ] Add note about conflation with 'The Redemptive Self' (2006)
- [ ] Run parse-citations script
- [ ] Commit both changes

## Tracking

| Field | Value |
|-------|-------|
| Spec Created | 2026-04-03 |
| Spec Complete | 2026-04-03 |
| Work Started | |
| Work Complete | |
| Gate Met | |
| Estimated Hours | 0.5 |
| Actual Hours | |

## Notes

### Fix Required
- Current: McAdams 'A new Big Five' (2006)
- Correct: McAdams 'A new Big Five' (1995)
- Note: His book 'The Redemptive Self' was 2006
