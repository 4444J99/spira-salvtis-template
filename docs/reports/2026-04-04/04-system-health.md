# System Health & Architecture Report

**Date:** 2026-04-04
**Project:** sovereign-systems--spiral-template
**Organ:** III (Commerce / Ergon) | **Tier:** standard | **Status:** ACTIVE | **Promotion:** LOCAL

---

## 1. Site Architecture

| Layer | Technology | Status |
|-------|-----------|--------|
| Framework | Astro 5.0.0 | Production-ready |
| Styling | Tailwind CSS 4.0.0 (CSS-first config via `@tailwindcss/vite`) | Production-ready |
| Language | TypeScript (strict) | Production-ready |
| Deploy | Cloudflare Pages | Deployed (`sovereign-systems-spiral.pages.dev`) |
| Functions | Cloudflare Pages Functions | 1 function (`functions/capture.ts` — email capture) |
| CMS | None (Markdown content collections) | Keystatic deferred to post-launch (GH#11) |
| Domain | `hub-example.com` (GoDaddy DNS) | Not connected (GH#3) |

### Build Pipeline

```
npm run prebuild → generates citations.json (custom preprocessing)
npm run build    → Astro production build → dist/
npm run preview  → local preview of production build
npm run dev      → dev server at localhost:4321
```

The `prebuild` step is notable — it extracts citation data into a JSON file consumed by a lazy-loaded tooltip system. This is a custom build-time content pipeline, not standard Astro.

---

## 2. Page Inventory

**8 route files** produce **15+ pages** via dynamic routing:

| Route | File | Status | Notes |
|-------|------|--------|-------|
| `/` | `src/pages/index.astro` | Live | Hub — spiral + 4-pillar grid |
| `/pillars/physical` | `src/pages/pillars/[slug].astro` | Live | Dynamic route (Zod-validated) |
| `/pillars/inner` | `src/pages/pillars/[slug].astro` | Live | |
| `/pillars/identity` | `src/pages/pillars/[slug].astro` | Live | |
| `/water/` | `src/pages/water/index.astro` | Live | Physical Sovereignty / water funnel home |
| `/water/explore` | `src/pages/water/explore.astro` | Live | Branch explorer (6 branches) |
| `/water/quiz` | `src/pages/water/quiz.astro` | Live (stub) | GHL quiz embed — URL TBD |
| `/water/gut-hormones` | `src/pages/water/[slug].astro` | Live | Dynamic branch pages (6 total) |
| `/water/fertility` | ↑ | Live | |
| `/water/athletic` | ↑ | Live | |
| `/water/autoimmune` | ↑ | Live | |
| `/water/cancer-support` | ↑ | Live | |
| `/water/sustainability` | ↑ | Live | |
| `/business/` | `src/pages/business/index.astro` | Live | Financial Sovereignty / EauCo Hub |
| `/research` | `src/pages/research.astro` | Live | Research citations page |

### Pages That Need to Exist (blocked by GH#13)

| Route | Purpose | Gate |
|-------|---------|------|
| `/spiral/node-1` through `/spiral/node-13` | Node deep-dive pages | GH#13 |
| `/water/hydration-node` | Hydration Node tool | GH#13 + GH#17 |
| `/about` | About / Philosophy | No gate (low priority) |
| `/tools` | Free tools + self-assessments | No gate (content ready) |

---

## 3. Content Collections

Defined in `src/content.config.ts` with Zod validation:

### Branches Collection (6 files)
**Schema:** `title` (string), `emoji` (string), `hook` (string), `status` (live|placeholder), `tone` (standard|soft), `order` (number)

| File | Status | Content State |
|------|--------|---------------|
| `gut-hormones.md` | live | Studio-written; ~25 atoms ready for enrichment |
| `fertility.md` | live | Studio-written; ~20 atoms ready |
| `athletic.md` | live | Studio-written; ~15 atoms ready |
| `autoimmune.md` | live | Studio-written; ~20 atoms ready |
| `cancer-support.md` | live | Studio-written; ~10 atoms ready |
| `sustainability.md` | live | Studio-written; ~10 atoms ready |

### Pillars Collection (3 files + hub config)
**Schema:** `title` (string), `emoji` (string), `tagline` (string), `status` (live|placeholder), `order` (number)

4 pillars defined in `src/data/hub.config.ts` with citation IDs. Pillar pages rendered via dynamic route.

---

## 4. Design System

### Tokens (defined in `src/styles/global.css` via Tailwind @theme)

| Category | Values |
|----------|--------|
| Colors | Ocean shades (900→100), sand-50, gold variants |
| Typography | Cormorant Garamond (headings), Inter (body) |
| Effects | Glass morphism (`.glass-card`), grain texture overlay, radial glow backgrounds |
| Layout | Responsive, mobile-first, fixed navigation with hamburger menu |

### Components
| Component | Purpose |
|-----------|---------|
| `spiral/spiral.ts` | Canvas spiral animation (vanilla TS, no deps) |
| `spiral/SpiralIsland.astro` | Astro island wrapper (client:idle) |
| `spiral/SpiralFallback.astro` | Static SVG fallback for no-JS |
| Citation tooltip system | Lazy-loaded JSON, interactive desktop/mobile |
| Navigation | Responsive hamburger, fixed position |

---

## 5. Domain Strategy

| Domain | Purpose | DNS | Connected |
|--------|---------|-----|-----------|
| `hub-example.com` | Hub — spiral + all pillars | GoDaddy | No (GH#3) |
| `water-example.com` | Water funnel (`/water/` alias) | TBD | No |
| `business-example.com` | Business funnel (`/business/` alias) | TBD | No |
| `sovereign-systems-spiral.pages.dev` | Cloudflare Pages default | Cloudflare | Yes (active) |

**Architecture decision pending (GH#17):** Whether `water-example.com` routes to `/water/` as an alias or becomes a standalone experience with the Hydration Node tool.

---

## 6. Infrastructure

### Serverless Functions
- `functions/capture.ts` — Cloudflare Pages Function for email capture (1,133 bytes)
- No other functions deployed
- Extensible for Hydration Node API endpoints (ZIP lookup, filter recommendations)

### Citation System
- `scripts/parse-citations.ts` → `src/data/citations.json` (prebuild step)
- Lazy-loaded tooltip system with interactive desktop/mobile support
- Citations referenced by ID in `hub.config.ts` (per pillar and branch)

### External Integrations
| Service | Status | Purpose |
|---------|--------|---------|
| GHL (Go High Level) | Partial | CRM/funnel — quiz form URL empty in config |
| Stripe | Not connected | Future payments |
| Cloudflare Pages | Active | Hosting and deploy |
| EWG Database | Not connected | Future Hydration Node (ZIP → contaminant lookup) |

---

## 7. Board State

### Overview
- **Total issues:** 19 open (+ 2 closed: #2, #4)
- **Critical path:** `#13 → #15 → #6`
- **P0 blockers:** #13 (node architecture — requires admin), #5 (revenue agreement — requires admin)

### Issues by Phase

| Phase | Issues | Status |
|-------|--------|--------|
| α (Alpha) — Foundations | #3, #5, #13, #14 | #3 unblocked, #5/#13 awaiting admin, #14 media access |
| β (Beta) — Build | #6, #7, #8, #9, #15, #16, #17, #18, #21 | All blocked by #13 or downstream |
| γ (Gamma) — Backlog | #10, #11, #19, #20 | Deferred |
| ω (Omega) — Cleanup | #12 | Citation correction |

### Bottleneck Analysis

The board has a **single-point-of-failure on admin's decisions.** Issues #5, #13, #14, #18, #19, and #20 all require client input. Of the 19 open issues, only 5 can advance without her:
- #3 (domain connection — technical only)
- #12 (citation correction — editorial only)
- #21 (N/A atom routing — internal decision)
- Social content calendar (no issue — ungated work)
- Branch/pillar enrichment (no issue — ungated enrichment)

---

## 8. Seed.yaml Edge Fulfillment

### Produces (5 declared, 0 fulfilled)

| Target | Signal | Status | Blocker |
|--------|--------|--------|---------|
| ORGAN-V | case-study / process-documentation | **UNFULFILLED** | Site not launched, no narrative written |
| ORGAN-VII | client-launch-announcement / distribution-signal | **UNFULFILLED** | Nothing to announce yet |
| ORGAN-VI | client-success-material / community-growth | **UNFULFILLED** | No success to share yet |
| ORGAN-I | practice-validates-theory / research-feedback | **UNFULFILLED** | No research feedback formalized |
| ORGAN-IV | xenograft-protocol / process-pattern | **UNFULFILLED** | Pipeline exists but not documented as a reusable protocol |

### Consumes (1 declared)

| Source | Type | Status |
|--------|------|--------|
| ORGAN-III/commerce--meta | governance (contracts, SOPs, client lifecycle) | **PARTIALLY CONSUMED** — SOPs written, contract pending (#5) |

### Assessment
The seed.yaml declares this project as the proof case for the eight-organ model. None of the produces edges have been fulfilled. The extraction/atomization pipeline (xenograft protocol) is the closest to fulfillment — it's a generalizable process for any organ receiving alien material — but hasn't been documented as a reusable pattern yet.

**Risk:** If this project completes without emitting its declared signals, the entailment matrix is aspirational rather than deductive. The systems theorist critique in seed.yaml's polis section explicitly calls this out.

---

## 9. Risk Register

| # | Risk | Severity | Likelihood | Mitigation |
|---|------|----------|------------|------------|
| R1 | Client decision bottleneck | HIGH | HIGH | Package decisions into one session (#5, #13, #18) |
| R2 | Unfulfilled produces edges | MEDIUM | HIGH | Schedule case study and distribution after launch |
| R3 | Editorial liability (104 FLAGGED atoms) | MEDIUM | MEDIUM | Editorial review session before any flagged content goes live |
| R4 | Governance drift (board vs local vs external handoff) | LOW | MEDIUM | Maintain single-source registry + regular sync |
| R5 | Revenue agreement remains verbal | HIGH | HIGH | Prepare written agreement for admin's confirmation |
| R6 | Hydration Node scope creep (static pages → full application) | MEDIUM | MEDIUM | Treat as Phase 2 after core spiral is live |
| R7 | 63 N/A atoms unrouted | LOW | LOW | Route via GH#21, most are cross-cutting build instructions |
| R8 | Domain connection delay | LOW | LOW | Site functional on pages.dev; custom domain is cosmetic |

---

## 10. Recommendations (Prioritized)

### Immediate (this week)

1. **Package client decisions.** Prepare a single "Decision Session" document with the 3 blocking asks (#5 revenue, #13 node architecture, #18 editorial review). One call, three decisions, unblocks the entire board.

2. **Ship social content calendar.** ~200 SCRIPT atoms organized by platform → `docs/social-content-calendar/`. No gates, immediate client value, proves the atom→deliverable pipeline.

3. **Enrich branch pages.** Inject ~120 PARTIAL atoms into the 6 existing branch pages. No gates, deepens the live site with admin's actual research.

### After Client Decisions

4. **Build 13 node deep-dive pages.** The core site experience. Each page draws from 25-45 atoms in the Science | Sacred | Soul Practice schema.

5. **Merge V5/V6 spiral prototypes.** V6 shell + V5 data + V5 modal renderer → production interactive spiral.

6. **Connect custom domains.** hub-example.com via Cloudflare DNS.

### Before Launch

7. **Editorial triage.** 104 FLAGGED atoms reviewed with admin (keep/reframe/defer). 177 UNVERIFIED atoms source-checked.

8. **Analytics and conversion tracking.** Currently absent — no measurement of funnel performance.

9. **Fulfill ORGAN-V edge.** Write the case study documenting the solo-practitioner consulting model.

### Defer

10. **Hydration Node tool.** Full application with ZIP lookup, filter recommendations, health survey. Build after core spiral is proven.

11. **Subscription model.** Free/paid tiers require the node architecture and content to exist first.

12. **Standalone products.** Inner Child Book, Astrology Hormone Moon Planner — packaging decisions after core site.

---

*Generated: 2026-04-04 | Organ: III | Formation: sovereign-systems--spiral-template*
