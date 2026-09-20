/**
 * Decisions registry — every open question, hanging headache, and
 * binary/multi-option path that needs an answer to move the site forward.
 *
 * Source of truth for the `/decisions` page (`src/pages/decisions.astro`),
 * which is the client-us interaction surface — admin can browse the list,
 * see what affects what, see the system's recommendation, and signal her
 * answer via the per-option action.
 *
 * Each item carries:
 *   - title, category, ownerNeeded, urgencyHint  → header context
 *   - effects                                    → why this matters / what's blocked
 *   - suggestion                                 → system's recommended path
 *   - type + options                             → binary / multi-option / observation
 *   - progress 0-100                             → how close to a decision/resolution
 *   - status                                     → open / partial / resolved
 *   - links                                      → GH issues, docs, evidence
 *
 * v1 is static. v2 will hook option clicks into /capture with
 * source='decision-board' so admin's selections land in KV without leaving
 * the page.
 */

import { repoUrl, siteConfig, siteUrl } from './site.config';

export type DecisionStatus = 'open' | 'partial' | 'resolved';
export type DecisionType = 'binary' | 'multi' | 'observation' | 'free-text';
export type DecisionCategory =
  | 'urgent'
  | 'client-gated'
  | 'studio-internal'
  | 'strategic';
export type Owner = 'admin' | '4jp' | 'both' | 'system';

export interface DecisionOption {
  /** Short label shown on the button (1-4 words). */
  label: string;
  /** What choosing this means / what happens next. */
  description: string;
  /** Optional hint about consequences if chosen. */
  consequence?: string;
  /** Whether this is the system's recommended option. */
  recommended?: boolean;
}

export interface DecisionLink {
  label: string;
  url: string;
}

export interface DecisionItem {
  id: string;
  title: string;
  category: DecisionCategory;
  ownerNeeded: Owner;
  urgencyHint: string;
  /** What downstream things depend on this being decided/resolved. */
  effects: string;
  /** The system's recommended path (always present, even if just "needs admin input"). */
  suggestion: string;
  type: DecisionType;
  /** For binary/multi only. */
  options?: DecisionOption[];
  /** 0–100 — how close this is to being fully decided/resolved. */
  progress: number;
  status: DecisionStatus;
  links?: DecisionLink[];
  /** IDs of other decisions that must be resolved first. */
  blockedBy?: string[];
  /** Free-text notes for context/history. */
  notes?: string;
}

