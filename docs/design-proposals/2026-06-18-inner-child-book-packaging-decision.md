# System Child Book — packaging decision (γ.3)

- **Date:** 2026-06-18
- **Issue:** [#19](https://github.com/organvm-iii-ergon/sovereign-systems--spiral-template/issues/19) · **Phase:** γ · **Priority:** P3
- **Spec:** `docs/superpowers/specs/2026-04-03-spec-system-child-book.md`
- **Concept source:** `docs/archive/extracted/mindset/system-child-book-concept.md` (DOC-M-16, atoms ATM-M-316…324 — "System child book concept", a 5-part / 11-chapter hybrid poetry × somatic × system-child × art-ritual workbook)
- **Status:** RECORDED — studio recommendation + provisional scope assigned. **Awaiting admin's explicit confirmation** (per SOP-SS-CLT-001: never auto-resolve to RESOLVED without the client's word). Surfaced on `/decisions` as `system-child-book-packaging`, and as an outbound draft at `docs/admin/2026-06-18-system-child-book-packaging.md`.
- **Approver:** admin

## What's being decided

The handoff elevates the "System child book concept" file from a raw idea to a **product-scope decision**. The concept spans 7 of the 13 spiral nodes (`nodes: [1, 2, 5, 9, 10, 13, 14]`, pillar: Cross-cutting) and its 5-part structure mirrors the E•A•U Spiral itself — so it is too large and self-contained to dilute inside a single hub node. It needs an explicit packaging answer and a scope home.

## Options

### A — Standalone product *(studio recommendation)*

The concept becomes its own offer: a published book (KDP / print-on-demand) and/or a sold digital workbook, with its own title, cover, and funnel. The spiral hub links *to* it; it does not live *inside* a node.

- **Scope:** post-launch product track (γ "Later" / Horizon 3). Enters the product backlog alongside #31 (product pipeline / lead magnets), #10 (store), gated by the #7 free/email/paid boundary.
- **Why recommended:**
  - The source content itself frames it as "one of your signature products" and "one of your first big published books." It is conceived as a product, not a page.
  - It is cross-cutting (7 nodes). Embedding it in one node buries it; making it standalone lets it carry its own brand and price.
  - Standalone is the *superset* — it preserves the option to *also* surface a gated excerpt on the hub later (Option B is reachable from A, not the reverse).
  - It is **not launch-blocking**: the build depends on the content layer and monetization stack (#7, #31, #10), which are upstream. Deciding now is cheap; building waits for those.

### B — Spiral-integrated gated asset

The book content lives inside the hub as an email-gated digital download / lead magnet, tied to the relevant nodes (e.g. nodes 1, 2, 9, 10 — the regulation/system-child arc).

- **Scope:** Horizon 1–2 (email-gated content), reusing `EmailGate.astro` + the capture pipeline.
- **Trade-off:** faster to ship and a strong list-builder, but it spends the concept as a freebie rather than banking it as a paid signature product. Caps the upside.

### C — Defer / archive for later

Park the concept; revisit after the content + revenue layers stabilize.

- **Scope:** archive. The concept stays preserved at `docs/archive/extracted/mindset/system-child-book-concept.md` (already archived — nothing is lost).
- **Trade-off:** zero effort now, but no demand signal captured and no forward motion.

## Recommended decision

**Option A — Standalone product, assigned to post-launch scope (γ "Later" / Horizon 3).**

The concept is recorded as a future standalone offer in the product backlog. It does **not** block launch and is **not** built yet — the build is gated behind the content layer (#31) and the free/email/paid boundary (#7).

**Low-cost interim (optional, no build commitment):** a spiral-integrated "interest / waitlist" signal — a single CTA that captures demand (`source=system-child-book-waitlist`) so the standalone build is informed by real interest before any production spend. This is the cheapest way to validate Option A without prematurely committing to Option B's giveaway.

## Scope assignment summary

| Field | Value |
| --- | --- |
| Packaging | Standalone product *(recommended; pending admin confirm)* |
| Launch scope | **post-launch** (γ "Later" / Horizon 3) — not launch-blocking |
| Concept preservation | Archived at `docs/archive/extracted/mindset/system-child-book-concept.md` |
| Build dependencies | #31 product pipeline · #7 free/email/paid boundary · #10 store |
| Interim option | spiral waitlist CTA (`source=system-child-book-waitlist`) — optional, no build commitment |

## Triple-reference (IRF-SYS-078)

- **(a) atomized-want:** the concept's atoms (ATM-M-316…324) under DOC-M-16; packaging want trackable as a `W-###` when pulled into a build cycle.
- **(b) IRF:** to file at `~/Code/organvm/organvm-corpvs-testamentvm/INST-INDEX-RERUM-FACIENDARUM.md` when the build is scheduled.
- **(c) GH issue:** [#19](https://github.com/organvm-iii-ergon/sovereign-systems--spiral-template/issues/19).

Currently **2/3 (EMBRYONIC)** — acceptable for a deferred/blocked decision item. File the `W-###` + IRF entry when the standalone build enters a cycle.
