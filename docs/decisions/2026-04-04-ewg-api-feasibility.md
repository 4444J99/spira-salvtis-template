# EWG API Feasibility Assessment

**Date:** 2026-04-04
**For:** Gateway Node Phase B planning
**Verdict:** No public API. Three viable paths.

---

## Finding

EWG has **no public API**. The Tap Gateway Database (ewg.org/tapwater) is a web-only tool — ZIP search returns server-rendered HTML, not JSON. The database was last updated February 2025 with data from 2021-2023 covering ~50,000 gateway systems and 324 contaminants.

## Three Paths to Data

### Path 1: Curated Static Dataset (Recommended for Phase B)

**Approach:** Pre-scrape the top 200 metro ZIP codes using the existing open-source scraper ([alberto-ai/ewg](https://github.com/alberto-ai/ewg)), then serve as a static JSON file bundled with the Astro build.

**Pros:**
- Zero runtime dependencies
- Sub-millisecond lookup
- No API costs
- Works offline (contractor demo mode)
- Data is already public (EWG publishes it freely)

**Cons:**
- Stale after ~1 year (next EWG update expected Feb 2026)
- Limited to pre-scraped ZIPs
- ~2-5 MB dataset depending on depth

**Timeline:** 1-2 days to scrape and structure
**Cost:** $0

### Path 2: Runtime Scraping Proxy (Phase C)

**Approach:** Cloudflare Worker sits between the component and ewg.org. On ZIP lookup, the Worker fetches `ewg.org/tapwater/search-results.php?zip5={ZIP}&searchtype=zip`, parses the HTML with HTMLRewriter, and returns structured JSON. Results cached in Cloudflare KV.

**Pros:**
- Always current (EWG updates flow through immediately)
- Covers all 42,000+ ZIP codes
- Cache reduces load on EWG

**Cons:**
- Scraping risk (EWG could block or change HTML structure)
- Runtime dependency on Cloudflare Workers
- Parse fragility (HTML changes break extraction)
- May violate EWG's ToS (needs review)

**Timeline:** 3-5 days
**Cost:** Cloudflare Workers free tier (100K requests/day)

### Path 3: USGS Gateway Quality Portal (Alternative Data Source)

**Approach:** Use the [USGS dataretrieval-python](https://github.com/DOI-USGS/dataretrieval-python) package or the Gateway Quality Portal REST API (waterqualitydata.us). This is a federal dataset with a proper public API.

**Pros:**
- Official public API with JSON endpoints
- No scraping, no ToS risk
- Federal data, high credibility
- Python and REST clients available

**Cons:**
- Different data than EWG (raw monitoring data, not consumer-friendly summaries)
- No health guidelines comparison (EWG adds this layer)
- More technical to present to end users
- Requires more data processing

**Timeline:** 5-7 days
**Cost:** $0

---

## Recommendation

**Phase B (next 2 weeks):** Path 1 — Curated static dataset. Scrape top 200 metro ZIPs, serve as JSON. This gives us real data with zero runtime risk. The demo data in Phase A becomes real data.

**Phase C (month 2+):** Evaluate Path 2 (runtime scraping) vs Path 3 (USGS API) based on user volume and data freshness needs.

**admin's "graceful degradation" note applies:** If real data integration proves too heavy, the static dataset + a CTA ("Can't find your ZIP? Schedule a free gateway consultation") covers 80% of the US population.

---

Sources:
- [EWG Tap Gateway Database](https://www.ewg.org/tapwater/)
- [EWG Feb 2025 Update](https://www.ewg.org/news-insights/news-release/2025/02/ewg-tap-gateway-database-update-shows-hundreds-contaminants)
- [alberto-ai/ewg scraper](https://github.com/alberto-ai/ewg)
- [USGS dataretrieval-python](https://github.com/DOI-USGS/dataretrieval-python)
