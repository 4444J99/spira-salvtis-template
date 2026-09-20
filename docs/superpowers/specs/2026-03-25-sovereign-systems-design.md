# Sovereign Systems Spiral — Technical Design Spec

**Date:** 2026-03-25
**Status:** APPROVED (client design decisions locked)
**Repo:** `sovereign-systems--spiral-template` (ORGAN-III)

---

## 1. Overview

A multi-domain static website system for admin's Sovereign Systems Spiral brand. Three domains served from one Astro codebase, connected by an interactive p5.js spiral navigation. Content authored in Markdown. Quiz/CRM stays in GoHighLevel (GHL) via embed.

### Domains

| Domain | Role | Content State |
|--------|------|---------------|
| hub-example.com | Hub — interactive spiral, 4 pillars | Spiral built, pillar pages 2/4 placeholder |
| gateway-example.com | Gateway pillar — documentary funnel, quiz, 6 branches | 3/6 branch copies done, landing copy done |
| business-example.com | Business pillar — placeholder | Placeholder only |

### Design Decisions (from client questionnaire)

| Decision | Answer |
|----------|--------|
| Spiral feel | Alive & breathing — slow orbital float, organic |
| Color palette | Teal/ocean tones — evolve existing, don't reinvent |
| Gateway page entry | Headline + hook text → documentary video |
| Quiz | GHL embed (preserves existing tagging/workflows) |
| Visible pillars | All 4 from day one, "coming soon" for unbuilt |
| Content editing | Markdown files she can edit + studio for structural changes |
| Build priority | Full skeleton with both domains, gateway side more polished |

---

## 2. Tech Stack

| Layer | Tool | Rationale |
|-------|------|-----------|
| Framework | Astro 5.x | Static-first, component islands, content collections, file-based routing |
| Styling | Tailwind CSS 4.x | Utility-first, custom theme tokens, responsive |
| Spiral component | Vanilla canvas + Perlin noise (~2KB) | No React wrapper needed. requestAnimationFrame + noise for organic float. Loaded via Astro `client:media="(min-width: 768px)"` — never loads on mobile. |
| Content | Astro Content Collections (Markdown) | Type-safe, editable without code |
| Quiz/CRM | GoHighLevel embed | Client's existing backend — tagging, workflows, follow-ups |
| Fonts | Self-hosted (Inter + Cormorant Garamond or similar serif) | Clean sans-serif body + elegant serif headings |
| Deploy | Netlify | Proven in ORGAN-III ecosystem, free tier, auto-deploy |
| Package manager | npm | Standard for Astro projects |

---

## 3. Project Structure

