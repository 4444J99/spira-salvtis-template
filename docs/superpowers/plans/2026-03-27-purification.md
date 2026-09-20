# Purification — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove premature framework dependencies (React, Keystatic, SSR adapter), fix all 15 review issues, and return the site to its original clean static architecture while preserving all content and citation work.

**Architecture:** Static Astro 5 site. No client-side frameworks. Email capture via Netlify Function (serverless, no SSR adapter). All 263 citations, 18 pages, and content enhancements preserved intact.

**Tech Stack:** Astro 5, Tailwind CSS 4, vanilla Canvas, @astrojs/sitemap, Netlify Functions

---

## File Map

### Removed
| File | Reason |
|------|--------|
| `keystatic.config.ts` | CMS deferred until pricing resolved |
| `src/pages/api/capture.ts` | Replaced by Netlify Function |
| `generate_canon_expansion.py` | Moved to `scripts/` |
| `parse-citations.js` | Moved to `scripts/` |

### Created
| File | Purpose |
|------|---------|
| `netlify/functions/capture.ts` | Serverless email capture (replaces SSR route) |
| `public/og-default.svg` | Placeholder OG image (SVG, zero-dependency) |
| `scripts/parse-citations.js` | Relocated build utility |
| `scripts/generate-canon-expansion.py` | Relocated build utility |

### Modified
| File | Changes |
|------|---------|
| `package.json` | Remove react, @astrojs/react, @keystatic/core, @keystatic/astro, @astrojs/netlify, react-dom |
| `astro.config.mjs` | Remove react(), keystatic(), netlify adapter. Keep sitemap(). |
| `src/layouts/Base.astro` | Fix Twitter meta (property→name), fix OG image path |
| `src/components/ResearchAccordion.astro` | Fix "113" → dynamic count |
| `src/pages/research.astro` | Fix "113" → dynamic count |
| `docs/corpus-canon.md` | Fix header count + ranges |
| `src/content/pillars/inner.md` | Fix dead link /hub → / |
| `src/content/branches/sustainability.md` | Capitalize "but" |
| `src/pages/pillars/[slug].astro` | Add ResearchAccordion + VerticalSpine |
| `src/pages/water/explore.astro` | Change fetch URL from /api/capture to /.netlify/functions/capture |
| `src/components/VerticalSpine.astro` | Throttle scroll listener with rAF |
| `src/pages/business/index.astro` | Replace placeholder URL with "coming soon" CTA |
| `GEMINI.md` | Fix content.config.ts path reference |
| `netlify.toml` | Add functions directory config |

---

## Task 1: Strip Framework Dependencies

**Files:**
- Modify: `package.json`
- Modify: `astro.config.mjs`
- Delete: `keystatic.config.ts`
- Delete: `src/pages/api/capture.ts`

- [ ] **Step 1: Remove packages**

```bash
npm uninstall @keystatic/core @keystatic/astro @astrojs/react @astrojs/netlify react react-dom
```

- [ ] **Step 2: Rewrite astro.config.mjs**

```js
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://hub-example.com',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
```

- [ ] **Step 3: Delete Keystatic config and SSR route**

```bash
rm keystatic.config.ts
rm src/pages/api/capture.ts
```

- [ ] **Step 4: Build to verify nothing breaks**

```bash
npm run build
```

Expected: Build succeeds. Output mode returns to `static`. No SSR function generated. Page count should be 18 (was 18 + SSR).

Note: The build may drop to 17 pages if `/keystatic` was generating a page. The `/research` page should still be present.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "refactor: remove Keystatic, React, SSR adapter — return to clean static

Removed: @keystatic/core, @keystatic/astro, @astrojs/react, @astrojs/netlify,
react, react-dom, keystatic.config.ts, src/pages/api/capture.ts

