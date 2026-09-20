# Decision: Water Hub Placement

**Issue:** #17 — Decide Water Hub placement in site architecture
**Related:** #7 (subscription boundary), #6 (Physical Sovereignty build)
**For:** admin
**Date:** 2026-04-04
**Status:** Recommendation ready

---

## The Question

Where does the Hydration Node live?

1. As a page within hub-example.com (`/water/hydration-node`)
2. As a standalone app at `water-example.com`
3. Both (shared component, two entry points)

---

## Recommendation: Option 3 — Both

Build the Hydration Node as a **shared component** that deploys to both locations.

### How it works

```
hub-example.com
├── /water/               ← existing funnel home (unchanged)
├── /water/explore        ← branch explorer (unchanged)
├── /water/quiz           ← GHL quiz (unchanged)
├── /water/hydration-node ← NEW: Hydration Node embedded here
└── /water/[slug]         ← branch deep-dives (unchanged)

water-example.com      ← standalone domain
├── /                     ← Hydration Node as full-page hero
├── /results              ← filter recommendations (post-email)
└── /learn                ← links back to hub-example.com/water/
```

### Why both

1. **hub-example.com visitors** discover the Hydration Node as part of their Physical Sovereignty exploration. It's one tool among many. Context: Spiral → Physical Pillar → Water → Hydration Node.

2. **water-example.com visitors** arrive directly from social media, ads, or word-of-mouth. They don't know about the Spiral yet. The Hydration Node IS the experience. After conversion, they're introduced to the broader ecosystem.

3. **The component is the same.** One `<HydrationNode />` Astro component, two pages that render it. Zero code duplication.

4. **Two income streams from one build.** water-example.com can be optimized for conversion (SEO, ads, landing page). hub-example.com serves the community funnel.

---

## Subscription Boundary (Partial #7 Resolution)

Your hydration node spec from 2026-04-03 already defines the gating:

| Step | Access | What Users Get |
|------|--------|---------------|
| 1 | **Free** | ZIP lookup → contaminant report, bottled water cost, spring finder |
| 2 | **Email-gated** | Name + email → personalized filter recommendations, cost savings |
| 3-6 | **Post-conversion** | Health survey, contractor demo, premium content |

This naturally resolves the subscription question for the water pillar:
- Steps 1-2 are the free → email conversion funnel
- Steps 3-6 are post-conversion (email list, then upsell to subscription)
- The subscription boundary sits between Step 2 and Step 3

---

## Domain Setup

When ready, connect `water-example.com` via Cloudflare:
1. Add domain in Cloudflare dashboard → Custom Domains
2. Point DNS to Cloudflare Pages
3. Route `water-example.com/*` to the hydration node pages

This can happen any time after the component is built. It doesn't block development.

---

## What We Need From You

**Confirm or adjust:**
- Option 3 (both entry points) — yes / no / different idea?
- Is the Step 1 (free) → Step 2 (email) → Steps 3-6 (post-conversion) gating correct?
- Do you have the `water-example.com` domain in your Cloudflare account already?

---

## Impact

Confirming this:
- Unblocks the Hydration Node Phase A build (static UI scaffold)
- Partially resolves #7 (subscription boundary for water pillar)
- Clarifies #6 scope (Physical Sovereignty now includes hydration node)