```
sovereign-systems--spiral-template/
├── src/
│   ├── layouts/
│   │   ├── Base.astro                  # <html>, <head>, fonts, nav, footer
│   │   ├── WaterLayout.astro           # Gateway pillar variant (teal accents)
│   │   └── HubLayout.astro             # Hub variant (if palette diverges later)
│   ├── components/
│   │   ├── spiral/
│   │   │   ├── spiral.ts              # Vanilla canvas: orbital animation, Perlin noise, pillar nodes
│   │   │   ├── SpiralIsland.astro     # Astro island wrapper with client:media="(min-width: 768px)"
│   │   │   └── SpiralFallback.astro   # Mobile: CSS-animated vertical list (no canvas)
│   │   ├── BranchSection.astro         # Single section of a branch page (hook/education/gateway/bridge/resources/cta)
│   │   ├── VideoEmbed.astro            # Responsive video player (Vimeo/YouTube/self-hosted)
│   │   ├── QuizEmbed.astro             # GHL form embed with loading state
│   │   ├── MiniSpiral.astro            # Smaller spiral for gateway "Explore" section
│   │   ├── PillarCard.astro            # Card for pillar overview on hub
│   │   ├── ComingSoon.astro            # Placeholder for unbuilt pillar/branch pages
│   │   ├── Hero.astro                  # Reusable hero section
│   │   └── CTAButton.astro             # Consistent call-to-action styling
│   ├── content/
│   │   ├── branches/                   # Gateway pillar branch pages (Markdown)
│   │   │   ├── archetype-epsilon.md         # ✅ Copy from ChatGPT spec
│   │   │   ├── archetype-delta.md            # ✅ Copy from ChatGPT spec
│   │   │   ├── archetype-beta.md           # ✅ Copy from ChatGPT spec
│   │   │   ├── archetype-alpha.md             # Placeholder
│   │   │   ├── archetype-gamma.md       # Placeholder (special soft tone)
│   │   │   └── archetype-zeta.md       # Placeholder
│   │   └── pillars/                    # Sovereign Systems pillars (Markdown)
│   │       ├── foundation.md             # Content from ChatGPT spec
│   │       ├── system.md                # Content from ChatGPT spec
│   │       ├── structure.md             # Placeholder
│   │       └── vision.md            # Placeholder
│   ├── pages/
│   │   ├── index.astro                 # Hub landing — hero + spiral + 4 pillar cards
│   │   ├── pillars/
│   │   │   └── [slug].astro            # Dynamic pillar page from content/pillars/*.md
│   │   ├── gateway/
│   │   │   ├── index.astro             # Gateway landing — headline → video → education → CTAs
│   │   │   ├── quiz.astro              # Quiz page with GHL embed
│   │   │   ├── explore.astro           # Mini spiral showing 6 branches
│   │   │   └── [slug].astro            # Dynamic branch page from content/branches/*.md
│   │   └── business/
│   │       └── index.astro             # Business pillar placeholder
│   ├── data/
│   │   ├── hub.config.ts              # Single topology file: hub name, pillars, branches, colors, domains
│   │   │                               # (Reusable pattern: next client only changes this file + content/)
│   └── styles/
│       └── global.css                  # Tailwind directives + CSS custom properties
├── public/
│   ├── fonts/                          # Self-hosted font files
│   └── images/                         # Static images (logo, placeholders)
├── content.config.ts                   # Astro content collection schemas
├── astro.config.mjs                    # Astro config (integrations: react, tailwind)
├── tailwind.config.mjs                 # Theme tokens: colors, fonts, spacing
├── package.json
├── seed.yaml                           # ORGANVM ecosystem contract (see §12)
├── CLAUDE.md                           # Project-specific Claude instructions
└── docs/
    ├── design-decisions.md             # Client-facing design summary
    └── superpowers/specs/              # Technical specs
```

---

## 4. Color System

Teal/ocean palette, evolved from her existing sites.

```css
/* CSS Custom Properties — defined in global.css, referenced in Tailwind config */

--color-ocean-900: #0a2a2f;       /* Deepest background */
--color-ocean-800: #0f3a40;       /* Card backgrounds */
--color-ocean-700: #145050;       /* Borders, dividers */
--color-ocean-600: #1a6b6b;       /* Secondary elements */
--color-ocean-500: #119a9e;       /* Primary brand — from hub-example.com */
--color-ocean-400: #3dbfc4;       /* Hover states, accents */
--color-ocean-300: #8cc5d3;       /* From gateway-example.com */
--color-ocean-200: #b8dfe6;       /* Light accents */
--color-ocean-100: #e0f0f0;       /* Lightest tint */

--color-sand-900: #2a2520;        /* Dark warm neutral */
--color-sand-500: #8a7d6b;        /* Body text on dark */
--color-sand-300: #c9b89a;        /* Subtle warm accent */
--color-sand-100: #f0ebe4;        /* Light backgrounds */
--color-sand-50:  #faf8f5;        /* Lightest neutral (page bg) */

--color-gold: #c9a96e;            /* Spiral accent, CTAs, highlights */

--color-text-primary: #1a2a2f;    /* Headings on light bg */
--color-text-body: #4a5a60;       /* Body text on light bg */
--color-text-muted: #7a8a90;      /* Secondary text */
--color-text-on-dark: #e8e4df;    /* Text on dark backgrounds */
```

### Typography

| Role | Font | Weight | Usage |
|------|------|--------|-------|
| Headings | Cormorant Garamond | 400, 600 | Page titles, section headers, spiral labels |
| Body | Inter | 300, 400, 500 | Paragraphs, UI text, buttons |
| Accent | Cormorant Garamond italic | 400i | Quotes, callouts, emotional hooks |

---

## 5. Component Specifications

### 5.1 Spiral (spiral.ts + SpiralIsland.astro)

**Rendering:** Vanilla `<canvas>` with `requestAnimationFrame` loop. ~2KB script. No React, no p5.js. Perlin noise for organic drift. Loaded via `<SpiralIsland>` Astro component with `client:media="(min-width: 768px)"` — canvas never loads on mobile (zero wasted CPU/battery).

