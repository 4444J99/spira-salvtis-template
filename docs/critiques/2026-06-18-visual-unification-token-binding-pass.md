# Design Critique + Change Record: Visual Unification — Brand-Color Token Binding Pass

**Date:** 2026-06-18
**Issue:** GH #184 ("Remaining unification: visual-pass write-up + post-feedback tuning")
**Supersedes (extends):** `docs/critiques/2026-06-05-visual-unification-pass.md` (the source-only accent-token audit)
**Target:** site-wide brand-color literals across `src/pages/**`, `src/components/**` + the token source in `src/styles/global.css`
**Method:** Source-level audit + a deterministic token-binding sweep, plus computed WCAG contrast for the pairings the 06-05 pass left flagged. Local `npm` build/test gates were sandbox-blocked in this session, so the build/render verification is delegated to CI on the PR (see Verification).

---

## Why this pass exists

The 2026-06-05 audit verified the `--color-accent` sweep landed on the four documentation surfaces (`/decisions`, `/library`, `/timeline`, `/aesthetics`) and named the headline gap: the brand colors were the **right values bound the wrong way** — hardcoded as raw `rgba(…)` / hex literals instead of referencing design tokens. It rated those "value right, binding hardcoded" and **deferred the edits** because the files sat outside that cluster's exclusive scope. It also predates three surfaces that did not exist on 06-05: `/store`, `/business/dp`, and `/admin/node-picker`.

This pass closes that deferred binding work across the whole surface and resolves the a11y contrast items the 06-05 pass could only flag (`[needs visual verification]`) because it never rendered or measured anything.

This advances the **M2 universal mandate** (no hardcoded dynamic/design values inlined in source — bind to config/tokens). Brand color is a design constant that must live in one place; before this pass it was duplicated as ~50 literals across 20 files, so a brand-teal or gold change could not propagate from the token.

---

## What changed

### New tokens (`src/styles/global.css`)

The `@theme` block already exposed `--color-ocean-500-rgb` (the rgb-triple form needed for `rgba(var(--x), a)` alpha composition). Four siblings were missing, which is *why* the literals could not be bound before. Added:

| Token | Value | Source hex |
| --- | --- | --- |
| `--color-gold-rgb` | `201, 169, 110` | `--color-gold` `#c9a96e` |
| `--color-ocean-400-rgb` | `61, 191, 196` | `--color-ocean-400` `#3dbfc4` |
| `--color-ocean-350-rgb` | `140, 197, 211` | `--color-ocean-350` `#8cc5d3` |
| `--color-ocean-300-rgb` | `125, 211, 215` | `--color-ocean-300` `#7dd3d7` |

### Bindings (20 files)

Every brand-color literal in declarative CSS (`<style>` blocks and inline `style=` attributes) was rebound to its token with the prior literal as the fallback, so the render is **byte-identical**:

- `rgba(17,154,158, a)` → `rgba(var(--color-ocean-500-rgb, 17, 154, 158), a)`
- `rgba(201,169,110, a)` → `rgba(var(--color-gold-rgb, 201, 169, 110), a)`
- `rgba(125,211,215, a)` → `rgba(var(--color-ocean-300-rgb, 125, 211, 215), a)`
- `rgba(140,197,211, a)` → `rgba(var(--color-ocean-350-rgb, …), a)` (one site: `CycleAwareness.astro`)
- `rgba(61,191,196, a)` → `rgba(var(--color-ocean-400-rgb, …), a)` (one site: `admin/node-picker.astro`)
- bare `color: #c9a96e` → `color: var(--color-gold)` (`decisions.astro`, `aesthetics.astro`)
- bare `background: #e0c992` → `var(--color-gold-light)` (`aesthetics.astro`)

Files touched: `index`, `store`, `gateway/[slug]`, `business/dp`, `pillars/[slug]`, `nodes/[id]`, `lineage/[envvar]`, `timeline`, `library`, `decisions`, `aesthetics`, `admin/node-picker`; components `Hero`, `HydrationNode`, `CycleAwareness`, `QuizEmbed`, `EmailGate`, `landing/HeroSection`, `spiral/SpiralIsland`; plus `styles/global.css`.

This is the same `rgba(var(--token-rgb), a)` shape already shipping in `quiz.astro` (`--color-ocean-500-rgb`) — a pattern proven through CI in this exact codebase, which is the basis for confidence absent a local build.

---

## Deliberately NOT bound (honest residual)

Three sites keep their literal and are **intentionally** out of scope; binding them would add risk or break syntax for no visual gain:

| Site | Literal | Why left |
| --- | --- | --- |
| `CTAButton.astro:17` | `shadow-[0_8px_32px_rgba(17,154,158,0.3)]` | Tailwind arbitrary-value: a spaced `var(--…, 17, 154, 158)` breaks Tailwind's comma/space parsing inside `[…]`. Tokenizing needs an underscore-encoded refactor — track separately. |
| `VerticalSpine.astro:14` | `shadow-[0_0_15px_rgba(61,191,196,0.3)]` | Same Tailwind arbitrary-value constraint. |
| `spiral/spiral.ts:3237` | `border:1px solid rgba(17,154,158,0.3)` | One injected-DOM tooltip border inside the large, heavily-patched Three.js runtime file. CLAUDE.md treats `spiral.ts` as authoritative/sensitive; not worth the review surface for one cosmetic border. |

