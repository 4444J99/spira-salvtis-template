# Specification: Merge V5/V6 HTML prototypes into production spiral

**Issue:** #15 | **Phase:** β | **Priority:** P1 | **Status:** SPEC

## Context

### Why This Matters
The production spiral must combine the best of V5 (rich content, modal renderer) and V6 (Three.js + GSAP, glassmorphism, touch support) into a single production implementation.

### Dependencies
- **Blocked by:** #13 (node architecture must be locked)
- **Blocks:** Production deployment with interactive spiral
- **Requires:** Final node architecture confirmed

### Upstream / Downstream
- **Upstream:** #13 (node architecture)
- **Downstream:** Production deployment, all pillar pages

## Scope

### In-Scope
- Merge V5 features: fullSpiralData, deepDive content, showTopicModal(), node 1/4 examples
- Merge V6 features: Three.js tube geometry, GSAP hover/camera/particles, glassmorphism, touch
- Node click → rich modal deep-dive
- Mobile/touch pass
- Align to locked node set

### Out-of-Scope
- Full content population (handled in #6)
- Subscription gating (handled in #7)
- Video hosting integration (handled in #18)

## Output

### Deliverable
Production spiral in this repo:
- Interactive canvas with merged V5/V6 features
- Node click → rich modal
- Touch support on mobile

### Success Criteria
- [ ] V5 deep-dive content renderer working
- [ ] V6 Three.js + GSAP animation working
- [ ] Glassmorphism UI applied
- [ ] Node click opens modal
- [ ] Touch support functional on mobile
- [ ] Aligned to locked 13-node architecture

### Verification Method
- Test in desktop browser: hover, click, modal
- Test in mobile: touch, tap, scroll

## Gate

**Gate Criterion:** Merged prototype runs against locked node set and is ready to wire into hub-example.com

**Approver:** Studio

**Evidence Required:**
- Functional spiral on local dev
- Modal opens on node click
- Mobile touch functional

## Execution Checklist

- [ ] Confirm final node architecture (#13 resolved)
- [ ] Set up production canvas in `src/components/spiral/`
- [ ] Implement Three.js tube geometry
- [ ] Add GSAP hover animations
- [ ] Add GSAP camera transitions
- [ ] Add GSAP particle effects
- [ ] Apply glassmorphism to modals
- [ ] Implement touch support
- [ ] Integrate V5 deepDive content objects
- [ ] Wire showTopicModal() renderer
- [ ] Align to 13-node structure
- [ ] Test desktop interaction
- [ ] Test mobile touch
- [ ] Commit and deploy to preview

## Tracking

| Field | Value |
|-------|-------|
| Spec Created | 2026-04-03 |
| Spec Complete | 2026-04-03 |
| Work Started | |
| Work Complete | |
| Gate Met | |
| Estimated Hours | 24 |
| Actual Hours | |

## Notes

### V5 Features to Preserve
- fullSpiralData structure
- deepDive content objects
- showTopicModal() rich renderer
- Production examples for nodes 1 and 4

### V6 Features to Preserve
- Three.js tube geometry
- GSAP hover, camera, particle motion
- Glassmorphism UI
- Touch support
- Modern web animation polish

### Reference Files
- HTML V5 prototype (from handoff)
- HTML V6 prototype (from handoff)
- Current `src/components/spiral/spiral.ts`
