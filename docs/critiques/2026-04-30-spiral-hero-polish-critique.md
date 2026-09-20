# Design Critique: Home / Spiral Hero (post-chakra ship, hybrid vessel default)

**Date:** 2026-04-30
**Target:** `src/pages/index.astro` + `SpiralIsland.astro` + `spiral.ts` + `Base.astro` chrome
**Stage:** Recently shipped (commit `070b98d` chakra spectrum + `ui.spiralVesselMode = 'hybrid'`) — polish pass
**Method:** Structural critique from code only. No live render in this pass — every visual claim is marked `[needs visual verification]`.

---

## Overall Impression

The page reads as a single coherent dark-teal scroll-poem: serif headline → animated 3D spiral → quiz invitation → quote → video → 4-pillar grid → 3-word framework → final CTA. Editorially it is calm, low-density, and intentional — the opposite of a SaaS landing. The biggest *structural* opportunity is **chromatic coherence**: the page now runs three parallel color systems (brand teal, chakra rainbow, per-node hex) that don't fully agree, and the most visually loud system (chakra) sits in the middle of the most visually quiet wrapper (ocean-900 + 40% white).

The single biggest *conversion* concern is that the hero h1 sits **above** the canvas and the primary CTA sits in a **separate section below** the canvas — meaning on most viewports the user sees title + spiral and must scroll to discover "Take the Quiz". The spiral itself is clickable per node (`CLICK_THRESHOLD = 8` in `spiral.ts:133`) but nothing in the markup telegraphs that affordance.

---

## Usability

| Finding | Severity | Recommendation |
|---|---|---|
| Primary CTA below the fold of the hero | 🟡 Moderate | Consider an in-canvas hint ("click a node, or take the quiz →") or a sticky semi-transparent CTA on the spiral itself. The spiral *is* clickable but invisible affordance = lost interactions. |
| 3D nodes have no keyboard activation | 🔴 Critical | `spiral.ts:2355` wires pointer events only. Tab through 13 nodes (in DOM order, per phase) is absent. Add a hidden focusable list inside `#spiral-container` that mirrors the SpiralFallback list, or move SpiralFallback into a visually-hidden but tab-reachable layer when 3D loads. |
| `aria-label` says "Gateway" is a phase | 🟡 Moderate | `SpiralIsland.astro:19` lists "Elevate, Align, Unlock, and Gateway". Gateway is a *node domain*, not a phase. Drop "and Gateway" to match the actual `Phase` type (`'ELEVATE' \| 'ALIGN' \| 'UNLOCK'`) declared in `hub.config.ts:22`. Otherwise screen readers learn the wrong taxonomy. |
| Two "Take the Quiz" CTAs route to `/quiz`, with shifting label | 🟢 Minor | First says "Take the Quiz", final says "Start the spiral" — same destination, different metaphor. Either align the copy or differentiate ("Take the Quiz" / "Skip to Node 1"). |
| `prefers-reduced-motion` only dampens animation, doesn't kill bloom pulse | 🟢 Minor | `spiral.ts:2362` sets `motionScale = 0.05` and disables `autoRotate`, but `UnrealBloomPass` still renders (subtle pulse from particle system damping). For photosensitive users, consider also lowering bloom strength when reduced-motion is set. |
| Fallback hidden on JS load, no recovery if Three.js init partially fails | 🟢 Minor | `SpiralIsland.astro:69` hides `#spiral-fallback` on dynamic-import resolve, BEFORE `initSpiral` runs. If `initSpiral` throws after the import resolves, user sees an empty hero. Move the `style.display = 'none'` line into the line after `initSpiral(...)` returns successfully, and wrap that in a try/catch that re-shows the fallback. |

---

## Visual Hierarchy

