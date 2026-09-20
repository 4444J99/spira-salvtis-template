# IRF-III-033 / GH#57 — Spiral Vessel Mode Comparison

**Closure work:** Four vessel modes wired through `src/data/hub.config.ts` (UIConfig schema) → `src/components/spiral/SpiralIsland.astro` (querystring + ui default) → `src/components/spiral/spiral.ts` (mesh visibility + particle opacity multiplier).

**Default ship state:** `invisible` (preserves admin's 2026-04-25 feedback: "the container exterior is only a guide and is to be removed").

**How to compare live (recommended):** open each URL in a real browser and watch the spiral render in WebGL. Querystring overrides the build-time default without redeploy.

| Mode | Live URL (local) | Live URL (deployed) |
|---|---|---|
| invisible | http://localhost:4321/?vessel=invisible | https://sovereign-systems-spiral.pages.dev/?vessel=invisible |
| visible | http://localhost:4321/?vessel=visible | https://sovereign-systems-spiral.pages.dev/?vessel=visible |
| refracted-star | http://localhost:4321/?vessel=refracted-star | https://sovereign-systems-spiral.pages.dev/?vessel=refracted-star |
| hybrid | http://localhost:4321/?vessel=hybrid | https://sovereign-systems-spiral.pages.dev/?vessel=hybrid |

---

## What each mode does

### invisible (CURRENT DEFAULT)

- `mesh.visible = false` — vessel mesh hidden in the scene-graph
- Per-node particle field at full opacity (`× 1.0`)
- Mesh stays in scene-graph as raycast/click target and as the spawn-volume reference for the phase particles
- **What you see:** the icon's identity IS the materia density of ~110 phase particles bouncing inside the icon's substrate boundary. No outline; only the field

### visible

- `mesh.visible = true` — vessel mesh rendered opaquely
- Per-node particle field opacity zeroed (`× 0.0`)
- Variant respects upstream `?variant=` (defaults to `symbols` → texture-mapped icon shapes; pass `?variant=stars&vessel=visible` for star-shape meshes)
- **What you see:** clean icon shape per node — sacred geometry primitives (PYR, OCULUS, DYAD, PYRAMIS, HYDOR, MANDORLA, KENOSIS, SHATKONA, PADMA, BODHI, TETRAD, OKTAEDRON, ANKH) lens-modulated by the V8 LENS_SEQUENCE × lineage hash

### refracted-star

- `mesh.visible = true`
- Forces variant override → `'stars'` (regardless of `?variant=` param)
- Material is `MeshPhysicalMaterial` with transmission `0.45–0.65`, IOR `1.33–1.53`, dispersion `0.6–2.4` (per-node jitter via opticRng)
- Per-node particle field opacity zeroed
- **What you see:** prismatic refractive star shapes — each orb passes light through with chromatic aberration; reads as crystalline / faceted / icy

### hybrid

- `mesh.visible = true` — vessel rendered
- Per-node particle field at 30% opacity (`× 0.3`)
- Variant respects upstream `?variant=`
- **What you see:** layered effect — visible icon outline + dimmed internal universe motion. The mesh is the dominant read; the particle field is accent / interior atmosphere

---

## Code paths

| Surface | File:Line | Change |
|---|---|---|
| Type definition | `src/data/hub.config.ts` | New `VesselMode` type + `UIConfig` interface + `ui` const (default `'invisible'`) |
| Server prop pass | `src/components/spiral/SpiralIsland.astro` | Reads `ui.spiralVesselMode` default + `?vessel=` querystring; passes 4th arg to `initSpiral` |
| Variant resolution | `src/components/spiral/spiral.ts` (initSpiral entry) | `vesselMode === 'refracted-star'` forces variant to `'stars'`; computes `meshVisible` and `particleOpacityMult` once |
| Mesh visibility | `src/components/spiral/spiral.ts:1651` | `mesh.visible = meshVisible` (replaces hardcoded `false`) |
| Particle opacity | `src/components/spiral/spiral.ts` (fieldMat) | `opacity: (live ? 0.95 : 0.55) * particleOpacityMult` |

---

## admin-ask: which mode ships as default?

The `invisible` default was last set on admin's 2026-04-25 directive ("the container exterior is only a guide"). The intent of this work is **not** to override that — it's to give admin a comparable surface to re-decide with realized artifacts in front of her, in case the prior call has been outdated by everything else V8 has added (per-node universes, IconWorlds physics, lens × lineage geometry).

**Question:** after viewing all four modes side-by-side via the live URLs, which mode should we promote to the build-time default in `src/data/hub.config.ts` `ui.spiralVesselMode`?

- [ ] `invisible` — keep current ship; refracted-star/visible/hybrid stay available via querystring
- [ ] `visible` — promote opaque vessel to default
- [ ] `refracted-star` — promote prismatic star to default
- [ ] `hybrid` — promote layered (vessel + dim particles) to default

Once admin picks, edit `ui.spiralVesselMode` in `hub.config.ts:[NEW_LINE]` to the chosen value and ship.

---

## Proof-cadence note

Per the Stream A handoff and user directive ("all three" proof rigor: screenshot + deploy + local browser), this closure was intended to ship with PNG screenshots of all four variants captured locally + a deploy-URL diff.

**Status:**
- ✅ Local browser smoke-test path: live URLs above (run `npm run dev`; visit each URL)
- ⚠️ Headless screenshot capture: **blocked** — Chrome headless on this Mac cannot initialize WebGL (verified across 4 flag combinations: default, swiftshader, ANGLE/OpenGL, ANGLE/Metal+Vulkan). The page header renders but the Three.js canvas does not paint. Production-grade headless screenshots would require Playwright or Puppeteer's bundled Chromium (~150MB devDep), or a connected `mcp__claude-in-chrome` browser extension (currently disconnected per `tabs_context_mcp` error)
- ⚠️ Deploy-URL diff: **pending** — `npm run deploy` attempt deferred to Track 6.1 of close-out; CI deploy is broken since 2026-04-19 (CF API token expired, GH#52)

**Recovery path** for full screenshot proof: connect the Chrome MCP browser extension (https://claude.ai/chrome) OR install `playwright-chromium` as a devDep. Once either is in place, screenshots can be retroactively captured and committed without re-doing the substrate work.

For now, the live URLs are the verifiable artifact. The Reconciliation Gate (Stream H) can verify closure by either: (a) hitting the URLs and visually confirming the four modes render distinct geometries / opacities, or (b) inspecting the diff at `src/components/spiral/spiral.ts` for the `meshVisible` + `particleOpacityMult` logic and confirming the four cases are handled.
