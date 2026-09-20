# Astro 6 Migration Scope

- **Status:** Scoped, not started — gated on a Keystatic decision
- **Date:** 2026-05-24
- **Motivation:** Clear the `osv-scanner` dependency vulnerabilities that keep the Trunk CI check red (notably the `@astrojs/cloudflare` SSRF), which have no clean fix while the project is pinned to Astro 5.
- **Related:** PR #109 (restored `npm ci` by reverting the Astro-6-only `@astrojs/cloudflare`/`@astrojs/markdoc` bumps back to Astro-5 lines), commit `f57e9c8` (the original audit-fix attempt that broke installability).

## Verdict

Technically feasible and it clears all the flagged vulnerabilities, but it is
**hard-blocked by Keystatic**. No `@keystatic/astro` release supports Astro 6,
and Keystatic's admin UI crashes under Astro 6's new React-island hydration.
The migration cannot proceed until the Keystatic question is resolved — that is
the gating decision.

## The blocker — Keystatic

- `@keystatic/astro` latest is `5.0.6`, peer-capped at `astro: 2 || 3 || 4 || 5`.
  There is no Astro 6 release (stable or prerelease).
- Upstream tracking issue `Thinkmill/keystatic#1515` ("Add Astro 6 support") is
  open as of 2026-03-14 and unimplemented. On Astro 6 the `/keystatic` UI throws
  React hook errors.
- Keystatic here is an authoring convenience (the `/keystatic` GUI for editing
  the `pillars`/`branches` collections), not a runtime dependency — content
  lives in Markdown and the static build does not need it.

### Keystatic options

| Option | Effort | Trade-off |
| --- | --- | --- |
| Wait for `#1515` | none now | External, no ETA; migration stays blocked |
| Drop Keystatic | low | Lose the GUI editor; content edited via Markdown / GitHub. Unblocks Astro 6 now |
| Replace (Decap / Tina / Pages CMS) | medium-high | Keeps a GUI; new integration, config, and auth |

Open question for the client: does admin actively use the `/keystatic` UI, or
is content edited another way? That determines whether "drop" is acceptable.

## Astro 5 to 6 breaking changes, mapped to this repo

- **Content Layer API (highest churn).** `src/content.config.ts` uses the legacy
  `type: 'content'` in all three collections; Astro 6 removes that, so they must
  move to the `glob()` loader. This changes `getCollection` / `render()` /
  `entry.id` semantics in `src/pages/pillars/[slug].astro`,
  `src/pages/nodes/[id].astro`, and `src/pages/water/[slug].astro`.
- **Cloudflare adapter v13.** `src/pages/capture.ts` reads `locals.runtime.env`
  for the KV `SUBMISSIONS` binding and `GHL_WEBHOOK_URL`; v13 reworks env
  bindings and moves the dev server into `workerd`. Needs review and likely a
  small change.
- **Zod 4** (Zod 3 dropped). The `src/content.config.ts` schemas
  (`z.object` / `z.enum` / `z.array` / `.default`) need a Zod 4 pass — mostly
  mechanical.
- **Markdoc 1.x.** `@astrojs/markdoc` `0.15.11` to `1.0.5` for the rich content
  blocks — verify the render API.
- **Not affected.** No `astro:assets` `<Image>` usage (the image-handling change
  is moot); no i18n.

## Dependency changes and vulnerabilities cleared

```text
astro                 ^5      -> ^6
@astrojs/cloudflare   12.6.13 -> 13.5.4   (pulls wrangler ^4.83 -> clears undici/ws)
@astrojs/markdoc      0.15.11 -> 1.0.5
@astrojs/check        0.9.2   -> 0.9.9    (+ npm audit fix -> clears yaml chain)
@keystatic/astro      5.0.6   -> BLOCKED  (no Astro 6 support)
```

Net effect: `osv-scanner` clean, so the Trunk check goes green. The
`@astrojs/cloudflare` SSRF (the runtime-relevant one) is only patched in the
13.x line, which is exactly why it has no Astro-5 fix.

## Interim mitigation (applied 2026-05-24)

Without waiting for the migration, npm `overrides` pin the vulnerable transitive
dev/build dependencies to patched releases while staying on Astro 5:

```json
"overrides": { "undici": "^7.25.0", "ws": "^8.21.0", "yaml": "^2.9.0" }
```

This clears 8 of the 12 `npm audit` findings — the
`wrangler -> miniflare -> undici/ws` chain and the
`@astrojs/language-server -> yaml` chain — and `npm run test:all` stays green.
These packages run only in local dev/deploy tooling, not in the deployed worker.

The residual 4 findings are all rooted in `astro` core and require Astro 6:
the `@astrojs/cloudflare` SSRF, the `astro` `define:vars` XSS
(GHSA-j687-52p2-xcff), the `astro` server-island encrypted-param replay
(GHSA-xr5h-phrj-8vxv), and `@astrojs/markdoc` (transitively via `astro`). None
are exercised by this site's code — it uses no `astro:assets` `<Image>`, no
`define:vars`, and no server islands — so they are present-but-dormant pending
the migration.

## Recommended sequencing

1. **Now:** merge PR #109 to un-break `npm ci` and ship the issue-discovery
   fixes (the real `test:all` gate is green). PR #110 (Prettier baseline) stands
   as a separate improvement.
2. **Decide Keystatic** (the gate above).
3. **Then, on a dedicated branch:** bump dependencies, migrate the content
   collections to the `glob()` loader, fix the Cloudflare-locals / Zod / Markdoc
   touchpoints, then validate with `npm run test:all` plus manual smoke tests of
   `/`, `/quiz`, `/capture`, and the content pages.

**Effort:** roughly 0.5 to 1 day of focused work once Keystatic is decided. Risk
concentrates in the Content Layer migration and the `/capture` Cloudflare
binding change — both are build-verifiable.

## Sources

- Thinkmill/keystatic#1515 — Add Astro 6 support to `@keystatic/astro`
- Astro docs — Upgrade to Astro v6
- Astro docs — Keystatic and Astro integration guide
