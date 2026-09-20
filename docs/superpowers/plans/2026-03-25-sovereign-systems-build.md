# Sovereign Systems Spiral — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the full Sovereign Systems Spiral website — hub with interactive spiral + water funnel with documentary-first landing, quiz embed, and 6 branch pages — deployed to Netlify.

**Architecture:** Single Astro 5 codebase serving three domains via subdirectory routing. Content in Markdown collections. Spiral rendered as vanilla canvas with Perlin noise (desktop) / CSS float list (mobile). GHL quiz embedded via iframe. All site topology defined in one `hub.config.ts` file.

**Tech Stack:** Astro 5, Tailwind CSS 4, vanilla Canvas API, Netlify

**Spec:** `docs/superpowers/specs/2026-03-25-sovereign-systems-design.md`

---

## File Map

### Created (new files)

| File | Responsibility |
|------|---------------|
| `astro.config.mjs` | Astro config: Tailwind integration, site URL |
| ~~`tailwind.config.mjs`~~ | ~~Theme tokens~~ — **Not needed in Tailwind v4.** Tokens live in `src/styles/global.css` via `@theme` block. |
| `content.config.ts` | Astro content collection schemas for branches + pillars |
| `src/styles/global.css` | Tailwind directives + CSS custom properties (color system) |
| `src/data/hub.config.ts` | Site topology: pillars, branches, domains, GHL URLs |
| `src/layouts/Base.astro` | Shared HTML shell: head, fonts, nav, footer |
| `src/components/Hero.astro` | Reusable hero section (heading + subtext + optional CTA) |
| `src/components/CTAButton.astro` | Consistent call-to-action button |
| `src/components/ComingSoon.astro` | Placeholder for unbuilt pages |
| `src/components/VideoEmbed.astro` | Responsive video player with placeholder state |
| `src/components/BranchSection.astro` | Single section of a branch page |
| `src/components/QuizEmbed.astro` | GHL form embed with loading state |
| `src/components/PillarCard.astro` | Card for pillar overview |
| `src/components/spiral/spiral.ts` | Vanilla canvas orbital animation with Perlin noise |
| `src/components/spiral/SpiralIsland.astro` | Astro island wrapper (desktop only via client:media) |
| `src/components/spiral/SpiralFallback.astro` | Mobile CSS float list |
| `src/components/MiniSpiral.astro` | Smaller spiral for water explore page |
| `src/pages/index.astro` | Hub landing page |
| `src/pages/pillars/[slug].astro` | Dynamic pillar pages |
| `src/pages/water/index.astro` | Water landing page |
| `src/pages/water/quiz.astro` | Quiz page with GHL embed |
| `src/pages/water/explore.astro` | Water branch explorer |
| `src/pages/water/[slug].astro` | Dynamic branch pages |
| `src/pages/business/index.astro` | Business pillar placeholder |
| `src/content/branches/*.md` | 6 branch content files |
| `src/content/pillars/*.md` | 4 pillar content files |
| `netlify.toml` | Netlify build + multi-domain redirect config |
| `seed.yaml` | ORGANVM ecosystem contract |
| `CLAUDE.md` | Project-specific Claude instructions |
| `.gitignore` | Node + Astro + Netlify ignores |

---

## Task 1: Scaffold Astro Project + Config

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tailwind.config.mjs`, `tsconfig.json`
- Create: `src/styles/global.css`
- Create: `src/data/hub.config.ts`
- Create: `content.config.ts`
- Create: `.gitignore`

- [ ] **Step 1: Initialize Astro project**

```bash
cd /Users/4jp/Workspace/organvm-iii-ergon/sovereign-systems--spiral-template
npm create astro@latest . -- --template minimal --no-install --typescript strict
```

Accept overwriting if prompted. Then install dependencies:

```bash
npm install
npm install tailwindcss @tailwindcss/vite
```

- [ ] **Step 2: Configure Astro**

Write `astro.config.mjs`:

```js
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://hub-example.com',
  vite: {
    plugins: [tailwindcss()],
  },
});
```

- [ ] **Step 3: Write global CSS with color system**

Write `src/styles/global.css`:

```css
@import 'tailwindcss';

@theme {
  --color-ocean-900: #0a2a2f;
  --color-ocean-800: #0f3a40;
  --color-ocean-700: #145050;
  --color-ocean-600: #1a6b6b;
  --color-ocean-500: #119a9e;
  --color-ocean-400: #3dbfc4;
  --color-ocean-300: #8cc5d3;
  --color-ocean-200: #b8dfe6;
  --color-ocean-100: #e0f0f0;

  --color-sand-900: #2a2520;
  --color-sand-500: #8a7d6b;
  --color-sand-300: #c9b89a;
  --color-sand-100: #f0ebe4;
  --color-sand-50: #faf8f5;

  --color-gold: #c9a96e;

  --color-text-primary: #1a2a2f;
  --color-text-body: #4a5a60;
  --color-text-muted: #7a8a90;
  --color-text-on-dark: #e8e4df;

  --font-heading: 'Cormorant Garamond', Georgia, serif;
  --font-body: 'Inter', system-ui, sans-serif;
}

html {
  font-family: var(--font-body);
  color: var(--color-text-body);
  background-color: var(--color-sand-50);
}

h1, h2, h3, h4 {
  font-family: var(--font-heading);
  color: var(--color-text-primary);
}
```

- [ ] **Step 4: Write hub config**

Write `src/data/hub.config.ts`:

```ts
export interface Pillar {
  name: string;
  slug: string;
  emoji: string;
  tagline: string;
  color: string;
  url: string;
  status: 'live' | 'coming-soon';
  order: number;
}

export interface Branch {
  name: string;
  slug: string;
  emoji: string;
  order: number;
}

export interface HubConfig {
  name: string;
  tagline: string;
  pillars: Pillar[];
  branches: Branch[];
  domains: {
    hub: string;
    water: string;
    business: string;
  };
  ghl: {
    quizFormUrl: string;
    productUrl: string;
  };
}

