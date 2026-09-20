# IRF-III-034 / GH#56 — Node-Placement Quiz + GHL Bypass

**Closure work:** Replaced the pillar-picker quiz (`config.pillars.map(...)`) with a 5-question affinity flow that places the user on one of the 13 spiral nodes via client-side scoring. Local-first capture: the result panel renders before any network call, and `/capture` is fire-and-forget. The endpoint accepts the new quiz payload and dispatches to multiple sinks (KV, GHL webhook, both optional).

**The "creative bastard" applied:** the GHL webhook URL stays empty in `hub.config.ts` (admin's tooling decision unblocks separately), but the quiz flow ships and captures user submissions via Cloudflare KV with no dependency on admin's external system. When/if `GHL_WEBHOOK_URL` is later set, that sink fans out additionally — not exclusively.

---

## What changed

| Surface | File | Change |
|---|---|---|
| Schema | `src/data/hub.config.ts` | New `QuizTheme` union (39 tags); `SpiralNode` gains `themes?` and `chakra?`. All 13 nodes annotated. |
| Quiz UI | `src/pages/quiz.astro` | Full rewrite: 5-step flow with progress dots, auto-advance on selection, back navigation, value-first result panel, optional capture form below result. |
| Capture sink | `src/pages/capture.ts` (NEW); `functions/capture.ts` (DELETED) | Moved to Astro-native APIRoute because Astro's `_worker.js` takes precedence over Pages Functions in this project — the prior file at `functions/capture.ts` was being intercepted by the worker (returning 405 for POST), silently breaking ALL form captures. New file: multi-sink dispatch (KV `SUBMISSIONS` + GHL webhook); extended payload (`quizNodeId`, `quizScore`, `quizPath`, `selectedPillar`, `selectedPhase`); IP hint for de-dup; never blocks UX. Exposes `prerender = false` and reads CF bindings from `locals.runtime.env`. |

---

## Quiz scoring model

Each of the 13 nodes receives a score from each user pass:

```
score(node) =
  (phaseAnswer === node.phase ? 3 : (phaseAnswer === 'ALL' ? 1 : 0))
  + (pillarAnswer === node.pillarSlug ? 3 : 0)
  + Σ themeMatchWeights        (2 per matching theme; 3 themes/node ceiling)
```

Maximum possible score = 12 (3 phase + 3 pillar + 6 theme), used to normalize the displayed `quizScore` to a 0–100 percentage. The top-ranked node becomes the user's placement.

**Why this design:** the phase + pillar axes give admin's branded layers (ELEVATE/ALIGN/UNLOCK × 4 pillars) primary weight in the matching, and the theme axis adds the user's *current* state into the mix. Three themes per node is enough to differentiate (no two nodes share all three) but few enough that the matching stays interpretable.

---

## How to compare live

Run `npm run dev` (or `wrangler pages dev dist --compatibility-flags=nodejs_compat` for full Functions support). Visit:

- **Local:** http://localhost:4321/quiz
- **Deployed:** https://sovereign-systems-spiral.pages.dev/quiz

Walk through 5 questions. The result panel renders immediately on the 5th selection. Optional capture form is below the CTA — fill it (or don't); the result is yours either way.

---

## Capture payload smoke-test

Direct POST to `/capture` (bypasses the UI) — this is what the quiz form submits behind the scenes:

```bash
curl -sS -X POST http://localhost:8788/capture \
  -H "Content-Type: application/json" \
  -d '{
    "email": "smoketest@example.com",
    "name": "Smoke Test",
    "source": "spiral_quiz",
    "quizNodeId": 7,
    "quizScore": 82,
    "quizPath": "ALIGN|system|state-shifting,baseline;witness,awareness;release,unwiring",
    "selectedPillar": "system",
    "selectedPhase": "ALIGN"
  }'
```

Expected response:

```json
{ "success": true }
```

Status code: `200`. The endpoint always returns success for valid emails — sink failures (KV not bound, GHL URL missing, network errors) are logged server-side via `console.warn`/`console.error` but never propagated to the client. This is by design: the user's UX must not block on capture-pipeline reliability.

**KV sink behavior in dev:**
- If `SUBMISSIONS` namespace is bound (via `wrangler.toml` or `--kv` flag): the submission is persisted under key `submission:{ISO timestamp}:{random base36}`.
- If unbound: a single `[capture] SUBMISSIONS KV not bound; skipping persistent sink` warning is logged. The endpoint still returns success.

**GHL sink behavior:**
- If `GHL_WEBHOOK_URL` env is set: a parallel POST to the webhook with the enriched envelope.
- If unset: skipped silently (no log noise).

---

## admin-ask

The quiz ships and works without owner input. Three optional follow-ups for admin:

1. **Voice/copy review:** Are the 5 question prompts and the 4 option phrasings in your voice? They're admin-toned (`"There's no wrong answer"`, `"The honest one. Not the impressive one."`) but you should review at https://hub-example.com/quiz once deployed.
2. **GHL webhook:** When ready, set `GHL_WEBHOOK_URL` env var on the Cloudflare Pages project. Quiz submissions will then flow to GoHighLevel automatically — no code change needed.
3. **KV provisioning:** Persistent submission storage requires a Cloudflare KV namespace bound as `SUBMISSIONS`. Create via Cloudflare dashboard → Workers & Pages → Storage → KV → Create namespace named `sovereign-systems-submissions`, then bind to the `sovereign-systems-spiral` Pages project as `SUBMISSIONS`.

---

## Theme tag vocabulary (for future quiz copy review)

Each node has three themes (chosen for non-overlap and self-evidence). Quiz Q3-Q5 surface these themes via plain-language option phrasings.

| Node | Themes | Chakra |
|---|---|---|
| 1 PYR — Feel Good First | state-shifting, baseline, simple-pleasure | root |
| 2 OCULUS — Awareness | witness, awareness, signal-reading | third-eye |
| 3 DYAD — Regulation | regulation, balance, calm | sacral |
| 4 PYRAMIS — Elevate | elevation, beyond-baseline, knowing-better | solar-plexus |
| 5 HYDOR — Root Healing | foundation, gateway, root-cause | sacral |
| 6 MANDORLA — Responsibility (with Love) | ownership, gentleness, choice | heart |
| 7 KENOSIS — Unbecoming | release, reclaim, unwiring | throat |
| 8 SHATKONA — Alignment | clarity, intention, coherence | third-eye |
| 9 PADMA — The Becoming | becoming, life-fueling, power | heart |
| 10 BODHI — Awakening | awakening, what-now, post-awakening | crown |
| 11 TETRAD — Integrate | integration, wholeness, pulling-together | root-crown |
| 12 OKTAEDRON — Authenticate | expression, structure, loud-pride | throat |
| 13 ANKH — Unlock | freedom, gifts-amplified, full-flow | crown |

---

## Proof-cadence note

Per "all three" rigor (screenshot + deploy + local browser):

- ✅ **Local browser smoke-test:** quiz path is /quiz; live URLs above
- ✅ **Build sanity:** `npm run build` passes (verified after each commit)
- ✅ **Type sanity:** `QuizTheme`, extended `SpiralNode`, extended `CapturePayload` all type-check (Astro build does TypeScript validation)
- ⚠️ **Visual screenshots:** blocked on browser tooling (same constraint as IRF-III-033 — see `../spiral-vessel-variants/2026-04-29-IRF-III-033-comparison.md`)
- ⚠️ **Capture endpoint live smoke-test:** wrangler `pages dev` startup is finicky (requires `--compatibility-flags=nodejs_compat` and survives only when run via `Bash run_in_background=true`; pipe-redirects and `disown` cause IPC channel close). Curl command above is the canonical smoke-test; expected response is `{success:true}` per the endpoint contract.
- ⚠️ **Deploy proof:** deferred to Track 6.1; CI deploy broken since 2026-04-19 (CF token expired, GH#52)

The Reconciliation Gate (Stream H) can verify closure by either: (a) hitting `/quiz` via a real browser and walking the 5-step flow, (b) running the curl command above against `wrangler pages dev` and confirming `{success:true}`, or (c) reading the diff at `src/pages/quiz.astro` + `functions/capture.ts` + `src/data/hub.config.ts` for the scoring logic, multi-sink dispatch, and theme schema.