Client JS drops from ~3MB to ~5KB. Output returns to static.
CMS deferred until pricing resolved (tracked in Issue #1)."
```

---

## Task 2: Create Netlify Function for Email Capture

**Files:**
- Create: `netlify/functions/capture.ts`
- Modify: `src/pages/water/explore.astro`
- Modify: `netlify.toml`

- [ ] **Step 1: Create functions directory and capture function**

```bash
mkdir -p netlify/functions
```

Write `netlify/functions/capture.ts`:

```ts
import type { Context } from "@netlify/functions";

export default async (request: Request, context: Context) => {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const data = await request.json();
    const email = typeof data.email === 'string' ? data.email.trim() : '';

    // Basic email format validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: 'Valid email required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const webhookUrl = Netlify.env.get('GHL_WEBHOOK_URL');

    if (webhookUrl) {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'water_explore_gate', timestamp: new Date().toISOString() }),
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
```

- [ ] **Step 2: Update explore.astro fetch URL**

In `src/pages/water/explore.astro`, change:
```js
const res = await fetch('/api/capture', {
```
to:
```js
const res = await fetch('/.netlify/functions/capture', {
```

- [ ] **Step 3: Update netlify.toml**

Add functions config:
```toml
[functions]
  directory = "netlify/functions"
```

- [ ] **Step 4: Build to verify**

```bash
npm run build
```

Expected: Static build succeeds. No SSR. Netlify Function exists at `netlify/functions/capture.ts`.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: email capture via Netlify Function (replaces SSR route)

Serverless function with email validation. No SSR adapter needed.
GHL webhook forwarding via GHL_WEBHOOK_URL env var."
```

---

## Task 3: Fix All Content Issues

**Files:**
- Modify: `src/components/ResearchAccordion.astro`
- Modify: `src/pages/research.astro`
- Modify: `docs/corpus-canon.md`
- Modify: `src/content/pillars/inner.md`
- Modify: `src/content/branches/sustainability.md`
- Modify: `GEMINI.md`

- [ ] **Step 1: Fix stale "113" in ResearchAccordion.astro**

Change line 45 from:
```
View full 113-source bibliography &#x2192;
```
to:
```
View full bibliography &#x2192;
```

(Remove the number entirely — it will never go stale again.)

- [ ] **Step 2: Fix stale "113" in research.astro**

Change the subtitle from:
```
An annotated bibliography of the 113 sacred, philosophical, and peer-reviewed sources
```
to:
```
An annotated bibliography of the sacred, philosophical, and peer-reviewed sources
```

Add a dynamic count by importing citations:
```astro
---
import Base from '../layouts/Base.astro';
import { citations } from '../data/citations';

const sacred = citations.filter(c => c.id.startsWith('S-'));
const biomedical = citations.filter(c => c.id.startsWith('B-'));
const total = citations.length;
---
```

Then in the subtitle:
```html
<p>...{total} sacred, philosophical, and peer-reviewed sources...</p>
```

- [ ] **Step 3: Fix corpus-canon.md header**

Change line 7 from `**Total entries:** 113` to `**Total entries:** 263`.
Update ID ranges to reflect actual content (S-01 through S-110, B-01 through B-153).

- [ ] **Step 4: Fix dead link in inner.md**

Change line 77 from `[Understand the full framework →](/hub)` to `[Understand the full framework →](/)`.

- [ ] **Step 5: Fix sustainability.md capitalization**

Find the lowercase "but" at start of sentence and capitalize it.

- [ ] **Step 6: Fix GEMINI.md stale path**

Change reference to `content.config.ts` to `src/content.config.ts`.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "fix: resolve all content issues — stale counts, dead links, copyediting

- Remove hardcoded 113 counts (now dynamic from citations.length)
- Fix /hub dead link → / in inner.md
- Capitalize 'but' in sustainability.md
- Fix GEMINI.md content.config.ts path"
```

---

## Task 4: Fix Base.astro (OG Image + Twitter Meta)

**Files:**
- Modify: `src/layouts/Base.astro`
- Create: `public/og-default.svg`

- [ ] **Step 1: Create public directory + placeholder OG image**

```bash
mkdir -p public
```

Write `public/og-default.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect fill="#071e22" width="1200" height="630"/>
  <text x="600" y="280" text-anchor="middle" fill="#119a9e" font-family="Georgia,serif" font-size="64" font-weight="300">Sovereign Systems</text>
  <text x="600" y="360" text-anchor="middle" fill="#ffffff" font-family="Georgia,serif" font-size="40" font-weight="300" opacity="0.6">Spiral</text>
  <line x1="500" y1="420" x2="700" y2="420" stroke="#c9a96e" stroke-width="1" opacity="0.4"/>
</svg>
```

- [ ] **Step 2: Fix Base.astro OG image + Twitter meta**

Change the image default from `/og-image.jpg` to `/og-default.svg`.

Change all Twitter meta tags from `property` to `name`:
```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:url" content={canonicalURL} />
<meta name="twitter:title" content={title} />
<meta name="twitter:description" content={description} />
<meta name="twitter:image" content={new URL(image, Astro.site)} />
```

- [ ] **Step 3: Build and verify**

```bash
npm run build
ls dist/og-default.svg
```

Expected: SVG copied to dist.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "fix: OG image + Twitter meta tags

- Created public/og-default.svg placeholder for social sharing
- Fixed Twitter meta: property → name (per Twitter Card spec)
- OG image now resolves instead of 404"
```

---

## Task 5: Wire ResearchAccordion + VerticalSpine into Pillar Pages

**Files:**
- Modify: `src/pages/pillars/[slug].astro`

- [ ] **Step 1: Read current pillar page**

Read `src/pages/pillars/[slug].astro` to see current imports and structure.

- [ ] **Step 2: Add ResearchAccordion and VerticalSpine**

Add imports:
```astro
import ResearchAccordion from '../../components/ResearchAccordion.astro';
import VerticalSpine from '../../components/VerticalSpine.astro';
import { config } from '../../data/hub.config';
```

Add VerticalSpine at the top of the template (after `<Base>`):
```astro
<VerticalSpine />
```

Add ResearchAccordion after the content section (before the CTA), wrapped in a status check:
```astro
{status === 'live' && pillarConfig && pillarConfig.citationIds && (
  <div class="max-w-[640px] mx-auto px-6">
    <ResearchAccordion ids={pillarConfig.citationIds} />
  </div>
)}
```

Get pillarConfig from hub.config:
```ts
const pillarConfig = config.pillars.find(p => p.slug === pillar.id.replace(/\.md$/, ''));
```

- [ ] **Step 3: Build and verify**

```bash
npm run build
```

Expected: Pillar pages now render with accordion + spine.

- [ ] **Step 4: Commit**

```bash
git add src/pages/pillars/ && git commit -m "feat: add ResearchAccordion + VerticalSpine to pillar pages

Pillar pages now match branch pages — citations displayed in
expandable accordion, scroll progress tracked via vertical spine."
```

---

## Task 6: Throttle VerticalSpine + Fix Placeholder URLs

**Files:**
- Modify: `src/components/VerticalSpine.astro`
- Modify: `src/pages/business/index.astro`
- Modify: `src/data/hub.config.ts`

- [ ] **Step 1: Throttle scroll listener**

In `src/components/VerticalSpine.astro`, replace:
```js
window.addEventListener('scroll', updateSpine);
```
with:
```js
let ticking = false;
window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      updateSpine();
      ticking = false;
    });
    ticking = true;
  }
});
```

- [ ] **Step 2: Fix placeholder URL in business page**

In `src/pages/business/index.astro`, change the CTA from:
```html
<CTAButton href="https://placeholder.ghl.com/calendar/business" label="Apply for a Systems Audit" />
```
to:
```html
<div class="text-white/30 text-[14px] font-light border border-white/10 rounded-full px-9 py-3.5 inline-block">
  Application opening soon
</div>
```

- [ ] **Step 3: Fix placeholder quiz URL in hub.config.ts**

In `src/data/hub.config.ts`, change:
```ts
quizFormUrl: 'https://placeholder.ghl.com/form/quiz',
```
to:
```ts
quizFormUrl: '', // admin provides GHL form URL
```

Update QuizEmbed.astro to show a message when URL is empty (check if it already handles this).

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "fix: throttle scroll, replace placeholder URLs with coming-soon states

- VerticalSpine uses requestAnimationFrame (no layout thrashing)
- Business CTA shows 'Application opening soon' instead of fake URL
- Quiz URL empty until admin provides GHL form embed"
```

---

## Task 7: Relocate Build Scripts + Final Cleanup

**Files:**
- Move: `parse-citations.js` → `scripts/parse-citations.js`
- Move: `generate_canon_expansion.py` → `scripts/generate-canon-expansion.py`

- [ ] **Step 1: Move scripts**

```bash
mkdir -p scripts
mv parse-citations.js scripts/
mv generate_canon_expansion.py scripts/generate-canon-expansion.py
```

- [ ] **Step 2: Add npm script for citation parsing**

In `package.json`, add to scripts:
```json
"parse-citations": "node scripts/parse-citations.js"
```

- [ ] **Step 3: Final build verification**

```bash
npm run build
```

Expected: Clean static build. 18 pages + sitemap. No SSR function. No React in output. Client JS ~5KB (spiral only).

Verify:
```bash
ls dist/_astro/*.js | wc -l
du -sh dist/_astro/
```

Expected: 2 JS files (spiral boot + spiral renderer), total ~5-8KB.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "chore: relocate build scripts to scripts/, add npm parse-citations command"
```

- [ ] **Step 5: Deploy and verify**

```bash
npx netlify-cli deploy --prod --build
```

Expected: Deploy to elevate-align-spiral.netlify.app. All pages working. Spiral animates. OG image resolves. No React in network tab.

- [ ] **Step 6: Final commit + push**

```bash
git push origin main
```

---

## Verification Checklist

After all tasks:

- [ ] `npm run build` succeeds with 0 errors, output mode `static`
- [ ] No React, Keystatic, or @astrojs/netlify in `node_modules`
- [ ] Client JS bundle < 10KB total
- [ ] 18 pages generated (hub + 6 branches + 4 pillars + business + quiz + explore + research + water landing)
- [ ] OG image exists at `/og-default.svg` and resolves
- [ ] Twitter meta uses `name` not `property`
- [ ] No "113" anywhere in rendered output (grep dist/)
- [ ] `/hub` link doesn't exist (inner.md links to `/`)
- [ ] All pillar pages have ResearchAccordion
- [ ] VerticalSpine scroll doesn't cause jank
- [ ] Business page shows "Application opening soon" not a fake URL
- [ ] Email gate on /water/explore works (client-side + Netlify Function)
- [ ] Netlify deploy succeeds
- [ ] `git status` clean, pushed to origin
