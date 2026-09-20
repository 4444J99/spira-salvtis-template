# Specification: Spiral interaction target (movable/clickable parity)

**Issue:** #8 | **Phase:** β | **Priority:** P1 | **Status:** SPEC

## Context

### Why This Matters
admin wants the spiral to feel like the prior moveable/clickable experience, not just the current orbital canvas. This issue defines the interaction target to ensure the implementation meets user expectations.

### Dependencies
- **Blocked by:** #13 (node architecture must be locked)
- **Blocks:** #15 (spiral merge - interaction spec)
- **Requires:** Final node architecture, old spiral docs/screenshots from admin

### Upstream / Downstream
- **Upstream:** #13 (node architecture)
- **Downstream:** #15 (implementation reference)

## Scope

### In-Scope
- Define interaction behaviors:
  - Tactile, user-manipulable spiral behavior
  - Hover and camera transitions that feel alive
  - Glassmorphism modal language
  - Touch support on mobile/tablet
- Reference old spiral docs/screenshots
- Align to locked node architecture

### Out-of-Scope
- Implementation details (handled in #15)
- Content population

### Boundaries
- Interaction target is specification; #15 is implementation

## Output

### Deliverable
Interaction specification document defining:
- Hover behaviors
- Click behaviors  
- Touch behaviors
- Animation expectations
- Modal interaction patterns

### Success Criteria
- [ ] Interaction target documented in sufficient detail
- [ ] Reference images/screenshots linked
- [ ] Mobile touch behaviors specified
- [ ] Glassmorphism language defined

### Verification Method
Spec review against: can implementation be executed without guesswork?

## Gate

**Gate Criterion:** Interaction target is specific enough to drive implementation without guesswork

**Approver:** Studio

**Evidence Required:**
- Written interaction spec
- Reference links to prior spiral (if available)

## Execution Checklist

- [ ] Review old spiral docs/screenshots from admin
- [ ] Define hover interaction (what happens on mouse over)
- [ ] Define click interaction (what happens on click)
- [ ] Define touch behaviors for mobile
- [ ] Document animation expectations (GSAP, timing)
- [ ] Define glassmorphism modal patterns
- [ ] Align to node architecture
- [ ] Document in spec
- [ ] Update #15 with interaction reference

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

### Interaction Principles
- "Feel alive" - subtle continuous motion
- "Tactile" - responds to user input
- "Glassmorphism" - frosted glass, blur, transparency

### Reference
The 2026-04-01 handoff sharpens the target, but old spiral docs/screenshots from admin still matter for parity.