export const config: HubConfig = {
  name: 'Sovereign Systems Spiral',
  tagline: 'Rebuilding life from the foundation up — stabilizing the body, strengthening inner authority, refining identity, and installing financial systems.',
  pillars: [
    {
      name: 'Physical Sovereignty',
      slug: 'physical',
      emoji: '\u{1F30A}',
      tagline: 'Control your inputs. Stabilize your body.',
      color: '#119a9e',
      url: '/water/',
      status: 'live',
      order: 1,
    },
    {
      name: 'Inner Sovereignty',
      slug: 'inner',
      emoji: '\u{1F54A}',
      tagline: 'Control your internal state.',
      color: '#8cc5d3',
      url: '/pillars/inner',
      status: 'coming-soon',
      order: 2,
    },
    {
      name: 'Identity Sovereignty',
      slug: 'identity',
      emoji: '\u{2728}',
      tagline: 'Control your self-expression.',
      color: '#c9a96e',
      url: '/pillars/identity',
      status: 'coming-soon',
      order: 3,
    },
    {
      name: 'Financial Sovereignty',
      slug: 'financial',
      emoji: '\u{1F4A0}',
      tagline: 'Control your income and systems.',
      color: '#3dbfc4',
      url: '/business/',
      status: 'coming-soon',
      order: 4,
    },
  ],
  branches: [
    { name: 'Gut + Hormones', slug: 'gut-hormones', emoji: '\u{1F33F}', order: 1 },
    { name: 'Fertility', slug: 'fertility', emoji: '\u{1F90D}', order: 2 },
    { name: 'Athletic Performance', slug: 'athletic', emoji: '\u{1F4AA}', order: 3 },
    { name: 'Inflammation / Autoimmune', slug: 'autoimmune', emoji: '\u{1F525}', order: 4 },
    { name: 'Cancer Support', slug: 'cancer-support', emoji: '\u{1F397}', order: 5 },
    { name: 'Sustainability / Savings', slug: 'sustainability', emoji: '\u{1F30E}', order: 6 },
  ],
  domains: {
    hub: 'hub-example.com',
    water: 'water-example.com',
    business: 'business-example.com',
  },
  ghl: {
    quizFormUrl: 'https://placeholder.ghl.com/form/quiz',
    productUrl: 'https://water-example.com',
  },
};
```

- [ ] **Step 5: Write content collection schemas**

Write `content.config.ts` (at project root, Astro 5 convention):

```ts
import { defineCollection, z } from 'astro:content';

const branches = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    emoji: z.string(),
    hook: z.string(),
    status: z.enum(['live', 'placeholder']),
    tone: z.enum(['standard', 'soft']).default('standard'),
    order: z.number(),
  }),
});

const pillars = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    emoji: z.string(),
    tagline: z.string(),
    status: z.enum(['live', 'placeholder']),
    order: z.number(),
  }),
});

export const collections = { branches, pillars };
```

- [ ] **Step 6: Write .gitignore**

```
node_modules/
dist/
.astro/
.netlify/
.superpowers/
.DS_Store
```

- [ ] **Step 7: Verify build**

```bash
npm run build
```

Expected: Build succeeds with 0 pages (no pages yet). No errors.

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "feat: scaffold Astro project with Tailwind, color system, hub config, content schemas"
```

---

## Task 2: Content Markdown Files

**Files:**
- Create: `src/content/branches/gut-hormones.md`
- Create: `src/content/branches/fertility.md`
- Create: `src/content/branches/autoimmune.md`
- Create: `src/content/branches/athletic.md`
- Create: `src/content/branches/cancer-support.md`
- Create: `src/content/branches/sustainability.md`
- Create: `src/content/pillars/physical.md`
- Create: `src/content/pillars/inner.md`
- Create: `src/content/pillars/identity.md`
- Create: `src/content/pillars/financial.md`

**Source:** Branch copy for gut-hormones, fertility, and autoimmune comes from the ChatGPT "Novel Funnel Strategies" transcript at `/Users/4jp/Desktop/ChatGPT-Novel Funnel Strategies.md`. Search for the section headers (e.g., "GUT + HORMONES BRANCH PAGE", "FERTILITY BRANCH PAGE", "AUTOIMMUNE BRANCH PAGE"). The user's inline handoff message also contains this copy. Extract the 6-section structure (Hook, Connection, Where Water Fits, Bridge, Resources, CTA) from each.

Pillar content for physical and inner comes from the ChatGPT spec's "THE BACKBONE (Strategic Structure)" section (~line 1600-1700).

- [ ] **Step 1: Write the 3 live branch pages**

Read the ChatGPT spec to extract the exact copy for each branch. Write each `.md` file with frontmatter matching the schema and body using `## Hook`, `## Connection`, `## Where Water Fits`, `## Bridge`, `## Resources`, `## CTA` headings.

Example structure for `src/content/branches/gut-hormones.md`:

```markdown
---
title: "Gut + Hormones"
emoji: "\U0001F33F"
hook: "If your gut is off, everything feels off."
status: live
tone: standard
order: 1
---

## Hook

If your gut is off, everything feels off...

[Extract full copy from ChatGPT spec — the gut/hormones branch page section]

## Connection

[Body text about what's happening in the body]

## Where Water Fits

[Hydrogen benefits, grounded]

## Bridge

[Reassurance — this doesn't have to be overwhelming]

## Resources

- Coming soon

## CTA

Start with your water.
```

Repeat for `fertility.md` and `autoimmune.md` with their respective copy from the spec.

- [ ] **Step 2: Write the 3 placeholder branch pages**

`src/content/branches/athletic.md`:

```markdown
---
title: "Athletic Performance"
emoji: "\U0001F4AA"
hook: "Your body is capable of more than you think."
status: placeholder
tone: standard
order: 3
---

## Hook

Your body is capable of more than you think.

## Connection

This branch is growing. We're preparing content about how water quality impacts athletic performance, recovery, and endurance.

## Where Water Fits

Coming soon.

## Bridge

Check back soon.

## Resources

- Coming soon

## CTA

Start with your water.
```

`src/content/branches/cancer-support.md`:

```markdown
---
title: "Cancer Support"
emoji: "\U0001F397"
hook: "You don't have to navigate this alone."
status: placeholder
tone: soft
order: 5
---

## Hook

You don't have to navigate this alone.

## Connection

This is a space for gentle exploration. We're preparing resources about how water quality can support the body during difficult times.

## Where Water Fits

Coming soon.

## Bridge

There is no pressure here.

## Resources

- Coming soon

## CTA

Explore gently.
```

`src/content/branches/sustainability.md`:

```markdown
---
title: "Sustainability / Savings"
emoji: "\U0001F30E"
hook: "What if better water also meant less waste and lower costs?"
status: placeholder
tone: standard
order: 6
---

## Hook

What if better water also meant less waste and lower costs?

## Connection

This branch is growing. We're preparing content about the environmental and financial impact of water choices.

## Where Water Fits

Coming soon.

## Bridge

Check back soon.

## Resources

- Coming soon

## CTA

Start with your water.
```

- [ ] **Step 3: Write the 4 pillar pages**

`src/content/pillars/physical.md`:

