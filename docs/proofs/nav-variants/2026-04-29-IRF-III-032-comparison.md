# IRF-III-032 — Nav Variant Comparison (Pillar-First vs Spiral-First)

**Closure work:** Both nav variants land in the codebase as parallel realized artifacts. Default ship state preserved (`pillar-first`). The variant admin picks promotes to default by editing `ui.navVariant` in `src/data/hub.config.ts`.

**Querystring override** (live A/B without redeploy):
- `?nav=pillar-first` — current default
- `?nav=spiral-first` — alternate

---

## How to compare live

| Variant | Local URL | Deployed URL |
|---|---|---|
| pillar-first (default) | http://localhost:4321/?nav=pillar-first | https://sovereign-systems-spiral.pages.dev/?nav=pillar-first |
| spiral-first | http://localhost:4321/?nav=spiral-first | https://sovereign-systems-spiral.pages.dev/?nav=spiral-first |

The same querystring works on every page (the override applies to whichever nav loads).

---

## What's different

### pillar-first (current default)

Desktop top-nav (5 items): **Gateway · System · Structure · Business · Research**

Mobile drawer:
- "Gateway" section: Gateway Home, Take the Quiz, Explore Branches
- "The Spiral" section: System Sovereignty, Structure Sovereignty, Business, Research

The user's mental model is "which pillar am I working on?" — entry points are pillar pages. Spiral is encountered as a visual on the home page; nodes are sub-pages of pillars.

### spiral-first (variant)

Desktop top-nav (5 items): **Spiral · Elevate · Align · Unlock · Research**
- Spiral → `/` (home with visualization)
- Elevate → `/nodes/1` (Feel Good First — entry of phase ELEVATE, nodes 1–5)
- Align → `/nodes/6` (Responsibility with Love — entry of phase ALIGN, nodes 6–10)
- Unlock → `/nodes/11` (Integrate — entry of phase UNLOCK, nodes 11–13)
- Research → `/research`

Mobile drawer:
- "Elevate (body)": all 5 ELEVATE nodes by id
- "Align (mind + life)": all 5 ALIGN nodes by id
- "Unlock (freedom)": all 3 UNLOCK nodes by id
- "Learn": Research

The user's mental model is "where am I on the spiral journey?" — entry points are phase boundaries. Pillars are encountered as the structural mapping a node belongs to (visible on each node page) but aren't themselves nav targets.

---

## Why the same item count

Both variants ship with **5 desktop nav items**. This is intentional — equal cognitive cost, same visual rhythm. The choice between them is about which mental model the brand foregrounds, not about adding or removing surface area.

---

## Code paths

| Surface | File:Line | Change |
|---|---|---|
| Type definition | `src/data/hub.config.ts` | `NavVariant` type already added with the IRF-III-033 closure (UIConfig.navVariant) |
| Server-side default | `src/layouts/Base.astro` | `ui.navVariant` import drives initial visibility class via `class:list` conditional |
| Phase entry constants | `src/layouts/Base.astro` (top of frontmatter) | `PHASE_ENTRY` map: ELEVATE → /nodes/1, ALIGN → /nodes/6, UNLOCK → /nodes/11 |
| Both nav blocks rendered | `src/layouts/Base.astro` (nav region) | Two `<div data-nav-variant>` blocks (pillar-first and spiral-first); one server-side hidden based on `ui.navVariant` |
| Mobile drawer parity | `src/layouts/Base.astro` (mobile menu) | Two `<div data-nav-variant>` blocks for the mobile hamburger panel as well |
| Runtime override | `src/layouts/Base.astro` (script) | `?nav=pillar-first` or `?nav=spiral-first` querystring swaps `.hidden` on both blocks |

---

## admin-ask

After viewing both URLs, which variant should we promote to the build-time default in `src/data/hub.config.ts` `ui.navVariant`?

- [ ] `pillar-first` — keep current ship state. The existing 4-pillar structure is the brand's organizing metaphor.
- [ ] `spiral-first` — promote spiral phases to nav prominence. Walks user through the 13-node arc more directly.

Once picked, change `ui.navVariant` and ship. Both variants stay accessible via `?nav=` querystring regardless.

---

## Proof-cadence note

- ✅ Build sanity: `npm run build` passes (12.79s, 53 routes)
- ✅ HTML smoke: both `data-nav-variant="pillar-first"` and `data-nav-variant="spiral-first"` blocks present in `dist/index.html` (server-side rendered, one with `.hidden`)
- ✅ Querystring override: client-side script in `Base.astro` swaps `.hidden` on the two `data-nav-variant` blocks based on `?nav=` param
- ⚠️ Visual screenshots: blocked on browser tooling (same constraint as IRF-III-033 — see `../spiral-vessel-variants/2026-04-29-IRF-III-033-comparison.md`). Live URLs above are the verifiable artifact.
- ⚠️ Deploy proof: deferred to Track 6.1; CI deploy broken since 2026-04-19 (CF token expired, GH#52)
