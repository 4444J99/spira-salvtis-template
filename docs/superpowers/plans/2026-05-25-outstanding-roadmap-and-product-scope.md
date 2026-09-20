# Outstanding Roadmap & Product Scope

- **Date:** 2026-05-25
- **Status:** Planning — scopes every open issue into horizons, with the product
  decisions and MVP slices each needs before code.
- **Context:** V1 is live (Astro 6, Cloudflare Pages, `npm audit` 0). The spiral
  hub, gateway funnel, quiz, capture pipeline, 4 pillars / 6 branches / 13 nodes
  all shipped. Everything below is post-launch: unblock, monetize, personalize,
  expand.

## How to read this

Items are grouped by **horizon** (Now / Next / Later) and **track**. Each carries
a gating tag:

- 🔒 **client** — needs admin input (requested in `docs/admin/2026-05-25-pending-inputs-and-setup.md`)
- ⚙️ **infra** — a dashboard/account action (Cloudflare, GHL, registrar)
- 🧭 **product** — a decision must be made before building
- 🛠️ **studio** — buildable once unblocked

## The keystone decisions

Three decisions each unlock multiple tracks. Make these first:

1. **Free / email-gated / paid boundary (#7)** → gates subscriptions (#38), store
   (#10), and the personalization tier (#30). Nothing monetizable ships cleanly
   until this matrix exists.
2. **Revenue agreement (#5)** → gates go-live of anything paid (the 10%/$10K terms).
3. **Nonprofit location + formation** (Idaho/Tennessee) → gates the nonprofit arm
   (#39) and its Sacred Symbols Canvas identity (#100).

A fourth, narrower one — **birth-data privacy posture** — gates the personalization
layer (#30), since charts need birth date/time/location.

---

## Horizon 0 — Unblock & close (days)

Mostly awaiting inputs, not building. Sequenced by leverage.

| Item | What | Gating | Note |
| --- | --- | --- | --- |
| #62 fluoride miss (P0) | reproduce + fix the EWG fluoride gap | 🔒 | needs badge-state + ZIP; highest client value |
| #49 affiliate URLs | wire K8, confirm Multipure path, Anespa/Coldstream calls | 🔒🛠️ | direct revenue; 3/5 live |
| #58 hub quiz URL | GHL form URL or keep local `/quiz` | 🔒 | vacuum-tracked |
| #61 node differentiation | visual approval of the spiral nodes | 🔒 | reversible via `?vessel=` |
| #51 analytics | set `CF_ANALYTICS_TOKEN` + enable CF Web Analytics | ⚙️ | code done; beacon gated on token |
| #3 custom domains | connect hub-example.com etc. in Cloudflare | ⚙️🔒 | DNS at registrar |
| #1 / GHL | set `GHL_WEBHOOK_URL`; connect Pages CMS at app.pagescms.org | ⚙️ | Keystatic replaced |
| #94, #1 closes | governance close via `transition-issue.sh` | ⚙️ | resolved/obsolete; needs `gh` |
| #103, #105 | rebase/close stale docs PRs | 🧭 | superseded by `93f83fe` |

---

## Horizon 1 — Revenue foundation (weeks)

The monetization stack. Build order is dependency-driven.

### #7 — Free / email-gated / paid content matrix 🧭

The prerequisite. Produce a per-surface matrix (page · pillar · node → tier).
Recommended starting model:

- **Free:** spiral hub, pillar overviews, branch hooks, quiz, gateway ZIP lookup.
- **Email-gated:** node deep-dives, full gateway report, research bibliography.
- **Paid:** subscription hub, the personalization layer (#30), automated video
  series, planner.

Decision owner: admin (what's worth paying for). Output: a written matrix wired
into `EmailGate` + a future paywall component.

### #38 — Subscriptions 🧭🛠️ (deps: #7, #5)

- **Decision:** GHL-native subscription forms vs Stripe. **Recommend Stripe
  Checkout (subscription mode)** — lower fees, sovereignty-aligned, embeddable;
  GHL stays the CRM/email layer.
- **MVP:** one tier ($22–33/mo per #30), a Stripe Payment Link or Checkout
  session → webhook → access flag (KV) → unlock gated content.
- **Surface:** `/membership` (or `/business`); reuse the capture pipeline for the
  post-purchase email.

### #10 — Store 🧭🛠️ (deps: what's being sold)

- **Decision:** Shopify Buy Button (if foundation inventory) vs Stripe Checkout
  (digital + simple foundation) vs Snipcart. **Recommend Stripe** for parity with
  #38 unless inventory/fulfilment needs Shopify.
- **MVP:** one purchasable product on a `/store` page.

### #65 — Email-simplified personalized filter plan 🔒🛠️ (W-070; deps: #62)

- Add `source=gateway-personalized-plan` + optional `address` to `CapturePayload`;
  new CTA on `/gateway/`. admin does the manual EWG lookup → personalized plan.
- Small once #62 clarifies the canonical EWG path.

### #18 — Video hosting 🧭🔒 (deps: #14 asset access)

- **Decision:** host for documentary + reels. **Recommend YouTube (unlisted) or
  Vimeo**; embed via the existing `VideoEmbed` component. Drive folders (#14)
  need access-verification first.

---

## Horizon 2 — Personalization layer (#30, P1)

The astrology / cycle-syncing / human-design layer — "what makes the spiral
PERSONAL" and the core value of the subscription tier. Covers ~61 untracked
atoms. Largest feature; ship in slices.

- **Slice 1 — cycle content (no code, M1-cited):** cycle-synced protocols in 3
  branches (gut / archetype-delta / archetype-alpha). `CycleAwareness.astro` already exists as
  the surface. Lowest effort, highest immediate value.
- **Slice 2 — profile + compute 🧭:** a personalization profile (birth
  date/time/location → chart; current cycle phase). **Decision:** build vs
  integrate — client-side astrology/HD library vs a third-party API. **Privacy
  decision required** (birth data is sensitive; where stored, how consented).
- **Slice 3 — paid tier (deps: #7, #38):** gate personalized guidance behind the
  subscription.
- **Slice 4 — planner:** a template tied to chart + cycle (admin wants to
  co-design).

Recommend doing Slice 1 early (it's content, unblocked) and deferring 2–4 behind
the privacy decision + the monetization stack.

---

## Horizon 3 — Ecosystem expansion (later)

### #39 nonprofit arm + #100 Sacred Symbols Canvas 🔒🧭

- Donations (start simple: Stripe + Instagram), farm-to-reset (WWOOF, 20hr/wk
  work-for-stay), housing/reset resources, and the Sacred Symbols Canvas as the
  nonprofit's visual structure.
- Gated on admin's location/nonprofit-formation decisions. **MVP:** a nonprofit
  landing page using the canvas aesthetic + a donation link.

### #98 node-picker admin UI / #99 constellation layout 🛠️ (v2 spiral)

- **#99** is small: a `SpiralLayout: 'helix' | 'constellation'` toggle alongside
  `VesselMode`/`NavVariant`, switchable via `?variant=`. Studio aesthetic work.
- **#98** is larger: an admin editor to design each node's particle physics /
  icon-world / lens interactively (extends `viewThroughLens`; Pages CMS could
  host once node-shape becomes editable structure). Needs admin's authoring
  engagement.

### #20 Creature Selves / #19 System Child Book 🧭🔒

- Concept-disposition decisions (keep / defer / archive). #19 could become a
  standalone gated product. The *decision* is cheap; the build depends on it.

---

## Recommended critical path

1. **Now:** close the gated cluster via the admin outbound; fix #62 (P0).
2. **Next:** #7 matrix → #5 terms → #38 subscriptions MVP (Stripe) → #30 Slice 1
   (cycle content).
3. **Then:** #30 Slices 2–3 (personalization + tier), #10 store, #65.
4. **Later:** nonprofit (#39 / #100), v2 spiral (#98 / #99), concept calls
   (#20 / #19).

## Triple-reference note

Per the repo's structure-by-triangulation law, each prioritized item should exist
in three surfaces — atomized-wants `W-###`, an IRF entry, and a GH issue. Most
have GH issues; when an item is pulled into a build cycle, file the missing
`W-###` / IRF references so it reaches CONSTITUTED (3/3).
