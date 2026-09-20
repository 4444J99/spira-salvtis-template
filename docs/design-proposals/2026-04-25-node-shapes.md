# Node Shape Design — Spiral V4

**Status:** Awaiting admin's response
**Origin:** Anthony pushback 2026-04-25 on the all-identical-5-point-star approach
**Context:** admin's note specified "asterisks or stars that match the colors of the chakras from bottom to top." That constrains coloring (chakra spectrum, root → crown), but leaves shape open. Shipped V3 used a single 5-point star for all 13 nodes — too homogeneous. Each node should be its own form, recognizable at small and large sizes, rooted in a tradition that matches the node's meaning.

## Proposal A — fixed sacred symbols mapped per node

Each node = a unique 3D shape pulled from a different belief system. Silhouette-readable at thumbnail and full-screen scale. Chakra color stays (per admin).

| # | Name | Phase | Shape | Tradition | Why |
|---|------|-------|-------|-----------|-----|
| 1 | Feel Good First | ELEVATE | Sunburst (12-ray radiant) | Egyptian Ra / universal solar | Joy, state-shift, illumination |
| 2 | Awareness | ELEVATE | Eye of Horus | Egyptian | Self-seeing, gnosis |
| 3 | Regulation | ELEVATE | Yin-yang circle | Taoist | Balance, regulation |
| 4 | Elevate | ELEVATE | Upward triangle | Pythagorean fire / Hindu Manipura | Rising |
| 5 | Root Healing | ELEVATE | Teardrop / wave | Universal water | Foundation, water |
| 6 | Responsibility (with Love) | ALIGN | Heart | Christian sacred heart | Love |
| 7 | Unbecoming | ALIGN | Crescent moon | Islamic / lunar feminine | Release, cycles |
| 8 | Alignment | ALIGN | Hexagram (6-pt) | Jewish Star of David / Hindu Anahata | Coherence |
| 9 | The Becoming | ALIGN | Lotus (8-petal) | Buddhist / Hindu Sahasrara | Awakening, emergence |
| 10 | Awakening | ALIGN | Eye-in-triangle | Egyptian / Masonic Eye of Providence | Declaration, vision |
| 11 | Integrate | ALIGN | Equal-arm cross | Celtic / pre-Christian | Synthesis |
| 12 | Authenticate | UNLOCK | Octahedron (3D diamond) | Sacred geometry | Multifaceted truth |
| 13 | Unlock | UNLOCK | Ankh | Egyptian "key of life" | Freedom — literally the key |

Spans 8+ traditions: Egyptian, Christian, Islamic, Jewish, Hindu, Buddhist, Taoist, Pythagorean, Celtic, Masonic.

**Implementation cost:** ~3-5h focused work. Each shape is a `THREE.Shape` path with `ExtrudeGeometry` (or in some cases a built-in Three.js geometry). Some shapes (heart, ankh, eye-in-triangle, lotus, yin-yang) require bezier curves; others (triangle, hexagram, cross, octahedron) are straightforward polygons.

## Proposal B — generative star structures (Anthony 2026-04-25)

Instead of mapping each node to a fixed sacred symbol, **procedurally generate** each node's geometry so every spiral instance produces 13 unique stars, with each star also having its own physics behavior (rotation, oscillation, breathing, drift).

### Generation seeds
- Each node's seed = `mulberry32(nodeId * SOME_CONSTANT)` — already exists at `spiral.ts:601`.
- Seeds produce: number of points (4–12), inner-radius ratio, twist, jitter, depth/extrusion profile.
- Result: every node is its own crystalline form, all star-family but no two alike.

### Per-node physics
Already partly in place via `PHASE_ANIM` (line 173–175) and `animParams` (line 600–627). Could deepen so each node has:
- Distinct breath frequency + amplitude
- Distinct rotation rates (X/Y/Z)
- Distinct orbit radius + speed
- Distinct emissive pulse pattern
- Maybe distinct "hum" — one node spins fast, one floats, one wobbles, etc.

### Generative-vs-meaning tradeoff
Generative stars are aesthetically richer but lose the "small/large recognizability" — you can't read "what this node is" from silhouette since every render differs. The shape no longer encodes meaning; meaning lives in the emoji overlay + node name + position.

### Hybrid possibility
Each node has a **base generative form** (procedurally generated star) **modulated by a meaning-archetype**:
- Fire nodes (1–4) generate jagged, sharp-pointed stars that flicker
- Water nodes (5) generate rounded, fluid forms that sway
- Heart nodes (6) generate symmetric, soft-radiant stars
- Air nodes (7–9) generate light, fluttering stars
- Light nodes (10–13) generate brilliant, radiating stars

The seed is the same (deterministic per node, so the renders are stable across visits), but the parameters skew per archetype.

**Implementation cost:** ~2-3h for pure generative; ~4-6h for hybrid with archetype skews.

## Decision pending

Anthony sent Proposal A (the fixed symbols mapping) to admin 2026-04-25 for her input. Awaiting her reaction. Per Anthony, the generative direction (Proposal B / hybrid) is on the table as the next iteration regardless.

Recommended sequence once admin responds:
1. If she likes the fixed-symbols mapping → ship Proposal A.
2. If she wants more dynamism → ship Proposal B (pure generative) or the hybrid.
3. If she wants something else entirely → adjust.

## Constraints admin has set

- **Color:** chakra spectrum bottom-to-top (root-red → crown-violet). Locked.
- **Family:** "asterisks or stars" — star-like silhouettes preferred. Both proposals honor this.
- **Pop:** spiral should feel bright and visible (already addressed in V3 — bg matches page, helix compressed to fit fold, brighter rendering).

## Constraints Anthony has set

- Each node should be a **different shape**, not 13 identical ones.
- Each shape should be **understandable small and large** — silhouette-readable.
- Each should be a **homage to a previous belief system** — meaning-rooted, not generic.

Proposal A satisfies these directly. Proposal B satisfies "different shape" via procedural variation but loses direct meaning-rootedness — that lives in animation/archetype instead.
