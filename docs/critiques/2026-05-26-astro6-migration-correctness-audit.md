# Correctness Critique: Post Astro-6-Migration Coverage Audit

**Date:** 2026-05-26

**Target:** the 15-commit Astro 6 migration now at `origin/main` (`81b8114`)
— spiral engine, Astro pages, components, `src/data` config, landing
engine, build gates, scripts, CI.

**Stage:** Post-migration, pre-polish. Branch
`claude/issue-reporting-severity-5HQ5L` sits at `origin/main`; this is a
full-surface correctness sweep, not a design pass.

**Method:** Coverage-first static review from code only (no live render).
The goal was breadth, not precision — every suspicion is logged with a
severity and a confidence so a downstream filter can rank and triage.
Items marked "verified" were confirmed by reading the source during this
pass. Findings are evaluative input, not a decided remediation plan.

Severity is High / Medium / Low. Confidence is High / Med / Low.

## Overall Impression

The migration is structurally sound — node, pillar, branch, and EnvVar
counts line up across all five config layers (13 / 4 / 6 / 13, 91 lens
bindings), `compose.ts` is genuinely pure, getStaticPaths are valid, and
the vacuum gate's tracked entries are correctly maintained. No confirmed
build-breaker or guaranteed runtime crash was found.

The real themes are: (1) a soft email gate that protects nothing and
leaks lead capture; (2) client and studio data hardcoded into source
(the M2 mandate) including a personal email and live affiliate URLs;
(3) a spiral lifecycle wired to an event that never fires, plus
incomplete Three.js teardown; and (4) build-gate fragility — `test.mjs`
silently depends on committed generated artifacts that the docs say
should not be committed, and `vacuum-gate.mjs` parses TypeScript with a
regex that can miss a vacuum.

## High Severity

- `EmailGate.astro:26-31,95-133` (conf High, verified). The email gate
  protects nothing: gated `<slot/>` content is server-rendered inside a
  hidden div (fully present in page source), unlock is client-side
  localStorage, and it unlocks even when the `/capture` POST fails
  (lines 128-133). Content is readable via view-source; capture is
  trivially bypassed.
- `Base.astro:671-712` (conf High). The hand-rolled citation tooltip
  builds an HTML string from `cite.source` / `detail` / `context` and
  assigns it via `tooltip.innerHTML` with no escaping. Data is
  studio-controlled `citations.json` (low exploitability), but the sink
  is a real XSS surface; `Citation.astro` renders the same data safely.
- `decisions.astro:27` (conf High, verified). A personal email,
  `padavano.anthony@gmail.com`, is hardcoded as the mailto recipient on
  a client-facing page (PII-in-source plus M2). It also disagrees with
  the synthetic `decisions@sovereign-systems.local` used by capture.ts.
- `SpiralIsland.astro:83-90` (conf High). Spiral cleanup is wired only
  to `astro:before-swap`, but no ClientRouter / ViewTransitions exists,
  so the event never fires — the WebGL context, RAF loop, and
  resize/pointer listeners are never torn down. If ViewTransitions is
  later added, there is no `astro:page-load` rebind, so the spiral will
  not re-mount after a swap.
- `spiral.ts` cleanup, approx 3544-3568 (conf Med). Cleanup disposes
  tracked geometries, materials, and textures but never removes
  scene-graph objects or clears the scene; `UnrealBloomPass` /
  `RenderPass` / `OutputPass` are not individually disposed (relying on
  `composer.dispose()`, which may not free bloom render targets in older
  three). The leak accumulates on repeated mount/unmount.
- `spiral.ts:1760-1765` (conf Med). Renderer creation and
  `container.clientWidth/Height` reads are unguarded; a 0-height
  container yields `camera.aspect = NaN` (corrupt projection), and any
  throw before `return cleanup` leaks everything already allocated
  because the cleanup closure is never returned.
- `quiz.astro:374-382` (conf Med). `MAX_SCORE = 12` is effectively
  unreachable for any single node (the Q3-Q5 theme bundles map to
  different nodes), so the displayed "Match: {score}%" is systematically
  deflated and never reaches 100%.
- `hydration.config.ts:272,290,306,333-359,268-325` (conf High-Med).
  Affiliate URLs (`ionfaucet.com/admin-spiral`,
  `multipure.com/admin-wired`, `purehome.co/admin`), prices, and
  contaminant statistics are hardcoded inline (M2). Prices feed cost
  math via a fragile regex and go stale silently.
- `VideoEmbed.astro:39-46` (conf Med). The iframe takes an arbitrary
  `src` with no host allow-list, `referrerpolicy`, `sandbox`, or
  `youtube-nocookie` enforcement. Dormant today (all callers pass
  `placeholder`) but unguarded for the first real video.