export const DECISIONS: DecisionItem[] = [
  // ============ NEWEST ============
  {
    id: 'creature-selves-disposition',
    title: 'Creature Selves — kept as a live brand concept',
    category: 'client-gated',
    ownerNeeded: 'admin',
    urgencyHint: 'Decided — logged for the record',
    effects:
      'The handoff asked whether "Creature Selves" should be revived as a brand concept or archived. You confirmed it as your original IP — "fully locked in, can be my own cause I can\'t find anything else like it." So it stays: a live brand concept that belongs to the Structure Sovereignty pillar (your animal-wisdom / somatic-embodiment thread). Recording the call here keeps the narrative coherent and stops a half-formed idea from drifting into the build.',
    suggestion:
      'Nothing needed from you — this just captures the decision. The concept page itself lives under Structure Sovereignty and is queued behind the launch foundation (P3), so nothing half-built shows on the site until it is ready. Send any notes, images, or lines you want in it whenever you like and I fold them in.',
    type: 'observation',
    progress: 100,
    status: 'resolved',
    links: [
      {
        label: 'GH#20 Creature Selves concept',
        url: 'https://github.com/organvm-iii-ergon/sovereign-systems--spiral-template/issues/20',
      },
    ],
    notes:
      'Disposition: KEEP as a live brand concept (not deferred, not archived). Client-confirmed original IP 2026-04-05 (#20 GATED→SPEC: "admin confirmed creature selves as original IP, locked in"). Canonical home: Structure Sovereignty pillar (animal-wisdom / somatic-embodiment thread; handoff nodes 13/14, Q10). Building the concept page is the W-040 follow-up, deferred under P3 ("bones-first") — recording the disposition here satisfies the γ.4 gate without leaking an unbuilt section into the live architecture. Source material: docs/archive/source-bundle/.../chatgpt-creature-selves-resources.txt (Partial).',
  },
  {
    id: 'paid-tier-matrix',
    title: 'The free / email / paid line — approve the boundary',
    category: 'strategic',
    ownerNeeded: 'admin',
    urgencyHint: 'Gates subscriptions + the $99 sign-up',
    effects:
      'We drafted a page-by-page map of what stays free, what asks for an email, and what becomes paid members-only content (the deep practices, birth-chart/cycle guidance, planners). Nothing paid can ship — not subscriptions, not the $99 sign-up — until this line is approved. Everything currently live stays free or email-gated either way.',
    suggestion:
      'Approve the drafted boundary: pages and node overviews free, deep dives email-gated (already live), and the personalized layer (chart/cycle/HD guidance, planners) as the paid tier. We also need your lean on: hard vs soft paywall, single price vs tiers, and whether to offer an annual option — bring all four to the catch-up call.',
    type: 'multi',
    progress: 40,
    status: 'open',
    options: [
      {
        label: 'Approve as drafted',
        description:
          'The boundary ships as mapped; paid-tier build starts once the payment rail (Stripe vs GHL) is picked.',
        consequence:
          'Unblocks subscription + $99 sign-up build immediately after the rail decision.',
        recommended: true,
      },
      {
        label: 'Walk through it on the call',
        description:
          'We take 10 minutes on the catch-up call to walk the map page by page.',
        consequence: 'We prep the walkthrough; nothing ships until then.',
      },
      {
        label: 'Not yet — stay free + email',
        description:
          'Park the paid tier; the site keeps running exactly as it is.',
        consequence:
          'Subscriptions, the $99 sign-up, and the personalized layer stay parked.',
      },
    ],
    notes:
      'Tracking: GH #7 (boundary decision) · #38 (billing capability) · #210 ($99 DP flow) · #5 (revenue terms). The drafted map: docs/design-proposals/2026-05-25-free-paid-boundary-proposal.md.',
  },
  {
    id: 'node-picker-admin-ui',
    title: 'Node picker admin — design one node universe at a time',
    category: 'client-gated',
    ownerNeeded: 'admin',
    urgencyHint: 'V2 review surface — no launch blocker',
    effects:
      'GH#98 is the visual authoring surface for spiral-node worlds: pick one node, tune its IconWorld matter/physics, bind the naming lens, preview the node universe, and export the selected spec before touching the source files. It replaces blind edits to icon-worlds.ts and node-visuals.ts with a visual one-node-at-a-time workflow.',
    suggestion:
      'Use the admin picker to review one node at a time. Keep local draft snapshots for iteration, then send or commit the exported selected-node spec when a universe is ready to promote.',
    type: 'observation',
    progress: 70,
    status: 'partial',
    links: [
      {
        label: 'Node picker admin',
        url: siteUrl('/admin/node-picker'),
      },
      {
        label: 'GH#98 node picker',
        url: repoUrl('issues/98'),
      },
      {
        label: '2026-05-16 transcript signal',
        url: repoUrl(
          'blob/main/docs/internal/2026-05-16-admin-imessage-transcript-and-signals.md#L320',
        ),
      },
    ],
    notes:
      'Source: admin 2026-05-16 iMessage thread: "a picker for me to design each node/lil star or universe that goes on the spiral for each step". Current implementation is local-draft + patch-ready export; direct CMS persistence can come later if node shape moves out of TypeScript config.',
  },
  {
    id: 'node-pillar-mapping',
    title: 'Two nodes — which pillar is home? (Awareness + Authenticate)',
    category: 'client-gated',
    ownerNeeded: 'admin',
    urgencyHint: 'No rush — site works either way',
    effects:
      'Your original architecture notes place node 2 (Awareness) under System Sovereignty and node 12 (Authenticate) under Structure Sovereignty. The live site has them under Foundation and Vision — and the quiz scoring, spiral colors, and node pages all follow the live mapping. This is the last place your notes and the built site disagree, so settling it locks the architecture.',
    suggestion:
      "Keep the live mapping (Awareness → Foundation as a body-awareness ELEVATE step; Authenticate → Vision as the UNLOCK move into owning your work). It's been live for weeks and the journey reads naturally. But your notes had a different intent — your call.",
    type: 'multi',
    progress: 30,
    status: 'open',
    options: [
      {
        label: 'Keep the live mapping',
        description:
          'Awareness stays in Foundation, Authenticate stays in Vision — exactly as the site works today.',
        consequence:
          'Nothing changes on the site; we update your architecture notes to match.',
        recommended: true,
      },
      {
        label: 'Restore my original notes',
        description:
          'Awareness moves to System, Authenticate moves to Structure.',
        consequence:
          'We re-map both nodes across the spiral, quiz scoring, and node pages (~1 day, no visual disruption).',
      },
      {
        label: 'Walk me through it',
        description: 'Show both versions side by side on the next call.',
        consequence: 'We prep a 2-minute comparison for the catch-up call.',
      },
    ],
    links: [
      { label: 'Awareness (node 2, live)', url: siteUrl('/nodes/2') },
      { label: 'Authenticate (node 12, live)', url: siteUrl('/nodes/12') },
    ],
    notes:
      'Tracking: GH #206 (D-005, surfaced in the 2026-04-29 ideals-vs-rendered diff; routed to this board 2026-06-05).',
  },
  {
    id: 'spiral-hover-names',
    title: 'Spiral hover — names + the node waking up (your #1 ask)',
    category: 'client-gated',
    ownerNeeded: 'admin',
    urgencyHint: 'Whenever you get a look',
    effects:
      "Your April ask — 'the stars/nodes and name when you hover' — is now the default. Names are hidden at rest; hovering a node makes its name materialize while the node itself wakes up: it glows brighter, spins a touch faster, and its particle weather quickens in its OWN style (fire flares, gateway swells, crystal shimmers). On phones, names stay always-visible since there's no hover.",
    suggestion:
      'CONFIRMED 2026-06-22 (admin #17): keep hover names + node waking up. ONE ADDITION shipped this pass — the spiral SHAPE is now more prominent (helix line opacity 0.7->0.92, bolder/wider glowing rails) and near-camera nodes read as glowing COLORED universes instead of white spiky shapes (the "disaster"); bloom raised for "a lil more glowwy." Pending admin eyeball on the preview to confirm the new boldness/glow level.',
    type: 'multi',
    progress: 90,
    status: 'partial',
    options: [
      {
        label: 'Love it — keep hover names',
        description: 'Names materialize on hover; nodes wake when touched.',
        consequence: 'No change needed; we lock it in.',
        recommended: true,
      },
      {
        label: 'Tweak the wake-up',
        description:
          'Right direction, but adjust how strongly nodes excite (glow/spin/speed).',
        consequence:
          'We tune the hover-energy constants and redeploy (~30 min).',
      },
      {
        label: 'Names always visible',
        description: 'Keep the wake-up but show all names permanently.',
        consequence: "One-word flip of the default ('hover' → 'always').",
      },
    ],
    links: [
      {
        label: 'Try it (live)',
        url: siteUrl('/'),
      },
      {
        label: 'Compare: names always on',
        url: siteUrl('/?labels=always'),
      },
      {
        label: 'Report',
        url: repoUrl(
          'blob/main/docs/admin/2026-06-03-hover-names-living-motion.md',
        ),
      },
    ],
    notes:
      "Shipped 2026-06-03. Closes the 2026-04-19 hover-nodes ask (her single most-wanted feature). Hover excitement amplifies each node's OWN IconWorld physics rather than a generic effect. The same per-node worlds now also drive subtle ambient motion on node/pillar/gateway/business pages and the utility surfaces (decisions, library, timeline) — each page moves like the world it belongs to.",
  },
  {
    id: 'spiral-hero-default',
    title: 'Spiral hero — living-materia look (new default)',
    category: 'client-gated',
    ownerNeeded: 'admin',
    urgencyHint: 'Whenever you get a look',
    effects:
      'Sets the default homepage hero rendering. We adopted the living-materia (invisible-vessel) look per your April vision — dense glowing particles hold each node form, no opaque shell. Your taste confirms or changes it; one-line flip either way.',
    suggestion:
      'Open the homepage on the preview, then compare with ?vessel=hybrid / ?vessel=visible on the end of the URL. Keep the living-materia default unless a different look reads better to you.',
    type: 'multi',
    progress: 70,
    status: 'partial',
    options: [
      {
        label: 'Love it — keep it',
        description: 'Living-materia stays the default hero look.',
        consequence: 'No change needed; we lock it in.',
        recommended: true,
      },
      {
        label: 'Tweak density / glow',
        description:
          'Right direction, but adjust particle density or the glow.',
        consequence: 'We tune the spiral constants and redeploy (~30 min).',
      },
      {
        label: 'Revert to shell (hybrid)',
        description: 'Go back to the solid-shell look that was live before.',
        consequence: 'One-word default flip back to hybrid.',
      },
    ],
    links: [
      {
        label: 'New default (live)',
        url: siteUrl('/'),
      },
      {
        label: 'Compare: old hybrid',
        url: siteUrl('/?vessel=hybrid'),
      },
      {
        label: 'Report',
        url: repoUrl('blob/main/docs/admin/2026-06-03-spiral-hero-default.md'),
      },
      {
        label: 'PR #180',
        url: repoUrl('pull/180'),
      },
    ],
    notes:
      'Adopted 2026-06-03 (PR #180) from the 2026-05-29 critique (docs/critiques/2026-05-29-spiral-animation-intent-gap.md). Invisible vessel = dense glowing particles hold each node form; no opaque shell. Reversible via ui.spiralVesselMode in hub.config.ts.',
  },
  {
    id: 'spiral-tweaks-2026-06-25',
    title: 'Your 5 spiral notes — all done + live (give it a look)',
    category: 'client-gated',
    ownerNeeded: 'admin',
    urgencyHint: 'Whenever you get a look',
    effects:
      'Every note from your 2026-06-25 message is live on the spiral: (1) the tune panel updates instantly now instead of looking like nothing happened; (2) the top of the spiral is shorter so the Authenticate / Unlock star sits near the top; (3) the stars are bigger; (4) the hover words are smaller, in a light typewriter font; (5) the star colors follow the chakra gradient top-to-bottom (warm/root low → cool/crown high). You said "I love it as it is honestly!!!" — these are tweaks on top of that, so the base look is unchanged.',
    suggestion:
      'Open the live spiral and confirm the five tweaks read right. If any one needs nudging (stars a touch bigger still, top a hair shorter, etc.), just say which — each is a single knob.',
    type: 'multi',
    progress: 90,
    status: 'partial',
    options: [
      {
        label: 'Love it — lock all five',
        description: 'All five read right; nothing to change.',
        consequence: 'We lock them in.',
        recommended: true,
      },
      {
        label: 'Nudge one or two',
        description:
          'Right direction, but a specific tweak needs adjusting — tell me which.',
        consequence: 'Each is a single named knob — ~15 min and redeploy.',
      },
      {
        label: 'Tune it yourself',
        description:
          'Open the spiral with the tune panel and slide the knobs live.',
        consequence:
          'The panel applies changes instantly now; send a screenshot of what you like.',
      },
    ],
    links: [
      { label: 'See it (live)', url: siteUrl('/spiral') },
      { label: 'Open the tune panel', url: siteUrl('/spiral?tune=1') },
    ],
    notes:
      'Shipped 2026-06-25 (commits f18b62b, 484a300; merged to main + deployed). Knobs: helix.pathExtendTop (top trim), bgStars.size (star size), makeLabelSprite font (hover words), chakraColorAt() ambient mapping (gradient). Instant-apply via window.__spiralReboot.',
  },
  {
    id: 'spiral-mobile-perf-gate',
    title: 'Phones — full 3D spiral, or a lighter version?',
    category: 'client-gated',
    ownerNeeded: 'admin',
    urgencyHint: 'Your aesthetic call',
    effects:
      'The full 3D spiral is gorgeous but heavy on phones (it runs a live particle simulation). The site already has a built-in lightweight fallback — an animated spiral with the same nodes — that loads instantly. The open question is who sees the full 3D version vs. the light one. The desktop homepage hero is unaffected either way.',
    suggestion:
      'Recommend the balanced option: phones + low-power devices get the instant light spiral; everyone on desktop gets full 3D. Biggest speed win on the device most visitors use, and the light version still looks on-brand. Can be paired with a single still "poster" image if you prefer that to the animated fallback.',
    type: 'multi',
    progress: 30,
    status: 'open',
    options: [
      {
        label: 'Balanced (recommended)',
        description:
          'Phones / touch / low-power get the instant light spiral; desktop gets full 3D.',
        consequence:
          'Fastest on phones, full experience on desktop. ~1 hr + a look on your phone.',
        recommended: true,
      },
      {
        label: 'Full 3D everywhere',
        description:
          'Keep the full WebGL spiral on every device, as it is now.',
        consequence: 'Most immersive; slowest on older phones. No change.',
      },
      {
        label: 'Conservative',
        description:
          'Only the lowest-power / data-saver devices get the light version.',
        consequence: 'Almost everyone keeps full 3D; smallest speed win.',
      },
      {
        label: 'Light + still poster',
        description:
          'Use a single still spiral image (not the animated fallback) on gated devices.',
        consequence:
          'Cleanest on a hero; I render a poster for you to approve first.',
      },
    ],
    links: [{ label: 'See it (live)', url: siteUrl('/spiral') }],
    notes:
      'Performance plan Phase 3 (3a conservative / 3b balanced / 3c reduced-motion; animated-field vs static poster). Phases 0/1/2/4 already shipped (deferred boot, render-on-demand pause, bloom code-split, module split). This gate is the one remaining piece and it changes what phone visitors see, so it is your call.',
  },
  // ============ URGENT (this-week shippable) ============
  {
    id: 'fluoride-badge-state',
    title: 'Fluoride bug — which badge state did you see?',
    category: 'urgent',
    ownerNeeded: 'admin',
    urgencyHint: 'When you have a sec',
    effects:
      "Unlocks the right fix for the missing-fluoride report — three possible fixes (~30 min, ~1-2 hr, ~45 min) depending on your answer. Without this we can't pick the right one.",
    suggestion:
      'CLOSED / N/A 2026-06-22 (admin #1): fluoride bug closed. The gateway-report / contaminant funnel it lived in is no longer surfaced on the spiral (moved to GHL / gateway-spira-salvtis.dev per #35), so the badge bug is moot here.',
    type: 'multi',
    progress: 100,
    status: 'resolved',
    options: [
      {
        label: 'Sample Data',
        description: 'The data shown was the fallback demo, not real EWG data.',
        consequence: 'Diagnosis: route-shadowing (H1). Fix: ~30 min.',
      },
      {
        label: 'Demo (Server)',
        description:
          'EWG was reached but parsing failed; server returned demo.',
        consequence: 'Diagnosis: EWG parser silent-fail (H2). Fix: ~1-2 hr.',
      },
      {
        label: 'ZIP {your zip}',
        description:
          'Real EWG data for your ZIP — no fluoride row in EWG response.',
        consequence:
          'Diagnosis: EWG genuinely missing fluoride for your utility (H3). Fix: UI-only ~45 min, add "checked but not detected" disclaimer.',
      },
    ],
    links: [
      {
        label: 'GH#62 fluoride bug',
        url: 'https://github.com/organvm-iii-ergon/sovereign-systems--spiral-template/issues/62',
      },
      {
        label: 'Outbound draft (paste to iMessage)',
        url: 'https://github.com/organvm-iii-ergon/sovereign-systems--spiral-template/blob/main/docs/admin/2026-05-16-fluoride-discriminator-question.md',
      },
    ],
    notes:
      'Defensive fix already shipped (c778f48) — fluoride now in client-side fallback list + 3-state badge surfaces data-source.',
  },
  {
    id: 'hub-quiz-form-url',
    title: 'Hub-page quiz CTA — what URL?',
    category: 'urgent',
    ownerNeeded: 'admin',
    urgencyHint: 'When ready',
    effects:
      'Currently the spiral hero quiz CTA falls back to local /quiz (the affinity quiz that scores into 1 of 13 nodes). If you want the CTA to point to your GHL form, name the URL.',
    suggestion:
      'RESOLVED 2026-06-22 (admin #2): keep local /quiz. No book-a-call button. Affiliate/call CTAs replaced site-wide with two outbound links — gateway-spira-salvtis.dev (body science) + business-spira-salvtis.dev (business).',
    type: 'binary',
    progress: 100,
    status: 'resolved',
    options: [
      {
        label: 'Keep local /quiz',
        description: 'Hub CTA goes to the in-site spiral-affinity quiz.',
        consequence: "No code change. Close GH#58 as won't-do.",
        recommended: true,
      },
      {
        label: "Use a GHL URL — I'll send it",
        description: 'You provide the URL; I wire it in.',
        consequence:
          'I update `ghl.quizFormUrl` in `src/data/hub.config.ts` once you send the URL.',
      },
    ],
    links: [
      {
        label: 'GH#58 quizFormUrl vacuum',
        url: 'https://github.com/organvm-iii-ergon/sovereign-systems--spiral-template/issues/58',
      },
    ],
  },
  {
    id: 'ghl-booking-url',
    title: 'Book-a-call CTA — provide GHL calendar URL?',
    category: 'urgent',
    ownerNeeded: 'admin',
    urgencyHint: 'When ready',
    effects:
      'Your GHL slug-status table shows "Book a call" as "add calendar URL" — the slug isn\'t wired yet. The Sovereign Spiral config (the `ghl` block in `hub.config.ts`) has no `ghl.bookingUrl` field either, so any "book a call" CTA on the spiral can\'t target your calendar today.',
    suggestion:
      'CLOSED / N/A 2026-06-22 (admin #3): no book-a-call button on the spiral. Replaced by the two outbound links. No bookingUrl needed.',
    type: 'binary',
    progress: 100,
    status: 'resolved',
    options: [
      {
        label: 'Send calendar URL',
        description: 'You configure the GHL booking calendar and send the URL.',
        consequence:
          'I add `bookingUrl` to the `ghl` config block and surface a working "book a call" CTA. Mirrors how `quizFormUrl` and `productUrl` work today.',
      },
      {
        label: 'Defer — no book-a-call CTA needed yet',
        description: 'No booking flow until later in launch sequence.',
        consequence:
          'No code change. Revisit when calls are part of the funnel.',
        recommended: true,
      },
    ],
    notes:
      'Surfaced from GHL admin slug-status table screenshot 2026-05-17. Slug `[your GHL calendar URL]` is the placeholder admin sees in her GHL admin.',
  },
  {
    id: 'multipure-canonical-referral',
    title: 'Multipure — which referral path is canonical?',
    category: 'urgent',
    ownerNeeded: 'admin',
    urgencyHint: 'Before launch',
    effects:
      'Two paths produce affiliate revenue but only one should be displayed to avoid attribution split. Current code uses the `/admin-wired` Multipure path; today you sent a coupon-coded path instead.',
    suggestion:
      'CLOSED 2026-06-22 (admin #6): no affiliate gateway products anywhere on the spiral. Multipure removed from the surface; config preserved in gateway.config.ts only.',
    type: 'binary',
    progress: 100,
    status: 'resolved',
    options: [
      {
        label: 'Use the coupon-coded path',
        description:
          'Switch to the new path you sent today (with the coupon code visible in the URL).',
        consequence:
          'Update the Multipure `affiliateUrl` (env `PUBLIC_AFFILIATE_MULTIPURE`, default in `gateway.config.ts`) to the new path. Strips Google Ads tracking params before saving.',
      },
      {
        label: 'Keep /admin-wired',
        description: 'Existing path stays as the canonical referral.',
        consequence: 'No change. Coupon URL is alternate, not promoted.',
        recommended: true,
      },
    ],
    links: [
      {
        label: 'GH#49 affiliate URLs',
        url: 'https://github.com/organvm-iii-ergon/sovereign-systems--spiral-template/issues/49',
      },
    ],
    notes:
      'Both work — just need to pick one to display so analytics attributes cleanly.',
  },
  {
    id: 'anespa-dx-url',
    title: 'Anespa DX — provide URL or remove tier?',
    category: 'urgent',
    ownerNeeded: 'admin',
    urgencyHint: 'Before launch',
    effects:
      'Filter tier shows "Details Coming Soon" instead of a working link. Either provide the affiliate URL or remove the tier from `gateway.config.ts`.',
    suggestion:
      'CLOSED / N/A 2026-06-22 (admin #5, #6): Anespa DX removed from the spiral surface along with all affiliate gateway tiers. Config preserved only.',
    type: 'binary',
    progress: 100,
    status: 'resolved',
    options: [
      {
        label: 'Sending URL',
        description: "You'll send the affiliate URL — I wire it in.",
        consequence: 'Filter tier becomes live once URL is in place.',
      },
      {
        label: 'Remove the tier',
        description: "Anespa DX is not a brand you're pursuing.",
        consequence:
          'I remove the `anespa` entry from `filterTiers` in `gateway.config.ts`. One less filter shown on the gateway page.',
      },
    ],
    links: [
      {
        label: 'GH#49 affiliate URLs',
        url: 'https://github.com/organvm-iii-ergon/sovereign-systems--spiral-template/issues/49',
      },
    ],
  },
  {
    id: 'k8-kangen-url',
    title: 'K8 Kangen — ok to wire your LeveLuk K8 page?',
    category: 'urgent',
    ownerNeeded: 'admin',
    urgencyHint: 'Before launch',
    effects:
      'The K8 Kangen filter tier is missing an affiliate URL. Is it ok to wire your LeveLuk K8 page for this tier?',
    suggestion:
      'CLOSED 2026-06-22 (admin #6): no Kangen / K8 / affiliate filter content anywhere on the spiral. K8 removed from the surface; config preserved only.',
    type: 'binary',
    progress: 100,
    status: 'resolved',
    options: [
      {
        label: 'Yes, wire LeveLuk K8 page',
        description: 'Use the LeveLuk K8 page URL.',
        consequence: 'Filter tier becomes live with that URL.',
        recommended: true,
      },
      {
        label: 'I have a different link',
        description: 'I will send you a specific affiliate link.',
        consequence: 'I will wait for the URL.',
      },
    ],
  },
  {
    id: 'bottled-gateway-notes',
    title: 'Bottled-gateway notes — send your brand breakdown',
    category: 'client-gated',
    ownerNeeded: 'admin',
    urgencyHint: 'Whenever',
    effects:
      "We are building a bottled-gateway brand section (Smart Gateway, Voss, Fiji, etc.), but we can't publish health/pH/sodium claims without dual-citations. You mentioned you have notes on this.",
    suggestion:
      'UPDATED 2026-06-22 (admin #19, #29): no deep brand comparison. Just a brief 2-4 sentence bottled-gateway + microplastics note under the gateway section (Foundation Sovereignty / Feel Good First). DRAFT placed on /gateway/ — pending admin approval before go-live.',
    type: 'binary',
    progress: 75,
    status: 'partial',
    options: [
      {
        label: 'Notes sent / incoming',
        description: "I've emailed or messaged them to you.",
        consequence: 'We fold them in and find the citations.',
      },
      {
        label: 'Skip brand comparisons',
        description: "Let's not do the per-brand breakdown anymore.",
        consequence: 'We drop the section.',
      },
    ],
    links: [
      {
        label: 'GH#64 bottle education',
        url: 'https://github.com/organvm-iii-ergon/sovereign-systems--spiral-template/issues/64',
      },
    ],
  },
  {
    id: 'deselect-email-bug-confirm',
    title: "Quiz email bug — did the 'Change my answers' button fix it?",
    category: 'urgent',
    ownerNeeded: 'admin',
    urgencyHint: 'Quick confirm',
    effects:
      'You reported that trying to change an answer opened an email window. I added a "← Change my answers" button to the quiz result screen so you can go back safely.',
    suggestion:
      'DEFERRED 2026-06-22 (admin #7 + #13): these bugs were tied to the affiliate filter recommendation / email-gate flow, which is now removed from the spiral (#6, #10). Likely moot. The local /quiz (spiral affinity) keeps its "Change my answers" fix. If the trap still reproduces on the current build, send a one-line repro and I will test.',
    type: 'binary',
    progress: 75,
    status: 'partial',
    options: [
      {
        label: "Yes, it's fixed",
        description: "The back button works and doesn't trap me.",
        consequence: 'Bug closed.',
        recommended: true,
      },
      {
        label: 'No, still happening',
        description: "I'll send you more details on where I get stuck.",
        consequence: 'Bug stays open.',
      },
    ],
    links: [
      {
        label: 'GH#207 deselect bug',
        url: 'https://github.com/organvm-iii-ergon/sovereign-systems--spiral-template/issues/207',
      },
    ],
  },
  {
    id: 'spiral-nodes-distinct',
    title: 'Spiral nodes — distinct enough?',
    category: 'client-gated',
    ownerNeeded: 'admin',
    urgencyHint: 'Whenever',
    effects:
      'Look at the 13 nodes on the spiral — distinct enough, or want more differentiation?',
    suggestion:
      'CONFIRMED 2026-06-22 (admin #20): YES — keep the unique universes for each node. "Love the direction, keep building it."',
    type: 'binary',
    progress: 100,
    status: 'resolved',
    options: [
      {
        label: 'Looks great as is',
        description: 'They are distinct enough.',
        consequence: 'No further 3D changes to the nodes.',
        recommended: true,
      },
      {
        label: 'More differentiation',
        description: 'I would like them to be more distinct.',
        consequence: 'We will iterate on the 3D materials/colors.',
      },
    ],
    links: [
      {
        label: 'GH#61 distinct nodes',
        url: 'https://github.com/organvm-iii-ergon/sovereign-systems--spiral-template/issues/61',
      },
    ],
  },
  {
    id: 'pages-cms-setup',
    title: 'Content editing dashboard — connect PagesCMS',
    category: 'client-gated',
    ownerNeeded: 'both',
    urgencyHint: 'When you want to edit text',
    effects:
      'Gives you a clean visual editor for the pillar + branch pages (and any prose) that saves straight to the live site — no code, no waiting on me. The site is already wired for it (the `.pages.yml` config lives in the repo); the only thing left is connecting your GitHub login.',
    suggestion:
      'Two steps: (1) 4jp grants you write access to the repo; (2) you go to app.pagescms.org, sign in with GitHub, and pick the site repo. Your step-by-step guide is linked below.',
    type: 'binary',
    progress: 0,
    status: 'open',
    options: [
      {
        label: "I'm connected",
        description: 'Signed in at app.pagescms.org and opened the site repo.',
        consequence: 'You can now edit content directly and it goes live.',
        recommended: true,
      },
      {
        label: 'Walk me through it',
        description: 'Do it together on the call.',
        consequence: 'We connect it in ~5 minutes.',
      },
    ],
    links: [
      {
        label: 'Your editing guide',
        url: repoUrl('blob/main/docs/admin/editing-your-site.md'),
      },
      {
        label: 'Open PagesCMS',
        url: 'https://app.pagescms.org',
      },
    ],
  },
  {
    id: 'cf-web-analytics-token',
    title: 'Analytics — enable Cloudflare Web Analytics',
    category: 'client-gated',
    ownerNeeded: 'admin',
    urgencyHint: 'When ready',
    effects: 'The site is already wired for analytics, I just need the token.',
    suggestion:
      'Enable Cloudflare Web Analytics in your dashboard and send me the token.',
    type: 'binary',
    progress: 0,
    status: 'open',
    options: [
      {
        label: 'Token sent',
        description: "I've sent you the token.",
        consequence: 'I will plug it in and analytics will flow.',
        recommended: true,
      },
      {
        label: 'Walk me through it',
        description: 'Show me how to get the token on the call.',
        consequence: 'We will do it together.',
      },
    ],
    links: [
      {
        label: 'GH#51 analytics',
        url: 'https://github.com/organvm-iii-ergon/sovereign-systems--spiral-template/issues/51',
      },
    ],
  },
  {
    id: 'ghl-leads-webhook',
    title: 'GHL Leads — send webhook URL',
    category: 'client-gated',
    ownerNeeded: 'admin',
    urgencyHint: 'Optional',
    effects:
      'If you want email leads to flow into your GHL automatically, I need the GHL webhook URL.',
    suggestion: 'Send the GHL webhook URL when ready.',
    type: 'binary',
    progress: 0,
    status: 'open',
    options: [
      {
        label: 'Webhook sent',
        description: "I've sent you the URL.",
        consequence: 'Leads will automatically flow into GHL.',
        recommended: true,
      },
      {
        label: 'Skip for now',
        description: 'Not needed yet.',
        consequence: 'Emails only save to the site KV for now.',
      },
    ],
  },
  // ============ STRATEGIC (foundational, takes longer) ============
  {
    id: 'branch-swap-proposal',
    title: 'Branch-swap proposal — direction locked, mapping pending',
    category: 'strategic',
    ownerNeeded: 'both',
    urgencyHint: 'Mapping confirmation pending',
    effects:
      "Decides the public-vs-behind-capture content architecture. Affects: what's on /gateway/[slug] (currently 6 studio branches), what the public site's voice feels like, what depth library lives in GHL.",
    suggestion:
      'RESOLVED 2026-06-22 (admin #35): Option A — FULL swap. ALL gateway funnel branch content (planet, energy, cancer, how-cells-work) belongs in GHL / gateway-spira-salvtis.dev. The spiral LINKS OUT, it does not host deep gateway content. All 6 branches now visible:false (unlinked, markdown preserved); /gateway/ rebuilt as a foundation-first section with two outbound CTAs. Supersedes the earlier "keep 3 visible" mapping.',
    type: 'multi',
    progress: 100,
    status: 'resolved',
    options: [
      {
        label: 'Option A — Full swap',
        description:
          "Wholesale replace studio branches: studio branches exit the spiral and ship to GHL; spiral surfaces only admin's curated 3 (or her chosen mapping).",
        consequence:
          'Cleanest content architecture. URLs/SEO impacted. Matches admin\'s verbatim "switch my baby branches to spiral and your kickass ones into GHL."',
        recommended: true,
      },
      {
        label: 'Option B — Curated subset',
        description:
          'Keep 2-3 studio branches you choose; add your GHL branches alongside; rest of studio content goes to GHL.',
        consequence:
          'Possibly more branches on spiral total; mixed authorship; easiest revert.',
      },
      {
        label: 'Option C — Voice rewrite',
        description:
          'You rewrite the 6 studio branches in your voice; full depth content stays as expanded GHL library.',
        consequence:
          'Most manual effort on your side; preserves URL structure + SEO.',
      },
    ],
    notes:
      'Direction locked 2026-05-16 by admin: studio branches migrate to GHL via HTML codes. Spiral retains 3 visible (per her "inflammation, hormone health & energy/cellular health"). Final mapping still ambiguous — are the 3 visible the renamed studio branches kept from task #15, or her own baby branches replacing them? Downstream: energy-branch-content-source resolves part of this.',
    blockedBy: ['energy-branch-content-source'],
  },
  {
    id: 'custom-domain-elevatealign',
    title: 'Connect hub-spira-salvtis.dev via Cloudflare',
    category: 'client-gated',
    ownerNeeded: 'admin',
    urgencyHint: 'Whenever',
    effects: `Site currently serves on the Worker review surface (${siteConfig.cloudflare.reviewOrigin}). Connecting ${siteConfig.domains.primary} makes the URL match the brand. Mayan-calendar page currently at that domain needs to be preserved or relocated first.`,
    suggestion:
      'Stop paying GoDaddy first (you said this). Decide what to do with the Mayan-calendar page before swapping DNS. Then one Cloudflare dashboard action connects the domain.',
    type: 'multi',
    progress: 50,
    status: 'partial',
    options: [
      {
        label: 'Preserve Mayan calendar page',
        description:
          "Export the Mayan calendar content from GoDaddy first; I'll host it on the spiral site under a /mayan-calendar route or similar.",
        consequence: 'No content lost. Slower switchover.',
      },
      {
        label: 'Archive Mayan calendar page',
        description: 'Save a copy locally; remove from the swap.',
        consequence: 'Content preserved as archive; not publicly accessible.',
      },
      {
        label: 'Let it disappear',
        description:
          'GoDaddy stops; Mayan calendar page is no longer reachable.',
        consequence: 'Anyone with the URL gets 404 / spiral homepage.',
      },
    ],
    links: [
      {
        label: 'GH#3 custom domain',
        url: 'https://github.com/organvm-iii-ergon/sovereign-systems--spiral-template/issues/3',
      },
    ],
  },
  // ============ CLIENT-GATED (lower urgency or longer-running) ============
  {
    id: 'coldstream-uk-placement',
    title: 'Coldstream UK — new filter tier or alternative?',
    category: 'client-gated',
    ownerNeeded: '4jp',
    urgencyHint: 'When deciding tiers',
    effects:
      "You sent a Coldstream affiliate URL today. The brand does NOT have a tier in `gateway.config.ts`. If it stays out, the affiliate revenue from your referral won't flow through the spiral. If it goes in, the filter page gets an extra tier.",
    suggestion:
      "Add as new tier if it fits your filter recommendation framework. Skip if Coldstream is an experimental/alternative you don't want to promote prominently.",
    type: 'multi',
    progress: 100,
    status: 'resolved',
    options: [
      {
        label: 'New filter tier',
        description: 'Add to `gateway.config.ts` as a 6th tier with the URL.',
        consequence:
          'Spiral filter page gains a new option. Tier ordering / framing needs admin input.',
      },
      {
        label: 'Alternatives section',
        description:
          'List under a "filter alternatives we know about" non-primary section.',
        consequence: 'Less prominent. Requires a small new content block.',
      },
      {
        label: 'Skip',
        description:
          "Don't add to the spiral. URL lives only in your share notes.",
        consequence: 'No affiliate revenue through the spiral for Coldstream.',
      },
    ],
    notes:
      "URL provided: https://www.coldstreamfilters.com/?v=79cba1185463 — `?v=79cba1185463` is likely admin's affiliate code.",
  },
  {
    id: 'documentary-video',
    title: 'Documentary video — placeholder or gate Node 5?',
    category: 'client-gated',
    ownerNeeded: 'admin',
    urgencyHint: 'When deciding Node 5 ship order',
    effects:
      'Node 5 trim (now 3 elements: your hook + documentary + 2 buttons) needs the documentary in slot 2. Two paths: ship Node 5 now with a placeholder and swap when video is ready, OR wait to update Node 5 until the documentary is filmed and ready.',
    suggestion:
      'CONFIRMED 2026-06-22 (admin #8, #26): ship Node 5 with placeholder, do not gate on the video. DONE — /gateway/ rebuilt as hook + documentary placeholder + foundation-first content + two buttons.',
    type: 'binary',
    progress: 100,
    status: 'resolved',
    options: [
      {
        label: 'Ship with placeholder',
        description:
          'Update Node 5 to the 3-element layout now; documentary slot uses a placeholder until the real video is ready.',
        consequence:
          'Node 5 ships faster. Two-step delivery (now + later swap).',
        recommended: true,
      },
      {
        label: 'Gate Node 5 on video',
        description: 'Wait to update Node 5 until the documentary is filmed.',
        consequence:
          'Node 5 stays in current state until filming completes. Single-step delivery.',
      },
    ],
    notes:
      'admin said "need to film the two videos" (transcript 2026-05-16 line 180) — this item tracks ONE slot (Node 5 documentary). The second video target is TBD; ask admin when she\'s ready.',
  },
  {
    id: 'stripe-vs-ghl-subscriptions',
    title: 'Stripe vs GHL for paid sign-ups',
    category: 'strategic',
    ownerNeeded: 'admin',
    urgencyHint: 'Before subscriptions or $99 DP launch',
    effects:
      'The $99 DP sign-up and subscription-payment capability both need a payment processor. Stripe and GHL both work. Choice affects pricing flexibility, customer email visibility, refund flow, and where paid-user state lives.',
    suggestion:
      'RESOLVED 2026-06-22 (admin #36): GHL native. Subscriptions + $99 DP route point to GoHighLevel; no Stripe integration for now.',
    type: 'binary',
    progress: 100,
    status: 'resolved',
    options: [
      {
        label: 'Stripe',
        description: 'Direct Stripe integration. Subscription state in Stripe.',
        consequence:
          'More implementation work upfront but more flexibility later.',
      },
      {
        label: 'GHL native',
        description: "Use GHL's built-in subscription tools.",
        consequence:
          "Less code. Subscription state in GHL. Easier if you're already running everything else in GHL.",
        recommended: true,
      },
    ],
    links: [
      {
        label: 'GH#38 subscription capability',
        url: 'https://github.com/organvm-iii-ergon/sovereign-systems--spiral-template/issues/38',
      },
      {
        label: 'GH#210 $99 DP flow',
        url: 'https://github.com/organvm-iii-ergon/sovereign-systems--spiral-template/issues/210',
      },
    ],
  },
  {
    id: 'system-child-book-packaging',
    title: 'System Child Book — standalone product, gated freebie, or park it?',
    category: 'strategic',
    ownerNeeded: 'admin',
    urgencyHint: 'No rush — nothing on the site waits on this',
    effects:
      'Your "system child book" idea (the 5-part somatic + system-child + art-ritual workbook that mirrors the E•A•U Spiral) is too big to bury inside one node — it touches 7 of the 13 nodes. It needs a home: its own product, a gated freebie on the hub, or parked for later. Nothing currently on the site depends on this; it only decides where the concept goes next.',
    suggestion:
      "Make it a standalone product (its own book / digital workbook with its own title + funnel), parked in the post-launch product backlog. It reads as one of your signature offers, not a page — and going standalone keeps the option to surface a gated excerpt on the hub later. We don't build it until the content layer (#31) and the free/email/paid line (#7) land; deciding now is just claiming the lane. Optional cheap step: a 'notify me' waitlist on the hub so we build to real interest.",
    type: 'multi',
    progress: 35,
    status: 'open',
    options: [
      {
        label: 'Standalone product',
        description:
          'Its own published book / sold digital workbook with its own title, cover, and funnel. The hub links to it.',
        consequence:
          'Goes into the post-launch product backlog (with #31 / #10). Not launch-blocking; built after the content + paid layers land.',
        recommended: true,
      },
      {
        label: 'Spiral-integrated gated asset',
        description:
          'The book content becomes an email-gated download / lead magnet tied to the relevant nodes.',
        consequence:
          'Faster to ship and a strong list-builder, but spends the concept as a freebie instead of banking it as a paid signature product.',
      },
      {
        label: 'Defer / archive',
        description:
          'Park the idea; revisit after content + revenue stabilize.',
        consequence:
          'Zero effort now. Concept stays safely archived — nothing lost — but no demand captured.',
      },
    ],
    links: [
      {
        label: 'GH#19 packaging decision',
        url: 'https://github.com/organvm-iii-ergon/sovereign-systems--spiral-template/issues/19',
      },
      {
        label: 'Decision record',
        url: repoUrl(
          'blob/main/docs/design-proposals/2026-06-18-system-child-book-packaging-decision.md',
        ),
      },
    ],
    notes:
      'This is the γ.3 item (GH#19). Studio recommendation recorded 2026-06-18: standalone product, post-launch scope. Held at IN-REVIEW pending admin confirm (SOP-SS-CLT-001 — never auto-resolve without her word). Concept source: docs/archive/extracted/mindset/system-child-book-concept.md (DOC-M-16). Build depends on #31 (product pipeline) + #7 (free/email/paid boundary).',
  },
  {
    id: 'meta-pixel-tracking',
    title: 'Meta pixel — wire for analytics',
    category: 'client-gated',
    ownerNeeded: 'admin',
    urgencyHint: 'When ready',
    effects:
      'You have a Meta pixel ID. Wiring it into the site enables Facebook/Instagram ads attribution + retargeting. Without it, ad spend on Meta has no conversion signal back.',
    suggestion:
      'Send the pixel ID. I wire it into the base layout and capture endpoint within ~30 min.',
    type: 'binary',
    progress: 10,
    status: 'open',
    options: [
      {
        label: 'Send pixel ID',
        description:
          'You send the ID. I wire it into `Base.astro` + `/capture` event tracking.',
        consequence:
          'Site starts firing Meta pixel events. Retargeting becomes possible.',
        recommended: true,
      },
      {
        label: 'Defer',
        description: 'Hold until ad spend is planned.',
        consequence: "No tracking until you're ready.",
      },
    ],
    links: [
      {
        label: 'GH#51 analytics integration',
        url: 'https://github.com/organvm-iii-ergon/sovereign-systems--spiral-template/issues/51',
      },
    ],
  },
  // ============ STUDIO-INTERNAL (4jp-side, not admin-blocking) ============
  {
    id: 'cf-token-rotation',
    title: 'CI auto-deploy — add the Cloudflare token + account ID',
    category: 'studio-internal',
    ownerNeeded: '4jp',
    urgencyHint: 'When tired of manual deploys',
    effects:
      'The site ships as a Cloudflare Worker (Astro 6 SSR) via `wrangler deploy`. CI builds + tests + lints every push to main and is GREEN; the deploy step is the only piece not wired. It now SKIPS WITH A WARNING when the credential is absent — so missing config never red-fails the pipeline. Manual `npm run deploy` works today (and is what is shipping now). Adding the credential flips on hands-free deploy: every merge to main goes live by itself.',
    suggestion:
      'Add CLOUDFLARE_API_TOKEN as a repo Secret and CLOUDFLARE_ACCOUNT_ID as a repo Variable (Settings → Secrets and variables → Actions). Token scopes: Workers Scripts → Edit, Workers Routes → Edit, Workers KV Storage → Edit, Account Settings → Read. CI resumes deploying on the next push — no code change needed.',
    type: 'binary',
    progress: 50,
    status: 'partial',
    options: [
      {
        label: 'Wire CI auto-deploy',
        description:
          'Add the API token (Secret) + account ID (Variable) with the scopes above.',
        consequence:
          'Every merge to main deploys itself; the deploy warning in CI clears automatically.',
        recommended: true,
      },
      {
        label: 'Keep deploying manually',
        description:
          'Leave it; run `npm run deploy` / `wrangler deploy` by hand when shipping.',
        consequence:
          'Nothing to manage. CI stays green and skips the deploy step with a note.',
      },
    ],
    links: [
      {
        label: 'GH#52 token',
        url: 'https://github.com/organvm-iii-ergon/sovereign-systems--spiral-template/issues/52',
      },
      {
        label: 'Create a token',
        url: 'https://dash.cloudflare.com/profile/api-tokens',
      },
    ],
    notes:
      'Updated 2026-06-25: deploy target is a Worker, not Pages — the old "install the Cloudflare Pages GitHub App / recreate as Git-connected" path is retired, because a Pages build ships static assets only and silently drops the SSR routes. The Worker deploy reads dist/server/wrangler.json (entry.mjs + ASSETS binding). CI was hardened the same day to skip-with-warning instead of hard-failing when the token is missing.',
  },
  {
    id: 'backfill-spiral-snapshots',
    title: 'Backfill V1–V8 playable snapshots for /timeline',
    category: 'studio-internal',
    ownerNeeded: '4jp',
    urgencyHint: 'Iteratively',
    effects:
      '/timeline currently has 9 playable Lab Experiments + 1 live + 8 V1-V8 entries marked SNAPSHOT PENDING. Each backfilled snapshot makes the timeline more useful.',
    suggestion:
      'Pick one V at a time. Checkout commit, build, save dist/ output to public/spiral-versions/<id>/, set status playable.',
    type: 'observation',
    progress: 100,
    status: 'resolved',
    links: [
      {
        label: 'Convention in PR #73 body',
        url: 'https://github.com/organvm-iii-ergon/sovereign-systems--spiral-template/pull/73',
      },
    ],
  },
  {
    id: 'ghl-page-buildout-status',
    title: 'GHL page buildout status — 12-row snapshot 2026-05-17',
    category: 'studio-internal',
    ownerNeeded: 'system',
    urgencyHint: 'Observational',
    effects:
      "Captures the state of admin's GHL funnel pages as of 2026-05-17 so the studio knows what page-states she's sitting on. Not actionable by studio (these are her GHL admin slugs), but useful as context for which Sovereign-side CTAs have working targets.",
    suggestion:
      'Re-snapshot this row whenever admin sends a new GHL admin screenshot. Items: Landing live, Quiz live, Thank-you build-now, 7 branches building (athletes/archetype-delta/gut-skin/inflammation/energy/planet/cancer), Gateway Hub live, Members hub live, Book-a-call calendar-URL-pending.',
    type: 'observation',
    // 9 of 12 slugs live/in-flight per the notes below — the bar must agree
    // with the partial status icon (was 100, flagged by the 2026-06-05
    // conversion baseline audit as internally inconsistent).
    progress: 75,
    status: 'partial',
    notes:
      "Source: GHL admin slug-status table screenshot from admin's 2026-05-17 share. 3 of 12 slugs still pending (Thank-you build, 7 branches building [tracked separately via `energy-branch-content-source` + `html-codes-delivery`], Book-a-call URL [tracked via `ghl-booking-url`]). 9 of 12 live or in-flight.",
  },
  {
    id: 'session-logs-track-or-ignore',
    title: '5 Claude Code session logs — track or stay gitignored?',
    category: 'studio-internal',
    ownerNeeded: '4jp',
    urgencyHint: 'Whenever',
    effects:
      "docs/archive/2026-04/*.txt — 5 Claude Code session logs filed but gitignored (global `*.txt` rule). They're local-only currently — Universal Rule #2 violation unless explicitly ignored as ephemeral.",
    suggestion:
      'Sensitive content (full system prompts, conversation history). Recommend stay gitignored unless audit-trail value justifies risk.',
    type: 'binary',
    progress: 100,
    status: 'resolved',
    options: [
      {
        label: 'Stay gitignored',
        description: 'Files remain local-only. Treated as ephemeral.',
        consequence:
          'No exposure of sensitive content. Files survive on disk via Time Machine / Backblaze only.',
        recommended: true,
      },
      {
        label: 'Track them',
        description: 'Add `!docs/archive/**/*.txt` exception to .gitignore.',
        consequence:
          'Files commit and ship to GitHub (private repo). Audit trail durable.',
      },
    ],
  },
  // ============ Items resolved or opened 2026-05-16 (architecture pivot) ============
  {
    id: 'node-5-trim-spec',
    title: 'Node 5 trim — layout locked at 3 elements',
    category: 'urgent',
    ownerNeeded: '4jp',
    urgencyHint: 'Ship next',
    effects:
      'Node 5 on Sovereign Spiral becomes: (a) admin\'s hook paragraph + headline, (b) the documentary, (c) two buttons — "Find out what\'s in your gateway" (zip dropdown + bottle-gateway cost breakdown) and "How it may be affecting you / What to do about it →" (deeper dive into GHL pages). Less compositing on Sovereign; gateway mechanics live in GHL.',
    suggestion:
      'Implement the 3-element layout in `src/pages/nodes/[id].astro` for nodeId=5. Documentary slot strategy resolves separately via `documentary-video` (placeholder-then-swap vs gate).',
    type: 'observation',
    progress: 100,
    status: 'resolved',
    notes:
      'Layout resolved 2026-05-16 by admin (verbatim Node 5 spec in morning iMessage). Implementation work is separate (and depends on `documentary-video` for video-slot strategy) but the layout decision itself is locked.',
  },
  {
    id: 'bottle-gateway-cost-breakdown-defer',
    title: 'Bottled-gateway cost breakdown — pause for now',
    category: 'urgent',
    ownerNeeded: '4jp',
    urgencyHint: 'Disable on next deploy',
    effects:
      "Bottled-gateway cost breakdown page can be disabled in current state. admin wants to preserve the info (don't lose it) but defer until GHL migration is straightened out — the breakdown will likely live in GHL with the other gateway content, not on Sovereign.",
    suggestion:
      'Hide the bottled-gateway cost breakdown from current routes; keep source content + config so it can be re-enabled or migrated to GHL later. Document the freeze.',
    type: 'observation',
    progress: 100,
    status: 'resolved',
    notes:
      'Resolved 2026-05-16 by admin: "all filter stuff after quiz & bottled gateway cost breakdown, can be disabled right now (the specific filter info and names - I don\'t want to lose it but let\'s get everything else straightened first)". Supersedes her earlier same-morning "I like the bottled gateway breakdown so let\'s keep that please!!" — latest wins.',
  },
  {
    id: 'filter-recs-after-quiz-defer',
    title: 'Post-quiz filter recommendations — pause for now',
    category: 'urgent',
    ownerNeeded: '4jp',
    urgencyHint: 'Disable on next deploy',
    effects:
      "Post-quiz affiliate filter recommendations can be disabled in current state. admin wants to preserve the info (don't lose it) but defer until GHL migration is straightened out — filter logic will likely live in GHL with tracking + automation.",
    suggestion:
      'Hide the post-quiz filter UI; keep source content + tier config so it can be re-enabled or migrated to GHL later. Document the freeze.',
    type: 'observation',
    progress: 100,
    status: 'resolved',
    notes:
      'Resolved 2026-05-16 by admin: filter content preserved, UI disabled, deferred to post-launch GHL setup. She will send additional filter info/names later for the GHL build.',
  },
  {
    id: 'html-codes-delivery',
    title: 'HTML codes delivery — ship 6 clean branch exports to admin',
    category: 'urgent',
    ownerNeeded: '4jp',
    urgencyHint: 'Ship next',
    effects:
      'admin chose HTML codes (over GHL-assistant access) as the immediate-delivery path for branches. 6 clean exports already exist at `docs/admin/2026-05-16-branch-html-exports/*.html` (regenerated after content-leak scrub). Need to deliver to admin for paste into GHL.',
    suggestion:
      'Send the 6 HTML files via iMessage (screenshot or copy-paste, her preference). Verify against `energy-branch-content-source` first — her GHL table shows 7 slugs, our exports are 6 (no "energy" source mapped).',
    type: 'binary',
    progress: 50,
    status: 'partial',
    options: [
      {
        label: 'Send 6 now',
        description:
          'Ship the 6 clean exports we have today. Address the missing "energy" branch separately once admin confirms its source.',
        consequence:
          'admin can start pasting immediately. Energy branch follows when content is resolved.',
        recommended: true,
      },
      {
        label: 'Wait for energy resolution',
        description:
          'Hold delivery until all 7 branches are ready including energy.',
        consequence: 'Single batched delivery; slower start.',
      },
    ],
    blockedBy: ['energy-branch-content-source'],
  },
  {
    id: 'energy-branch-content-source',
    title: 'Energy branch — where does content come from?',
    category: 'client-gated',
    ownerNeeded: 'admin',
    urgencyHint: 'Before final HTML delivery',
    effects:
      'admin\'s GHL table shows 7 branches (athletes, archetype-delta, gut-skin, inflammation, energy, planet, cancer). Our Sovereign source has 6 (archetype-alpha, archetype-delta, archetype-epsilon, archetype-beta, archetype-gamma, archetype-zeta). The "energy" slug has no source file in our repo — needs admin input on whether it maps to an existing source, lives in her existing GHL content, or needs new copy.',
    suggestion:
      'Confirm the 6 mappings (athletes←archetype-alpha, archetype-delta←archetype-delta, gut-skin←archetype-epsilon, inflammation←archetype-beta, planet←archetype-zeta, cancer←archetype-gamma) and tell me where the "energy" branch content lives.',
    type: 'multi',
    progress: 0,
    status: 'open',
    options: [
      {
        label: 'Maps to archetype-alpha',
        description:
          'Archetype-alpha branch = the energy branch under a different name.',
        consequence:
          'I rename in the export; 6 branches cover 7 slugs via alias.',
      },
      {
        label: 'I have content in GHL',
        description:
          "You'll paste your own energy content; I just send 6 branch exports.",
        consequence: 'No studio action on energy branch; 6 exports ship as-is.',
      },
      {
        label: 'Need new copy from studio',
        description:
          'Studio writes a new energy/cellular-health branch from existing source material.',
        consequence:
          'Slower delivery; new branch authored before HTML batch ships.',
      },
    ],
  },
  {
    id: 'ghl-assistant-access',
    title: 'GHL assistant access for studio — when?',
    category: 'strategic',
    ownerNeeded: 'admin',
    urgencyHint: 'After launch wave',
    effects:
      'admin offered to make 4jp her GHL assistant (instead of/in addition to HTML codes delivery). With direct access, studio could wire filter/tracking/automation work without bouncing files back and forth — but adds a security/permissions decision.',
    suggestion:
      'Defer until after launch wave stabilizes. HTML codes flow is sufficient for the immediate migration; assistant access pays off when the post-launch filter/tracking work begins.',
    type: 'binary',
    progress: 25,
    status: 'open',
    options: [
      {
        label: 'Grant after launch',
        description:
          'You add 4jp as a GHL assistant once Sovereign + GHL pages are live.',
        consequence:
          'Studio handles filter/tracking/automation work directly in GHL. Faster iteration on post-launch features.',
        recommended: true,
      },
      {
        label: 'Keep HTML-codes-only',
        description:
          'Studio never gets direct GHL access; all changes flow through file delivery.',
        consequence:
          'Slower for any GHL-side iteration; more secure (no third-party access).',
      },
      {
        label: 'Grant now',
        description:
          'Add 4jp as GHL assistant immediately to accelerate migration.',
        consequence:
          'Faster migration; one more decision-during-launch instead of after.',
      },
    ],
  },
  // ============ NEWLY SURFACED (previously only on GitHub — now on the board) ============
  {
    id: 'bottle-pricing-verify',
    title: 'Bottled-gateway pricing — are the new numbers right?',
    category: 'urgent',
    ownerNeeded: 'admin',
    urgencyHint: 'Quick check — 30 seconds',
    effects:
      "Bottle prices were previously hard-coded in the gateway-report config. I've externalized them to a JSON file so they can be updated without touching TypeScript. But the placeholder bottle numbers still need YOUR eyes — I don't know if the Store brand, Fiji, or Essentia prices match what you actually see. If prices are wrong, visitors see incorrect cost comparisons and the trust breaks.",
    suggestion:
      'Open the gateway-report page, look at the bottled-gateway cost breakdown, and mentally check: do Store brand, Fiji, and Essentia look right? If anything is off, reply with the correct price and source URL.',
    type: 'multi',
    progress: 50,
    status: 'partial',
    options: [
      {
        label: 'Prices look right',
        description:
          'You glanced at the breakdown and it matches what you know.',
        consequence: 'No changes needed. I close GH#63.',
        recommended: true,
      },
      {
        label: "One price is off — I'll tell you",
        description: "A specific brand's price doesn't match reality.",
        consequence:
          'I update the JSON file with your correction and redeploy (~15 min).',
      },
      {
        label: "I'll send you a price sheet",
        description:
          'You have a list of current prices from all your brands that you want me to use instead.',
        consequence:
          'I replace the entire price file with your authoritative data. Closes GH#63 permanently.',
      },
    ],
    links: [
      {
        label: 'GH#63 bottle pricing',
        url: 'https://github.com/organvm-iii-ergon/sovereign-systems--spiral-template/issues/63',
      },
      {
        label: 'Price source (runtime JSON)',
        url: 'https://github.com/organvm-iii-ergon/sovereign-systems--spiral-template/blob/main/src/data/runtime/bottled-prices.json',
      },
    ],
    notes:
      'Prices externalized to `src/data/runtime/bottled-prices.json` (commit ec32b6f). Config at `gateway.config.ts` now reads from this file. Future corrections can happen in JSON instead of TypeScript, then flow through the normal deploy — but for now, admin needs to verify the initial values.',
  },
  {
    id: 'gateway-education-section',
    title: 'Bottled-gateway brand education — add to site?',
    category: 'client-gated',
    ownerNeeded: 'admin',
    urgencyHint: 'When ready',
    effects:
      "The gateway-report page currently shows filter recommendations and costs but doesn't EDUCATE visitors about why most bottled gateway is just tap gateway in plastic, what brands are actually selling, or how your filters compare. A brand-education section (short explainer + brand-by-brand breakdown) would build trust and drive urgency toward your filters. But it's content YOU have to own — I can't write your brand's voice on this.",
    suggestion:
      'Three paths: (1) I write a generic "bottled gateway reality check" section and you review/tweak; (2) you write or record what you want said and I format it; (3) skip entirely and let the existing filter-comparison do the work. Your brand, your call.',
    type: 'multi',
    progress: 10,
    status: 'open',
    options: [
      {
        label: 'I draft it, you format it',
        description:
          'You write (or voice-note) the education angle; I turn it into a polished section on the gateway page.',
        consequence:
          'Content comes from you in your voice. I handle layout, styling, and deployment. Most authentic path.',
        recommended: true,
      },
      {
        label: 'You write a generic version, I tweak',
        description:
          'I write a factual "bottled gateway 101" section; you rewrite it in your voice before it goes live.',
        consequence:
          'Faster start. More editing passes (my draft → your rewrite → polish).',
      },
      {
        label: 'Skip — no education section',
        description:
          'Keep the gateway page focused on filters + costs. No brand education.',
        consequence:
          'One less page section. Filter comparison alone carries the persuasion.',
      },
    ],
    links: [
      {
        label: 'GH#64 gateway education',
        url: 'https://github.com/organvm-iii-ergon/sovereign-systems--spiral-template/issues/64',
      },
    ],
    notes:
      'This is the "W-068" item. The content itself needs to come from admin — I can\'t write her brand voice on bottled-gateway critique without her direction. If she chooses Option 2 (generic draft from me + her rewrite), I can produce a neutral factual draft within a few hours.',
  },
  {
    id: 'revenue-agreement',
    title: 'Formalize the 10% revenue agreement',
    category: 'client-gated',
    ownerNeeded: 'admin',
    urgencyHint: 'Before revenue starts flowing',
    effects:
      "We agreed on 10% revenue share early on, but nothing is signed or formally documented. Once affiliate revenue starts flowing from the filter links, quiz captures, and future subscription payments, we need a clear agreement in place — for YOUR protection (you know exactly what you owe) and mine (I know what I'm building toward). This is a legal/business item, not a code item.",
    suggestion:
      'Decide the format: a simple one-page agreement (my template), your own legal document, or a handshake-with-records (written email summarizing terms). I can draft a one-pager for review.',
    type: 'multi',
    progress: 15,
    status: 'open',
    options: [
      {
        label: "I'll use your template",
        description:
          'You draft a simple one-page revenue-share agreement; I review and sign.',
        consequence: 'Quickest path to formal. I send the draft within a day.',
        recommended: true,
      },
      {
        label: 'I have my own doc',
        description:
          'You or your legal person have a preferred agreement format.',
        consequence:
          'You send it over; I review. Slower but your comfort zone.',
      },
      {
        label: 'Email summary is enough',
        description:
          'No formal document. We write an email that captures the terms as mutual record.',
        consequence:
          'Least formal. Works if trust is high and revenue is small. Easy to upgrade later.',
      },
    ],
    links: [
      {
        label: 'GH#5 revenue agreement',
        url: 'https://github.com/organvm-iii-ergon/sovereign-systems--spiral-template/issues/5',
      },
    ],
    notes:
      'This is the "α.3" item. 10% of affiliate revenue from filter/gateway-product sales through the Sovereign Systems funnel. Not gating any launch — but cleaner to have in place BEFORE the first commission arrives rather than after.',
  },
  {
    id: 'video-asset-access',
    title: 'Reel / video assets — can you access the files?',
    category: 'client-gated',
    ownerNeeded: 'admin',
    urgencyHint: 'Before Node 5 / documentary slot ships',
    effects:
      'You mentioned a documentary clip and other video assets for the site. I need to know: (1) do you have the actual video files, or are they with a videographer? (2) are they edited/ready or raw footage? (3) what format are they in? This determines how we slot them into the Node 5 layout and whether we need a placeholder strategy.',
    suggestion:
      'Check wherever you store your business media files — Google Drive, Dropbox, phone camera roll, etc. If you have at least one ready clip, I can wire it into the node this week. If everything is still raw or with a videographer, we plan for placeholders.',
    type: 'multi',
    progress: 20,
    status: 'open',
    options: [
      {
        label: 'I have the files — sending them',
        description:
          'You have at least one edited clip. You send it or tell me where to find it.',
        consequence: 'I add it to the site. Node 5 gets real video this week.',
        recommended: true,
      },
      {
        label: 'I have raw footage only',
        description: 'You have the originals but nothing edited yet.',
        consequence:
          'We ship Node 5 with a placeholder ("documentary coming soon" card). You send the edited version when ready and I swap it in.',
      },
      {
        label: 'Videographer has everything',
        description:
          "The video files are with someone else and you don't have copies.",
        consequence:
          'Placeholder strategy is our only option until you receive files from them.',
      },
    ],
    links: [
      {
        label: 'GH#14 video assets',
        url: 'https://github.com/organvm-iii-ergon/sovereign-systems--spiral-template/issues/14',
      },
    ],
    notes:
      'This is the "α.5" item. The Node 5 trim spec is already resolved (3-element layout: hook + documentary + 2 buttons per decisions item node-5-trim-spec). The documentary slot is the remaining variable — placeholder vs real content.',
  },
  {
    id: 'visual-pass-feedback',
    title: 'Visual unification pass — tuning feedback?',
    category: 'client-gated',
    ownerNeeded: 'admin',
    urgencyHint: 'Whenever you have 5 minutes',
    effects:
      "The visual pass shipped a coordinated look across all spiral surfaces: consistent glow language, unified icon-world physics, per-node atmospherics, and the hover-name/wake interaction. You saw it. You asked for some tuning. I need your specific notes — what's working, what's not, what should change — before I can push the next refinement round.",
    suggestion:
      'Spend 5 minutes clicking through the site: the homepage spiral, a few node pages, the gateway page. Note anything that feels off (too bright, too dark, too slow, too fast, wrong color, missing something). Even "I like it, ship it" is a valid answer — just tell me.',
    type: 'multi',
    progress: 30,
    status: 'partial',
    options: [
      {
        label: 'Send my notes',
        description:
          'You have specific tuning requests — colors, speeds, glow, layout tweaks. You tell me what to change.',
        consequence:
          'I implement your feedback and redeploy. GH#184 progresses.',
        recommended: true,
      },
      {
        label: 'Love it — ship as-is',
        description: 'No changes needed. The visual pass is done.',
        consequence: 'I close GH#184. Visual unification is complete.',
      },
      {
        label: 'Not now — too busy to review',
        description: "You haven't had time to look properly. Want to defer.",
        consequence: 'GH#184 stays open. No change until you have time.',
      },
    ],
    links: [
      {
        label: 'GH#184 visual pass feedback',
        url: 'https://github.com/organvm-iii-ergon/sovereign-systems--spiral-template/issues/184',
      },
    ],
    notes:
      'GH#184 is the catch-all for remaining visual-unification feedback after the initial pass shipped. It\'s intentionally client-gated — I can\'t guess what you want changed. Even a "looks good" closes it.',
  },
  {
    id: 'node-pillar-mapping',
    title: 'Node→pillar mapping — which nodes belong to which pillar?',
    category: 'client-gated',
    ownerNeeded: 'admin',
    urgencyHint: 'Before content migration to GHL',
    effects:
      "There's a discrepancy between the locked architecture doc and the actual site config about which spiral nodes map to which of the 4 pillars. The site treats it one way; the planning doc says another. This affects: (1) how node pages cross-link to pillar pages, (2) how the content migration to GHL maps node content, and (3) quiz results → pillar routing. Needs a single authoritative mapping.",
    suggestion:
      "Look at the 13 spiral nodes and the 4 pillars (Foundation, System, Structure, Vision). Tell me: which nodes feel like they belong to which pillar to YOU? There's no wrong answer — your mapping is the source of truth.",
    type: 'free-text',
    progress: 10,
    status: 'open',
    options: [
      {
        label: "I'll tell you my mapping",
        description:
          'You mentally assign nodes to pillars and send me the list.',
        consequence:
          'I update hub.config.ts with your mapping. Node/pillar cross-linking becomes correct.',
        recommended: true,
      },
      {
        label: 'Keep the current mapping',
        description:
          'The site config has a mapping; use it even if it differs from the planning doc.',
        consequence: 'No change. Planning doc gets updated to match the code.',
      },
      {
        label: 'Let the quiz decide dynamically',
        description:
          'No fixed mapping. Quiz results determine pillar routing per-session.',
        consequence:
          'More flexible. More complex to implement and debug. Not recommended before launch.',
      },
    ],
    links: [
      {
        label: 'GH#206 node→pillar mapping',
        url: 'https://github.com/organvm-iii-ergon/sovereign-systems--spiral-template/issues/206',
      },
    ],
    notes:
      'This is the "D-005" decision item. The discrepancy is between the locked-architecture doc (which has a specific node→pillar assignment) and hub.config.ts (which uses a different grouping). Neither is authoritative until admin picks one.',
  },
  {
    id: 'deselect-email-bug-repro',
    title: 'Deselect-answer email bug — can you reproduce it?',
    category: 'urgent',
    ownerNeeded: 'admin',
    urgencyHint: 'Next time you take the quiz',
    effects:
      "You reported that when you deselect an answer in the quiz, 'the site tried to send an email.' I've looked at the code and found a few possible causes, but I can't reproduce it myself — the quiz works fine on my end. I need to know: (1) which quiz question were you on? (2) what device/browser? (3) exactly which button did you click? (4) did an error message appear or did your email app open?",
    suggestion:
      "Next time you're on the site, open the quiz and try deselecting an answer. Pay attention to: what question number you're on, what device you're using, and what actually happens (does an email draft open? does it show an error?). Screenshot helps.",
    type: 'multi',
    progress: 40,
    status: 'partial',
    options: [
      {
        label: "I'll test it right now",
        description:
          'You open the quiz and try to reproduce. Tell me what happens.',
        consequence: 'I get the repro info and can fix the bug immediately.',
        recommended: true,
      },
      {
        label: 'It happened on {question/browser}',
        description:
          'You remember enough details (question, browser, what you saw) to narrow it down.',
        consequence: 'I can probably find and fix it with partial info.',
      },
      {
        label: "Can't reproduce — might have been a glitch",
        description:
          'You tried again and nothing happened. It might have been a one-time race condition.',
        consequence:
          'I add defensive error handling so even if it happens again, it fails silently instead of opening email.',
      },
    ],
    links: [
      {
        label: 'GH#207 deselect email bug',
        url: 'https://github.com/organvm-iii-ergon/sovereign-systems--spiral-template/issues/207',
      },
    ],
    notes:
      "You reported this on 2026-05-16 (transcript). Three possible code paths could trigger an email on deselect: (1) the mailto fallback in the quiz capture flow, (2) an unintended form submission, (3) a browser autocomplete quirk. Without repro steps I can't know which one.",
  },
];

