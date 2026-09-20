# Design Critique: Spiral Node Animation — Intent vs. Shipped (the "massive gap")

**Date:** 2026-05-29
**Target:** `src/components/spiral/spiral.ts` + `src/data/hub.config.ts` (`ui.spiralVesselMode`) + `src/data/icon-worlds.ts` + `src/data/sacred-geometry-primitives.ts`
**Stage:** Frozen since 2026-05-01. Last visual parameter change was the chakra spectrum + hybrid default (`070b98d`, Apr 30); the only commits touching `spiral.ts` since are the Astro 6 migration (`dfbb08e`, May 24) and an installability fix (`35b4cef`) — both mechanical ports, zero animation change.
**Method:** Intent corpus reconstructed verbatim from the pre-assessed prompt corpus (`organvm-corpvs-testamentvm/data/corpora/week-2026-04-19_to_2026-04-26/prompts-raw.jsonl`) + Codex specstory exports (`.specstory/history/*.md`) + the May-1 evolution timeline. Implementation read from code only — no live render in this pass; visual claims are derived from configured parameters and marked where inference is involved.

---

## Overall Impression

The gap is not missing work — it is **suppressed work**. Across the late-April cascade the user specified, and the engine implemented, a per-node "universe inside the shape": 600 spring-bound particles per node, per-node physics (8 behaviors), per-node phase mix (gas/solid/liquid), generative uniqueness. Almost all of it is **live in the code**. But the shipped default (`vesselMode: 'hybrid'`) renders that universe at **~14% opacity behind an opaque shell**, with bloom dialed to near-zero. The single most-specified intent — *"remove the shape surface… we'll be able to see the shape prevail"* — is inverted in the default: the surface the user wanted removed is the star of the render, and the materia that was meant to **be** the icon is a ghost.

Three config values and one orphaned geometry path account for nearly the entire delta. None of them is a missing feature; all are dials turned the wrong way or code left unwired.

---

## The Intent Corpus (every instance, verbatim)

This is the complete set of prompts where the user described what the node animation should look/move/behave like. Deduped, chronological, source in brackets. There are **no animation-intent prompts after 2026-05-01** — the corpus closes Apr 26, the specstory trail closes May 2, and admin's May-1 note is the last word.

### Apr 21 — motion & form [`corpus 2026-04-21T10:46`]

> "The orbs should be orbs. They shouldn't be flat circles. When you zoom in, there's pixelation, and it's ugly. There should be an infinite effect. So we can't see where the spiral/helix starts or ends. And there should be movement beyond just the spiral. The orb should move slightly in different gravitational forces… These are just feedback and changes within, not changes of complete nature."

### Apr 21 — the DRAMATIC / ALIVE specification [`corpus 2026-04-21T21:41`]

The implementation-plan prompt that encodes admin's exact requirements:

> "The current implementation has subtle, barely-perceptible animations. The client wants DRAMATIC, VISIBLE, ALIVE movement."
>
> 1. "Each orb should spin" — VISIBLE spinning, not 0.06 rad/s
> 2. "The orbs should orbit the spiral"
> 3. "Around each orb and the spiral itself, there should be sprites and animations" — floating particles, motes, wisps
> 4. "Universal, gateway-like, air-like, gas-like" — the whole scene should feel fluid and atmospheric
> 5. "Always different" — never-repeating motion
> 6. The spiral should be truly infinite — no visible start or end point

### Apr 25 — stars with unique physics [`corpus 2026-04-25T15:19`]

> "perhaps we can make generative star structures that each one is always unique and they each have different physics and so forth?"

### Apr 25 — the universe-inside-the-shape cascade [`corpus`, in sequence]

> `21:33` — "icon and inside that 3dimensional perimeter a universe — the materia cant pass the icon's substrate"
>
> `21:47` — "getting closer — but the container exterior is only a guide and is to be removed — so hence my 99% filled ask"
>
> `21:50` — "imagine each icon as the universe that has different gas, solids, or liquids… Would it be more stone?… But there should be **no sort of blank space inside the shapes. So when we remove the shape surface, we'll be able to see the shape prevail.**"
>
> `21:52` — "stars contained by bouncing off their env exterior substrate; icons naturally reach edges and keep form like birds or magnets or electronics"

### Apr 25 — the anchor (the whole V5 thesis) [`corpus 2026-04-25T22:48`]

> "Halloween Town, Tomorrowland, The Christmas Tree Shop; think of each nodes ideal form and what elements, phase states, biology, physics, etc govern them — more gaseous or more solid more fire or more desert — i mean this literally and abstractly — that's icons, now stars u take the same ideal form of the chakra node, and **give its elements rules for the star's quantum mechanics represented in rendered form**; i also want everything to be unique and so every loaded instance will be Recognized as the same God, but it's like returning to a river that that God made. **It's always different.**"

### May 1 — admin, the last word [`timeline / iMessage`]

> "I just want them to be easily identifiable / enough differential that you can tell they're different… Even if it's just the distinct colors or shapes or whatever it is."

---

## The Gap, Mapped

