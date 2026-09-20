# Atom Routing Map — Where 1,821 Atoms Land

**Generated:** 2026-04-03
**Source:** atom-registry.yaml (1,821 atoms)
**Purpose:** Concrete landing zones for every atom by destination type

---

## The Build Surface (What Exists Today)

```
hub-example.com (Astro site)
├── / .......................... Hub — spiral + 4-pillar grid
├── /pillars/foundation ......... Foundation Sovereignty pillar
├── /pillars/system ............ System Sovereignty pillar
├── /pillars/structure ......... Structure Sovereignty pillar
├── /gateway/ ................... Gateway funnel home
├── /gateway/explore ............ Branch explorer (6 branches)
├── /gateway/quiz ............... GHL quiz embed
├── /gateway/archetype-epsilon ....... Branch: Gut + Hormones
├── /gateway/archetype-delta .......... Branch: Archetype-delta
├── /gateway/archetype-alpha ........... Branch: Archetype-alpha Performance
├── /gateway/archetype-beta ......... Branch: Inflammation / Archetype-beta
├── /gateway/archetype-gamma ..... Branch: Cancer Support
├── /gateway/archetype-zeta ..... Branch: Archetype-zeta / Savings
├── /business/ ................ Vision Sovereignty / EauCo Hub
└── /research ................. Research citations page

gateway-example.com → /gateway/ (alias, not yet connected)
business-example.com → /business/ (alias, not yet connected)
```

## The Build Surface (What Needs to Exist)

After GH#13 (node architecture) resolves, the site expands:

```
hub-example.com
├── / .......................... Hub (exists)
├── /spiral/node-1 ............ Node: Feel Good First
├── /spiral/node-2 ............ Node: Your Body Is the Starting Point
├── /spiral/node-3 ............ Node: Stabilize Your Blood Sugar
├── /spiral/node-4 ............ Node: Your Nervous System Is the Filter
├── /spiral/node-5 ............ Node: Sleep Is Non-Negotiable
├── /spiral/node-6 ............ Node: Awareness Creates Choice
├── /spiral/node-7 ............ Node: You're Not Your Thoughts
├── /spiral/node-8 ............ Node: Patterns Run Until Seen
├── /spiral/node-9 ............ Node: Your Reality Is Interpreted
├── /spiral/node-10 ........... Node: Radical Responsibility (with Love)
├── /spiral/node-11 ........... Node: You Can't Change What You Won't Acknowledge
├── /spiral/node-12 ........... Node: Integrity Builds Self-Trust
├── /spiral/node-13 ........... Node: Systems Create Freedom
├── /pillars/* ................ (exists)
├── /gateway/* .................. (exists)
├── /gateway/gateway-node ..... Gateway Node tool (new — from 2026-04-03 spec)
├── /about .................... About / Philosophy (new)
├── /tools .................... Free tools + self-assessments (new)
├── /business/ ................ (exists)
└── /research ................. (exists)
```

---

## Routing Table: 7 Destinations

### 1. NODE DEEP-DIVE PAGES (~400 atoms → 13 pages)

These are the core build. Each node gets a deep-dive page with content drawn from multiple source files.

| Node | Page | Primary Atom Sources | Est. Atoms |
|------|------|---------------------|------------|
| 1 | Feel Good First | health/feel-good-first-script, health/gateway-and-blood-sugar, concepts/divine-feminine-flow, root 1a/2b | ~40 |
| 2 | Body as Starting Point | health/body-trust-and-shifts, health/fascia-and-emotions, mindset/self-soothing, root 1b | ~35 |
| 3 | Blood Sugar | health/gut-rebuilding-diet, health/gateway-and-blood-sugar, mindset/meal-planning | ~30 |
| 4 | Nervous System | health/cortisol-stress-carousel, health/cymascope, concepts/dopamine-oxytocin | ~45 |
| 5 | Sleep | health/period-related-rest, health/hormone-cycle, time-astro/cycle-and-moon | ~30 |
| 6 | Awareness | mindset/blindspots-gaps, mindset/overwhelm-to-clarity, concepts/dopamine-oxytocin-energy | ~35 |
| 7 | Not Your Thoughts | mindset/ego-integration, mindset/rendering-explained, mindset/ether-concepts | ~25 |
| 8 | Patterns | mindset/neuro-signatures, mindset/success-and-small-habits, concepts/book-concept-breakdown | ~25 |
| 9 | Reality Interpreted | mindset/emotional-misattunement, mindset/self-awareness-and-love, health/endometriosis | ~30 |
| 10 | Radical Responsibility | mindset/anger-processing, mindset/system-child-healing, mindset/fear-of-being-seen | ~30 |
| 11 | Won't Acknowledge | mindset/overexplaining, mindset/frozen-feelings, mindset/insecurity-self-respect | ~25 |
| 12 | Integrity Self-Trust | mindset/masculine-feminine-balance, mindset/ask-integrate-reflect, mindset/manifestation | ~25 |
| 13 | Systems Create Freedom | business/vision-freedom-blueprint, business/idea-implementation, business/sales-momentum | ~25 |

