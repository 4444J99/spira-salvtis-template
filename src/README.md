# src/

Astro 5 source code. Zero JS by default — everything is static unless explicitly hydrated.

## Directory Map

| Directory | Contents |
|-----------|----------|
| `components/` | Astro components (.astro files) |
| `components/spiral/` | Canvas spiral visualization (vanilla TS, no deps) |
| `content/` | Markdown content collections (branches + pillars) |
| `content/branches/` | 6 gateway branch deep-dives (gut, archetype-delta, archetype-alpha, archetype-beta, cancer, archetype-zeta) |
| `content/pillars/` | 4 sovereignty pillars (foundation, system, structure, vision) |
| `data/` | TypeScript data files (hub config, citations) |
| `layouts/` | Base HTML layout |
| `pages/` | Route definitions (file-based routing) |
| `styles/` | Global CSS (Tailwind 4, custom theme) |

## Key Components

| Component | Purpose |
|-----------|---------|
| `SpiralIsland.astro` | Canvas spiral wrapper (boot deferred via requestIdleCallback; render loop pauses off-screen / when tab hidden; bloom is a dynamic chunk) |
| `EmailGate.astro` | Email capture gate — unlocks gated content |
| `HydrationNode.astro` | Gateway funnel interactive tool |
| `PillarCard.astro` | 4-pillar grid cards on homepage |
| `BranchSection.astro` | Branch explorer cards |
| `CTAButton.astro` | Styled call-to-action buttons |
| `VideoEmbed.astro` | Video player with placeholder state |
| `QuizEmbed.astro` | GHL quiz iframe embed |

## Content Editing

Branch and pillar pages are Markdown with frontmatter. To edit content:

1. Open `src/content/branches/<slug>.md` or `src/content/pillars/<slug>.md`
2. Edit the Markdown body
3. Frontmatter fields are enforced by `content.config.ts`

To add a new branch: create the `.md` file and add an entry to `src/data/hub.config.ts`.
