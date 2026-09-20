# Plan: Atom Grading → Assembly → First Deliverable

## Context

**Where we are:** 1,821 atoms extracted, verified (three-way: Claude + Gemini + Claude-blind), routed to 7 destinations, and committed. The primitives are complete.

**What the user proposed:** "Assembly through scale and hierarchy" — merge atoms into build-ready groups.

**Why that's almost right but not quite:** The registry has a signal-to-noise problem that must be resolved first. Of 842 LOCAL (admin's voice) atoms, 752 are QUESTION/NARRATIVE/CLAIM — mostly chat artifacts ("YAY!!", "Can you do X?", "Transcript Unavailable"), not content. Assembly without grading would mix styrofoam with brick.

**The wiser sequence:** Grade → Cluster → Ship.

---

## Phase 1: Noise Sweep (the missing operation)

**Goal:** Partition 1,821 atoms into SIGNAL, CONTEXT, and NOISE tiers.

### Tier Definitions

| Tier | Meaning | What qualifies |
|------|---------|----------------|
| **SIGNAL** | Build-worthy content | Atoms that can appear on a page, in a calendar, or in a product. Has substantive information or voice. |
| **CONTEXT** | Intent/direction markers | admin's questions, preferences, build instructions. Not page content, but informs build decisions. Valuable for SOP-SS-CLT-001. |
| **NOISE** | Archive-only | Acks ("Thank you!"), ChatGPT pleasantries ("Absolutely!"), "Transcript Unavailable", empty/broken fragments. |

### Implementation

Add a `tier` field to the in-situ markers and registry schema:

```yaml
tier: SIGNAL    # or CONTEXT or NOISE
```

**Sweep rules** (automatable):

1. `idea` matches `^(Yes|Yay|Thank|Ugh|Oof|Omg|Amazing|Perfect|Love it|Awesome)` + LOCAL provenance + CLAIM nature → **NOISE**
2. `idea` contains `Transcript Unavailable` → **NOISE**
3. `idea` matches `^(Absolutely|Sure|You're so welcome|Great question|I'd love to)` + HYBRID provenance + (CLAIM|NARRATIVE) nature → **NOISE**
4. LOCAL + QUESTION nature + idea is a request to ChatGPT (not a self-assessment question) → **CONTEXT**
5. LOCAL + INSTRUCTION nature → **CONTEXT** (build direction, not page content)
6. Everything else → **SIGNAL** (default, manually downgrade)

**Estimated outcome:** ~600 SIGNAL, ~450 CONTEXT, ~770 NOISE

### Artifacts

- Update `scripts/build-atom-registry.sh` to parse and propagate `tier`
- New coverage map: `docs/archive/coverage/by-tier.md`
- Existing coverage maps regenerated with tier filter

### Key files to modify
- In-situ markers in `docs/archive/extracted/**/*.md` (add `tier:` line)
- `scripts/build-atom-registry.sh` (add `tier` to parsed fields)
- `docs/archive/atom-registry.yaml` (regenerated)

---

## Phase 2: Semantic Clustering (the assembly operation)

**Goal:** Group SIGNAL atoms into content units — the intermediate structure between atoms and pages.

### What is a Content Unit?

A **content unit** is a cluster of 3-10 SIGNAL atoms that form a coherent piece of content for a single destination. It's the build-ready group the merge pass (IRF-III-017) was trying to produce.

### Clustering Strategy

Use the routing map's 7 destinations as the primary axis, then sub-cluster by topic within each:

```
Destination → Topic Cluster → Content Unit → Atoms
```

Example:
```
Node 4 (Nervous System)
  └── Cortisol Science
       ├── CU-N4-01: The 90-Second Reset (ATM-H-047, ATM-H-052, ATM-H-050)
       └── CU-N4-02: HPA Axis Explained (ATM-H-051, ATM-H-053)
  └── Regulation Protocols
       ├── CU-N4-03: Box Breathing Protocol (ATM-H-050, ATM-M-109)
       └── CU-N4-04: Somatic Release Sequence (ATM-M-110, ATM-H-048)
```

### Implementation

New file: `docs/archive/content-units.yaml`

```yaml
units:
  - id: CU-N4-01
    destination: node-4
    topic: cortisol-science
    title: "The 90-Second Reset"
    atoms: [ATM-H-047, ATM-H-052, ATM-H-050]
    page_section: science
    editorial_ready: true
```

### Estimated outcome

~600 SIGNAL atoms → ~150-200 content units across 7 destinations.

### Key files to create
- `docs/archive/content-units.yaml` — the clustering registry
- `scripts/build-content-units.py` — clustering script (queries atom-registry, proposes groupings)
- `docs/archive/coverage/by-unit.md` — content unit coverage map

---

## Phase 3: Validate with One Deliverable

**Goal:** Prove the pipeline by producing the cleanest deliverable: the social content calendar.

### Why social content first

1. **Ungated** — no dependency on GH#13 or GH#17
2. **Cleanest atoms** — SCRIPT nature (94 atoms) are pre-written social media content
3. **Immediate client value** — admin can use these NOW
4. **Small scope** — proves the atom→deliverable pipeline without touching the Astro site

### Implementation

1. Filter content units with `destination: social-content`
2. Organize by platform (IG carousel, IG reel, FB post, email, video script)
3. Output to `docs/social-content-calendar/` organized by platform and pillar
4. Format as admin-ready markdown files she can copy/paste

### Key files to create
- `docs/social-content-calendar/README.md` — overview + usage guide
- `docs/social-content-calendar/instagram/` — carousel scripts, reel scripts, captions
- `docs/social-content-calendar/email/` — nurture sequences
- `docs/social-content-calendar/video/` — documentary scripts

---

## Verification

1. After Phase 1: `SIGNAL + CONTEXT + NOISE = 1,821` (zero atoms unaccounted)
2. After Phase 2: Every SIGNAL atom belongs to exactly one content unit
3. After Phase 3: Every SCRIPT atom in social destination has a calendar entry
4. Registry regeneration: `bash scripts/build-atom-registry.sh` produces consistent output
5. Coverage maps: all 5 maps regenerated with tier dimension

---

## Execution Order

```
Phase 1 (noise sweep)     — ~2 hours agent work
  ↓
Phase 2 (clustering)      — ~1.5 hours agent work
  ↓
Phase 3 (social calendar) — ~1 hour agent work
```

All three phases are unblocked. No external gates.