**Layout:**
- Center node: "Sovereign Systems" label with subtle pulse (opacity oscillation via sine)
- 4 pillar nodes orbit at different radii and speeds
- Orbital paths drawn as faint dotted arcs (canvas arc + setLineDash)
- Spiral line connects center → foundation → system → structure → vision in a logarithmic spiral

**Animation:**
- Constant slow rotation (0.001 rad/frame base speed)
- Each pillar has Perlin noise offset on radius + angle (organic wobble, not mechanical orbit)
- Hover on pillar: node scales up 1.15x via lerp, label fades in, orbital speed slows
- Click on pillar: navigates to pillar page or external domain (window.location)

**Pillar Node Visual:**
- Circle with icon/emoji inside (drawn via canvas fillText for emoji, arc for circle)
- Label below (pillar name)
- Status indicator: filled circle = live, hollow circle with dashed stroke = coming soon
- Color: each pillar gets a tint from the ocean palette

**Responsive:**
- Desktop (>768px): full canvas orbital layout via `<SpiralIsland>`
- Mobile (<768px): `<SpiralFallback>` — vertical list with CSS `@keyframes float` (translateY oscillation). Pure CSS, no JS.
- No double-render. Astro's `client:media` prevents canvas from loading on mobile entirely. `<SpiralFallback>` is server-rendered HTML+CSS only.

**Data Input:** `hub.config.ts` defines the entire site topology:
```ts
interface HubConfig {
  name: string;              // "Sovereign Systems Spiral"
  tagline: string;           // Positioning statement
  pillars: Pillar[];
  branches: Branch[];        // Gateway pillar branches
  domains: {
    hub: string;             // "hub-example.com"
    gateway: string;           // "gateway-example.com"
    business: string;        // "business-example.com"
  };
  ghl: {
    quizFormUrl: string;     // GHL embed URL (provided by client)
    productUrl: string;      // CTA destination for "start with your gateway"
  };
}

interface Pillar {
  name: string;              // "Foundation Sovereignty"
  slug: string;              // "foundation"
  emoji: string;             // "🌊"
  tagline: string;           // "Control your inputs. Stabilize your body."
  color: string;             // Tint from palette
  url: string;               // "/pillars/foundation" or external domain
  status: 'live' | 'coming-soon';
  order: number;             // Orbital position (1-4)
}

interface Branch {
  name: string;              // "Gut + Hormones"
  slug: string;              // "archetype-epsilon"
  emoji: string;             // "🌿"
  order: number;
}
```

This single config file is the studio's reusability hook — a future client project duplicates the repo, changes `hub.config.ts` + `src/content/`, and has a new hub-and-spoke site.

### 5.2 Branch Page Template

All 6 gateway branches use identical structure, rendered from Markdown frontmatter + body.

**Markdown schema (content.config.ts):**
```ts
branches: defineCollection({
  schema: z.object({
    title: z.string(),                    // "Gut + Hormones"
    emoji: z.string(),                    // "🌿"
    hook: z.string(),                     // Emotional opening line
    status: z.enum(['live', 'placeholder']),
    tone: z.enum(['standard', 'soft']).default('standard'),
    // 'soft' tone renders: muted color accent (ocean-200 instead of ocean-500),
    // gentler CTA text ("Explore gently" vs "Start with your gateway"),
    // no quiz-digging language. Used for archetype-gamma.
    order: z.number(),
  })
})
```

**Rendered sections (from Markdown headings):**
1. `## Hook` — Relatable emotional entry
2. `## Connection` — What's happening in the body
3. `## Where Gateway Fits` — Hydrogen benefits, grounded
4. `## Bridge` — "This doesn't have to be overwhelming"
5. `## Resources` — Videos/clips (expandable later)
6. `## CTA` — "Start with your gateway" → product link

Each section maps to a `<BranchSection>` component with consistent spacing, typography, and a subtle teal left-border accent.

### 5.3 Gateway Landing Page (gateway/index.astro)

**Flow (top to bottom):**
1. **Hero** — Headline: "Gateway changed everything for me." + 2-3 sentences of context
2. **Documentary** — `<VideoEmbed>` component, large, centered. Placeholder state: thumbnail + "Documentary coming soon" overlay
3. **Post-video grounding** — Short section: "What you just watched" (2-3 sentences)
4. **Mini demo** — Optional second video embed (1-2 min product demo)
5. **Simple education** — "What is molecular hydrogen?" + "Why gateway ≠ just gateway anymore"
6. **Primary CTA** — "Find what your body actually needs" → /gateway/quiz
7. **Secondary CTA** — "Explore by category" → /gateway/explore (mini spiral)
8. **Final CTA** — "If something in you is curious... follow that."

