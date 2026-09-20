#!/usr/bin/env python3
"""Phase 2: Semantic clustering — group SIGNAL atoms into build-ready content units.

A content unit is the smallest assemblable piece of a page section.
Clustering logic:
  1. Primary: routing destination (derived from strike_phase)
  2. Secondary: source_file (atoms from same file cover same topic)
  3. Tertiary: section proximity (adjacent atoms in same section)

Output:
  - docs/archive/content-units.yaml — structured content unit registry
  - docs/archive/content-units-summary.md — human-readable summary
"""

import re
import datetime
from pathlib import Path
from collections import defaultdict, OrderedDict

REGISTRY = Path("docs/archive/atom-registry.yaml")
OUTPUT_YAML = Path("docs/archive/content-units.yaml")
OUTPUT_MD = Path("docs/archive/content-units-summary.md")

# Map strike_phase prefixes to routing destinations
PHASE_TO_DESTINATION = {
    "1A": "architecture",
    "1B": "architecture",
    "2A": "node-deep-dive",
    "2B": "node-deep-dive",
    "2C": "branch-enrichment",
    "2D": "water-funnel",
    "3A": "node-deep-dive",
    "3B": "node-deep-dive",
    "3C": "standalone-product",
    "4A": "node-deep-dive",
    "4B": "social-content",
    "4C": "standalone-product",
    "5A": "reference",
}

# Map natures to content roles within a unit
NATURE_ROLES = {
    "FRAMEWORK": "structure",
    "MODEL": "structure",
    "PROTOCOL": "actionable",
    "TOOL": "actionable",
    "NARRATIVE": "voice",
    "SCRIPT": "deliverable",
    "CLAIM": "assertion",
    "CITATION": "evidence",
    "STATISTIC": "evidence",
    "QUESTION": "prompt",
    "INSTRUCTION": "directive",
    "PRODUCT": "asset",
}


def parse_signal_atoms():
    """Extract SIGNAL-tier atoms from registry using regex."""
    content = REGISTRY.read_text()
    blocks = re.split(r"\n  - id: ", content)
    atoms = []

    for block in blocks[1:]:
        block = "id: " + block
        tier = re.search(r"tier: (\S+)", block)
        if not tier or tier.group(1) != "SIGNAL":
            continue

        def extract(field, default=""):
            m = re.search(rf'{field}: "([^"]*)"', block) or re.search(rf"{field}: (.+?)$", block, re.MULTILINE)
            return m.group(1).strip() if m else default

        atom_id = extract("id")
        source_file = extract("source_file")
        idea = extract("idea")
        section = extract("section")
        nature = extract("nature")
        pillar = extract("pillar")
        nodes_raw = re.search(r"nodes: \[([^\]]*)\]", block)
        nodes = [int(n.strip()) for n in nodes_raw.group(1).split(",") if n.strip()] if nodes_raw else []
        build_state = extract("build_state")
        editorial = extract("editorial")
        strike = extract("strike_phase")
        provenance = extract("provenance")
        position = int(extract("position", "0") or "0")

        atoms.append({
            "id": atom_id,
            "source_file": source_file,
            "idea": idea,
            "section": section,
            "nature": nature,
            "pillar": pillar,
            "nodes": nodes,
            "build_state": build_state,
            "editorial": editorial,
            "strike_phase": strike,
            "provenance": provenance,
            "position": position,
        })

    return atoms


def cluster_atoms(atoms):
    """Group atoms into content units."""
    # Phase 1: Group by (destination, source_file)
    groups = defaultdict(list)
    for atom in atoms:
        dest = PHASE_TO_DESTINATION.get(atom["strike_phase"], "unrouted")
        key = (dest, atom["source_file"])
        groups[key].append(atom)

    # Phase 2: Split large groups by section
    content_units = []
    unit_id = 0

    for (dest, source_file), group_atoms in sorted(groups.items()):
        # Sub-group by section
        by_section = defaultdict(list)
        for a in group_atoms:
            section_key = a["section"] or "default"
            by_section[section_key].append(a)

        # Merge small sections (< 3 atoms) into nearest neighbor
        sections = list(by_section.items())
        merged = []
        buffer = []
        for sec_name, sec_atoms in sections:
            buffer.extend(sec_atoms)
            if len(buffer) >= 3:
                merged.append(buffer)
                buffer = []
        if buffer:
            if merged:
                merged[-1].extend(buffer)
            else:
                merged.append(buffer)

        # Create content units from merged groups
        for group in merged:
            unit_id += 1
            group.sort(key=lambda a: a["position"])

            # Derive unit metadata
            natures = defaultdict(int)
            pillars = set()
            all_nodes = set()
            build_states = defaultdict(int)
            editorials = defaultdict(int)

            for a in group:
                natures[a["nature"]] += 1
                pillars.add(a["pillar"])
                all_nodes.update(a["nodes"])
                build_states[a["build_state"]] += 1
                editorials[a["editorial"]] += 1

            dominant_nature = max(natures, key=natures.get)
            role = NATURE_ROLES.get(dominant_nature, "mixed")

            # Generate descriptive name from source file
            source_stem = Path(source_file).stem if source_file else "unknown"
            # Clean up: replace hyphens with spaces, title case
            source_label = source_stem.replace("-", " ").replace("_", " ").title()

            content_units.append({
                "unit_id": f"CU-{unit_id:04d}",
                "destination": dest,
                "source_file": source_file,
                "label": source_label,
                "atom_count": len(group),
                "atom_ids": [a["id"] for a in group],
                "dominant_nature": dominant_nature,
                "role": role,
                "pillars": sorted(pillars),
                "nodes": sorted(all_nodes),
                "build_states": dict(build_states),
                "editorials": dict(editorials),
                "natures": dict(natures),
            })

    return content_units


