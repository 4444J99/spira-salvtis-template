# Client Walkthrough v4 — What Changed and Why

**Prepared for:** admin  
**Date:** April 2026  
**Site:** hub-example.com (Cloudflare Pages)

---

## The Big Picture

Your site has been fundamentally restructured based on what your intake documents actually say you want. The previous version led with the spiral methodology — practitioner-facing architecture. Your intake materials reveal something different: **gateway is the primary offering you sell**. The spiral is how you think about the work; gateway is how your clients enter it.

Everything below flows from that single insight.

---

## What Changed

### 1. Homepage — Spiral as Hero (was: gateway-first)

The homepage now opens with a dramatic 3D interactive spiral — 13 nodes across four phases (Elevate, Align, Unlock, Gateway). Visitors see the full scope of your practice at a glance. Each orb is clickable, navigating to that node's dedicated page.

**Why:** The spiral is the architecture of your entire practice. Leading with it positions you as a practitioner with a complete system, not just a gateway seller. Gateway has its own dedicated space (see #2).

**Technical:** Three.js 3D renderer, 156 particle auras, orbital motion, mobile touch support. Falls back to a static card list if WebGL isn't available.

### 2. Gateway ��� Dedicated Mini-Funnel (was: mixed into homepage)

Gateway now lives at `/gateway/` with its own focused experience:
- Hero: "Gateway changed everything for me"
- Video embed for your gateway story
- Education section on H2 and cellular gateway
- **HydrationNode funnel**: visitors enter their ZIP code → get a localized gateway report → receive filter recommendations matched to their contaminants → name + email capture
- 6 branch deep-dives (gut/hormones, archetype-delta, archetype-alpha, archetype-beta, cancer support, archetype-zeta)
- Research section with citeable references

**Why:** Gateway-curious visitors get a complete, focused journey without distraction from the broader spiral. The ZIP-based gateway report creates immediate personal relevance.

### 3. Quiz — Entry Point Routing (was: nonexistent)

At `/quiz`, visitors provide name + email, then choose which pillar resonates: Body, Mind, Structure, or Income. Each routes to the relevant pillar page.

**Why:** You asked for a quiz. This version captures the lead before routing — so even if they don't complete the quiz, you have their contact. The pillar routing replaces a complex branching assessment with a simple self-selection that still personalizes the experience.

### 4. Spiral Nodes — Individual Pages (was: overview only)

Each of the 13 spiral nodes now has a dedicated page at `/nodes/[id]` with content drawn from your original materials. Node 5 (Gateway/Non-Negotiable) links directly to the gateway funnel.

**Why:** The spiral overview tells the story; node pages let visitors dive deep into what resonates.

### 5. Accessibility & Polish (this pass)

- **Data integrity fix**: The gateway funnel's email capture form was silently losing lead data (form fields had no name attributes — now fixed)
- **Skip-to-content link** for keyboard navigation
- **ARIA labels** on the 3D spiral container and navigation hamburger
- **Reduced motion support**: visitors who prefer less animation get a calmer experience
- **Mobile viewport fix**: spiral container uses dynamic viewport height to prevent layout jumps when the mobile address bar shows/hides

---

## What's Waiting on You

| Item | What's Needed | Status |
|------|---------------|--------|
| GHL Quiz URL | You're building a quiz in GoHighLevel — once the URL is ready, we drop it into `/gateway/quiz` | Placeholder active |
| Documentary Video | You mentioned filming — once you have the file, we embed it on the gateway page | Placeholder active |
| Affiliate URLs | You're setting up affiliate accounts — once active, we wire them into product recommendations | Structure ready |
| Stripe/GHL Payments | Decision: Stripe checkout or GHL payments for subscriptions? | Awaiting your call |

---

## What's Live Right Now

- hub-example.com → Cloudflare Pages (auto-deploys on every code push)
- 28 pages: homepage, quiz, 12 node pages, 4 pillar pages, gateway hub + 6 branches + gateway quiz, business landing, research bibliography
- All pages mobile-responsive with touch interaction on the spiral
- Email capture at quiz entry and gateway funnel
- Research citations lazy-loaded from curated bibliography

---

## Architectural Decisions (for the record)

1. **Astro 5 static site** — zero JavaScript shipped by default, fastest possible load times
2. **Three.js for the spiral only** — loaded as a client island, doesn't slow down other pages
3. **Content in Markdown** — you (or anyone) can edit page copy without touching code
4. **Cloudflare Pages** — free hosting, global CDN, auto-deploy from GitHub
5. **No framework lock-in** — if you ever want to move platforms, the content is plain Markdown files
