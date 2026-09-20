# Process Extraction — What We Built That's Repeatable

**Source engagement:** Sovereign Systems (admin) — first studio client
**Extraction date:** 2026-04-05
**Purpose:** Distill every process developed during this engagement into reusable protocols for future clients and projects

---

## 1. The Xenograft Protocol

**What it is:** Taking a client's raw, unstructured material — ChatGPT transcripts, voice notes, documents, iMessages — and processing it into structured, tagged, routable content.

**What we did:**
- Received 127 files (~360,000 words) from admin
- Decomposed into 1,821 atomic content units
- Tagged each with 17 metadata fields (provenance, nature, tier, pillar, editorial, build_state, nodes, etc.)
- Verified three ways (Claude, Gemini, Claude-blind)
- Graded: SIGNAL (1,153) / CONTEXT (557) / NOISE (111)
- Linked 1,343 atoms to GitHub issues

**What's reusable:**
- The atom schema (17 fields)
- The extraction scripts (excavate-atoms.py, grade-atoms.py)
- The three-way verification pattern
- The SIGNAL/CONTEXT/NOISE tiering
- The provenance tracking (LOCAL/HYBRID/ALIEN)

**Where it should live:** ORGAN-IV as a system-wide SOP. Any organ receiving foreign material runs this protocol.

**IRF reference:** IRF-SYS-058 (generalize to ORGAN-IV)

---

## 2. Board Governance Toolkit

**What it is:** Config-driven scripts that manage a GitHub Project board — state transitions, tracking, auditing, redundancy detection.

**What we built:**
- `transition-issue.sh` — gatekeeper with state machine validation + audit log
- `sync-tracking-table.sh` — materializes board state into read-only markdown
- `audit-board.sh` — detects drift and incomplete fields
- `detect-redundancy.sh` — finds duplicate/near-duplicate issues
- `setup-board.sh` — instantiates fields + prints view specs from config
- `board.config.json` — all instance-specific IDs

**What's reusable:**
- The entire toolkit. Scripts are portable — swap the config, same process.
- The 5-state lifecycle: GATED → SPEC → WIP → DONE → CLOSED
- The field model: Phase, Issue Type, Priority, Status, Gate Met, Next Action, External Party
- The audit log pattern (append-only, timestamps, rejected transitions logged)

**Already tested on:** Styx board (504 items) — found 55 redundancy clusters, ~75 mergeable items.

**Where it should live:** Template repo or ORGAN-IV tooling. New project = `cp board.config.json` + run `setup-board.sh`.

---

## 3. Single-Authority Data Model

**What it is:** One canonical record, everything else derives. No manual sync between systems.

**The problem it solved:** Three independently-maintained records (GitHub board, local tracking table, IRF) drifting out of sync. Manual "parity rituals" that nobody actually did consistently.

**The pattern:**
```
Canonical record (GitHub board)
  ├── written by → gatekeeper script (validates + logs)
  ├── generates → local tracking table (read-only view)
  └── referenced by → IRF entries (pointers, not copies)
```

**What's reusable:**
- The principle: if you have N systems claiming to hold truth about the same entity, reduce to 1 + (N-1) derived views
- The implementation: one write path (script), one materialization path (sync script), one audit path (drift detector)
- The config-driven portability

**Where it should live:** System-wide architectural principle in ORGAN-IV governance.

---

## 4. Client Content-to-Product Pipeline

**What it is:** The full journey from "client hands over raw conversations" to "organized, prioritized, specced work items on a project board with a roadmap."

**Steps we executed:**
1. **Receive** raw material (127 files)
2. **Extract** atoms (1,821 units)
3. **Grade** by quality tier (SIGNAL/CONTEXT/NOISE)
4. **Tag** with metadata (17 fields per atom)
5. **Verify** three ways (independent model validation)
6. **Route** to build destinations (branches, pillars, social, products)
7. **Identify IP** (Bio-Safety Pyramid, Feel Good First, Creature Selves, etc.)
8. **Create issues** from content gaps and IRF items
9. **Fill board fields** for every issue
10. **Link atoms to issues** (universal recall)
11. **Generate reports** (executive, client, technical)
12. **Send to client** for review and decisions
13. **Log decisions** as they come back
14. **Build roadmap** from confirmed decisions

**What's reusable:** The entire pipeline as a checklist. Steps 1-8 are pre-build. Steps 9-14 are execution governance. Any client engagement follows this shape.

**Where it should live:** commerce--meta as a client engagement SOP.

---

## 5. Editorial Triage Protocol

**What it is:** Handling contested claims in client content without unilateral censorship.

**What we did:**
- Identified 104 FLAGGED atoms (water memory, biophotonics, frequency healing, statistical claims)
- Categorized by claim type and risk level
- Presented to admin as "here's content where the framing matters — how do you want to present these?"
- Not "we found problems" but "these are your choices"

