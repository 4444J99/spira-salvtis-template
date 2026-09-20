# Specification: Start Here quiz routing + GHL integration

**Issue:** #9 | **Phase:** β | **Priority:** P1 | **Status:** SPEC

## Context

### Why This Matters
The quiz is the primary entry point for new visitors. Building the Start Here page and connecting GHL routing determines how users are funneled to the right pillar and next steps.

### Dependencies
- **Blocked by:** #14 (video asset access), #17 (gateway hub placement)
- **Blocks:** #6 (foundation build - funnel integration)
- **Requires:** GHL embed URL and routing rules

### Upstream / Downstream
- **Upstream:** Handoff section on quiz
- **Downstream:** #6 (funnel routing), #7 (subscription boundary)

## Scope

### In-Scope
- Build `/start-here/` or `/quiz/` page
- Polish GHL iframe/embed experience
- Define routing logic by pillar/result
- Connect CTA from spiral hub and Foundation Sovereignty entry

### Out-of-Scope
- GHL account configuration
- Custom GHL workflows (beyond embed)
- Video hosting (handled in #18)

### Boundaries
- Uses existing GHL embed, no custom CRM integration

## Output

### Deliverable
Live quiz page with:
- GHL embed functional
- Routing logic by pillar/result
- CTA handoff from spiral hub

### Success Criteria
- [ ] Quiz page live at /quiz/ or /start-here/
- [ ] GHL iframe loads and functions
- [ ] Routing logic applies based on quiz results
- [ ] Users land on correct next step by pillar
- [ ] CTA from spiral hub routes to quiz

### Verification Method
- Visit quiz page, complete quiz, verify result routing

## Gate

**Gate Criterion:** Quiz route is live, GHL tags apply, and users land on correct next step by pillar

**Approver:** Studio + admin (routing rules)

**Evidence Required:**
- Live URL accessible
- Test completion shows correct routing

## Execution Checklist

- [ ] Obtain GHL embed URL from admin (if not in handoff)
- [ ] Confirm routing rules by pillar/result
- [ ] Create quiz page route
- [ ] Implement GHL iframe embed
- [ ] Add routing logic (if GHL doesn't handle)
- [ ] Connect CTA from spiral hub
- [ ] Connect CTA from Foundation Sovereignty
- [ ] Test routing flow
- [ ] Commit and deploy

## Tracking

| Field | Value |
|-------|-------|
| Spec Created | 2026-04-03 |
| Spec Complete | 2026-04-03 |
| Work Started | |
| Work Complete | |
| Gate Met | |
| Estimated Hours | 8 |
| Actual Hours | |

## Notes

### GHL Routing
If GHL handles routing internally (recommended), only need embed URL. If custom routing needed, implement in code.

### Routing Examples
- Result A → Foundation Sovereignty
- Result B → System Sovereignty
- Result C → Structure Sovereignty
- Result D → Vision Sovereignty

### Source Reference
See handoff section on "Start Here / Quiz" flow.