```markdown
---
title: "Physical Sovereignty"
emoji: "\U0001F30A"
tagline: "Control your inputs. Stabilize your body."
status: live
order: 1
---

## Overview

Physical Sovereignty is the foundation of the Sovereign Systems Spiral. Everything starts here.

## What This Means

- Water quality and hydration
- Nervous system regulation
- Inflammation management
- Energy optimization
- Hormone stability
- Sleep architecture

## Why It's First

You cannot build income on an unstable body. You cannot refine identity while your nervous system is in survival mode. Physical sovereignty creates the platform everything else stands on.

## Start Here

The water pillar is your entry point. Take the quiz to find where your body needs support most.
```

`src/content/pillars/inner.md`:

```markdown
---
title: "Inner Sovereignty"
emoji: "\U0001F54A"
tagline: "Control your internal state."
status: live
order: 2
---

## Overview

Inner Sovereignty is the second layer — regulating your emotional and nervous system state so you can make clear decisions.

## What This Means

- Emotional authority
- Responsibility and ownership
- The Spiral framework for self-check-in
- Belief recalibration
- Vision anchoring

## Why It's Second

Once your body is stable, your inner state becomes accessible. You can't regulate what you can't feel. Physical stability unlocks emotional clarity.
```

`src/content/pillars/identity.md`:

```markdown
---
title: "Identity Sovereignty"
emoji: "\u2728"
tagline: "Control your self-expression."
status: placeholder
order: 3
---

## Overview

This pillar is coming soon. Identity Sovereignty covers fashion evolution, personal brand, voice, standards, and environment design.
```

`src/content/pillars/financial.md`:

```markdown
---
title: "Financial Sovereignty"
emoji: "\U0001F4A0"
tagline: "Control your income and systems."
status: placeholder
order: 4
---

## Overview

This pillar is coming soon. Financial Sovereignty covers skill-based income, backend funnels, tracking, automation, lead flow, and sales process.
```

- [ ] **Step 4: Verify content collections parse**

```bash
npm run build
```

Expected: Build succeeds. Astro discovers the content collections. No schema validation errors.

- [ ] **Step 5: Commit**

```bash
git add src/content/ && git commit -m "content: add 6 branch pages + 4 pillar pages (3 live branches, 2 live pillars, rest placeholder)"
```

---

## Task 3: Base Layout + Shared Components

**Files:**
- Create: `src/layouts/Base.astro`
- Create: `src/components/Hero.astro`
- Create: `src/components/CTAButton.astro`
- Create: `src/components/ComingSoon.astro`
- Create: `src/components/VideoEmbed.astro`
- Create: `src/components/BranchSection.astro`
- Create: `src/components/QuizEmbed.astro`
- Create: `src/components/PillarCard.astro`

- [ ] **Step 1: Write Base layout**

`src/layouts/Base.astro`:

```astro
---
import '../styles/global.css';
import { config } from '../data/hub.config';

interface Props {
  title: string;
  description?: string;
}

const { title, description = config.tagline } = Astro.props;
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content={description} />
    <title>{title} | {config.name}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;500&display=swap"
      rel="stylesheet"
    />
  </head>
  <body class="min-h-screen flex flex-col">
    <nav class="px-6 py-4 flex items-center justify-between border-b border-ocean-100">
      <a href="/" class="font-heading text-xl text-ocean-900 hover:text-ocean-500 transition-colors">
        {config.name}
      </a>
      <div class="flex gap-6 text-sm">
        <a href="/water/" class="text-text-body hover:text-ocean-500 transition-colors">Water</a>
        <a href="/water/quiz" class="text-text-body hover:text-ocean-500 transition-colors">Quiz</a>
        <a href="/water/explore" class="text-text-body hover:text-ocean-500 transition-colors">Explore</a>
      </div>
    </nav>

    <main class="flex-1">
      <slot />
    </main>

    <footer class="px-6 py-8 border-t border-ocean-100 text-center text-sm text-text-muted">
      <p>&copy; {new Date().getFullYear()} {config.name}. All rights reserved.</p>
    </footer>
  </body>
</html>
```

- [ ] **Step 2: Write Hero component**

`src/components/Hero.astro`:

```astro
---
interface Props {
  heading: string;
  subtext?: string;
  dark?: boolean;
}

const { heading, subtext, dark = false } = Astro.props;
const bg = dark ? 'bg-ocean-900 text-text-on-dark' : 'bg-sand-50';
const headingColor = dark ? 'text-ocean-100' : 'text-text-primary';
const subtextColor = dark ? 'text-ocean-300' : 'text-text-body';
---

<section class={`px-6 py-20 text-center ${bg}`}>
  <h1 class={`font-heading text-4xl md:text-5xl font-normal mb-4 ${headingColor}`}>
    {heading}
  </h1>
  {subtext && (
    <p class={`max-w-xl mx-auto text-lg font-light leading-relaxed ${subtextColor}`}>
      {subtext}
    </p>
  )}
  <div class="mt-8">
    <slot />
  </div>
</section>
```

- [ ] **Step 3: Write CTAButton component**

`src/components/CTAButton.astro`:

```astro
---
interface Props {
  href: string;
  label: string;
  variant?: 'primary' | 'secondary';
}

const { href, label, variant = 'primary' } = Astro.props;
const styles = variant === 'primary'
  ? 'bg-ocean-500 text-white hover:bg-ocean-400'
  : 'border border-ocean-500 text-ocean-500 hover:bg-ocean-100';
---

<a
  href={href}
  class={`inline-block px-8 py-3 rounded-full text-sm font-medium transition-colors ${styles}`}
>
  {label}
</a>
```

- [ ] **Step 4: Write ComingSoon component**

`src/components/ComingSoon.astro`:

```astro
---
interface Props {
  title: string;
  emoji: string;
  message?: string;
}

const { title, emoji, message = 'This branch is growing. Check back soon.' } = Astro.props;
---

<div class="max-w-lg mx-auto text-center py-20 px-6">
  <div class="text-5xl mb-4">{emoji}</div>
  <h2 class="font-heading text-2xl mb-3">{title}</h2>
  <p class="text-text-muted font-light">{message}</p>
</div>
```

- [ ] **Step 5: Write VideoEmbed component**

`src/components/VideoEmbed.astro`:

```astro
---
interface Props {
  src?: string;
  title?: string;
  placeholder?: boolean;
}

const { src, title = 'Video', placeholder = false } = Astro.props;
---

<div class="w-full max-w-3xl mx-auto aspect-video rounded-xl overflow-hidden bg-ocean-900 relative">
  {placeholder || !src ? (
    <div class="absolute inset-0 flex flex-col items-center justify-center text-text-on-dark">
      <div class="w-16 h-16 rounded-full border-2 border-ocean-400 flex items-center justify-center mb-4">
        <svg class="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>
      <p class="text-ocean-300 text-sm font-light">Documentary coming soon</p>
    </div>
  ) : (
    <iframe
      src={src}
      title={title}
      class="w-full h-full"
      frameborder="0"
      allow="autoplay; fullscreen"
      allowfullscreen
    />
  )}
</div>
```