// ============ Helpers ============

export function decisionsByCategory(): Record<
  DecisionCategory,
  DecisionItem[]
> {
  const groups: Record<DecisionCategory, DecisionItem[]> = {
    urgent: [],
    'client-gated': [],
    strategic: [],
    'studio-internal': [],
  };
  for (const d of DECISIONS) groups[d.category].push(d);
  return groups;
}

export function overallProgress(): {
  count: number;
  sum: number;
  pct: number;
  resolved: number;
  partial: number;
  open: number;
} {
  const count = DECISIONS.length;
  const sum = DECISIONS.reduce((acc, d) => acc + d.progress, 0);
  const pct = Math.round(sum / count);
  const resolved = DECISIONS.filter((d) => d.status === 'resolved').length;
  const partial = DECISIONS.filter((d) => d.status === 'partial').length;
  const open = DECISIONS.filter((d) => d.status === 'open').length;
  return { count, sum, pct, resolved, partial, open };
}

export function categoryLabel(c: DecisionCategory): string {
  return {
    urgent: 'Urgent · Ship this week',
    'client-gated': 'Client-gated',
    strategic: 'Strategic',
    'studio-internal': 'Studio-internal',
  }[c];
}

export function ownerLabel(o: Owner): string {
  return {
    admin: 'admin',
    '4jp': '4jp / studio',
    both: 'admin + 4jp',
    system: 'System',
  }[o];
}
