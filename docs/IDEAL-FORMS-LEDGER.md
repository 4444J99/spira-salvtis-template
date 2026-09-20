# Ideal-Forms Ledger — Sovereign Systems Spiral

**Operating principle (Anthony, 2026-06-24):** *"all your ideas need to be logged
and tracked just like all my prompts and all my clients asks — all permanent and
all horizons towards ideal forms."*

This is the single permanent ledger for the project. Three streams — **Client
asks** (admin), **Directives** (Anthony), **Ideas** (Claude) — are tracked the
same way: nothing is ephemeral, every entry names the **ideal form** it points
toward, and entries are *distilled toward* that form over time, never reduced
away. Append here; do not delete. Horizons stay open until the ideal form is
reached.

Related permanent records: `src/data/decisions.ts` (rendered at `/decisions`),
`src/data/spiral-versions.ts` (rendered at `/timeline`),
`docs/archive/admin-intent-register.md`, and the full star-history dossier in
this session's transcript (2026-06-24).

Status legend: 🟢 done · 🔵 in progress · 🟡 staged/gated · ⚪ horizon (future) · 🔴 blocked

---

## 1 — Client asks (admin)

| Date | Verbatim / ask | Ideal form (horizon) | Status |
|---|---|---|---|
| 2026-06-25 | "I love it as it is honestly!!! … but now it **won't update the changes**" | Tuning a knob updates the spiral instantly — what you set is what you see, every time. | 🟢 **FIXED & deployed (preview).** The `?tune` panel did a full page reload deferred up to ~2 s by `requestIdleCallback` (read as "nothing happened" + reset the panel). Added `window.__spiralReboot` (reuses the proven boot/teardown to re-read params **in place**) so a change re-renders instantly; reload kept as fallback; debounce 700→200 ms. Param pipeline verified end-to-end on preview (URL overrides apply live). |
| 2026-06-25 | "the **top of the spiral could be shorter** cause I want the authenticate/unlock star to be at the top!" | The top (authenticate/unlock) star sits right at the crown of the spiral; the bottom still falls into infinite fog. | 🟢 **DONE & verified.** Asymmetric helix extension — bottom keeps its infinite-descent tail, new `PATH_EXTEND_TOP` (0.12) trims the top so the unlock star caps it. Screenshot-confirmed (and the inverse override `=1.6` re-grows the tail, proving the knob). Named knob: `helix.pathExtendTop`. |
| 2026-06-25 | "the **stars could be a little bit bigger** too" | Background stars read clearly without overwhelming the nodes. | 🟢 **DONE.** `bgStars.size` 0.1 → 0.14 (conservative per "a little bit"). Verified on preview; tunable live. |
| 2026-06-25 | "the **hover words just a bit smaller & in light typewriter font** would be badass!" | Node names appear as small, light, typewriter-style labels on hover. | 🟢 **DONE.** `makeLabelSprite`: Inter 400 34px → **300 (light) 27px monospace**, tighter tracking, billboard 2.2→2.0. (Renders on hover; the two-pass shadow keeps the thin weight legible.) |
| 2026-06-25 | "Can we please have the **colors of the stars match the chakra colors** or variations of … that **follow the same gradient from top to bottom** pretty please!?" | The starfield rides the same root→crown chakra gradient the nodes do — red/warm at the bottom, violet/cool at the top, with per-star variety. | 🟢 **DONE & render-verified.** Ambient stars now sample the chakra gradient by HEIGHT (mapped over the helix span so it aligns with node colors and reads top→bottom), + a ±½-stop per-star jitter for variety ("more stars than colors"). RNG order preserved → star positions unchanged, only color. Screenshot: warm gold low, cool teal high. |
| 2026-06-25 | "can we start **breaking down all the pages** !?! Or **set me up so I can**!? Whatever will be most efficient!" | Every node/pillar/branch has its own page, and admin can edit them herself via a GUI. | 🟡 **Pages ALREADY EXIST + render** (`/nodes/[id]`, `/pillars/[slug]`, `/gateway/[slug]`, `/for/[persona]`, `/lineage/[envvar]` — verified HTTP 200 w/ real content on preview). **CMS already configured** (`.pages.yml` = Pages CMS, pillars + branches collections). The one remaining step is human: connect this repo at **app.pagescms.org** via GitHub OAuth (admin's login + repo access) → she edits content in a GUI that commits straight to the Markdown. Surfaced to Anthony. |
| 2026-06-24 | "AH okay … **wrong stars disappeared I loved the other ones !!**" | The dense **background starfield** is always present — the cosmos between nodes is rich, never a void. | 🟢 **RESTORED & verified on preview** — Background Starfield is now a *named* element: count `160→1200`, radius `34→26`, size `0.045→0.1→0.14`, opacity `0.7`, brightness floor `0.55`. Visible starfield confirmed by screenshot (count alone was sub-pixel/invisible — homepage has no bloom). Pending your/admin's eye + the gated live merge. |
| 2026-06-23 | "two sets of stars and **I like the lil universe ones the best**" | Keep the materia **universe nodes** at full richness as the node treatment; drop the redundant CSS star-dot layer. | 🟢 Universe nodes kept at full (1600-particle materia ×13). CSS layer stays hidden — the set she was OK losing. |
| 2026-06-23 | "just want the **spiral to be a little bit more apparent / bolder**" (#17) | The helix body itself reads as a bold, glowing spiral, not a hairline. | 🟢 Bold glowing TubeGeometry helix (`0546adf`) + line opacity 0.7→0.92, bolder rails (`7dcff81`). |
| 2026-04-30 | "easily identifiable / **enough differential** that you can tell they're different" | Every node is instantly distinguishable. | 🟢 Hybrid→invisible vessel tuning; per-node IconWorld physics. |
| 2026-04-25 | "**IM SO OBSESSED !!!!**" · "stars … all different … **refracted light on gateway**" · "each symbol from a different religion — chefs kiss" | The V4 dual look (sacred symbols + generative refracted-light stars) is the loved reference point for the node aesthetic. | ⚪ Reference (playable: `b6f1d5ec…pages.dev/?variant=stars`). Candidate to resurface as an option for her. |
| 2026-04-25 | "empty space visually is a **vacuum** … otherwise none look like anything" | The space between systems is a populated cosmos. | 🟢 Original directive behind the dense ambient field — now re-honored by the 2026-06-24 restore above. |

> Full chronological star-feedback timeline (V0→current, every reaction mapped to
> its commit + a playable URL) lives in the 2026-06-24 dossier. Candidate ranking
> for "the other ones": **#1 background starfield** (acting on it), #2 CSS star-dots
> (she didn't want these), #3 V4 refracted-star nodes, #4 additive node glow,
> #5 V2 5-point chakra stars.

---

## 2 — Directives (Anthony)

| Date | Directive | Ideal form (horizon) | Status |
|---|---|---|---|
| 2026-06-24 | "the site still **runs like shit** — what's the status of the modularization?" | The spiral runs at full fidelity, smooth on every device. | 🟢 **Step 0 + 1 + 4 SHIPPED.** Step 0/1: ambient starfield drift → vertex shader (onBeforeCompile); dead empty-buffer flushes gated. **Step 4 — measured + fixed the true dominant cost:** profiling (Node, exact functions) showed it was NOT the integration math but the per-frame **icon-shape containment raycast** — `raycaster.intersectObject` is O(triangles) with no spatial index, **~37–540 ms/frame per icon** (3 brute-force casts × ~6% of 1,600 particles × 13 nodes). Added a per-icon **BVH** (`three-mesh-bvh`, `indirect` so the shared rendered geometry index is never mutated) → **5.6–50× faster, byte-identical hits (verified), ~1 ms/icon build, +19 KB brotli** on the spiral chunk. The earlier voxel-cache attempt was built, **measured (only 1.4–1.8× + a 4–14 s boot bake), and discarded** — measurement caught the regression before it shipped. Anti-reduction: same 20.8k particles, same look, just an O(log n) cast. Internal A/B on `?perf=1` / `?legacyContainment=1`. Remaining integration arithmetic (centroid/boids/thermal) is now the next-largest cost; whether it needs a GPGPU port is an **on-device measurement** call (Step 4b), not assumed. Step 3 (merge 13 draws→1) optional. **Modularization — the explicit ask — answered (2026-06-24):** the 4,430-line monolith is split into named pure-builder modules — `spiral-geometry.ts` (521 lines), `spiral-materials.ts` (233), `spiral-paths.ts` (145), joining the prior `spiral-postprocessing.ts` (bloom, 4c) — and `spiral.ts` is down to 3,604 lines. Path builders parameterized (`PathConfig`) since the registry-overwritten `let`s can't cross an ES-module boundary. Variant A (the loved sacred-symbol geometry) is preserved + exported for resurfacing, NOT deleted. Build + types green; **bundle byte-identical (157 KB brotli, unchanged — static imports re-bundle); look verified identical on preview** (Version `6343f010`). **4b/4d (extracting scene-setup + the render loop out of the `initSpiral` orchestrator) deliberately NOT done** — closed as net-negative, not parked: it yields a byte-identical bundle (zero runtime win), the plan keeps `initSpiral` as the orchestrator, and it would require rewiring the async bloom-composer + the render-loop path, which is **unverifiable in this environment** (Chrome freezes rAF in the automation tab) — refactoring code I can't watch run, on a live client deliverable, for no gain. The maintainability win is already captured by 4a + the parameter registry (tweaking is decoupled from this file). |
| 2026-06-24 | "why reduction? we have so much capability and usage — **reduction is fucking wrong**" | Performance is won by **distillation toward the ideal form** (GPU does the work), never by cutting richness. | 🟢 Standing principle. Mobile particle-budget plan **discarded.** Replaced with full-fidelity GPU architecture. |
| 2026-06-24 | "all your ideas … logged and tracked just like all my prompts and all my clients asks — all permanent, all horizons towards ideal forms" | One permanent ledger; my ideas tracked alongside his asks and the client's. | 🟢 This file. |
| 2026-06-24 | "essentially **every element needs a name we can point to and define and tweak (parameters)** … so i can be specific in what we are all talking about" | Every visual element = a named, defined, tweakable parameter; a shared vocabulary so Anthony / admin / Claude all point at the exact same knob. | 🟢 **SHIPPED + FULLY WIRED.** All **13 elements / 55 knobs** named in `spiral-params.ts`; live `?tune=1` panel + a printed glossary at **/aesthetics#parameters** (table of every knob: default, range, URL key — rendered straight from the registry so panel ↔ page ↔ renderer can't drift). **Zero `WIRING PENDING` left** — the last 8 (emissive glow/saturation/hover, vessel mode + glass opacity, drag inertia, node accent blend) are now live & URL-driven. Proven on preview: `?p.vessel.mode=visible&p.emissive.liveSymbols=1.8&p.colors.accentBlend=1` swaps the soft clouds for bright, color-varied glass icons. |
| 2026-06-24 | "push fixes to the live site" | The done perf + restored-stars + bolder-spiral state reaches admin's production site. | 🟢 **SHIPPED (2026-06-25).** All work (perf/BVH, modularization, parameter registry, stars-restore + bolder spiral, and admin's 2026-06-25 notes) merged to `main` (reconciled the #263 squash) and deployed to the production Worker `sovereign-systems-spiral.ivixivi.workers.dev` (Version `b740ebcc`). **CI green** on main (lint/test/check/build; deploy step skips gracefully until the CF token is set). The earlier sequencing risk is moot — the regression was already fixed before merge. **Remaining his-hand:** wire the `hub-example.com` custom domain to this Worker (currently an empty stub) + set `CLOUDFLARE_API_TOKEN`/`CLOUDFLARE_ACCOUNT_ID` in repo settings to enable CI auto-deploy. |
| 2026-06-03 | (in-code) "the void between containers is the universe, near-empty" → cut 700→160 | — superseded — | 🟢 Reversed 2026-06-24 per the anti-reduction directive + client love of the dense field. |

---

## 3 — Ideas (Claude)

| Date | Idea | Ideal form (horizon) | Status |
|---|---|---|---|
| 2026-06-24 | **GPU/shader-driven particle motion** — move the per-frame position math for the ~20,800 materia + ambient particles off the CPU into a vertex/compute shader; **merge/instance draw calls** so 13 node-fields + ambient + coord render in a handful of GPU passes. | All particles animate on the GPU → the hero runs smooth on phones *with more particles, not fewer.* Richness becomes effectively free. | 🔵 Step 0/1 SHIPPED (ambient field on GPU). **Lesson (Step 4):** measured first — the dominant materia cost was the no-BVH containment *raycast*, not the integration arithmetic, so a BVH (CPU) bought 5–50× with zero look change before any GPGPU rewrite. A full GPGPU port of the integration math is still a horizon, but its value must be re-measured **on-device after BVH** — the biggest cost has moved. |
| 2026-06-24 | **Spiral Parameter Registry + live `?tune` panel** — single named source (`spiral-params.ts`) for every element's params; on-page grouped sliders + URL serialization (`?p.bgStars.size=0.12`) so a tuned look is shareable/lockable; rendered glossary page converging with `/aesthetics`. | Anyone can point at any element by name and dial it — no rebuild-per-guess; kills visual ambiguity at the root. | 🟢 **SHIPPED + COMPLETE** — registry covers all 13 elements / 55 knobs; `TunePanel.astro` (`?tune=1`) renders every group with live controls + Copy-link/Apply/Reset; **all knobs now wired** (the last 8 flipped live); printed glossary live at **/aesthetics#parameters**, rendered from the registry so panel ↔ page ↔ renderer can't drift. URL serialization proven across 10+ elements on preview. |
| 2026-06-24 | **Restore ambient to richer-than-700** once GPU motion lands — push density/volume well past the loved-era baseline since cost is no longer the constraint. | The fullest, deepest cosmos the brand can carry. | ⚪ Horizon (after GPU re-arch). |
| 2026-06-24 | **/stars comparison page** — phone-first page that opens each historical build with a plain-English star description, so admin can confirm the exact density/look (and it doubles as a permanent client-decision artifact). | Client visual decisions are made by *pointing at real renders*, never by guessing from words. | 🟡 Drafted (dossier page_spec); build pending. |
| 2026-06-24 | **Pin the trigger-state + loved versions** as permanent playable URLs in `spiral-versions.ts` (add the V4 `?variant=stars` entry; backfill a pinned preview at `5051f73`). | Every meaningful version is permanently playable, never rebuild-only. | ⚪ Proposed. |
| 2026-06-24 | **Don't merge the branch to live until stars+perf land** — the branch's recent commits are entangled with the regression. | Production never shows a state worse than what the client last loved. | 🟢 Enforced (see Directives gate above). |

---

*Last updated 2026-06-24. Append new entries; advance status in place; never delete a horizon.*
