# Specification: Lock final Spiral node architecture (13 vs 14 + order)

**Issue:** #13 | **Phase:** α | **Priority:** P0 | **Status:** GATED

## Context

### Why This Matters
The 2026-04-01 admin Spiral Path handoff identifies node architecture as the first blocker on the critical path. Without locked architecture, downstream implementation issues cannot proceed with confidence.

### Dependencies
- **Blocked by:** None
- **Blocks:** #15 (spiral merge), #8 (interaction), #6 (physical build)
- **Requires:** Written confirmation from admin

### Upstream / Downstream
- **Upstream:** Handoff doc 2b (Nodular Flow Refinement)
- **Downstream:** All β-phase spiral and physical sovereignty work

## Scope

### In-Scope
- Confirm node count: 13 vs 14
- Confirm node ordering: 2b phase order vs original HTML sequence
- Confirm treatment of dropped/absorbed nodes

### Out-of-Scope
- Content for individual nodes (handled in #6)
- Spiral visual implementation (handled in #15)

### Boundaries
- Dropped nodes from consideration: Check-In, Quantum Creation, Embodiment, Rebirth (unless admin insists)

## Output

### Deliverable
Canonical node table documenting:
- Node number
- Node name
- Phase assignment
- Status (live/coming-soon)

### Success Criteria
- [ ] Written confirmation from admin received
- [ ] Node count locked (13 or 14)
- [ ] Ordering confirmed
- [ ] Dropped nodes documented
- [ ] Node table committed to `docs/handoff-admin-spiral-path-2026-04-01.md`

### Verification Method
Text/email from admin with explicit statement of chosen architecture, plus updated node table in handoff doc.

## Gate

**Gate Criterion:** Written confirmation from admin with specific node count and order

**Approver:** admin (client)

**Evidence Required:**
- Text/email confirmation
- Updated handoff doc with node table

## Execution Checklist

- [ ] Review handoff docs 1a, 1b, 2b for node references
- [ ] Prepare recommendation (13-node 2b structure)
- [ ] Send to admin with explicit options
- [ ] Await confirmation
- [ ] Update handoff doc with canonical node table
- [ ] Commit changes

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

### Recommendation
Adopt the 13-node `2b` structure. It is admin's most recent and most considered architecture, and her margin notes suggest active consolidation.

### Related Files
- `docs/handoff-admin-spiral-path-2026-04-01.md` - lines 94-150 (node structure)
- `docs/handoff-admin-spiral-path-2026-04-01.md` - lines 200+ (node details)