**Gate:** GH#13 must resolve first (node architecture lock).

**Content schema per node page:** Title → Truth (one line) → Reality Check → Science column → Sacred column → Soul Practice column → Reflection Prompts → Closing Line → CTA

**Atom selection criteria:** `nature ∈ [PROTOCOL, FRAMEWORK, NARRATIVE, CITATION, CLAIM(verified)]` + `build_state ∈ [MISSING, PARTIAL]` + `editorial ∈ [CLEAN, UNVERIFIED(with caveat)]`

---

### 2. BRANCH PAGE ENRICHMENT (~120 atoms → 6 existing pages)

The 6 branch pages exist but are studio-written. admin's atoms deepen them with her actual research.

| Branch | File | Atoms to Inject | What They Add |
|--------|------|----------------|---------------|
| archetype-epsilon | `src/content/branches/archetype-epsilon.md` | ~25 | Gut-rebuilding diet plan, hormone cycle protocols, inflammation self-check |
| archetype-delta | `src/content/branches/archetype-delta.md` | ~20 | Birth control resource guide, hormone cycle guide, endometriosis research |
| archetype-beta | `src/content/branches/archetype-beta.md` | ~20 | hEDS diagnosis, neurodivergence-archetype-beta link, fascia-emotion connection |
| archetype-alpha | `src/content/branches/archetype-alpha.md` | ~15 | Molecular hydrogen for athletes, cycle-synced fitness, bubble butt guide |
| archetype-gamma | `src/content/branches/archetype-gamma.md` | ~10 | Sulphur/glutathione research, sonoluminescence, cellular reprogramming |
| archetype-zeta | `src/content/branches/archetype-zeta.md` | ~10 | Well gateway costs, bottled gateway comparison, spring locator concept |

**Gate:** None — these pages exist, atoms can be injected now for `build_state: PARTIAL` atoms.

**Atom selection criteria:** `build_state: PARTIAL` + `nature ∈ [CITATION, CLAIM(verified), PROTOCOL, TOOL]`

---

### 3. PILLAR PAGE ENRICHMENT (~80 atoms → 4 existing pages)

| Pillar | File | Atoms to Inject | What They Add |
|--------|------|----------------|---------------|
| foundation | `src/content/pillars/foundation.md` | ~25 | Root-Cause Pyramid, Square Zero concept, Bio-Safety Pyramid |
| system | `src/content/pillars/system.md` | ~20 | Yin/yang framework, nervous system regulation, emotional processing |
| structure | `src/content/pillars/structure.md` | ~20 | Visibility wounds, ego integration, radical responsibility framework |
| vision | `src/content/pillars/vision.md` | ~15 | 12-step Vision Freedom Blueprint, wealth energetics, funnel strategy |

**Gate:** None for enrichment of existing copy. Full rewrite blocked by GH#13.

---

### 4. GATEWAY NODE / GATEWAY FUNNEL (~150 atoms → new application)

From the 2026-04-03 admin spec. A dynamic tool, not just a content page.

| Component | Atom Sources | What They Provide |
|-----------|-------------|-------------------|
| Contaminant education (Step 1) | gateway/ionized-gateway-benefits, gateway/gateway-hub-design, health/chlorine-absorption | Science claims, educational copy |
| Bottled gateway comparison | gateway/well-gateway-costs, business/income-projections (pricing data) | Cost data, comparison framework |
| Filter recommendations (Step 2) | gateway/kangen-gateway-content-ideas, business/sales-momentum | Product tier descriptions, CTA copy |
| Health survey (Step 3) | health/inflammation-self-check, health/gateway-and-blood-sugar | Assessment questions, scoring logic |
| Spring locator | gateway/gateway-hub-framework-breakdown | Feature concept (needs API integration) |

**Gate:** GH#13 + GH#17 (architecture + domain routing).

---

### 5. SOCIAL CONTENT PIPELINE (~200 atoms → NOT the website)

These atoms go to admin's social media, not the Astro site. They should be organized into a **content calendar** or exported to a format she can use directly.

| Type | Count | Destination |
|------|-------|------------|
| IG carousel scripts | ~40 | Instagram — ready to design as carousel slides |
| IG reel scripts | ~30 | Instagram — video scripts for filming |
| IG captions | ~50 | Instagram — post copy |
| FB post templates | ~15 | Facebook — group/page content |
| Video scripts (documentary) | ~20 | YouTube/hosting platform — long-form |
| Email sequences | ~15 | GHL — nurture automation |
| DM scripts | ~10 | Direct messaging — sales conversations |
| Affirmations/mantras | ~20 | Mixed — social + downloadable PDFs |