Also left as **acceptable, not brand colors** (consistent with the 06-05 ruling): `rgba(255,255,255, a)` neutral overlays/dividers, `#1a1a1a` fixed foreground-on-gold, `#78c4a8` one-off "shipped" status green, the `rgba(2,11,16,…)` ocean-900 scrims, and the bespoke spiral substrate gradient colors in `spiral.astro` / `SpiralFallback.astro` data maps (the latter is legitimately a phase→color **data** table, not a CSS binding gap).

---

## 06-05 deferred items — status now

| 06-05 finding | Severity then | Status now |
| --- | --- | --- |
| `/` and `/quiz` outside the token world (hero framework words; quiz borders) | 🟡 Moderate | ✅ Resolved — both were tokenized between 06-05 and now (`index.astro` uses `var(--color-ocean-*)`; `quiz.astro` uses `rgba(var(--color-ocean-500-rgb), …)`); this pass extends the same to every remaining surface. |
| Literal `#e0c992` where `--color-gold-light` exists | 🟢 Minor | ✅ Resolved — `aesthetics.astro` bound to `var(--color-gold-light)`. |
| Gold/teal rgba literals across the gold + teal pages | 🟡/🟢 | ✅ Resolved — bound site-wide via the new `*-rgb` tokens. |
| Body-text contrast on teal pages (`text-white/30–40`) | 🟡 carried | ⏳ Still owed — an **opacity** problem, untouched by a color-token sweep. Carried forward (see below). |

---

## Accessibility — contrast now computed (was `[needs visual verification]`)

The 06-05 pass flagged two pairings it could not measure. Computed WCAG 2.x contrast ratios (relative-luminance method) from the canonical token hexes:

| Foreground | Background | Ratio | AA (4.5) | AAA (7) |
| --- | --- | --- | --- | --- |
| accent gold `#c9a96e` | ocean-900 `#020b10` (page) | **≈ 8.9 : 1** | ✅ | ✅ |
| accent gold `#c9a96e` | ocean-800 `#07161c` (cards) | **≈ 8.2 : 1** | ✅ | ✅ |
| `#1a1a1a` | accent gold `#c9a96e` (active pill) | **≈ 7.8 : 1** | ✅ | ✅ |

All three pass AA and AAA for normal text — the gold link/pill semantics are safe at the sizes used. This resolves the two deferred a11y flags definitively (the math is deterministic; no render needed).

**Still owed (carried from 04-30 / 06-05):** the low-opacity body copy (`text-white/30`–`/40`) on `/` and `/quiz` is a real contrast risk and is *not* fixed by this color-binding pass — it needs an opacity lift, tracked under #184's tuning tail.

---

## Cross-page coherence (source-level)

- **One palette, one font, now one binding path.** Every audited page draws color from the single `global.css` `@theme` block, and after this pass every brand color *references* that block rather than re-stating the value. A brand-teal or gold change now propagates from one line.
- **New surfaces fold in cleanly.** `/store` and `/business/dp` (added after 06-05) used the same gold + ocean-teal literals; they now bind to the same tokens, so they joined the system instead of forking it.
- **`/admin/node-picker`** (internal authoring tool) was also bound — cheap, removes future drift even on a non-public surface.

---

## Remaining under #184 (explicitly client-gated — NOT done here)

The **post-feedback tuning loop** is the open half of #184 and is *not* something a code pass can pre-empt:

- admin's responses to the spiral-hero-default `/decisions` card (PR #182) are still pending; the hero-default and any consequent palette/zone decisions wait on her.
- The "two color worlds" question (does gold-world ↔ teal-world read as two **intentional zones** or two **unfinished palettes** when crossing hero → quiz → decisions/library) is a perception/brand judgment for the client + a live render, not a token decision.
- The carried-forward body-opacity contrast lift on `/` and `/quiz`.

Per the standing instruction, **#184 stays open** until admin's decision-card responses land and the tuning loop closes. This pass delivers the named "visual-pass write-up" artifact and the remaining-unification code; it does not close the issue.

---

## Verification

- **Static correctness:** grep confirms zero unbound brand triples remain in swept files (only the three documented exclusions); no double-wrapped `var()`; every `rgba(var(--…-rgb, …), a)` closes its system `var()` before the alpha. The shape is identical to the already-shipping `quiz.astro` usage.
- **Build/test gates:** `npm run check`, `npm test`, `npm run build`, and `npm run format:check` were **blocked by the session sandbox** (npm/node not runnable here). They run on the PR via `.github/workflows/ci.yml` (`npm run test:all` + Prettier) — that CI run is the authoritative gate. If Prettier flags any inline-`style=` formatting, it is a one-line fix with no behavior change.
- **Render:** unchanged by construction — token fallback === prior literal — so no visual diff is expected; a live screenshot pass at sign-off can confirm the gold/teal zones read as intended (that judgment belongs to the client tuning loop above).
