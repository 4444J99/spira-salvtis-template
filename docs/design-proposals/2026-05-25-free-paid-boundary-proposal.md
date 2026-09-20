# Free / Email-Gated / Paid Boundary — Proposal (GH#7)

- **Date:** 2026-05-25
- **Status:** Proposal — turns GH#7 from "decide the matrix" into "approve / edit
  this one." **Owner of the paid line: admin.**
- **Why it's the keystone:** subscriptions (#38), store (#10), and the
  personalization tier (#30) can't ship cleanly until every surface has a tier.

## Current state (implemented today)

- **Email-gated** (via `EmailGate.astro`): pillar deep-content (`/pillars/[slug]`),
  branch deep-content (`/water/[slug]`), and the research bibliography
  (`/research`). The hook/overview above each gate is free.
- **Free:** everything else — hub (`/`), quiz, water hub, node pages, business
  page, persona landings, lineage/aesthetics/timeline/library/decisions.
- **Paid:** nothing. No `Paywall` component, no access model.

## Proposed three-tier matrix

| Surface | Proposed tier | Rationale |
| --- | --- | --- |
| `/` hub, spiral, quiz | Free | Top of funnel; must be frictionless |
| Pillar overviews, branch hooks | Free | The "taste" that drives email capture |
| Node pages (`/nodes/[id]`) | Free | Discovery; the journey map |
| Pillar / branch deep-dives | Email-gated *(current)* | Lead magnet; already wired |
| Water report + filter match | Email-gated *(current)* | Converts to filter affiliate revenue |
| Research bibliography | Email-gated *(current)* | Credibility asset for capture |
| **Personalization layer (#30)** | **Paid** | Birth-chart/cycle/HD guidance — the core subscription value |
| **Planner (#30)** | **Paid** | Recurring, personalized — natural subscription anchor |
| **Automated video series** | **Paid** | Premium content per the 2026-04 handoff |
| Community / nonprofit perks (#39) | Paid or donation | Later; ties to nonprofit arm |

The only **new** line vs today is the **Paid** tier — everything currently free
or email-gated stays put. That keeps the change small and the funnel intact.

## What justifies $22–33/mo (the paid value prop)

Per #30 + the 2026-04 handoff, the subscription bundles: personalized guidance
(astrology + human design + cycle baked in), the planner attuned to the member's
chart, the automated video series, and (later) community/nonprofit access. The
free + email-gated layers remain the on-ramp.

## Decisions for admin

1. **The paid line** — confirm the Paid rows above. Specifically: do node
   deep-dives ever become paid, or stay email-gated forever?
2. **Hard vs soft paywall** — block paid content entirely, or show a preview +
   upgrade prompt (recommend soft: preview → upgrade, mirrors the EmailGate UX).
3. **One tier or several** — start with a single $22–33/mo tier (recommended), or
   tiered (e.g. content-only vs content+planner+1:1)?
4. **Annual option** — offer annual at a discount at launch, or monthly-only MVP?

## Recommended MVP (once approved + #5 terms signed)

1. A `Paywall.astro` component (sibling to `EmailGate`) — preview + "Become a
   member" CTA; checks an access flag in `localStorage` + server-side KV.
2. **Stripe Checkout (subscription mode)** for the single tier (#38) → webhook →
   set an access record in the `SUBMISSIONS`/a new `MEMBERS` KV namespace →
   unlock.
3. Wrap exactly one surface first (the #30 personalization tier, or a single
   premium node) to prove the flow end-to-end before expanding.
4. GHL stays the CRM/email layer; Stripe handles billing.

## Dependencies

- **#5** revenue agreement (terms) — gates go-live of anything paid.
- **#38** subscription integration — the billing mechanism.
- **#30** personalization layer — the thing being sold (can ship its free
  Slice 1 content meanwhile; the paid tier waits on this matrix + #38).

## Triple-reference

GH#7 ✓ · this proposal ✓ · atomized-wants/IRF to be filed when pulled into a
build cycle.
