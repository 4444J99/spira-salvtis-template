# Water Report Fluoride-Miss Diagnosis

**Date:** 2026-05-01
**Trigger:** admin's 2026-05-01 voice memo: "the biggest issue with my ZIP Code is fluoride and I didn't see that pop-up. Fluoride is a very specific filter that you have to get a specific filter for so a lot of people spend a shit ton of money on the wrong filters and they don't even filter out what they want to filter."
**Verdict:** Three live hypotheses. Two are dispatched today via defensive patches. One remains gated on a single admin data point (her ZIP code + the badge state she saw).

---

## What we know

- The contaminant lookup endpoint is `POST /api/water-report`. Consumed at `src/components/HydrationNode.astro:399`. Implemented at `functions/api/water-report.ts` (Cloudflare Pages Function — legacy `functions/` directory pattern).
- The endpoint scrapes EWG's tap-water HTML at `https://www.ewg.org/tapwater/search-results.php?zip5={ZIP}&searchtype=zip`, parses with a complex regex against `class="contaminant"` / `class="name"` / `class="amount"` / `class="legal"` / `class="health"`, caches to Cloudflare KV (`EWG_CACHE`) for 24h, and returns a `WaterReport` with `contaminants[]` plus `isDemo: boolean`.
- On parse failure, network failure, or zero contaminants extracted, the server returns `DEMO_REPORT` with `isDemo: true`. **DEMO_REPORT contains a fluoride row** (`functions/api/water-report.ts:146` — `{ name: 'Fluoride', detected: 700, ... }`).
- The contaminant-effects map at `functions/api/water-report.ts:38-57` **does include fluoride** — `'fluoride': ['neurological', 'hormonal']`. So even if fluoride is parsed from the HTML, it gets its effects correctly.
- admin said fluoride did NOT appear in her result. So she was NOT looking at DEMO_REPORT (which has fluoride).
- **Critical caveat:** Per `CLAUDE.md`, "the Astro `_worker.js` takes precedence over the `functions/` directory" in production. The legacy Pages Function may be orphaned in the deployed worker bundle. The `dist/` build artifact contains no `water-report*` file.

## Three live hypotheses

### H1. Production route is shadowed (legacy Pages Function not served by worker)

**Mechanism:** `_worker.js` from the Astro adapter overrides the `functions/api/water-report.ts` route. `/api/water-report` returns Astro's default 404 (HTML), which crashes `response.json()` in `HydrationNode.astro:404` → catch block fires.

**The catch-block fallback list (HydrationNode.astro:434-440 prior to today's patch) was hardcoded to 5 contaminants — and fluoride was NOT in that list.** This matches admin's symptom exactly: she ran the lookup, it visually "worked," and fluoride was never shown.

**Discriminator:** Badge in the result card shows "Sample Data" with no specific reason. Because the server never replied with `isDemo: true` (it never replied with valid JSON at all), the original badge logic at line 416 only fired the "Sample Data" branch from the catch block at line 433. To the user, "Sample Data" felt like a server response state, not an error state.

**Today's defensive fix (shipped):** Fluoride added to the catch-block fallback (HydrationNode.astro:434-441). Even if H1 is the cause, future visitors will at least see fluoride listed. The permanent fix (route migration `functions/api/water-report.ts` → `src/pages/api/water-report.ts`, mirroring the precedent set by `src/pages/capture.ts` per CLAUDE.md) is held until evidence confirms H1.

### H2. Route works, parser silently fails on admin's utility

**Mechanism:** EWG redesigned the tap-water HTML structure (the 2026-04-04 EWG feasibility doc explicitly flagged this risk: "Parse fragility (HTML changes break extraction)"). The complex regex against `class="contaminant"`/`name`/`amount`/`legal`/`health` returns zero matches → `parseEwgHtml()` returns null → server falls back to `DEMO_REPORT` with `isDemo: true`. **DEMO_REPORT has fluoride.** So if H2 were true, admin would have seen fluoride.

**Status:** H2 is partially exonerated. The only way H2 stays alive is if admin's specific recall is wrong AND she actually saw "Sample Data" badge AND simply didn't notice the fluoride row in the demo list.

### H3. Route works, parser works, EWG genuinely returns no fluoride for admin's utility

**Mechanism:** Some utilities don't test for or report fluoride to EWG. The parser extracts what's there. Fluoride is silently absent from `contaminants[]`. The UI gives no "here are common contaminants we did NOT find" disclaimer — absence reads to the user as "we didn't check for fluoride," which is misleading.

**Discriminator:** Badge shows "ZIP {N}" (live data, real `isDemo: false`). If admin saw that badge, H3 is the diagnosis. The fix shape is then UI-only: a "common contaminants we checked but weren't detected" sub-list, plus a "fluoride may not appear in your report — get a fluoride-specific filter regardless" callout that protects against admin's stated concern (people buying wrong filters).

**Status:** Untestable without either admin's badge state or her ZIP for reproduction.

## What ships today (correct under all three hypotheses)

1. **Fluoride added to client-side catch fallback** (`src/components/HydrationNode.astro:434-441`). Defensive — costs nothing, helps in H1.
2. **Three-state data-source banner** (`src/components/HydrationNode.astro` markup + `setDataSourceState()` helper). The result card now distinguishes:
   - `live` — green-equivalent: `ZIP {N}` badge in white/40, no banner.
   - `demo-server` — amber: "Sample data" badge + amber banner explaining EWG returned nothing for this ZIP, with explicit note that contaminant *absence* in this state is not informative.
   - `demo-fallback` — red: "Sample data — connection error" badge + red-tinted banner explaining the lookup service was unreachable, contaminants are a default sample.
   This makes the H1 vs H2 vs H3 discriminator visible to *every* user, not just for diagnosis.
3. **Spiral hybrid particle opacity tune** (`src/components/spiral/spiral.ts:1325`, 0.3 → 0.15). Unrelated to this bug; addresses admin's parallel "easily identifiable" feedback. Bundled because it's the single shipping commit.

## What does NOT ship today

- **Route migration `functions/api/water-report.ts` → `src/pages/api/water-report.ts`.** Deferred until evidence confirms H1. Migration is mid-risk (production endpoint) and addresses only one hypothesis.
- **Fluoride-specific UI disclaimer** ("get a fluoride filter regardless"). Deferred — this is the H3 fix and shouldn't ship pre-emptively.
- **"Common contaminants checked but not detected" sub-list.** Same — H3-specific.

## Outbound to admin (one question ends the ambiguity)

Send: ZIP code + badge-state question. The three states surface differently in the patched UI; she'll know on her next attempt which she's seeing. If she still has the previous result open, the badge color/banner state tells the story directly.

## References

- `functions/api/water-report.ts` — current implementation (legacy Pages Function pattern)
- `src/components/HydrationNode.astro:112-135` — result card markup; `:375-444` — script handlers
- `docs/decisions/2026-04-04-ewg-api-feasibility.md` — original feasibility doc; recommended Path 1 (curated static dataset). Production shipped Path 2 (runtime scraping). Path drift = open governance question.
- `CLAUDE.md` — "the Astro `_worker.js` takes precedence over the `functions/` directory" — the H1 mechanism is documented but unaddressed in production.
- `src/pages/capture.ts` — precedent for the route-migration shape, if H1 is confirmed.