- [ ] **Step 6: Write BranchSection component**

`src/components/BranchSection.astro`:

```astro
---
interface Props {
  tone?: 'standard' | 'soft';
}

const { tone = 'standard' } = Astro.props;
const accent = tone === 'soft' ? 'border-ocean-200' : 'border-ocean-500';
---

<section class={`border-l-2 ${accent} pl-6 py-4 mb-8`}>
  <slot />
</section>
```

- [ ] **Step 7: Write QuizEmbed component**

`src/components/QuizEmbed.astro`:

```astro
---
import { config } from '../data/hub.config';

interface Props {
  formUrl?: string;
}

const { formUrl = config.ghl.quizFormUrl } = Astro.props;
---

<div class="max-w-2xl mx-auto" id="quiz-container">
  <div id="quiz-loading" class="text-center py-12 text-text-muted">
    <p class="font-light">Loading your quiz...</p>
  </div>
  <iframe
    src={formUrl}
    width="100%"
    style="border:none; min-height:600px;"
    title="Find what your body needs"
    onload="document.getElementById('quiz-loading').style.display='none'"
  />
</div>
```

- [ ] **Step 8: Write PillarCard component**

`src/components/PillarCard.astro`:

```astro
---
import type { Pillar } from '../data/hub.config';

interface Props {
  pillar: Pillar;
}

const { pillar } = Astro.props;
const isLive = pillar.status === 'live';
---

<a
  href={pillar.url}
  class={`block p-6 rounded-xl border transition-all hover:shadow-md ${
    isLive
      ? 'border-ocean-200 hover:border-ocean-400 bg-white'
      : 'border-dashed border-ocean-200 bg-sand-50 opacity-75'
  }`}
>
  <div class="text-3xl mb-2">{pillar.emoji}</div>
  <h3 class="font-heading text-lg mb-1">{pillar.name}</h3>
  <p class="text-sm text-text-muted font-light">{pillar.tagline}</p>
  {!isLive && (
    <span class="inline-block mt-3 text-xs text-ocean-400 font-medium uppercase tracking-wider">
      Coming soon
    </span>
  )}
</a>
```

- [ ] **Step 9: Write a smoke test page to verify components render**

Create `src/pages/index.astro` (temporary, replaced in Task 5):

```astro
---
import Base from '../layouts/Base.astro';
import Hero from '../components/Hero.astro';
import CTAButton from '../components/CTAButton.astro';
---

<Base title="Home">
  <Hero heading="Sovereign Systems Spiral" subtext="Structure on the outside. Spiral growth on the inside.">
    <CTAButton href="/water/" label="Start at the root" />
  </Hero>
</Base>
```

- [ ] **Step 10: Build and verify**

```bash
npm run build
```

Expected: Build succeeds. 1 page generated (`/index.html`). No errors.

```bash
npm run dev &
sleep 2
curl -s http://localhost:4321/ | head -20
kill %1
```

Expected: HTML response containing "Sovereign Systems Spiral". Fonts loading. Tailwind classes present.

- [ ] **Step 11: Commit**

```bash
git add src/layouts/ src/components/ src/pages/index.astro && git commit -m "feat: base layout + 8 shared components (Hero, CTA, ComingSoon, VideoEmbed, BranchSection, QuizEmbed, PillarCard)"
```

---

## Task 4: Water Funnel Pages

**Files:**
- Create: `src/pages/water/index.astro`
- Create: `src/pages/water/quiz.astro`
- Create: `src/pages/water/explore.astro`
- Create: `src/pages/water/[slug].astro`
- Create: `src/components/MiniSpiral.astro`

**Depends on:** Tasks 1, 2, 3

- [ ] **Step 1: Write water landing page**

`src/pages/water/index.astro`:

```astro
---
import Base from '../../layouts/Base.astro';
import Hero from '../../components/Hero.astro';
import VideoEmbed from '../../components/VideoEmbed.astro';
import CTAButton from '../../components/CTAButton.astro';
---

<Base title="The Water Hub" description="A simple shift that impacted my health, energy, and everything I thought I knew about healing.">
  <Hero
    heading="Water changed everything for me."
    subtext="A simple shift that impacted my health, energy, and everything I thought I knew about healing."
  />

  <!-- Documentary -->
  <section class="px-6 py-16 bg-white">
    <VideoEmbed placeholder={true} title="My Water Story" />
  </section>

  <!-- Post-video grounding -->
  <section class="px-6 py-12 max-w-2xl mx-auto text-center">
    <h2 class="font-heading text-2xl mb-4">What you just watched</h2>
    <p class="text-text-body font-light leading-relaxed">
      This is my story — how changing my water changed my health, my energy, and eventually my entire life.
      If you made it this far, you probably feel something too.
    </p>
  </section>

  <!-- Simple education -->
  <section class="px-6 py-12 bg-ocean-100/30">
    <div class="max-w-2xl mx-auto">
      <h2 class="font-heading text-2xl mb-6 text-center">The basics</h2>
      <div class="grid md:grid-cols-2 gap-8">
        <div>
          <h3 class="font-heading text-lg mb-2">What is molecular hydrogen?</h3>
          <p class="text-text-body font-light text-sm leading-relaxed">
            Molecular hydrogen (H2) is the smallest molecule in existence. It acts as a selective antioxidant,
            targeting only the most harmful free radicals while leaving beneficial ones alone.
          </p>
        </div>
        <div>
          <h3 class="font-heading text-lg mb-2">Why hydration isn't just water anymore</h3>
          <p class="text-text-body font-light text-sm leading-relaxed">
            Most tap and bottled water has been stripped of minerals and structure.
            True hydration means giving your cells what they actually need to function.
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- CTAs -->
  <section class="px-6 py-16 text-center space-y-6">
    <div>
      <CTAButton href="/water/quiz" label="Find what your body actually needs" />
    </div>
    <div>
      <CTAButton href="/water/explore" label="Explore by category" variant="secondary" />
    </div>
    <p class="text-text-muted text-sm font-light italic mt-8">
      If something in you is curious... follow that.
    </p>
  </section>
</Base>
```

- [ ] **Step 2: Write quiz page**

`src/pages/water/quiz.astro`:

```astro
---
import Base from '../../layouts/Base.astro';
import Hero from '../../components/Hero.astro';
import QuizEmbed from '../../components/QuizEmbed.astro';
---

<Base title="Find What Your Body Needs">
  <Hero
    heading="Find what your body actually needs"
    subtext="5 quick questions. No wrong answers. Just honest curiosity."
  />

  <section class="px-6 py-12">
    <QuizEmbed />
  </section>
</Base>
```

