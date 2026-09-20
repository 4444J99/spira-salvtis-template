# Design Critique: Visual Unification Pass (accent-token sweep + cross-page coherence)

**Date:** 2026-06-05
**Target:** `src/pages/index.astro`, `src/pages/decisions.astro`, `src/pages/library.astro`, `src/pages/timeline.astro`, `src/pages/quiz.astro` + the shared `src/layouts/Base.astro` chrome and `src/styles/global.css` tokens
**Stage:** Post-`--color-accent` sweep — the documented half of GH #184's acceptance ("visual pass documented as a `docs/critiques/` entry")
**Method:** Source-level audit from code only. No live render in this pass — every visual claim is marked `[needs visual verification]`. Token usage was confirmed by grepping each page; the accompanying live-render tuning and admin's decision-card responses remain **open under #184**.

---

## Scope and Honesty

This is a **code-level unification audit**, not a pixel-level one. It verifies that the canonical accent token landed where it was supposed to, that nav and typography systems are shared rather than re-forked per page, and it severity-rates the gaps that source reading can prove. It does **not** assert how any of this renders — contrast ratios, perceived hue separation, and "does the gold read as warm or muddy" all require a live pass and are flagged inline. The post-feedback tuning loop (acting on admin's pending `/decisions` responses) is explicitly out of scope and stays tracked under #184.

---

## Overall Impression

The accent-token sweep is the right move and mostly landed. Four surfaces that previously fell back to an off-brand gold now resolve a single canonical token — `--color-accent: #c9a96e` in `global.css:20`, whose own comment names the bug it closed ("timeline/library/decisions/aesthetics fell back to an off-brand gold (#c4a878)"). Grep confirms `#c4a878` no longer appears in any page; it survives only as the historical note in the token definition. That is a clean, source-honest fix: the color became a named token, and the pages reference it as `var(--color-accent, #c9a96e)`.

The unresolved tension is **two color worlds that never got reconciled**: the gold-accent world (decisions / library / timeline / aesthetics) and the teal-brand world (the `/` hub hero and `/quiz`). The sweep unified the gold pages with each other but did **not** reach `/` or `/quiz`, which still carry hardcoded brand-teal hexes and literal `rgba()` teal respectively. So "visual unification" is true *within* the documentation/utility surfaces and *not yet* true *across* the hero-and-funnel surfaces. This is the headline gap.

---

## Accent-Token Sweep Verification (the #184 acceptance check)

| Page | Accent landed? | Evidence | Severity of any gap |
| --- | --- | --- | --- |
| `/decisions` (`decisions.astro`) | ✅ Yes | 11× `var(--color-accent, #c9a96e)`; gradient at `:502` pairs it with `--color-gold-light`'s value | — |
| `/library` (`library.astro`) | ✅ Yes | 6× `var(--color-accent, #c9a96e)` (`:220, :234, :330, …`) | — |
| `/timeline` (`timeline.astro`) | ✅ Yes | 4× `var(--color-accent, #c9a96e)` (`:211, :236, :305, :365`) | — |
| `/aesthetics` (reference page, not in scope but swept) | ✅ Yes | ~20 accent references | — |
| `/` (`index.astro`) | ❌ No | 0 accent references; framework words use inline `style="color:#119a9e/#8cc5d3/#3dbfc4"` (`:142, :154, :166`) | 🟡 Moderate |
| `/quiz` (`quiz.astro`) | ❌ No | 0 accent references; borders use literal `rgba(17, 154, 158, …)` (`:217, :220`) — the ocean-500 teal as raw rgba, not the token | 🟡 Moderate |

The sweep is **verified landed on 4 of 4 intended surfaces**. The two misses (`/` and `/quiz`) were never part of the gold contract — they live in the teal world — so this is not a regression. It is the next unification frontier, not a failed sweep.

---

## Visual Hierarchy

- **What draws the eye** [needs visual verification]: unchanged by this sweep on the gold pages — accent is used for links, pill backgrounds, and gradient rules, which is correct (accent = wayfinding/action, not body text).
- **Consistent accent semantics across the gold pages** ✅: in all three swept pages the accent is reserved for the same roles (interactive text + the "active/now" pill), and foreground-on-accent is consistently `#1a1a1a` (`decisions.astro:584`, `timeline.astro:306, :366`). That is a coherent contract — the gold means the same thing on every page that uses it.
- **The teal pages tell a different chromatic story** 🟡 [needs visual verification]: `/` leads with brand teal (the Elevate/Align/Unlock words) and `/quiz` frames inputs in teal. A user moving hero → quiz → decisions/library crosses from a teal world into a gold world with no transitional cue. Whether that reads as "two intentional zones" or "two unfinished palettes" can only be settled live.

---

## Consistency

| Element | Issue | Severity | Recommendation |
| --- | --- | --- | --- |
| `--color-accent` token | Landed cleanly on the four intended pages as `var(--color-accent, #c9a96e)` | 🟢 Resolved | Keep. The token + fallback pattern is the correct shape — if the token ever moves, the fallback degrades to the same value. |
| Framework words on `/` (`index.astro:142, :154, :166`) | Three hardcoded teal hexes (`#119a9e`, `#8cc5d3`, `#3dbfc4`) as inline `style="color:…"` — the same DRY violation the 2026-04-30 hero critique flagged, still open | 🟡 Moderate | Lift a `phaseColors: Record<Phase, string>` (or reuse the ocean tokens) into `hub.config.ts` / `global.css` and reference the token. Inline `style=` color on a hero is the least maintainable form. **Defer the edit:** `index.astro` and `hub.config.ts` are out of this cluster's file scope — file/track separately. |
| Quiz borders (`quiz.astro:217, :220`) | Brand teal expressed as literal `rgba(17, 154, 158, 0.5 / 1)` rather than `var(--color-ocean-500)` | 🟡 Moderate | Tokenize to `--color-ocean-500` so a brand-teal change propagates. The value is correct; the binding is not. **Defer the edit:** `quiz.astro` is out of file scope. |
| Gold-light hover tint | `#e0c992` appears literally (`decisions.astro:502`, `timeline.astro:371`) although `--color-gold-light: #e0c992` already exists in `global.css:17` | 🟢 Minor | Optional: bind these to `var(--color-gold-light)` for symmetry with the accent. Low churn, low payoff. **Defer the edit:** those pages are out of file scope. |
| Foreground-on-accent (`#1a1a1a`) | Repeated literal across decisions/timeline | 🟢 Minor | Acceptable — it is a fixed near-black for legibility on gold, not a brand color; a token would be over-engineering. |

**Net:** the swept pages are internally consistent. The remaining inconsistencies are all in the *un*-swept teal pages, and all are token-binding gaps (value right, binding hardcoded), not value mismatches.

---

## Navigation Variant Consistency

All five audited pages import the shared `Base.astro` layout (confirmed: each begins with `import Base`). Nav variant is therefore **uniform by construction** — there is no per-page nav fork to drift:

- `Base.astro` renders both `data-nav-variant="pillar-first"` and `data-nav-variant="spiral-first"` markup and toggles on the build-time default `ui.navVariant` (`Base.astro:39, :187, :243`), with a client-side `?nav=` querystring override (`:543–:555`).
- Because every page routes through this single chrome, the nav contract — including the `?nav=` override and the skip-to-content link — is shared, not re-implemented. ✅ No unification gap in nav.

[needs visual verification]: that the spiral-first variant's per-phase entry-node links render correctly on the gold pages (e.g. `/library`), where the surrounding palette differs from the hero the nav was tuned against.

---

## Typography and Spacing Token Reuse

- **Fonts** ✅: `global.css:22–23` defines `--font-heading` (Cormorant Garamond) and `--font-body` (Inter), applied globally at `html`/`h1–h4` (`:26–:41`). No page re-declares a font family — the two-font system is shared, not forked. This matches the "single brand voice in typography" the 2026-04-30 critique praised, now confirmed still intact across the swept pages.
- **Color tokens** ✅: the ocean scale, gold, gold-light, and accent all live in the single `@theme` block (`global.css:3–24`); there are 13 `--color-*` tokens and no competing palette file.
- **Spacing** 🟢 [needs visual verification]: spacing is Tailwind-utility-driven per page rather than tokenized, which is idiomatic for Tailwind 4 — not a unification defect, but it means vertical rhythm consistency across pages can only be confirmed live, not by token grep.

---

## Accessibility

Carried forward from the 2026-04-30 hero critique and re-checked against the swept pages — all require a live WCAG pass:

- **Accent-on-dark contrast** [needs visual verification]: `#c9a96e` gold on `ocean-900` (`#020b10`) is a high-luminance-on-dark pairing and likely passes AA for the link/pill roles it is used in, but must be measured — especially where accent is used as small interactive text on `/library`.
- **Foreground-on-accent** [needs visual verification]: `#1a1a1a` on `#c9a96e` (the active pill) is dark-on-gold and very likely passes AA; confirm with a checker before sign-off.
- **The teal-page body-opacity offenders** flagged on 2026-04-30 (`text-white/30`–`/40` body copy) are *not* addressed by an accent sweep and remain open on `/` and `/quiz`. 🟡 Out of this pass's scope; still owed.
- **Shared a11y wins** ✅: because all five pages use `Base.astro`, the skip-to-content link and `aria-expanded` hamburger are present uniformly — no per-page regression introduced by the sweep.

---

## What Works Well

- **The sweep is source-honest.** The bug it fixed is named in the token's own comment (`global.css:18–19`), and the off-brand `#c4a878` is verifiably gone from all pages. Color became data, lives in data.
- **One palette file, one font system.** Every audited page draws color and type from the single `global.css` `@theme` block. There is no parallel-palette substrate to reconcile — the foundation for unification is already correct.
- **Accent semantics are consistent** on the swept pages: gold = action/wayfinding, `#1a1a1a` = foreground-on-gold, everywhere it appears.
- **Nav cannot drift** — it is layout-owned, not page-owned. The `?nav=` and `?vessel=` overrides remain available across the surface for live client review.

---

## Unification Gaps (severity-rated summary)

1. 🟡 **Moderate — `/` and `/quiz` are outside the accent/token world.** The hero framework words (`index.astro:142, :154, :166`) and quiz borders (`quiz.astro:217, :220`) use hardcoded/literal brand teal instead of tokens. Value is correct; binding is not. This is the main thing standing between "documentation pages unified" and "site unified." *Edit deferred — those files are outside this cluster's exclusive scope; track as a follow-up.*
2. 🟢 **Minor — literal `#e0c992` where `--color-gold-light` exists.** Cosmetic token-binding gap on `decisions.astro:502` / `timeline.astro:371`. *Edit deferred — out of file scope.*
3. 🟡 **Carried forward (not in this scope) — body-text contrast** on the teal pages, owed since 2026-04-30 and still untouched by the accent sweep.

---

## Caveats

This critique was produced from source reading without rendering any page. Confirm the following with a live visual pass before treating #184 as visually closed:

- Whether `#c9a96e` gold and the brand teal read as two **intentional zones** or two **unfinished palettes** when a user crosses hero → quiz → decisions/library.
- Whether accent gold on `ocean-900`, and `#1a1a1a` on accent gold, pass WCAG AA at the sizes actually used (run a contrast checker on `/library` links and the `/timeline` active pill).
- Whether the spiral-first nav variant's per-phase links render legibly on the gold-accented pages.
- The post-feedback tuning that depends on **admin's pending `/decisions` responses** — that loop stays open under #184 and is not something a code pass can pre-empt.