| Intent (verbatim source) | Shipped reality (code-cited) | Severity |
| --- | --- | --- |
| "remove the shape surface… see the shape prevail" — materia density **is** the icon (V5.7–V5.9) | Default `vesselMode: 'hybrid'` (`hub.config.ts:190`) draws the **opaque shell** + materia at `particleOpacityMult = 0.15` (`spiral.ts:1742`). Effective particle opacity `0.95 × 0.15 ≈ 14%`. The full materia-as-icon effect only renders in `?vessel=invisible`, which is not the default. | 🔴 Critical |
| Code comment asserts hybrid blends at "0.3" (`spiral.ts:2498`); May-1 plan Track A wanted **0.55–0.60** | Actual literal is `0.15` (`spiral.ts:1742`) — lower than even the stale comment, ~4× below the planned target. | 🔴 Critical |
| "stars… quantum mechanics in rendered form"; nodes should "read as actual stars" (per `spiral.ts:1770` comment) | `UnrealBloomPass` strength = `0.05` (`spiral.ts:1780`), with the inline comment *"bloom was washing all material colors to white."* The glow is effectively off; the star-core read is largely not happening. | 🔴 Critical |
| "each node's ideal form" — the religion-specific glyphs admin loved ("each symbol being from a different religion — chefs kiss") | `symbolGeometryFor()` and all hand-built symbol shapes (`makeSunburst`/`makeEye`/`makeAnkh`/`makeLotus`/…) are **dead code** — defined `spiral.ts:1494` + `1200–1491`, referenced only in a comment (`spiral.ts:571`), never invoked. Live geometry is `makeGeometryFromPrimitives()` (`spiral.ts:2017`) — generic math-extruded stars seeded from each EnvVar's primitive. Node 13 is not a rendered ankh; it is a polygon whose vertex count was seeded from ANKH's primitive. | 🟡 Moderate (depends whether literal symbols are still wanted) |
| "DRAMATIC, VISIBLE, ALIVE… each orb should spin"; orbit; "always different" | **Met in the engine.** Orbs spin (per-phase base rates; UNLOCK Y ≈ 1.2 rad/s), orbit their helix anchor, breathe, emissive-pulse; 600 particles/node run live phase physics (`spiral.ts:3099–3496`); helix has a traveling brightness pulse (`spiral.ts:3505`). Motion is genuinely alive at close framing. | 🟢 Met |
| "always different / different physics per node" | **Met in the engine** — distinct geometry, phase mix, gravity vector, and one of 8 particle behaviors per node (`icon-worlds.ts`, `applyWorldBehaviorForce` `spiral.ts:459`). **But** the field carrying that personality is the same one suppressed to 14% in hybrid, so the divergence is faint in the default. | 🟢 Met in engine / 🔴 invisible in default |
| "no visible start or end point" — truly infinite helix | Tapered helix dissolving into `FogExp2` at both ends; auto-rotate `0.4`. Reads as effectively endless. | 🟢 Met |

---

## Root Cause: three dials + one orphan

The engine is over-built, not under-built. V5 → EnvVar → V7 → V8 stacked in a single night (Apr 25), each layer added without removing the prior. The result: live materia + live planets + **dead** sacred symbols + a deliberately neutered bloom. admin's "easily identifiable" was answered by leaning on the safe, readable **opaque colored shell** rather than the **glowing particle universe** that was actually designed. Readability won; the vision was dimmed to 14%.

| Dial | Current | Intent-aligned target | Location |
| --- | --- | --- | --- |
| Default vessel mode | `'hybrid'` (shell + 14% materia) | `'invisible'` (materia **is** the icon) — or hybrid with a far higher blend | `hub.config.ts:190` |
| Hybrid materia opacity multiplier | `0.15` | `~0.55–0.60` (per May-1 Track A) | `spiral.ts:1742` |
| Bloom strength | `0.05` (off) | raise to read as stars **+ retune emissive colors** so it doesn't white-wash (the documented reason it was killed) | `spiral.ts:1780` |
| Sacred-symbol geometry | `symbolGeometryFor()` dead | decide: revive the literal glyphs, or formally retire them and delete the dead path | `spiral.ts:1494` (def), `2017` (live alternative) |

---

## Stale comments found (code contradicts itself)

These are load-bearing because they hide the gap from anyone reading the file:

- `spiral.ts:2498` — claims hybrid materia at "0.3"; actual is `0.15` (`spiral.ts:1742`).
- `spiral.ts:1770–1772` — claims bloom is "what makes the nodes read as actual stars," immediately before setting strength `0.05` "because bloom was washing all material colors to white" (`spiral.ts:1780`). The comment describes the intent; the value defeats it.
- `spiral.ts:1957–1964` (per prior code audit) — labels the planet arrays "legacy / empty no-ops / disabled"; they are in fact populated and animated (`spiral.ts:2124–2373`, `3037–3068`).

---

## Provenance & an artifact-loss note

- Verbatim 4jp prompts: `organvm-corpvs-testamentvm/data/corpora/week-2026-04-19_to_2026-04-26/prompts-raw.jsonl` (103 spiral-cwd prompts; relocated out of `~/Workspace` into `~/Code/organvm/`).
- The May-1 recap (`.specstory/history/2026-05-01_11-13-12-0400.md`) truncates every prompt >350 chars (`text[:300] + … + text[-50:]`). Full text is only recoverable from the JSONL above. **This is a single-source dependency** — if that corpus week is ever pruned, the untruncated animation spec is lost. Worth a durable copy (Rule #2: nothing local-only).
- Implementation: `spiral.ts` (init `1723`, render loop `2937`), `hub.config.ts:190`, `icon-worlds.ts`, `sacred-geometry-primitives.ts`.

---

## Decisions are yours, not the layout's

1. **Default mode** — flip to `'invisible'` (materia is the icon, the purest expression of the V5 intent), or keep `'hybrid'` but raise the blend to ~0.55? The A/B querystrings (`?vessel=`) already let admin compare without a redeploy.
2. **Bloom** — bring it back for the "stars" read, which requires retuning the emissive palette so colors survive (the original reason it was killed). This is the one item that is real work, not a dial.
3. **Sacred symbols** — revive the hand-authored glyphs admin reacted to ("chefs kiss"), or formally retire `symbolGeometryFor()` and delete the dead path so the file stops lying about what renders.
