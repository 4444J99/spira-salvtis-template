# Spiral — round 2 lightening + chakra-colored stars

**Date shipped:** 2026-04-25
**Live:** https://sovereign-systems-spiral.pages.dev/
**Commit:** [`02c90a2`](https://github.com/organvm-iii-ergon/sovereign-systems--spiral-template/commit/02c90a2)
**Plan:** [`.claude/plans/2026-04-25-admin-spiral-chakra-stars-round2-lightening.md`](../.claude/plans/2026-04-25-admin-spiral-chakra-stars-round2-lightening.md)

## Summary for admin

Two notes addressed in this pass:

1. **"Can we lighten the spiral so it pops a lil more?"** — round 2 lightening, since the round-1 changes from 2026-04-23 weren't quite enough.
2. **"Doing the nodes as asterisks or stars that match the colors of the chakras from bottom to top"** — every node is now a 5-point star, colored along the chakra rainbow ascending root-to-crown.

## What changed

### Nodes

| Before | After |
|---|---|
| 13 sphere orbs | 13 5-point extruded stars |
| Coloured by 4 phase hexes (teal / light blue / gold / cyan, repeating) | Coloured along the 7-chakra spectrum, smoothly interpolated across all 13 nodes |
| No directional reading | Bottom = root (red) → top = crown (violet); ascent reads visually |

### Chakra mapping (bottom to top)

| Node | Chakra reference | Hex |
|---|---|---|
| 1 | Root (Muladhara) | `#ff3b3b` |
| 3 | Sacral (Svadhisthana) | `#ff8a3c` |
| 5 | Solar Plexus (Manipura) | `#ffd23b` |
| 7 | Heart (Anahata) | `#4ed158` |
| 9 | Throat (Vishuddha) | `#3da9f5` |
| 11 | Third Eye (Ajna) | `#6c4cd6` |
| 13 | Crown (Sahasrara) | `#b04ad8` |

(The 6 in-between nodes blend smoothly between adjacent chakras.)

### Lightness

| Setting | Round 1 (Apr 23) | Round 2 (Apr 25) |
|---|---|---|
| Background | `#0a2d33` (dark teal) | `#14525d` (lighter teal) |
| Fog density | `0.050` | `0.035` |
| Tone mapping exposure | `1.6` | `1.85` |
| Ambient light intensity | `0.65` | `0.85` |
| Helix line opacity | `0.45` | `0.6` |
| Locked-node emissive | `0.2` | `0.35` |
| Locked-node opacity | `0.3` | `0.45` |

Locked-node bumps matter because most of the upper chakras (heart, throat, third-eye, crown) sit on nodes that are still locked — without the bump, the upper rainbow would read as muted while the lower chakras pop.

### Emojis

Per-node emoji glyphs (✦ 🧬 ⚖️ 🛡️ 🌊 🕊️ 🌙 🔮 ✨ 📣 🚧 💠 ⚡) stay on top of the colored stars — they carry node-specific meaning used elsewhere on the site (node detail pages, OG share images), and read cleanly as small icons over the solid star fill.

## What is intentionally not changed

- **Node detail pages and pillar pages still use phase colors** (teal / light blue / gold / cyan). The spiral is the only surface using chakra colors. If we want chakra colors site-wide, that's a separate brand-system pass.
- **Mobile renders a small spiral** at the same camera distance as desktop — chakra colors don't read clearly at mobile size. Pre-existing; not introduced by this pass. Worth a follow-up to either widen FOV on mobile or move the camera closer.

## Deploy notes (internal)

- The GitHub Actions CF Pages deploy is currently broken — the `CLOUDFLARE_API_TOKEN` GH secret is rejecting with `Authentication error [code: 10000]`. Both Apr 23 (round 1) and Apr 25 (round 2) commits pushed to `main` but never deployed via CI. The live site was stuck on a pre-Apr-23 build until this pass.
- This deploy was shipped via local `wrangler pages deploy dist --project-name sovereign-systems-spiral` using OAuth login (account `ivviiviivvi`).
- **Follow-up:** rotate the CF API token in GitHub repo secrets so future pushes redeploy automatically.

## What I'd ask admin

> "Lightened it more + the nodes are now chakra-colored stars going bottom-up — pop level right where you want it? Lmk if any specific node should be a different shade, or if you want the chakra system to spread to the rest of the site."
