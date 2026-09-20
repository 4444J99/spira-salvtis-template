#!/usr/bin/env python3
"""
link-atoms-to-issues.py — Enriches atom-registry.yaml with github_issue field.

Routes each atom to its GitHub issue(s) based on nature, tier, editorial,
build_state, pillar, and source file. Atoms can map to multiple issues.

Usage:
  python3 scripts/link-atoms-to-issues.py              # dry-run (print stats)
  python3 scripts/link-atoms-to-issues.py --write      # update registry in place

Run AFTER build-atom-registry.sh regenerates the base registry.
"""

import yaml
import sys
import re
from collections import Counter, defaultdict

REGISTRY = "docs/archive/atom-registry.yaml"
WRITE = "--write" in sys.argv

# --- Routing rules ---
# Each rule: (condition_fn, issue_number, reason)
# Atoms can match multiple rules → multiple issues

RULES = [
    # Nature-based routing
    (lambda a: a.get("nature") == "SCRIPT",
     26, "social content injection"),

    (lambda a: a.get("nature") in ("TOOL", "PRODUCT"),
     31, "downloadable product pipeline"),

    # Editorial routing
    (lambda a: a.get("editorial") == "FLAGGED",
     25, "editorial triage"),

    # Build state routing
    (lambda a: a.get("build_state") == "N/A",
     22, "N/A atom routing"),

    (lambda a: a.get("build_state") == "PARTIAL" and a.get("tier") == "SIGNAL",
     27, "branch/pillar enrichment"),

    # Pillar + tier routing
    (lambda a: a.get("tier") == "SIGNAL" and a.get("pillar") == "Physical",
     6, "physical sovereignty build"),

    (lambda a: a.get("tier") == "SIGNAL" and a.get("pillar") == "Inner",
     27, "inner pillar enrichment"),

    (lambda a: a.get("tier") == "SIGNAL" and a.get("pillar") == "Identity",
     27, "identity pillar enrichment"),

    (lambda a: a.get("tier") == "SIGNAL" and a.get("pillar") == "Financial",
     27, "financial pillar enrichment"),

    # Semantic clustering (all SIGNAL atoms)
    (lambda a: a.get("tier") == "SIGNAL",
     28, "semantic clustering"),

    # Source-file-based routing
    (lambda a: any(kw in a.get("source_file", "").lower()
                   for kw in ["time-astro/", "cycle", "moon", "astrology", "human-design", "hormone"]),
     30, "astrology/cycle integration"),

    (lambda a: any(kw in a.get("source_file", "").lower()
                   for kw in ["alchemy", "frequency", "cymascope", "fda", "sulphur",
                              "water-crystals", "sound-frequency"]),
     32, "research thread integration"),

    # Creature selves
    (lambda a: "creature" in a.get("source_file", "").lower()
            or "creature" in a.get("idea", "").lower(),
     20, "creature selves concept"),
]


def route_atom(atom):
    """Return list of (issue_number, reason) for this atom."""
    matches = []
    for condition, issue, reason in RULES:
        try:
            if condition(atom):
                matches.append(issue)
        except Exception:
            pass
    # Deduplicate while preserving order
    seen = set()
    unique = []
    for m in matches:
        if m not in seen:
            seen.add(m)
            unique.append(m)
    return unique


def main():
    with open(REGISTRY) as f:
        data = yaml.safe_load(f)

    atoms = data.get("atoms", [])
    total = len(atoms)

    # Route all atoms
    stats = Counter()
    issue_counts = Counter()
    unlinked = []

    for atom in atoms:
        issues = route_atom(atom)
        atom["github_issues"] = issues if issues else []

        if issues:
            stats["linked"] += 1
            for iss in issues:
                issue_counts[iss] += 1
        else:
            stats["unlinked"] += 1
            unlinked.append(atom)

    # Report
    print(f"Total atoms: {total}")
    print(f"Linked: {stats['linked']} ({stats['linked']/total*100:.1f}%)")
    print(f"Unlinked: {stats['unlinked']} ({stats['unlinked']/total*100:.1f}%)")
    print()
    print("Issue coverage:")
    for iss, count in sorted(issue_counts.items()):
        print(f"  #{iss}: {count} atoms")
    print()

    if unlinked:
        print(f"Unlinked atoms ({len(unlinked)}):")
        # Group by tier
        by_tier = defaultdict(list)
        for a in unlinked:
            by_tier[a.get("tier", "?")].append(a)
        for tier, items in sorted(by_tier.items()):
            print(f"  {tier}: {len(items)}")
            for item in items[:3]:
                print(f"    {item['id']}: {item.get('idea', '')[:80]}")
            if len(items) > 3:
                print(f"    ... and {len(items) - 3} more")

    if WRITE:
        # Rewrite the YAML with github_issues field
        with open(REGISTRY, "w") as f:
            f.write("# AUTO-GENERATED — do not edit. Source of truth is the in-situ markers.\n")
            f.write("# Regenerate: bash scripts/build-atom-registry.sh && python3 scripts/link-atoms-to-issues.py --write\n")
            f.write(f"# Generated: {data.get('generated', 'unknown')}\n")
            f.write(f"# Issue linkage: {stats['linked']}/{total} atoms linked\n")
            f.write("\natoms:\n")
            for atom in atoms:
                f.write(f"  - id: {atom['id']}\n")
                f.write(f'    source_file: "{atom.get("source_file", "")}"\n')
                # Escape idea field properly
                idea = atom.get("idea", "").replace('"', '\\"')
                f.write(f'    idea: "{idea}"\n')
                section = atom.get("section", "").replace('"', '\\"')
                f.write(f'    section: "{section}"\n')
                f.write(f"    position: {atom.get('position', 0)}\n")
                f.write(f"    of_total: {atom.get('of_total', 0)}\n")
                prev = atom.get("prev")
                f.write(f"    prev: {prev if prev else 'null'}\n")
                f.write(f"    provenance: {atom.get('provenance', 'HYBRID')}\n")
                f.write(f"    nature: {atom.get('nature', 'CLAIM')}\n")
                nodes = atom.get("nodes", [])
                if nodes:
                    f.write(f"    nodes: {nodes}\n")
                else:
                    f.write("    nodes: []\n")
                pillar = atom.get("pillar", "").replace('"', '\\"')
                f.write(f'    pillar: "{pillar}"\n')
                f.write(f"    build_state: {atom.get('build_state', 'MISSING')}\n")
                f.write(f"    editorial: {atom.get('editorial', 'CLEAN')}\n")
                f.write(f"    tier: {atom.get('tier', 'CONTEXT')}\n")
                f.write(f"    strike_phase: {atom.get('strike_phase', '1A')}\n")
                issues = atom.get("github_issues", [])
                if issues:
                    f.write(f"    github_issues: {issues}\n")
                else:
                    f.write("    github_issues: []\n")

        print(f"\n✅ Registry updated: {REGISTRY}")
        print(f"   {stats['linked']}/{total} atoms linked to issues")
    else:
        print("\nDry run — use --write to update registry")


if __name__ == "__main__":
    main()