- **What draws the eye first** [needs visual verification]: most likely the 3D spiral canvas — it's `calc(100vh-240px)` tall, animated, with bloom + warm chakra orbs against ocean-900. The h1 above (`text-shadow: 0 0 60px rgba(17,154,158,0.15)`) is gentle and serif-light; the canvas wins on motion alone. *This is correct* for a brand introduction page.
- **Reading flow**: cleanly top-down, single column. No competing rails. Good.
- **Emphasis correctness**: the 4-pillar grid (line 87-91) gives Foundation, System, Structure, Vision **equal weight** in a 2×2. But Foundation Sovereignty is admin's commercial entry (gateway funnel ships first, branches are stocked, GHL hooks live), while System / Structure / Vision are status `'live'` but light on conversion infrastructure. Equal weight is editorial honesty; if conversion matters more, lean Foundation (subtle: order it first — already true; less subtle: spotlight card). *Decision is yours, not the layout's.*
- **Three color systems running in parallel** — this is the headline issue:
  1. **Brand teal palette** (`global.css:5-10`) — used for CTAs, eyebrows, dividers, and the "Elevate / Align / Unlock" framework words at `index.astro:98,102,106` (hardcoded `#119a9e`, `#8cc5d3`, `#3dbfc4`).
  2. **Chakra spectrum** (`spiral.ts:147-156`) — 8 interpolated stops, red→orange→yellow→green→blue→indigo→violet — drives the orb colors.
  3. **Per-node `hub.config.ts` colors** (`hub.config.ts:200-216`) — 13 explicit hex values that almost-but-not-quite trace the chakra arc; these drive the SpiralFallback border-left rims and PillarCard accents.
  
  System 1 and System 2/3 tell different stories about the *same phase*. In `SpiralFallback.astro:11-13` the ELEVATE phase eyebrow is teal (`#119a9e`), but in the 3D spiral the ELEVATE nodes are warm reds/oranges/yellows. Same word, two color signatures. *Cognitive mismatch.*
  
  **Recommendation**: pick one canonical phase color contract.
  - **Option A (chakra wins)** — kill the teal phase tags in `SpiralFallback.astro` and the framework words, use chakra anchors instead (Elevate = warm-orange anchor, Align = green anchor, Unlock = violet anchor). Most aligned with what the hero now shows.
  - **Option B (teal wins)** — keep brand teal as the phase label color, treat chakra as a *node-level* structure only. Reduce orb saturation in the 3D scene so nodes read as "members of teal phase X" rather than independent rainbow points.
  - **Option C (explicit dual contract)** — document that phase-words are brand, node-orbs are chakra, and visually unify by making the eyebrow-cap eyebrow in `index.astro:43,69,83,95` use a tiny color-dot from the relevant chakra family, signaling "this section maps to that band of the spectrum." Lowest churn.

---

## Consistency

| Element | Issue | Recommendation |
|---|---|---|
| Pillar 3 (Structure, `#6c4cd6` indigo) and Pillar 4 (Vision, `#c97ce8` lightened violet) | 🟡 Adjacent in hue, low separation [needs visual verification] | Either widen the gap (Vision → magenta `#d44ec8`-ish) or use *value* (Vision lighter, Structure darker) to keep them distinct in PillarCard hover-states and footer. |
| `PHASE_HEX` in `spiral.ts:136-140` and `phaseConfig` in `SpiralFallback.astro:10-14` and the hardcoded framework words in `index.astro:98,102,106` | 🟡 Three files holding the same teal trio | DRY: lift phase-color into `hub.config.ts` (e.g. `phaseColors: Record<Phase, string>`) and import everywhere. The framework words at `index.astro:98,102,106` should *not* be inline `style="color:..."`. |
| Eyebrow caps | 🟢 Consistent and clean | All four eyebrow labels use `text-[11px] font-medium tracking-[0.2em] uppercase text-ocean-500` — good system. Keep. |
| Two fonts only — Cormorant Garamond + Inter | 🟢 Clean | Good. The italic Cormorant pull-quote is the strongest typography moment on the page. |
| Vessel-mode UI surface | 🟡 Hidden affordance | `?vessel=` and `?nav=` query overrides exist (`SpiralIsland.astro:55-63`, `Base.astro:223-230`) but are invisible to a user who isn't reading source. For client demos this is fine; for production, this is a polish gap — either expose a small toggle or document that these are A/B-only. |

---

## Accessibility

- **Color contrast** [needs visual verification with WCAG checker]:
  - **Hero tagline** at `text-white/40` on `#071e22` — `rgba(255,255,255,0.4)` over `#071e22` computes to roughly `#666b6e` on a black-near-teal — likely ratio ≈ **3.1:1**. Fails WCAG AA for body text (needs 4.5:1).
  - **Quiz CTA description** at `text-white/40` (`index.astro:47`) — same problem.
  - **Framework descriptions** at `text-white/30` (`index.astro:99,103,107`) — almost certainly **fails AA and AAA**.
  - **Footer link defaults** at `text-white/15` to `text-white/20` (`Base.astro:251-256, 273`) — likely fails even AA Large.
  - **Recommendation**: bump all body-text opacities to ≥ 60% on ocean-900. Reserve 30%–40% for *truly tertiary* text (timestamps, footer copyright). Run `domus contrast` or any WCAG calculator on the four worst offenders before sign-off.
- **Touch targets**:
  - CTA pill (`CTAButton.astro:16`): `px-9 py-3.5 text-[13px]` — height ≈ 47px. **Passes** WCAG 2.5.5 (44×44).
  - Pillar cards: full-width on mobile, ≥ 80px tall. **Passes**.
  - Mobile nav links (`Base.astro:174-181`): `py-1.5 pl-4 text-[13px]` — height ≈ 32px. **Fails** WCAG 2.5.5 minimum. Bump `py-1.5` → `py-2.5` (≈ 44px).