### 5.4 QuizEmbed Component

```astro
<!-- GHL form embed with loading state -->
<div class="quiz-container">
  <div class="quiz-loading" id="quiz-loading">
    <p>Loading your quiz...</p>
  </div>
  <iframe
    src="{ghlFormUrl}"
    width="100%"
    style="border:none; min-height:600px;"
    onload="document.getElementById('quiz-loading').style.display='none'"
  />
</div>
```

GHL form URL provided by admin. Styling of the embed controlled in GHL to match the site palette. The wrapper handles loading state and responsive sizing.

**Quiz → Branch Routing (critical UX path):**

After quiz submission, the user needs to land on the correct branch page. Two options depending on GHL capability:

1. **GHL handles redirect** — GHL form "thank you page" URL is set per-result to `/gateway/archetype-epsilon`, `/gateway/archetype-delta`, etc. Quiz routing logic lives entirely in GHL. Simplest approach if GHL supports conditional redirects.

2. **Custom results page** — If GHL can't redirect conditionally, the quiz page includes a post-submission handler that reads the primary tag from the GHL response (via webhook or URL parameter) and redirects client-side. The quiz page at `/gateway/quiz` becomes:
   - Show quiz (GHL embed)
   - On submit: GHL applies tags → redirects to `/gateway/quiz/results?branch=archetype-epsilon`
   - Results page shows personalized header + link to branch page

**admin's existing GHL workflow (Day 0/2/4/6 follow-up sequence) triggers on form submission regardless of which approach is used — the tagging happens in GHL, not in our code.**

### 5.5 Hub Landing Page (index.astro)

**Flow:**
1. **Hero** — "Sovereign Systems Spiral" + positioning statement + subtle background animation
2. **Spiral** — `<SpiralCanvas client:visible />` — the interactive spiral with 4 orbiting pillars
3. **Pillar cards** — 4 cards below the spiral (fallback/reinforcement for mobile and accessibility)
4. **Positioning** — The authority version positioning statement
5. **CTA** — "Start at the root" → links to gateway pillar (primary revenue path)

---

## 6. Multi-Domain Strategy

### Option: Subdirectory Routing (Recommended for MVP)

Deploy as a single Netlify site. Use path-based routing initially:
- `site.netlify.app/` → hub (hub-example.com content)
- `site.netlify.app/gateway/` → gateway pillar (gateway-example.com content)
- `site.netlify.app/business/` → business pillar (business-example.com content)

When ready to connect custom domains, Netlify supports multiple domains per site with redirect rules:
```toml
# netlify.toml
[[redirects]]
  from = "https://gateway-example.com/*"
  to = "/gateway/:splat"
  status = 200

[[redirects]]
  from = "https://business-example.com/*"
  to = "/business/:splat"
  status = 200
```

This means: one deploy, three domains, zero code duplication.

---

## 7. Content Editing Flow

admin edits content by modifying Markdown files in `src/content/`.

**Simple edits (admin does herself):**
- Change a headline or body text in a branch page
- Update a video URL
- Add a resource link
- Edit the "coming soon" placeholder text

**Structural changes (studio handles):**
- Add a new branch page (create new .md file + add to branches.ts)
- Add a new pillar to the spiral (update pillars.ts + create page)
- Change page layout or component structure
- Update the spiral animation

**Day-1 editing experience (no GitHub required):**

admin will not use GitHub. The editing flow must meet her where she is (GHL, Canva, Instagram).

Phase 1 approach: **Keystatic** — a git-based CMS that gives her a visual editor at `/keystatic` on the deployed site. She opens a URL, sees her content as editable fields (title, hook, body sections), edits in a browser form, clicks save. Keystatic commits to GitHub behind the scenes, Netlify auto-deploys. She never sees git, never sees Markdown, never sees code.

Setup cost: ~1 hour of configuration. Returns: she can edit content independently from day one.

Fallback if Keystatic adds too much complexity to the initial build: she sends edits via text/voice note, studio updates the Markdown files. CMS added in a fast follow.

---

## 8. Deployment

| Config | Value |
|--------|-------|
| Platform | Netlify |
| Build command | `npm run build` |
| Publish directory | `dist/` |
| Node version | 22.x |
| Auto-deploy | On push to `main` |
| Custom domains | Phase 1 deliverable (see Domain Connection below) |

