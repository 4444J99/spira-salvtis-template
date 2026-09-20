# Specification: Formalize 10% revenue agreement

**Issue:** #5 | **Phase:** α | **Priority:** P0 | **Status:** GATED

## Context

### Why This Matters
admin agreed verbally to 10% of water sales until $10K. Without written confirmation, the revenue arrangement lacks legal standing and blocks all revenue-generating work from proceeding with confidence.

### Dependencies
- **Blocked by:** None
- **Blocks:** #10 (store), all revenue-sharing work
- **Requires:** Written/text confirmation from admin

### Upstream / Downstream
- **Upstream:** IRF-APP-031
- **Downstream:** All monetization and revenue work

## Scope

### In-Scope
- Obtain written confirmation of revenue terms
- Document exact terms in project records

### Out-of-Scope
- Payment processing implementation (future)
- Revenue tracking systems (future)

### Boundaries
- Terms: 10% of water sales, 12 months, $10K cap

## Output

### Deliverable
Written/text confirmation from admin with explicit terms

### Success Criteria
- [ ] Text/email received with "10% of water sales"
- [ ] Text/email received with "12 months" (or explicit duration)
- [ ] Text/email received with "$10,000" cap (or explicit amount)
- [ ] Terms documented in `docs/handoff-admin-spiral-path-2026-04-01.md`
- [ ] Both parties have copy of confirmation

### Verification Method
Text message, email, or documented call with explicit terms stated by admin

## Gate

**Gate Criterion:** Both parties have explicit text record of: 10% of water sales, 12 months, until $10K cap

**Approver:** admin (client) + Studio

**Evidence Required:**
- Text/email from admin with all three terms explicit
- Stored in project docs

## Execution Checklist

- [ ] Draft confirmation request with all three terms explicit
- [ ] Send to admin via preferred channel
- [ ] Await response
- [ ] Store confirmation in `docs/handoff-admin-spiral-path-2026-04-01.md` (new section)
- [ ] Acknowledge receipt to admin

## Tracking

| Field | Value |
|-------|-------|
| Spec Created | 2026-04-03 |
| Spec Complete | 2026-04-03 |
| Work Started | |
| Work Complete | |
| Gate Met | |
| Estimated Hours | 1 |
| Actual Hours | |

## Notes

### Current Status
- Pricing sent ✅
- Verbal agreement received ✅
- Written confirmation: PENDING

### Template for Request
> Hi admin,
> 
> To formalize our water sales agreement, could you send a quick text confirming:
> - 10% of water sales
> - For 12 months
> - Up to $10,000 total
> 
> This helps both of us have a clear record. Thanks!

### Related Files
- `docs/handoff-admin-spiral-path-2026-04-01.md` - Revenue section
