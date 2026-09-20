#!/usr/bin/env python3
"""Extract SIGNAL+SCRIPT atoms into a social content calendar.

Reads the atom registry (grep-based, avoids YAML parse issues) and
extracts full content from the extracted source files. Organizes
by content format: carousel, reel, email, video, guide, post.

Output: docs/social-content-calendar/
"""

import re
import os
from pathlib import Path
from collections import defaultdict

REGISTRY = Path("docs/archive/atom-registry.yaml")
EXTRACTED = Path("docs/archive/extracted")
OUTPUT = Path("docs/social-content-calendar")


def parse_script_atoms():
    """Extract SCRIPT+SIGNAL atoms from registry using regex."""
    content = REGISTRY.read_text()
    blocks = re.split(r"\n  - id: ", content)
    atoms = []

    for block in blocks[1:]:
        block = "id: " + block
        nature = re.search(r"nature: (\S+)", block)
        tier = re.search(r"tier: (\S+)", block)
        if not nature or nature.group(1) != "SCRIPT":
            continue
        if not tier or tier.group(1) != "SIGNAL":
            continue

        atom_id = re.search(r"^id: (ATM-\S+)", block).group(1)
        source = re.search(r'source_file: "([^"]+)"', block)
        idea = re.search(r'idea: "([^"]*)"', block) or re.search(r"idea: (.+?)$", block, re.MULTILINE)
        pillar = re.search(r'pillar: "?([^"\n]+)"?', block)
        nodes = re.search(r"nodes: \[([^\]]*)\]", block)
        editorial = re.search(r"editorial: (\S+)", block)

        atoms.append({
            "id": atom_id,
            "source_file": source.group(1) if source else "",
            "idea": (idea.group(1) if idea else "").strip(),
            "pillar": (pillar.group(1) if pillar else "").strip(),
            "nodes": (nodes.group(1) if nodes else "").strip(),
            "editorial": (editorial.group(1) if editorial else "UNVERIFIED").strip(),
        })

    return atoms


def extract_atom_content(atom):
    """Extract full content of an atom from its source file."""
    source_path = EXTRACTED / atom["source_file"]
    if not source_path.exists():
        return None

    text = source_path.read_text()
    atom_id = atom["id"]

    # Find content between ATM-xxx IN marker and ATM-xxx OUT marker
    in_pattern = rf"<!-- {re.escape(atom_id)} IN\n.*?-->\n(.*?)(?:<!-- {re.escape(atom_id)} OUT|<!-- ATM-\w+-\d+ IN|\Z)"
    match = re.search(in_pattern, text, re.DOTALL)
    if match:
        content = match.group(1).strip()
        # Remove section headers like "## Response:"
        content = re.sub(r"^## (?:Response|Prompt):?\s*\n?", "", content).strip()
        return content

    return None


def classify_format(atom, content):
    """Classify content into format categories."""
    idea = (atom["idea"] + " " + (content or "")).lower()
    source = atom["source_file"].lower()

    if "carousel" in idea or "slide" in idea:
        return "carousel"
    if "reel" in idea or "talking" in idea or "script" in source:
        return "reel"
    if "email" in idea or "sequence" in idea:
        return "email"
    if "video" in idea or "documentary" in idea or "youtube" in idea:
        return "video"
    if "caption" in idea or "post" in idea or "instagram" in idea:
        return "post"
    if "guide" in idea or "routine" in idea or "checklist" in idea or "tracker" in idea:
        return "guide"
    return "other"


def main():
    atoms = parse_script_atoms()
    print(f"Found {len(atoms)} SIGNAL+SCRIPT atoms")

    # Extract content and classify
    entries = []
    for atom in atoms:
        content = extract_atom_content(atom)
        fmt = classify_format(atom, content)
        entries.append({**atom, "content": content, "format": fmt})

    # Group by format
    by_format = defaultdict(list)
    for e in entries:
        by_format[e["format"]].append(e)

    # Create output directory
    OUTPUT.mkdir(parents=True, exist_ok=True)

    # Write index
    index_lines = [
        "# Social Content Calendar",
        "",
        f"**Generated:** {__import__('datetime').datetime.now().strftime('%Y-%m-%dT%H:%M:%SZ')}",
        f"**Source:** atom-registry.yaml (SIGNAL + SCRIPT tier)",
        f"**Total pieces:** {len(entries)}",
        "",
        "Ready-to-use social content extracted from admin's content archive.",
        "Each piece has been graded SIGNAL (build-worthy) and classified as SCRIPT (actionable content).",
        "",
        "## By Format",
        "",
        "| Format | Count | File |",
        "|--------|-------|------|",
    ]

    for fmt in sorted(by_format.keys()):
        items = by_format[fmt]
        fname = f"{fmt}.md"
        index_lines.append(f"| {fmt.title()} | {len(items)} | [{fname}]({fname}) |")

    index_lines.extend([
        "",
        "## By Pillar",
        "",
        "| Pillar | Count |",
        "|--------|-------|",
    ])
    pillar_counts = defaultdict(int)
    for e in entries:
        pillar_counts[e["pillar"]] += 1
    for p, c in sorted(pillar_counts.items(), key=lambda x: -x[1]):
        index_lines.append(f"| {p} | {c} |")

    index_lines.extend([
        "",
        "## Editorial Status",
        "",
        "| Status | Count |",
        "|--------|-------|",
    ])
    ed_counts = defaultdict(int)
    for e in entries:
        ed_counts[e["editorial"]] += 1
    for s, c in sorted(ed_counts.items(), key=lambda x: -x[1]):
        index_lines.append(f"| {s} | {c} |")

    index_lines.extend([
        "",
        "---",
        "",
        "*Content is client IP. Code/architecture is studio IP.*",
    ])

    (OUTPUT / "README.md").write_text("\n".join(index_lines) + "\n")

    # Write per-format files
    for fmt, items in sorted(by_format.items()):
        lines = [
            f"# {fmt.title()} Content",
            "",
            f"**{len(items)} pieces** | Extracted from content archive",
            "",
            "---",
            "",
        ]

        for i, item in enumerate(items, 1):
            lines.extend([
                f"## {i}. {item['id']}",
                "",
                f"**Source:** `{item['source_file']}`",
                f"**Pillar:** {item['pillar']} | **Nodes:** [{item['nodes']}]",
                f"**Editorial:** {item['editorial']}",
                "",
            ])

            if item["content"]:
                lines.extend([
                    "### Content",
                    "",
                    item["content"],
                    "",
                ])
            else:
                lines.extend([
                    f"*Content not extracted — check source file: `docs/archive/extracted/{item['source_file']}`*",
                    "",
                ])

            lines.append("---")
            lines.append("")

        (OUTPUT / f"{fmt}.md").write_text("\n".join(lines))
        print(f"  {fmt}: {len(items)} pieces → {fmt}.md")

    print(f"\nOutput: {OUTPUT}/")
    print(f"Index: {OUTPUT}/README.md")


if __name__ == "__main__":
    main()