def write_yaml(units):
    """Write content units as YAML (manual serialization to avoid PyYAML issues)."""
    now = datetime.datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ")

    lines = [
        "# Content Units — Phase 2 Semantic Clustering",
        f"# Generated: {now}",
        f"# Total units: {len(units)}",
        f"# Total atoms: {sum(u['atom_count'] for u in units)}",
        "",
        "units:",
    ]

    for u in units:
        lines.append(f"  - unit_id: {u['unit_id']}")
        lines.append(f"    destination: {u['destination']}")
        lines.append(f"    source_file: \"{u['source_file']}\"")
        lines.append(f"    label: \"{u['label']}\"")
        lines.append(f"    atom_count: {u['atom_count']}")
        lines.append(f"    dominant_nature: {u['dominant_nature']}")
        lines.append(f"    role: {u['role']}")
        lines.append(f"    pillars: [{', '.join(u['pillars'])}]")
        lines.append(f"    nodes: [{', '.join(str(n) for n in u['nodes'])}]")
        lines.append(f"    atom_ids:")
        for aid in u["atom_ids"]:
            lines.append(f"      - {aid}")
        lines.append(f"    build_states: {{{', '.join(f'{k}: {v}' for k, v in u['build_states'].items())}}}")
        lines.append(f"    editorials: {{{', '.join(f'{k}: {v}' for k, v in u['editorials'].items())}}}")

    OUTPUT_YAML.write_text("\n".join(lines) + "\n")
    print(f"Wrote {OUTPUT_YAML} ({len(units)} units)")


def write_summary(units):
    """Write human-readable summary."""
    now = datetime.datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ")
    total_atoms = sum(u["atom_count"] for u in units)

    by_dest = defaultdict(list)
    for u in units:
        by_dest[u["destination"]].append(u)

    lines = [
        "# Content Units Summary — Phase 2 Semantic Clustering",
        "",
        f"**Generated:** {now}",
        f"**Total content units:** {len(units)}",
        f"**Total SIGNAL atoms clustered:** {total_atoms}",
        "",
        "Each content unit is the smallest assemblable piece of a page section.",
        "Units are grouped by destination (where they go on the site) and labeled by source topic.",
        "",
        "---",
        "",
        "## Destination Overview",
        "",
        "| Destination | Units | Atoms | Top Natures |",
        "|-------------|-------|-------|-------------|",
    ]

    for dest in sorted(by_dest.keys()):
        dest_units = by_dest[dest]
        dest_atoms = sum(u["atom_count"] for u in dest_units)
        all_natures = defaultdict(int)
        for u in dest_units:
            for n, c in u["natures"].items():
                all_natures[n] += c
        top3 = ", ".join(f"{n}({c})" for n, c in sorted(all_natures.items(), key=lambda x: -x[1])[:3])
        lines.append(f"| {dest} | {len(dest_units)} | {dest_atoms} | {top3} |")

    for dest in sorted(by_dest.keys()):
        dest_units = by_dest[dest]
        dest_atoms = sum(u["atom_count"] for u in dest_units)
        lines.extend([
            "",
            "---",
            "",
            f"## {dest.replace('-', ' ').title()} ({len(dest_units)} units, {dest_atoms} atoms)",
            "",
            "| Unit | Label | Atoms | Role | Pillars | Nodes | Build State |",
            "|------|-------|-------|------|---------|-------|-------------|",
        ])

        for u in sorted(dest_units, key=lambda x: -x["atom_count"]):
            pillars = ", ".join(u["pillars"])
            nodes = ", ".join(str(n) for n in u["nodes"][:5])
            if len(u["nodes"]) > 5:
                nodes += "..."
            missing = u["build_states"].get("MISSING", 0)
            partial = u["build_states"].get("PARTIAL", 0)
            exists = u["build_states"].get("EXISTS", 0)
            state = f"M:{missing} P:{partial} E:{exists}"
            lines.append(f"| {u['unit_id']} | {u['label'][:40]} | {u['atom_count']} | {u['role']} | {pillars} | [{nodes}] | {state} |")

    lines.extend([
        "",
        "---",
        "",
        "## Next Steps",
        "",
        "1. **Node deep-dive assembly:** Use content units to populate node page sections (blocked by GH#13)",
        "2. **Branch enrichment:** Inject branch-enrichment units into existing pages (UNBLOCKED)",
        "3. **Architecture resolution:** Architecture units inform the GH#13 decision deck",
        "4. **Social content:** Already extracted to `docs/social-content-calendar/`",
        "5. **Standalone products:** Review product units for packaging decisions (GH#19, GH#20)",
        "",
        "*Content is client IP. Code/architecture is studio IP.*",
    ])

    OUTPUT_MD.write_text("\n".join(lines) + "\n")
    print(f"Wrote {OUTPUT_MD}")


def main():
    atoms = parse_signal_atoms()
    print(f"Parsed {len(atoms)} SIGNAL atoms from registry")

    units = cluster_atoms(atoms)
    print(f"Formed {len(units)} content units")

    write_yaml(units)
    write_summary(units)


if __name__ == "__main__":
    main()
