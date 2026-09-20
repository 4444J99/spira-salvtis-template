---
title: Branch-Swap Proposal — Analysis & Decision Matrix
date: 2026-05-16
direction: inbound proposal from admin → studio analysis → response draft
status: analysis-pending-decision
parent_thread: docs/internal/2026-05-16-admin-imessage-transcript-and-signals.md (addendum)
---

# Branch-Swap Proposal — Analysis

## The proposal (verbatim from admin 2026-05-16)

> *"Is there anyway for me to pull all the branches you made/info resources etc into GHL? Cause it's really amazing and I'd love to use it so it doesn't get lost, but if not that's okay too we can just repurpose it on the spiral site a lil so it's not redundant (cause I don't want all of it on the spiral I don't think, just a few parts)"*
>
> *"Essentially I want to switch my baby branches to the spiral and your kickass ones into GHL if that's okay with you?"*

## The swap, restated

| Surface | Currently | Proposed |
|---|---|---|
| **Spiral site** (`src/content/branches/*.md` → `/gateway/[slug]`) | 6 studio-developed depth branches (archetype-epsilon, archetype-delta, archetype-alpha, archetype-beta, archetype-gamma, archetype-zeta) | admin's GHL "baby branches" — fewer, lighter, her voice, more aesthetic |
| **GHL** (her funnel system) | admin's "baby branches" | Studio-developed depth library — full info, behind capture |

This is a **content-architecture inversion**: front-of-funnel becomes curated/aesthetic; behind-capture becomes depth library.

## Why this is sound (independent of execution)

This is a textbook content-marketing pattern:
- **Public surface = magnet** — short, curated, voice-led, gets people interested
- **Email capture = depth** — full resources, comprehensive, builds trust and retention

If executed well: site converts better, email list quality rises, depth content lives where it has the biggest commercial leverage (GHL drives email + sales). The studio branches as they currently exist are valuable IP but they are **dense** — admin is right that putting all of it on the public spiral page makes the spiral feel heavy.

## Why this is not a same-session execute

Three unknowns must close before code work begins:

1. **What's actually in admin's GHL branches?** Unknown to the studio. We'd need her to either:
   - Export GHL pages as PDF / plaintext and share, OR
   - Grant GHL viewer access so we can inventory, OR
   - Describe the structure (number of branches, names, length per)
2. **Which studio branches stay visible on the spiral?** She said "just a few parts" — that's not a count or a list yet.
3. **Format-conversion path for studio → GHL.** GHL supports rich text but not Markdown directly. The `src/content/branches/*.md` files (Markdown with frontmatter) need conversion to either HTML, Word doc, or copy-paste-friendly rich text per page.

Without these, any execution is speculative.

## What the studio branches currently look like (inventory)

Per `src/content/branches/` (verified 2026-05-16):

| File | Slug | Purpose |
|---|---|---|
| `archetype-epsilon.md` | archetype-epsilon | Cycle-synced gut/hormones content |
| `archetype-delta.md` | archetype-delta | Archetype-delta-focused gateway/protocols |
| `archetype-alpha.md` | archetype-alpha | Archetype-alpha performance gateway |
| `archetype-beta.md` | archetype-beta | Archetype-beta-support framing |
| `archetype-gamma.md` | archetype-gamma | archetype-gamma framing |
| `archetype-zeta.md` | archetype-zeta | Environmental/archetype-zeta angle |

Schema enforced by `content.config.ts`. All six are shipped per latest CLAUDE.md note ("Cycle-synced branch content — shipped").

Linked from `/gateway/[slug]` route in `src/pages/gateway/[slug].astro`. Also referenced by `src/data/hub.config.ts` branches array.

## Three execution paths (decision options)

### Option A — Full swap (her vision, literal)

- Replace all 6 `src/content/branches/*.md` with admin's GHL content (likely fewer files, possibly 2-3)
- Update `src/data/hub.config.ts` branches array to match new count + slugs
- Update `src/pages/gateway/[slug].astro` getStaticPaths (auto since it reads from content collection)
- Studio branches exported as PDF or HTML, delivered to admin for import into GHL

**Pros:** clean architecture, matches her stated intent
**Cons:** 6 shipped pages disappear from the spiral; SEO impact if any have indexed; loss of cross-linking from node pages that reference branches

### Option B — Curated subset (literal interpretation of "just a few parts")

- Keep 2-3 studio branches **as-is** on the spiral (her selection from the 6 existing)
- admin's GHL "baby branches" go on the spiral as NEW additional branches
- Studio branches that don't make her cut → exported to GHL
- Total spiral branch count = (kept studio) + (new from GHL), possibly higher than 6

**Pros:** preserves working studio content where it earned its place; adds her voice without subtraction
**Cons:** more confusing navigationally; doesn't fully realize her "lighter spiral" vision

### Option C — Voice rewrite (hybrid)

- Studio branches stay on spiral but admin rewrites them in her voice
- Resulting Markdown files are her words + studio's content scaffolding
- Full studio depth content (original/expanded) → exported to GHL
- Total spiral branch count stays at 6 but each is lighter and voice-aligned

**Pros:** preserves URL structure + SEO; gives her authorship; keeps GHL as depth library
**Cons:** highest manual effort for admin (rewriting 6 pages); slower to ship

## My recommendation

**Option B (curated subset)** is the closest match to her verbatim words ("just a few parts" + "switch my baby branches to the spiral"). It also has the lowest revert cost if it doesn't work — adding files is easier to undo than rewriting them.

Recommended next step: **send admin three clarifying questions** before any code work begins.

## Draft response to admin (for 4jp review before sending)

> Love this — yes let's swap. Before I touch anything, three quick questions so I get it right:
>
> **1.** Of the 6 branches currently on the spiral (archetype-epsilon / archetype-delta / archetype-alpha / archetype-beta / archetype-gamma / archetype-zeta), which 2-3 do you want to KEEP visible? I'll move the rest over to the GHL side.
>
> **2.** How many of YOUR GHL "baby branches" should land on the spiral, and what are their names? Even rough list works — I'll figure out the slugs.
>
> **3.** Easiest format for me to send the studio branches to you for GHL — PDF per branch, plain text, or HTML? Whatever pastes cleanest into GHL on your side.
>
> No rush on these — gateway funnel ships first as planned. Once I have answers I can scope the swap into a couple of focused commits.

## Files this would touch when executed

- `src/content/branches/*.md` — add/remove/rewrite
- `src/data/hub.config.ts` — branches array (line ~135 onward)
- `src/pages/gateway/[slug].astro` — no change needed (reads from collection)
- `src/pages/gateway/index.astro` — branch grid links may need update
- `src/pages/nodes/*.md` — if any node pages link to branches by slug, those break on rename
- `content.config.ts` — schema unchanged unless new fields needed for her content shape

Effort estimate (Option B):
- admin's content arrives → 2-4 hrs to write new branch files + reconcile slugs
- Studio export to GHL-friendly format → 1 hr (script or manual pandoc)
- Spiral build verification + deploy → 30 min

## Tracking

When 4jp + admin align on direction, file a GH issue with the chosen option and the answers to the 3 questions. Issue body links here for the analysis trail.