- [ ] **Step 3: Write MiniSpiral component**

`src/components/MiniSpiral.astro`:

```astro
---
import { config } from '../data/hub.config';

const { branches } = config;
---

<div class="max-w-md mx-auto">
  <div class="text-center mb-8">
    <div class="text-3xl mb-2">{'\u{1F30A}'}</div>
    <h3 class="font-heading text-xl">The Water Hub</h3>
  </div>
  <div class="grid grid-cols-2 gap-4">
    {branches.map((branch) => (
      <a
        href={`/water/${branch.slug}`}
        class="block p-4 rounded-lg border border-ocean-200 hover:border-ocean-400 bg-white hover:shadow-sm transition-all text-center"
      >
        <div class="text-2xl mb-1">{branch.emoji}</div>
        <p class="text-sm font-medium text-text-primary">{branch.name}</p>
      </a>
    ))}
  </div>
</div>
```

- [ ] **Step 4: Write water explore page**

`src/pages/water/explore.astro`:

```astro
---
import Base from '../../layouts/Base.astro';
import Hero from '../../components/Hero.astro';
import MiniSpiral from '../../components/MiniSpiral.astro';
import CTAButton from '../../components/CTAButton.astro';
---

<Base title="Explore the Water Hub">
  <Hero
    heading="Explore by category"
    subtext="Everyone's body tells a different story. Find where yours wants to start."
  />

  <section class="px-6 py-12">
    <MiniSpiral />
  </section>

  <section class="px-6 py-8 text-center">
    <p class="text-text-muted text-sm mb-4">Not sure where to start?</p>
    <CTAButton href="/water/quiz" label="Take the quiz instead" variant="secondary" />
  </section>
</Base>
```

- [ ] **Step 5: Write dynamic branch page**

`src/pages/water/[slug].astro`:

```astro
---
import { getCollection } from 'astro:content';
import Base from '../../layouts/Base.astro';
import BranchSection from '../../components/BranchSection.astro';
import ComingSoon from '../../components/ComingSoon.astro';
import CTAButton from '../../components/CTAButton.astro';
import { config } from '../../data/hub.config';

export async function getStaticPaths() {
  const branches = await getCollection('branches');
  return branches.map((branch) => ({
    params: { slug: branch.id },
    props: { branch },
  }));
}

const { branch } = Astro.props;
const { Content, headings } = await branch.render();
const { title, emoji, status, tone } = branch.data;
const accentColor = tone === 'soft' ? 'ocean-200' : 'ocean-500';
const ctaText = tone === 'soft' ? 'Explore gently' : 'Start with your water';
---

<Base title={title}>
  <section class="px-6 py-16 text-center">
    <div class="text-4xl mb-3">{emoji}</div>
    <h1 class="font-heading text-3xl md:text-4xl mb-2">{title}</h1>
    <p class="text-text-muted font-light italic">{branch.data.hook}</p>
  </section>

  {status === 'placeholder' ? (
    <ComingSoon title={title} emoji={emoji} />
  ) : (
    <article class="max-w-2xl mx-auto px-6 pb-16 prose prose-lg">
      <Content />
    </article>
  )}

  <section class="px-6 py-12 text-center border-t border-ocean-100">
    <CTAButton href={config.ghl.productUrl} label={ctaText} />
    <div class="mt-4">
      <CTAButton href="/water/explore" label="Explore other branches" variant="secondary" />
    </div>
  </section>
</Base>
```

- [ ] **Step 6: Build and verify**

```bash
npm run build
```

Expected: Build generates pages:
- `/water/index.html`
- `/water/quiz/index.html`
- `/water/explore/index.html`
- `/water/gut-hormones/index.html`
- `/water/fertility/index.html`
- `/water/autoimmune/index.html`
- `/water/athletic/index.html`
- `/water/cancer-support/index.html`
- `/water/sustainability/index.html`

Total: 9 water pages + 1 index = 10 pages.

- [ ] **Step 7: Commit**

```bash
git add src/pages/water/ src/components/MiniSpiral.astro && git commit -m "feat: water funnel — landing page, quiz embed, explore page, 6 dynamic branch pages"
```

---

## Task 5: Hub + Pillar + Business Pages

**Files:**
- Modify: `src/pages/index.astro`
- Create: `src/pages/pillars/[slug].astro`
- Create: `src/pages/business/index.astro`

**Depends on:** Tasks 1, 2, 3

- [ ] **Step 1: Write hub landing page (replaces smoke test)**

`src/pages/index.astro`:

```astro
---
import Base from '../layouts/Base.astro';
import Hero from '../components/Hero.astro';
import PillarCard from '../components/PillarCard.astro';
import CTAButton from '../components/CTAButton.astro';
import { config } from '../data/hub.config';
---

<Base title="Home">
  <Hero
    heading={config.name}
    subtext={config.tagline}
    dark={true}
  />

  <!-- Spiral placeholder — replaced by canvas in Task 6 -->
  <section class="px-6 py-16 bg-ocean-900" id="spiral-mount">
    <div class="max-w-md mx-auto text-center text-ocean-300">
      <p class="text-sm font-light mb-2">Interactive spiral loading...</p>
    </div>
  </section>

  <!-- Pillar cards -->
  <section class="px-6 py-16">
    <h2 class="font-heading text-2xl text-center mb-8">The Four Pillars</h2>
    <div class="max-w-3xl mx-auto grid md:grid-cols-2 gap-6">
      {config.pillars.map((pillar) => (
        <PillarCard pillar={pillar} />
      ))}
    </div>
  </section>

  <!-- Positioning -->
  <section class="px-6 py-12 bg-sand-100 text-center">
    <blockquote class="max-w-xl mx-auto font-heading text-xl italic text-text-primary leading-relaxed">
      "Most people try to fix their mindset while their foundation is unstable.
      Growth isn't linear. It's spiral. But it requires a backbone."
    </blockquote>
  </section>

  <!-- CTA -->
  <section class="px-6 py-16 text-center">
    <h2 class="font-heading text-2xl mb-4">Start at the root</h2>
    <p class="text-text-body font-light mb-6 max-w-md mx-auto">
      Physical sovereignty is the foundation. Everything else builds from here.
    </p>
    <CTAButton href="/water/" label="Explore the water pillar" />
  </section>
</Base>
```

- [ ] **Step 2: Write dynamic pillar page**

`src/pages/pillars/[slug].astro`:

