# Specification: Physical Sovereignty node build (nodes 1-5 + water funnel)

**Issue:** #6 | **Phase:** β | **Priority:** P1 | **Status:** SPEC

## Context

### Why This Matters
Physical Sovereignty is the first phase of the Spiral. Building nodes 1-5 establishes the core funnel and establishes the content architecture for all subsequent pillars.

### Dependencies
- **Blocked by:** #13 (node architecture), #9 (quiz routing), #17 (water hub placement)
- **Blocks:** Inner, Identity, Financial pillars (content architecture follows)
- **Requires:** Node architecture locked, quiz routing defined

### Upstream / Downstream
- **Upstream:** #13 (architecture), #9 (quiz)
- **Downstream:** #17 (water hub), all pillar pages

## Scope

### In-Scope
- Build Phase 1 ELEVATE node set:
  1. Feel Good First
  2. Your Body Is the Starting Point
  3. Stabilize Your Blood Sugar
  4. Your Nervous System Is the Filter
  5. Sleep Is Non-Negotiable
- Map source content from `health/`, `water/`, `1a`, `1b`
- Integrate `Hormones & Healing.docx` as content
- Add self-assessment tools
- CTA to water funnel

### Out-of-Scope
- Full spiral implementation (handled in #15)
- Subscription gating (handled in #7)
- Inner/Identity/Financial content

### Boundaries
- Water remains monetization funnel inside pillar, not the whole pillar

## Output

### Deliverable
Physical Sovereignty page live with:
- Nodes 1-5 content mapped and published
- Self-assessment tools integrated
- CTA to water funnel functional

### Success Criteria
- [ ] Page live at /water/ or /pillars/physical/
- [ ] Nodes 1-5 content populated from source docs
- [ ] Self-assessment tools functional
- [ ] CTA to water funnel works
- [ ] Responsive on mobile

### Verification Method
- Visit /water/ in browser
- Navigate each node
- Test CTA click-through
- Verify mobile rendering

## Gate

**Gate Criterion:** Physical Sovereignty page is live, nodes 1-5 are mapped to source assets, self-assessment tools integrated, and CTA handoff to water funnel works

**Approver:** Studio + admin (content review)

**Evidence Required:**
- Live URL accessible
- Node content verified against source
- CTA functional (test click)

## Execution Checklist

- [ ] Confirm node architecture (#13 resolved)
- [ ] Confirm quiz routing (#9 direction known)
- [ ] Confirm water hub placement (#17 resolved)
- [ ] Map content sources for each node
- [ ] Create /water/ page structure
- [ ] Build node 1: Feel Good First
- [ ] Build node 2: Your Body Is the Starting Point
- [ ] Build node 3: Stabilize Your Blood Sugar
- [ ] Build node 4: Your Nervous System Is the Filter
- [ ] Build node 5: Sleep Is Non-Negotiable
- [ ] Integrate self-assessment tools
- [ ] Add CTA to water funnel
- [ ] Mobile responsive check
- [ ] Commit and deploy
- [ ] Verify live

## Tracking

| Field | Value |
|-------|-------|
| Spec Created | 2026-04-03 |
| Spec Complete | 2026-04-03 |
| Work Started | |
| Work Complete | |
| Gate Met | |
| Estimated Hours | 16 |
| Actual Hours | |

## Notes

### Content Sources
- `health/` folder from handoff
- `water/` folder from handoff
- `1a. Master spiral backend breakdown.docx`
- `1b. Spiral dump for build`
- `Hormones & Healing.docx`
- `Inflammation Self-Check Questions`

### Water Funnel
Water should remain the monetization mechanism inside Physical Sovereignty. CTA leads to water-example.com or GHL funnel.

### Self-Assessment Tools
Pull from Inflammation Self-Check Questions and related diagnostics in the handoff docs.
