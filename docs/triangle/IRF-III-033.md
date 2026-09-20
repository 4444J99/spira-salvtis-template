# Triangulation Log — IRF-III-033

**Item:** sovereign-systems: Restore visible spiral visual fidelity and hover-name behavior
**Triangle state:** PROVISIONAL
**Last triangulated:** 2026-04-29
**Rotation count:** 0
**SOP:** `organvm/praxis-perpetua/standards/SOP--triangulation-protocol.md`
**Originating plan:** `~/.claude/plans/atomic-concurrent-matsumoto.md`
**External tracking:** GH#57 (`organvm/sovereign-systems--spiral-template`), IRF row in `meta-organvm/organvm-corpvs-testamentvm/INST-INDEX-RERUM-FACIENDARUM.md`

---

## Vertex A — Ideal

**Source:** admin's recovered statements across the client-decisions archive.

Verbatim quotes (the unreduced specification):

- "I've been obsessed with stars lately and how they're all different but essentially just look like refracted light on gateway 😎😎😎"
- "we could even just do little glowing orbs with the sparkles around it and then the name pop up on the hover in the middle"
- "I absolutely love the each symbol being from a different religion - chefs kiss !!!"
- "Can we lighten the spiral so it pops a lil more?"
- "name pops up in center or under on hover"

**Ideal-form summary**: visible refracted-light stars OR visible sacred-symbol vessels (one per religion, less generic than cross/heart), the spiral pops, the name surfaces *centered or below the node only on hover/focus/tap* — not always-visible, not at cursor position.

**Recognition test (the only test that matters at vertex A)**: admin sees the deployed page on her phone and says "yes, that's what I wanted." Until that statement exists in writing or recorded voice, A has not signed.

---

## Vertex B — Reduction

**Original prompt** (from `Closing admin's Spiral Gaps.md`, ~2026-04-29 review session):

> "okay now review what exists and let's track the gaps"

**Implicit context attached**: `admin_spiral_wishes.md.resolved` artifact + the sovereign-systems repo state.

**Lossiness estimate** (what the prompt almost certainly omitted that A would have demanded):

- Did not require browser-rendered proof of the visual fidelity claim.
- Did not require admin's recognition before any item could be marked closed.
- Did not distinguish "code-level fix exists" from "user perceives the fix in the deployed artifact."
- Treated the gap-tracker's status fields as authoritative when they were self-reported by the same agent that wrote the code.

**B-as-spoken vs B-as-should-have-been-spoken**: the prompt asked for a tracker; the ideal demanded a tracker *plus a verification standard*. A→B reduction lost the verification standard.

---

## Vertex C — Artifact

**Last filesystem verification:** 2026-04-29 (Explore agent report against current `src/components/spiral/spiral.ts` after commit `9baed08`).

**State:**

- `mesh.visible = meshVisible` (line 1665) — `meshVisible` is driven by the `vesselMode` parameter; default behavior is still mesh-invisible (particle-cloud containment).
- Refracted-light material (transmission/dispersion/IOR) still defined for stars variant at ~1582-1609. Renders only when vessel is enabled.
- `symbolGeometryFor()` sacred-symbol code path: still present but only invoked under specific variant configuration.
- Hover behavior: changed from "tagline near cursor + name always visible below" to a two-tier disclosure (tooltip surfaces tagline/lock state on hover; node label always visible below). **Not** "name pops up in center or under on hover" — name is *persistently* below, not *hover-revealed* there.
- `mobileTouch` hover skip: status not re-verified post-commit.
- Browser screenshot proof: **not present** in repo.

**Artifact-as-instantiated vs Artifact-as-claimed**: the GH issue is closed; the filesystem is closer-but-not-converged on the ideal. The closure was unilateral (the agent that did the code closed the issue).

---

## Edges

| Edge | Status | Specific gap |
|------|--------|--------------|
| **A → B** (reduction loss) | Acknowledged | The "vibe" of refracted light, the recognition standard, and the hover-behavior precision were all lost when the ideal was prompted as "track gaps against wishes." |
| **B → C** (recreation drift) | Open | Hover behavior implemented as two-tier persistent + tooltip, not as hover-revealed centered name. Vessel still defaults invisible. |
| **A → C** (fidelity gap) | Open | admin has not browser-witnessed the change. No screenshot exists. The only person whose recognition counts at vertex A has not been queried. |

---

## Generated next action

**Single concrete next action** (per `feedback_part_of_creation.md` — never present a menu):

> Capture desktop and mobile browser screenshots of the deployed spiral, then send them to admin with the verbatim quotes from §Vertex A above and ask: *"Is this what you meant by [each quote]?"* Record her response (yes/no/specific-edit) inline below. Do not move this item to CLOSED until A-recognition exists in writing or recorded voice.

---

## Rotation log

*No rotations yet. The triangle was first established 2026-04-29; current state PROVISIONAL because A→C has no evidence (admin has not reviewed). One rotation cycle will be triggered if admin's response generates a 3-way disagreement (e.g., she rejects the artifact + the prompt + her own remembered ideal).*

---

## Related items

- IRF-III-034 (REGRESSED, paired) — quiz still phase-picker, also lacks A-recognition.
- IRF-SYS-163 (DRIFT, methodologically related) — different repo, same closure-without-evidence pattern.
- Source review: `/Users/4jp/Downloads/Closing admin's Spiral Gaps.md`
- Closeout doc: `meta-organvm/organvm-corpvs-testamentvm/docs/session-closeouts/2026-04-29-admin-artifact-review-closeout.md`

---

*Format version: 1.0.0 — first instance of the per-item triangulation log. Format may evolve after the first three rotations per `feedback_forced_revision.md` (never write into final form first).*