### Domain Connection (Phase 1, not deferred)

The site on a `.netlify.app` URL is meaningless to the client. Domain connection is part of the initial build:

1. **Deploy to Netlify** → get `.netlify.app` URL for development/review
2. **Connect hub-example.com** — requires admin to update DNS (she's on GoDaddy). We provide exact instructions: "Add a CNAME record pointing to X."
3. **Connect gateway-example.com** — currently on LeadConnector. Requires DNS change. Same instructions.
4. **business-example.com** — can stay on HighLevel until business pillar is built. Connect when ready.

**Dependency:** admin must share domain registrar access or follow DNS instructions. This is a blocking dependency for launch — document it clearly and get it early.

---

## 9. Placeholder Strategy

Content that doesn't exist yet gets intentional placeholder treatment:

**Branch pages (archetype-alpha, archetype-gamma, archetype-zeta):**
- Rendered with `<ComingSoon>` component
- Shows branch name, emoji, and: "This branch is growing. Check back soon."
- Same visual treatment as live branches (consistent navigation)

**Pillar pages (structure, vision):**
- Same pattern: name, tagline from pillars.ts, "coming soon" message
- Spiral shows them as hollow-circle nodes (visually distinct from live pillars)

**Documentary video:**
- Thumbnail placeholder with play button overlay
- Text: "Documentary coming soon" or a still frame if available

**No broken links.** Every navigation path leads somewhere intentional.

---

## 10. Testing & Verification

- **Visual:** Manual check on desktop + mobile (Chrome DevTools responsive mode)
- **Lighthouse:** Target 95+ performance, 100 accessibility, 100 SEO on branch pages
- **Links:** No dead links — all navigation paths verified
- **GHL embed:** Quiz loads, form submits, tags apply (requires admin's GHL credentials for end-to-end)
- **Content rendering:** All 6 branch pages render from Markdown correctly
- **Spiral:** Loads on desktop, degrades to list on mobile, pillar clicks navigate correctly

---

## 11. Scope Boundaries

**In scope for this build:**
- Hub landing page with interactive spiral
- Gateway funnel landing page with video placeholder + copy
- Quiz page with GHL embed
- Gateway explore page with mini spiral
- 6 branch pages (3 with real copy, 3 placeholder)
- 4 pillar pages (2 with content from spec, 2 placeholder)
- Business pillar placeholder page
- Responsive design (desktop + mobile)
- Netlify deployment
- Markdown content editing capability

**Out of scope (future phases):**
- GHL workflow configuration (admin's backend — she manages this)
- Documentary video production
- Remaining branch page copywriting
- Downline duplication system
- Analytics integration (Plausible/PostHog)
- Email sequence design

---

## 12. Ecosystem Integration & IP Separation

### seed.yaml

```yaml
organ: III
name: sovereign-systems--spiral-template
tier: standard
type: client-project          # New: distinguishes from internal ORGANVM products
client: admin                # Client identifier (not in registry, not public)
status: ACTIVE
promotion: LOCAL              # Client projects do not promote through PUBLIC_PROCESS
produces:
  - event: client.site.deployed
consumes: []
```

The `client-project` type signals to ORGANVM governance:
- This repo does NOT appear in public-facing dashboards or portfolio
- Promotion pipeline does not apply (no PUBLIC_PROCESS, no GRADUATED)
- Content within `src/content/` is client IP, not studio IP

### IP Separation

admin's intellectual property (Sovereign Systems framework, 4 pillars, branch copy, spiral concept) lives in `src/content/` and `src/data/pillars.ts`. The studio's IP (Astro architecture, spiral rendering code, component library, deployment config) lives everywhere else.

**Current approach:** Single repo, clear directory boundary. Content files are admin's. Code files are studio's.

**Future option (if she wants formal separation):** Extract `src/content/` into a private repo she owns, pulled as a git submodule at build time. The studio repo becomes a template; her content repo becomes her property. This is available but not required for MVP.

### Reusability (Studio Pattern Extraction)

What feeds back into the studio is the **code architecture**, not the content:
- `spiral.ts` → reusable orbital animation component (parameterized by config)
- `hub.config.ts` pattern → any hub-and-spoke site defines its topology in one file
- `BranchSection.astro` → reusable content page template
- `QuizEmbed.astro` → GHL integration pattern
- Netlify multi-domain redirect pattern

None of these contain admin's framework, copy, or brand structure. The next client gets the plumbing; their content is entirely their own.