- `nodes/[id].astro:32-33,94,135,176,205` and
  `HydrationNode.astro:583-588` (conf Med). Explicit `: any` annotations
  violate the strict no-any policy. Note `astro check` (tsc) does not
  fail on explicit `any` and there is no ESLint, so CI passes — this is
  policy/safety erosion, not a build break.

## Medium Severity

- `vacuum-gate.mjs:62-73` (conf Med, verified). The filter-tier regex
  lazily stops at the first `}`; a tier with a nested `{}` before
  `affiliateUrl`, or one lacking `affiliateUrl`, can be missed (silent
  gate evasion) or mis-attributed across tiers.
- `test.mjs:154,160-168` plus `package.json` (conf Med, verified).
  `test:all` runs `test` before `build`, but `test.mjs` reads
  `public/citations.json` and `docs/manifests/*.json` produced by
  `prebuild` (build-only). It passes only because both are committed
  snapshots — contradicting CLAUDE.md ("do not commit a stale
  snapshot"). De-committing per the docs breaks `npm test` / CI.
- `docs/manifests/` (conf Med, verified). The latest manifest is dated
  2026-04-30; the migration materially changed the corpus but the
  manifest was not regenerated (the test checks shape, not freshness).
- `hub.config.ts:312`, `nodes/[id].astro:43-45`, `quiz.astro:393`
  (conf High). Node 5's url is `/water/`, not `/nodes/5`; prev/next nav
  and the quiz preview cross out of the node space silently. Likely
  intentional but undocumented and inconsistent.
- `naming-chains.ts:27-34` vs `lens-geometry.ts:13-20` (conf High). Two
  independent `Lens` type definitions (same 7 members, different order)
  plus duplicated `LENSES` arrays; adding a lens to one file silently
  drifts from the other.
- `naming-chains.ts:302-307` (conf High). The PYRAMIS christian-mystical
  binding has `eraSort: -600` despite 16th-century sources, mis-sorting
  the `/lineage/PYRAMIS` chronology to the front.
- `lens-geometry.ts:151` (conf Med). `phiExponent * scaleMul` multiplies
  an exponent by a scale factor (unit conflation); for nodes with
  `phiExponent: 0` it is always 0 regardless of lens. Likely meant to
  modulate scale.
- `HydrationNode.astro:405-409` (conf Med). `row.innerHTML` interpolates
  `c.name` (from the `/api/water-report` EWG proxy) unescaped — reflected
  XSS if the upstream or proxy returns markup. Use `textContent`.
- `HydrationNode.astro:552`, `EmailGate.astro:118` (conf Med). Capture
  `source` values `hydration-node` and `email_gate` are not in the
  CLAUDE.md source registry; downstream filtering by the registry
  silently drops them.
- `decisions.ts:144,161,163,204,245,371,192` (conf Med). Decision copy
  cites source-file line numbers that are already stale (quizFormUrl is
  at line 533); also a live affiliate URL and coupon code are inlined as
  data.
- `SpiralIsland.astro:58-75` (conf High). `JSON.parse` of `data-nodes` /
  `data-ui` is unguarded (a parse error masquerades as a WebGL failure
  and hides the whole container); an invalid `?vessel=` or
  `spiralVesselMode` is cast `as VesselMode` with no validation into
  `initSpiral`.
- `Base.astro:33-49` (`navClass`) (conf Med).
  `currentPath.startsWith(href)` greedily over-highlights sibling routes
  (for example `/research-archive` activates `/research`).
- `spiral.ts:3120,3236` (conf Med). `frame` is the requestAnimationFrame
  handle id (not monotonic), so `(frame * 7919) % len` particle sweeps
  are erratic rather than the intended even cycle.
- `spiral.ts:2411,3453` (conf Med). The `hits.length % 2` inside-test on
  beveled/holed geometry (eye pupil, yin-yang, crescent, ankh) can
  mis-classify edge-grazing rays, producing flickering particles.

## Low Severity

- `spiral.ts:916,1028,1102,1684` (conf High). `getContext('2d')!`
  non-null assertions in four canvas helpers; throws if the 2D context
  is unavailable and violates the no-unsafe-cast posture. Similar `!`
  escapes at lines 2388 and 3107.
- `spiral.ts:1659-1668` (conf High). A stale "0..6" comment;
  `CHAKRA_HEX` now has 8 entries. The code is correct (uses
  `length-1`) but the comment misleads.
- `spiral.ts:1146` (conf Med). `nodePathIndex` clamps the upper bound
  but not negative `t`; a negative value would index an undefined path
  entry and `.clone()` would throw. Not currently triggered.
- `spiral.ts:2909-2911` (conf Med). `prefers-reduced-motion` is read
  once at init with no `change` listener, so toggling it mid-session has
  no effect (accessibility).
- `spiral.ts:711`, `icon-worlds.ts:239` (conf Med). Code indexes by
  0-based `i` (colors) and 1-based `node.id` (universes/worlds)
  interchangeably; a partial or reordered node list passed to
  `initSpiral` would desync color and universe silently.
- `Base.astro:496-507`, `SpiralIsland.astro:66-67` (conf High).
  CLAUDE.md documents `?variant=pillar-first|spiral-first`, but the
  layout reads `?nav=` for that while SpiralIsland reads `?variant=` for
  `stars|symbols`. Docs/code divergence plus a FOUC on the `?nav=` swap.
- `VerticalSpine.astro:42,55-66` (conf Med). `winScroll / height`
  divides by 0 on short pages (NaN%, ignored by the browser); the
  scroll/resize listeners are never removed.
- `PillarCard.astro:12-13` (conf High). A non-live card renders
  `<a href={undefined}>` plus `aria-disabled`, which is not
  keyboard-focusable and does not block activation; it should be a
  non-anchor element (SpiralFallback does this correctly).
- `CycleAwareness.astro:9-65`, `Base.astro:9-13` (`PHASE_ENTRY`)
  (conf Med). Branch copy, cycle phase data, and per-phase node URLs
  (`/nodes/1,6,11`) are inlined (M2 plus desync risk if node numbering
  changes).
- `QuizEmbed.astro:24` (conf Med). An inline `onload` dereferences
  `getElementById('quiz-loading')` without a null guard.
- `quiz.config.ts:149-152` (conf Med). Q5 answer 4 bundles six themes
  versus three elsewhere, giving disproportionate scoring weight toward
  nodes 4 and 13.
- `hydration.config.ts:169-173,155-157` (conf Med). The price regex
  takes the low end of a range and defaults to a fictitious $300 on no
  match; the "All major contaminants" tier always scores 100% regardless
  of the actual contaminant profile.
- `personas.ts:9` (conf Low). A stale comment references Keystatic,
  removed in the migration.
- `.github/workflows/ci.yml:62` (conf Low). The Cloudflare accountId is
  inlined in the workflow (an identifier, not a secret; M2-adjacent).
- `lib/docs-library.ts:202-219` (conf Low). Three single-file library
  entries reference root session artifacts (`*.txt`, `session-ses_*.md`);
  if removed, those library cards render empty.
- Miscellaneous accessibility (conf Med-Low). Breadcrumbs lack
  `aria-current`; VideoEmbed uses a generic `title="Video"` and omits
  `allow`; dual citation-tooltip systems (CSS plus JS) double-fire on
  pages using `Citation`.

## Verified Non-Issues

- Quiz Q3-Q5 theme tags match `hub.config` exactly; all `{placeholder}`
  tokens are substituted; there are no function values in the serialized
  copy.
- getStaticPaths across all dynamic routes return valid params; the
  node-5 to `/water/` exclusion is intentional.
- Counts line up: 13 nodes, 4 pillars, 6 branches, 13 EnvVars, 91 lens
  bindings; `chainsFor` and `viewThroughLens` never return undefined.
- `compose.ts` is genuinely pure; `library-manifest.json` is valid;
  section `type` literals match the renderer switch.
- The quiz result-before-network and fire-and-forget capture is the
  documented intended UX invariant — not a bug.
- The empty-string vacuums (`ghl.quizFormUrl`, `anespa` and `k8`
  `affiliateUrl`) are correctly tracked in `TRACKED_VACUUMS` (GH#58,
  GH#49) — they do not fail the build (verified).

## Suggested Triage Order

1. Decide the intent of the email gate (`EmailGate.astro`). If it is
   meant to gate, the content must not be server-rendered into the DOM;
   if it is a soft prompt, document it so it is not mistaken for
   protection.
2. Remove the hardcoded personal email and live affiliate URLs from
   source into env/config (M2).
3. Decide the spiral lifecycle story — either adopt ViewTransitions (and
   add an `astro:page-load` rebind) or drop the dead `astro:before-swap`
   cleanup, and guard the 0-height and init-throw paths.
4. Harden the build gates — make `test.mjs` independent of build-only
   artifacts (or generate them in a pretest step) and replace the
   vacuum-gate tier regex with a parser that cannot skip a nested tier.

This is a coverage-first audit — findings are unfiltered by design. A
separate verification step should confirm and rank them before any are
actioned.