- **Keyboard navigation**:
  - Skip-to-content link present (`Base.astro:233`). ✅
  - Hamburger toggle has `aria-expanded`. ✅
  - **3D spiral nodes have no keyboard path.** ❌ See Usability above.
- **Motion sensitivity**:
  - `prefers-reduced-motion` is honored in `spiral.ts:2362-2367`. ✅
  - Suggest also reducing `UnrealBloomPass` strength in that branch (currently bloom always renders).
- **Semantic structure**:
  - One `<h1>`, then `<h2>` per section. ✅
  - But the h2s have no `id` attributes, so deep-linking and table-of-contents are impossible. Low priority for a one-page hub but worth setting on the four section anchors (`#quiz-cta`, `#story`, `#architecture`, `#start`).
- **Image semantics**:
  - `#spiral-container` declares `role="img"` with a descriptive aria-label. ✅ (with the "Gateway phase" copy fix above).

---

## What Works Well

- **The fallback strategy is genuinely good.** `SpiralFallback.astro` renders all 13 nodes as a navigable card list before JS, hidden after WebGL succeeds. No-JS users get a full content surface, not a broken page.
- **The vessel-mode A/B system is elegant.** Build-time default in `hub.config.ts` (`ui.spiralVesselMode = 'hybrid'`) + querystring override = same code, four visual treatments, no redeploy. This is exactly the right shape for in-call client review.
- **Single brand voice in typography.** Cormorant + Inter, font-light, italic for one quote, no surprises. The serif italic at `index.astro:58-61` is the strongest typographic moment on the page — the hero h1 at line 27 could afford to be quieter, since the quote is doing emotional work.
- **The chakra commit is structurally honest.** It changed only `hub.config.ts` (84 lines, no markup churn). Color is a data concern, lives in data. Good separation.
- **`spiral.ts:129` ties `BG_COLOR = 0x071e22` to `--color-ocean-900`** with an inline comment about no-seam — that's the kind of cross-file note that prevents future drift. More of these, please.
- **Reduced-motion is wired.** `spiral.ts:2362` doesn't just *check*, it *acts* — autoRotate off, motionScale 5%. Few sites do this for 3D.
- **Analytics on CTAs.** `data-ea-action` attributes on `CTAButton.astro:14,15,23,24` give clean tracking without polluting React-style click handlers.

---

## Priority Recommendations

1. **Resolve the three-color-system mismatch.** Pick one canonical phase color contract (recommend Option C — eyebrow color-dots — for lowest churn) and DRY the phase colors into `hub.config.ts`. *Files: `hub.config.ts`, `spiral.ts:136-140`, `SpiralFallback.astro:10-14`, `index.astro:98,102,106`.* This is the single change that will most improve perceived coherence.

2. **Fix the four contrast offenders.** Bump body opacities ≥ 60% in: hero tagline (`index.astro:30`), quiz description (`index.astro:47`), framework descriptions (`index.astro:99,103,107`), footer link defaults (`Base.astro:251-256`, `273`). Reserve `text-white/30` and lower for truly tertiary content. Without this, the page fails an accessibility audit.

3. **Wire keyboard nav into the 3D spiral.** Add a visually-hidden but focusable list of 13 anchor links inside `#spiral-container` (or convert SpiralFallback into a `sr-only`-but-keyboard-reachable mirror layer when 3D loads). This unblocks the screen-reader and keyboard-only path that the rest of the page already supports cleanly.

4. **Fix the aria-label "Gateway phase" wording** at `SpiralIsland.astro:19`. Five-character change, prevents propagating a wrong taxonomy to assistive tech.

5. **Telegraph the click-on-node affordance** with a small caption below the spiral ("Click a node to explore — or take the quiz") OR a once-on-load tooltip ("← drag to rotate") that fades. Otherwise the click handler is invisible and the canvas reads as a passive animation.

---

## Caveats

This critique was produced from code reading without rendering the page. Confirm the following with a live visual pass:
- Whether the chakra reds (`#ff3b3b`) read as "fire / root chakra" or "alarm / danger" against `ocean-900` background.
- Whether Identity (`#6c4cd6`) and Vision (`#c97ce8`) pillar cards read as distinct or interchangeable.
- Whether the warm-side compression in `CHAKRA_HEX` (per the inline comment at `spiral.ts:142-146`) reads as "bottom-heavy fire" or "balanced spectrum" in the actual helix.
- Bloom intensity under `prefers-reduced-motion` — is it still pulsing visibly?

If you want me to run the dev server and re-do this with screenshots and a contrast checker, say the word.