**Gate:** None. This content is ready NOW. admin can use it immediately.

**Landing zone:** `docs/social-content-calendar/` (new directory) organized by platform and pillar.

---

### 6. STANDALONE PRODUCTS (~80 atoms → separate product tracks)

These are complete product concepts that live outside the main site build.

| Product | Source Atoms | Status | Next Step |
|---------|------------|--------|-----------|
| **Hormones & Healing ebook** | health-hormones-and-healing.md (~25 atoms) | Draft complete, needs light editing | GH#19 decision: standalone or Spiral-integrated? |
| **System Child Book** | mindset/system-child-book-concept.md (~9 atoms of structure + ~30 atoms of supporting content) | Concept complete, 5 parts / 11 chapters outlined | GH#19: packaging decision |
| **Astrology Hormone Moon Planner** | time-astro/astrology-hormone-moon-planner.md (~6 atoms) | Concept only | Deferred to Phase 4 |
| **30-Day Acupressure Guide** | health/30-day-acupressure-routine.md (~17 atoms) | Complete protocol, ready for PDF design | Could be a lead magnet (free gated download) |
| **Rhythms & Rituals daily system** | mindset-rhythms-and-rituals.md (~20 atoms) | Complete framework | Could be a subscription offering |

**Gate:** GH#19 (System Child Book), GH#20 (Creature Selves). Others ungated.

---

### 7. REFERENCE / RESEARCH BACKING (~300 atoms → not directly visible)

These atoms don't appear on any page but support atoms that do. They're the evidence layer.

| Type | Count | How They're Used |
|------|-------|-----------------|
| Research citations | ~36 | Feed `src/data/citations.ts` — tooltip references |
| Verified statistics | ~38 | Embedded as `<sup>` citation references in content |
| Background frameworks | ~80 | Inform page structure without appearing verbatim |
| admin's raw questions | ~100 | Feed client decision tracker (SOP-SS-CLT-001) |
| Build instructions | ~46 | Already reflected in site architecture |

---

### DEAD / DEFERRED (~390 atoms → nowhere right now)

| Type | Count | Disposition |
|------|-------|------------|
| Duplicate revisions | ~100 | Same idea rewritten 2-3 times. Keep best version, archive rest. |
| Empty file stubs | ~63 | N/A atoms from empty exports |
| Fringe/pseudoscience | ~30 | FLAGGED atoms requiring editorial decision before any use |
| AI boilerplate | ~8 | ALIEN provenance, generic, no value |
| Unresolved questions | ~100 | admin asked but ChatGPT didn't resolve — feed back to her |
| Future concepts | ~89 | Ideas with no current build target (Creature Selves, retreats, courses) |

---

## Priority Compilation Order

What to build first, using atoms as ammunition:

```
NOW (no gates):
  1. Social content calendar    — ~200 SCRIPT atoms → docs/social-content-calendar/
  2. Branch page enrichment     — ~120 PARTIAL atoms → src/content/branches/*.md
  3. Pillar page enrichment     — ~80 PARTIAL atoms → src/content/pillars/*.md
  4. Editorial triage           — 104 FLAGGED atoms → verify/reframe/remove
  5. Lead magnets               — Acupressure guide, Rhythms PDF → gated downloads

AFTER GH#13 (node architecture):
  6. 13 node deep-dive pages    — ~400 atoms → src/content/nodes/*.md (new collection)
  7. Gateway Node tool        — ~150 atoms → new application component

AFTER GH#19/20 (product decisions):
  8. Standalone products        — ~80 atoms → separate product tracks
```

---

## Implementation: How Atoms Become Pages

For a concrete example — building Node 4 (Nervous System):

1. Query registry: `grep "nodes:.*4" atom-registry.yaml` → returns ~45 atoms
2. Filter: `editorial: CLEAN` or `UNVERIFIED` (skip FLAGGED)
3. Sort by provenance: LOCAL first (admin's voice), then HYBRID (AI-structured)
4. Map to page schema:
   - **Title + Truth:** From root doc 2b (ATM-R-007: "Your Nervous System Is the Filter")
   - **Science column:** ATM-H-047 (cortisol 90-sec reset), ATM-H-052 (HPA axis)
   - **Sacred column:** ATM-M-109 (frozen feelings somatic work)
   - **Soul Practice:** ATM-H-050 (box breathing protocol)
   - **Citations:** ATM-H-053 (cortisol research reference)
   - **CTA:** Derived from ATM-R-091 (admin's build instruction for Foundation → quiz routing)
5. Write the page in Astro content collection format
6. Mark used atoms as `build_state: EXISTS` in their in-situ fences
7. Regenerate registry

The atom IDs are the instruction set. An agent with this routing map and the registry can build any page without ever re-reading admin's original files.
