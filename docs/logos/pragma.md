# Pragma — The Honest Account of What Exists

*Last updated: 2026-06-05*

## What Is Built

Hub-and-spoke Astro 6 site deployed to Cloudflare Workers + Static Assets. The build now generates **~51 routes** (prerendered pages + 2 server APIRoutes — `/capture` and `/api/water-report`; recount from `npm run build` output rather than trusting the figure) across 3 domains:

| Domain | Purpose | Connected |
|--------|---------|-----------|
| hub-example.com | Central hub | No (CF dashboard pending) |
| water-example.com | Water filtration funnel | Configured |
| business-example.com | Financial Sovereignty / business arm | Not yet |

### Architecture

- **13-node golden-angle spiral** — Phase 1 ELEVATE (5 nodes live), Phases 2-4 (8 nodes locked)
- **Spiral-first homepage** — canvas hero (80vh), quiz CTA, pillar phases, video placeholder
- **Water page** scoped to mini version — Hero, video, education, HydrationNode funnel, research
- **Quiz routing** — name+email gate, pillar routing options at `/quiz`
- **6-step HydrationNode funnel** — ZIP lookup via EWG API, email-gated filter recommendations, 5 filter tiers, spring locator
- **Content collections** — 6 branch pages, 4 pillar pages, 12 node pages
- **Email capture** — Astro APIRoute at `src/pages/capture.ts` (`POST /capture`), bundled into the SSR worker; posts to GHL webhook (no `functions/` directory)

### Quantitative State

| Metric | Value |
|--------|-------|
| Routes | ~51 (regenerate from `npm run build`) |
| Spiral nodes | 13 (5 live, 8 locked) |
| Atomized wants | 65 total, 48 in-scope |
| Wants addressed | 22 DONE |
| Wants blocked | 9 (awaiting admin) |
| Open issues | 23 |
| Closed issues | 16 |
| Client walkthroughs | 3 (v1, v2, v3) |

### What Does Not Exist

- Written revenue agreement (GH#5 — agreed in principle, not formalized)
- Case study (III to V signal)
- Distribution signal (III to VII)
- Research feedback (III to I)
- Analytics or conversion tracking
- Custom domain connection
- admin's GHL quiz URL, documentary video, Phase 2-4 node names