```astro
---
import { getCollection } from 'astro:content';
import Base from '../../layouts/Base.astro';
import ComingSoon from '../../components/ComingSoon.astro';
import CTAButton from '../../components/CTAButton.astro';

export async function getStaticPaths() {
  const pillars = await getCollection('pillars');
  return pillars.map((pillar) => ({
    params: { slug: pillar.id },
    props: { pillar },
  }));
}

const { pillar } = Astro.props;
const { Content } = await pillar.render();
const { title, emoji, tagline, status } = pillar.data;
---

<Base title={title}>
  <section class="px-6 py-16 text-center">
    <div class="text-4xl mb-3">{emoji}</div>
    <h1 class="font-heading text-3xl md:text-4xl mb-2">{title}</h1>
    <p class="text-text-muted font-light">{tagline}</p>
  </section>

  {status === 'placeholder' ? (
    <ComingSoon title={title} emoji={emoji} message="This pillar is being built. The foundation comes first." />
  ) : (
    <article class="max-w-2xl mx-auto px-6 pb-16 prose prose-lg">
      <Content />
    </article>
  )}

  <section class="px-6 py-12 text-center border-t border-ocean-100">
    <CTAButton href="/" label="Back to the spiral" variant="secondary" />
  </section>
</Base>
```

- [ ] **Step 3: Write business placeholder**

`src/pages/business/index.astro`:

```astro
---
import Base from '../../layouts/Base.astro';
import ComingSoon from '../../components/ComingSoon.astro';
import CTAButton from '../../components/CTAButton.astro';
---

<Base title="Financial Sovereignty">
  <ComingSoon
    title="Financial Sovereignty"
    emoji={'\u{1F4A0}'}
    message="The business pillar is being built. Start with your foundation first."
  />
  <div class="text-center pb-16">
    <CTAButton href="/" label="Back to the spiral" variant="secondary" />
  </div>
</Base>
```

- [ ] **Step 4: Build and verify**

```bash
npm run build
```

Expected: Build generates all pages. Total should be ~16 pages:
- `/index.html` (hub)
- `/water/index.html` + 5 water pages
- `/water/gut-hormones/`, `/water/fertility/`, `/water/autoimmune/`, `/water/athletic/`, `/water/cancer-support/`, `/water/sustainability/`
- `/pillars/physical/`, `/pillars/inner/`, `/pillars/identity/`, `/pillars/financial/`
- `/business/index.html`

- [ ] **Step 5: Commit**

```bash
git add src/pages/ && git commit -m "feat: hub landing page + 4 pillar pages + business placeholder"
```

---

## Task 6: Spiral Canvas Component

**Files:**
- Create: `src/components/spiral/spiral.ts`
- Create: `src/components/spiral/SpiralIsland.astro`
- Create: `src/components/spiral/SpiralFallback.astro`
- Modify: `src/pages/index.astro` (wire spiral in)

**Depends on:** Task 1 (hub.config.ts)

- [ ] **Step 1: Write Perlin noise + spiral canvas**

`src/components/spiral/spiral.ts`:

```ts
// Minimal Perlin noise (2D, single octave)
const PERM = new Uint8Array(512);
for (let i = 0; i < 256; i++) PERM[i] = i;
for (let i = 255; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [PERM[i], PERM[j]] = [PERM[j], PERM[i]];
}
for (let i = 0; i < 256; i++) PERM[i + 256] = PERM[i];

function fade(t: number) { return t * t * t * (t * (t * 6 - 15) + 10); }
function lerp(a: number, b: number, t: number) { return a + t * (b - a); }
function grad(hash: number, x: number, y: number) {
  const h = hash & 3;
  const u = h < 2 ? x : y;
  const v = h < 2 ? y : x;
  return ((h & 1) ? -u : u) + ((h & 2) ? -v : v);
}

function noise(x: number, y: number): number {
  const xi = Math.floor(x) & 255;
  const yi = Math.floor(y) & 255;
  const xf = x - Math.floor(x);
  const yf = y - Math.floor(y);
  const u = fade(xf);
  const v = fade(yf);
  const aa = PERM[PERM[xi] + yi];
  const ab = PERM[PERM[xi] + yi + 1];
  const ba = PERM[PERM[xi + 1] + yi];
  const bb = PERM[PERM[xi + 1] + yi + 1];
  return lerp(
    lerp(grad(aa, xf, yf), grad(ba, xf - 1, yf), u),
    lerp(grad(ab, xf, yf - 1), grad(bb, xf - 1, yf - 1), u),
    v,
  );
}

// --- Spiral renderer ---

interface PillarNode {
  name: string;
  emoji: string;
  color: string;
  url: string;
  status: 'live' | 'coming-soon';
  order: number;
  // Runtime state
  angle: number;
  radius: number;
  targetScale: number;
  currentScale: number;
  labelOpacity: number;
}

export function initSpiral(
  canvas: HTMLCanvasElement,
  pillars: Array<{
    name: string; emoji: string; color: string;
    url: string; status: string; order: number;
  }>,
) {
  const ctx = canvas.getContext('2d')!;
  let width = 0;
  let height = 0;
  let cx = 0;
  let cy = 0;
  let time = 0;
  let hoveredIndex = -1;
  let animId = 0;

  const nodes: PillarNode[] = pillars.map((p, i) => ({
    ...p,
    status: p.status as 'live' | 'coming-soon',
    angle: (i / pillars.length) * Math.PI * 2,
    radius: 0,
    targetScale: 1,
    currentScale: 1,
    labelOpacity: 0,
  }));

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    width = rect.width;
    height = rect.height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx = width / 2;
    cy = height / 2;
  }

  function getBaseRadius() {
    return Math.min(width, height) * 0.3;
  }

  function draw() {
    time += 0.005;
    ctx.clearRect(0, 0, width, height);

    const baseRadius = getBaseRadius();

    // Draw orbital paths
    ctx.setLineDash([2, 6]);
    ctx.strokeStyle = 'rgba(17, 154, 158, 0.15)';
    ctx.lineWidth = 1;
    nodes.forEach((node, i) => {
      const r = baseRadius * (0.6 + i * 0.15);
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    });
    ctx.setLineDash([]);

    // Draw logarithmic spiral line
    ctx.strokeStyle = 'rgba(201, 169, 110, 0.12)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let t = 0; t < Math.PI * 6; t += 0.05) {
      const r = 20 + t * baseRadius * 0.08;
      const x = cx + Math.cos(t + time * 0.3) * r;
      const y = cy + Math.sin(t + time * 0.3) * r;
      if (t === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Center node
    const centerPulse = 0.7 + Math.sin(time * 2) * 0.3;
    ctx.fillStyle = `rgba(201, 169, 110, ${centerPulse * 0.8})`;
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(201, 169, 110, ${centerPulse})`;
    ctx.font = '500 11px Inter, system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('SOVEREIGN SYSTEMS', cx, cy - 16);

    // Pillar nodes
    nodes.forEach((node, i) => {
      const baseAngle = (i / nodes.length) * Math.PI * 2;
      const noiseAngle = noise(i * 0.5, time * 0.4) * 0.3;
      const noiseRadius = noise(i * 0.5 + 100, time * 0.3) * baseRadius * 0.05;

      const speed = hoveredIndex === i ? 0.0003 : 0.001;
      node.angle += speed;
      const angle = node.angle + baseAngle + noiseAngle;
      const r = baseRadius * (0.6 + i * 0.15) + noiseRadius;
      node.radius = r;

      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;

      // Scale lerp
      node.currentScale = lerp(node.currentScale, node.targetScale, 0.08);
      const s = node.currentScale;

      // Node circle
      const nodeRadius = 24 * s;
      if (node.status === 'live') {
        ctx.fillStyle = node.color + '20';
        ctx.beginPath();
        ctx.arc(x, y, nodeRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = node.color;
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = node.color + '60';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(x, y, nodeRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Emoji
      ctx.font = `${16 * s}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'white';
      ctx.fillText(node.emoji, x, y);

      // Label
      node.labelOpacity = lerp(
        node.labelOpacity,
        hoveredIndex === i ? 1 : 0.4,
        0.06,
      );
      ctx.globalAlpha = node.labelOpacity;
      ctx.font = `${12 * s}px Inter, system-ui`;
      ctx.fillStyle = node.color;
      ctx.textBaseline = 'top';
      ctx.fillText(node.name, x, y + nodeRadius + 8);
      if (node.status === 'coming-soon') {
        ctx.font = '9px Inter, system-ui';
        ctx.fillStyle = '#7a8a90';
        ctx.fillText('coming soon', x, y + nodeRadius + 24);
      }
      ctx.globalAlpha = 1;
    });

    animId = requestAnimationFrame(draw);
  }

  // Hit detection
  function getNodeAt(mx: number, my: number): number {
    for (let i = nodes.length - 1; i >= 0; i--) {
      const node = nodes[i];
      const baseAngle = (i / nodes.length) * Math.PI * 2;
      const angle = node.angle + baseAngle;
      const x = cx + Math.cos(angle) * node.radius;
      const y = cy + Math.sin(angle) * node.radius;
      const dist = Math.hypot(mx - x, my - y);
      if (dist < 30) return i;
    }
    return -1;
  }

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const idx = getNodeAt(mx, my);
    hoveredIndex = idx;
    nodes.forEach((n, i) => { n.targetScale = i === idx ? 1.15 : 1; });
    canvas.style.cursor = idx >= 0 ? 'pointer' : 'default';
  });

  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const idx = getNodeAt(mx, my);
    if (idx >= 0) {
      window.location.href = nodes[idx].url;
    }
  });

  canvas.addEventListener('mouseleave', () => {
    hoveredIndex = -1;
    nodes.forEach((n) => { n.targetScale = 1; });
  });

  resize();
  window.addEventListener('resize', resize);
  draw();

  return () => {
    cancelAnimationFrame(animId);
    window.removeEventListener('resize', resize);
  };
}
```

- [ ] **Step 2: Write SpiralIsland.astro**

`src/components/spiral/SpiralIsland.astro`:

```astro
---
import { config } from '../../data/hub.config';

const pillarsJson = JSON.stringify(config.pillars);
---

<div class="w-full" style="height: 420px;" id="spiral-container">
  <canvas
    id="spiral-canvas"
    class="w-full h-full hidden md:block"
    style="background: transparent;"
  ></canvas>
</div>

<script define:vars={{ pillarsJson }}>
  if (window.matchMedia('(min-width: 768px)').matches) {
    import('./spiral.ts').then(({ initSpiral }) => {
      const canvas = document.getElementById('spiral-canvas');
      if (canvas) {
        initSpiral(canvas, JSON.parse(pillarsJson));
      }
    });
  }
</script>
```

Note: Astro's `define:vars` passes the data. The dynamic import ensures the script only loads on desktop.

- [ ] **Step 3: Write SpiralFallback.astro**

`src/components/spiral/SpiralFallback.astro`:

```astro
---
import { config } from '../../data/hub.config';
---

<div class="md:hidden py-8 px-6">
  <div class="text-center mb-6">
    <p class="text-ocean-400 text-xs uppercase tracking-widest mb-1">Sovereign Systems</p>
  </div>
  <div class="space-y-4">
    {config.pillars.map((pillar, i) => (
      <a
        href={pillar.url}
        class={`block p-5 rounded-xl border transition-all hover:shadow-md animate-float-${i} ${
          pillar.status === 'live'
            ? 'border-ocean-200 bg-white'
            : 'border-dashed border-ocean-200 bg-sand-50 opacity-75'
        }`}
        style={`animation-delay: ${i * 0.3}s`}
      >
        <div class="flex items-center gap-4">
          <span class="text-2xl">{pillar.emoji}</span>
          <div>
            <h3 class="font-heading text-lg">{pillar.name}</h3>
            <p class="text-xs text-text-muted font-light">{pillar.tagline}</p>
            {pillar.status === 'coming-soon' && (
              <span class="text-xs text-ocean-400 font-medium">Coming soon</span>
            )}
          </div>
        </div>
      </a>
    ))}
  </div>
</div>

<style>
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-4px); }
  }
  [class*="animate-float"] {
    animation: float 4s ease-in-out infinite;
  }
</style>
```

- [ ] **Step 4: Wire spiral into hub landing page**

Replace the spiral placeholder in `src/pages/index.astro`. Change the spiral section:

Replace:
```astro
  <!-- Spiral placeholder — replaced by canvas in Task 6 -->
  <section class="px-6 py-16 bg-ocean-900" id="spiral-mount">
    <div class="max-w-md mx-auto text-center text-ocean-300">
      <p class="text-sm font-light mb-2">Interactive spiral loading...</p>
    </div>
  </section>
```

With:
```astro
  <!-- Interactive spiral -->
  <section class="bg-ocean-900 relative overflow-hidden">
    <SpiralIsland />
    <SpiralFallback />
  </section>
```

Add to the frontmatter imports:
```astro
import SpiralIsland from '../components/spiral/SpiralIsland.astro';
import SpiralFallback from '../components/spiral/SpiralFallback.astro';
```

- [ ] **Step 5: Build and verify**

```bash
npm run build
```

Expected: Build succeeds. Spiral script included in the output. No TS errors.

```bash
npm run dev
```

Open http://localhost:4321/ in Chrome. Verify:
- Desktop: canvas renders with 4 orbiting pillar nodes
- Hover: nodes scale up, labels brighten
- Click: navigates to pillar URL
- Mobile (Chrome DevTools, 375px width): canvas hidden, vertical list with float animation visible

- [ ] **Step 6: Commit**

```bash
git add src/components/spiral/ src/pages/index.astro && git commit -m "feat: interactive spiral canvas — vanilla Perlin noise, orbital animation, mobile CSS fallback"
```

---

## Task 7: Deployment + Ecosystem

**Files:**
- Create: `netlify.toml`
- Create: `seed.yaml`
- Create: `CLAUDE.md`
- Modify: `.gitignore` (add `.superpowers/`)

- [ ] **Step 1: Write Netlify config**

`netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "22"

# Multi-domain redirects (activate when custom domains are connected)
# [[redirects]]
#   from = "https://water-example.com/*"
#   to = "/water/:splat"
#   status = 200

# [[redirects]]
#   from = "https://business-example.com/*"
#   to = "/business/:splat"
#   status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "SAMEORIGIN"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

- [ ] **Step 2: Write seed.yaml**

```yaml
organ: III
name: sovereign-systems--spiral-template
tier: standard
type: client-project
client: admin
status: ACTIVE
promotion: LOCAL
stack:
  - astro
  - tailwind
  - typescript
produces:
  - event: client.site.deployed
consumes: []
metadata:
  description: "Sovereign Systems Spiral — hub-and-spoke website for admin's 4-pillar brand"
  domains:
    - hub-example.com
    - water-example.com
    - business-example.com
```

- [ ] **Step 3: Write project CLAUDE.md**

`CLAUDE.md`:

```markdown
# CLAUDE.md

## What This Is

Sovereign Systems Spiral — a multi-domain static website for a client (admin). Hub-and-spoke architecture: interactive spiral at hub-example.com, water funnel at water-example.com, business placeholder at business-example.com.

## Tech Stack

Astro 5 + Tailwind CSS 4 + vanilla Canvas (spiral animation). Content in Markdown collections. GHL quiz embed.

## Commands

\`\`\`bash
npm run dev          # Dev server at localhost:4321
npm run build        # Production build to dist/
npm run preview      # Preview production build
\`\`\`

## Key Files

- \`src/data/hub.config.ts\` — Site topology (pillars, branches, domains, GHL URLs)
- \`src/content/branches/*.md\` — Water branch page content (client IP)
- \`src/content/pillars/*.md\` — Pillar page content (client IP)
- \`src/components/spiral/spiral.ts\` — Canvas spiral animation
- \`content.config.ts\` — Content collection schemas

## Content Editing

Branch and pillar content lives in \`src/content/\`. Edit the Markdown files directly. The site rebuilds automatically on push via Netlify.

## Client IP Boundary

Content in \`src/content/\` and pillar definitions in \`hub.config.ts\` are client intellectual property. Code architecture, components, and deployment config are studio IP.

## Deploy

Netlify. Auto-deploys on push to \`main\`. Custom domains to be connected (see spec).
```

- [ ] **Step 4: Deploy to Netlify**

```bash
npx netlify-cli deploy --prod --dir=dist --site=sovereign-systems-spiral
```

If site doesn't exist yet:

```bash
npx netlify-cli init
# Choose "Create & configure a new site"
# Team: 4-b100m's team
# Site name: sovereign-systems-spiral
npx netlify-cli deploy --prod --dir=dist
```

Note the deployed URL. It will be something like `https://sovereign-systems-spiral.netlify.app`.

- [ ] **Step 5: Verify deployed site**

Open the Netlify URL in browser. Verify:
- Hub page loads with spiral animation (desktop)
- Nav links work: Water, Quiz, Explore
- Water landing page renders with video placeholder
- Branch pages render (3 with content, 3 with ComingSoon)
- Pillar pages render (2 with content, 2 with ComingSoon)
- Business page shows placeholder
- Mobile responsive (Chrome DevTools)

- [ ] **Step 6: Commit**

```bash
git add netlify.toml seed.yaml CLAUDE.md .gitignore && git commit -m "chore: Netlify config, seed.yaml, CLAUDE.md, deploy"
```

- [ ] **Step 7: Push to GitHub**

```bash
# Create remote repo first
gh repo create labores-profani-crux/sovereign-systems--spiral-template --private --source=. --push
```

Note: Using the ORGAN-III GitHub org (`labores-profani-crux`). Private because it contains client content.

---

## Task 8: Domain Connection Documentation

**Files:**
- Create: `docs/domain-setup.md`

This task creates the DNS instructions admin needs to connect her domains. Not code — documentation that is a Phase 1 deliverable.

- [ ] **Step 1: Write domain setup guide**

`docs/domain-setup.md`:

```markdown
# Connecting Your Domains

Your site is live at: [NETLIFY_URL]

To connect your real domains, you need to update DNS records. Here are the exact steps for each domain.

## 1. hub-example.com (GoDaddy)

1. Log in to GoDaddy → My Products → DNS
2. Find the existing A record or CNAME for @ (or www)
3. Change it to a CNAME record:
   - **Name:** www
   - **Value:** [NETLIFY_SITE].netlify.app
   - **TTL:** 1 hour
4. For the root domain (@), add an A record pointing to Netlify's load balancer:
   - **Type:** A
   - **Name:** @
   - **Value:** 75.2.60.5
5. In Netlify → Domain Settings → Add custom domain → hub-example.com
6. Wait 5-30 minutes for DNS propagation

## 2. water-example.com (LeadConnector)

1. Log in to your domain registrar (wherever you bought this domain — may be GoDaddy, Namecheap, etc.)
2. Update the DNS records the same way as above, pointing to the Netlify site
3. Note: This will disconnect the current LeadConnector site. Your GHL forms/workflows still work — they're backend, not frontend.

## 3. business-example.com (When Ready)

Same process. Connect when the business pillar is built.

## Need Help?

Send me a screenshot of your DNS settings and I'll tell you exactly what to change.
```

- [ ] **Step 2: Commit**

```bash
git add docs/domain-setup.md && git commit -m "docs: domain connection instructions for client"
```

---

## Verification Checklist

After all tasks are complete:

- [ ] `npm run build` succeeds with 0 errors
- [ ] All pages render: hub (1) + water (9) + pillars (4) + business (1) = 15 pages
- [ ] Spiral canvas animates on desktop, float list on mobile
- [ ] All navigation links resolve (no 404s)
- [ ] GHL quiz embed loads (may show placeholder URL until client provides real one)
- [ ] Branch pages with `status: live` show full content
- [ ] Branch pages with `status: placeholder` show ComingSoon component
- [ ] Cancer support page uses soft tone (muted accent, gentle CTA)
- [ ] Site deployed to Netlify and accessible via public URL
- [ ] Lighthouse: 95+ performance on branch pages