**What's reusable:**
- The FLAGGED editorial state (distinct from CLEAN and UNVERIFIED)
- The review document format (keep/reframe/remove per item)
- The framing: client decides how their content is presented on their professional site
- The principle: never remove without asking, never publish without flagging

**Where it should live:** Content SOP in ORGAN-IV or commerce--meta.

---

## 6. Client IP Identification

**What it is:** Recognizing and naming the client's original intellectual property from within their raw material.

**What we found in admin's content:**
- Bio-Safety Pyramid
- Feel Good First philosophy
- Burnt Toast Theory
- 90-second cortisol reset
- Creature Selves concept
- EAU (Elevate, Align, Unlock) framework

**What's reusable:**
- The provenance field (LOCAL = client's original work)
- The pattern: scan LOCAL-provenance atoms for named frameworks, unique methodologies, original terminology
- The output: IP inventory with protection recommendations

**Where it should live:** commerce--meta IP documentation SOP.

---

## 7. Multi-Perspective Reporting

**What it is:** Analyzing the same data from multiple viewpoints and presenting each to the client.

**What we generated:**
1. Executive Summary — high-level, decision-focused
2. Client Report — admin-facing, her content analyzed for her
3. Technical Audit — system architecture assessment
4. System Health — operational metrics

**What's reusable:**
- The 4-report template
- The principle: same data, different lenses, different audiences
- The client report specifically — showing someone their own content analyzed is powerful

**admin's reaction:** "#3 & #5 made me actually lol lmao that's crazyyyyy this is amazing I knew I had a lot of info but had no idea"

**Where it should live:** Delivery SOP in commerce--meta.

---

## 8. Spiral Build Methodology

**What it is:** The build order follows the spiral — forward, return, forward at a higher level.

**The pattern:**
```
⟨α⟩ Foundation — lay ground, resolve blockers
{there — First Pass: bones live, content in hands
back) — Return: enrich, connect, fill gaps
again — Second Pass: products, revenue, independence
⟨ω⟩ Completion — system runs, client is sovereign
```

**What's reusable:**
- The wave structure: unblocked → after-decisions → after-build-progress → deferred
- The principle: deliver something usable FIRST (social content calendar), then build infrastructure around it
- The "bones first" approach: placeholders for what's not done, structure visible, client can see progress

**Critical lesson from this engagement:** admin was already selling while we were building governance tooling. Client-facing work ships first, always.

**Where it should live:** Project management SOP in ORGAN-IV.

---

## 9. The "Nothing Lost" Protocol

**What it is:** Session close discipline ensuring no work, decision, or artifact is lost.

**What we enforce:**
- local:remote = 1:1 (every commit pushed)
- Persistent memory updated
- Plans additive (never overwritten)
- Client decisions logged with dates
- IRF updated (completions moved, new items added, GH# pointers set)
- Deferrals logged as issues (no deferral without a record)
- Build verified passing

**What's reusable:** The hall-monitor audit script pattern. Every session ends with a verification pass.

**Where it should live:** Universal session close SOP (already exists but was refined here).

---

## 10. Process Portability Pattern

**What it is:** Separating the PROCESS from the INSTANCE so work exists outside the context where it was created.

**What we did:**
- Extracted all hardcoded IDs from governance scripts into `board.config.json`
- Scripts are the portable process; config is the instance
- Same scripts deployed to Styx repo with different config
- View definitions as copy-pasteable filter queries, not fixed structures

**The principle:** "The work must exist outside the instance of creation so it can be a process refined and repeated."

**Where it should live:** This IS the principle. It applies everywhere.

---

## Summary: The Reusable Stack

| # | Process | Scope | Portable? |
|---|---------|-------|-----------|
| 1 | Xenograft Protocol | Content extraction + atomization | Yes — parameterize domain |
| 2 | Board Governance Toolkit | Project management | Yes — swap config |
| 3 | Single-Authority Model | Data architecture | Yes — principle |
| 4 | Content-to-Product Pipeline | Client engagement lifecycle | Yes — checklist |
| 5 | Editorial Triage | Content quality | Yes — SOP |
| 6 | IP Identification | Client asset protection | Yes — provenance scan |
| 7 | Multi-Perspective Reporting | Client communication | Yes — template |
| 8 | Spiral Build Methodology | Project phasing | Yes — wave structure |
| 9 | "Nothing Lost" Protocol | Session discipline | Yes — audit script |
| 10 | Process Portability | Meta-process | Yes — it IS the pattern |

**Next step:** Generalize each into a domain-neutral SOP in ORGAN-IV or commerce--meta. Strip admin-specific details, parameterize the domain, document the entry conditions and gate criteria. The first client engagement produced 10 reusable processes. The second client should take half the time.
