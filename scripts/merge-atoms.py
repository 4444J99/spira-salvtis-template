#!/usr/bin/env python3
"""Merge pass: add merge_group field to atom registry.

Groups adjacent atoms from the same source_file + section. Sub-divides
when nature changes and group exceeds 2 atoms. Target: 800-1100 groups
from 1,821 atoms.

Usage: python3 scripts/merge-atoms.py [--dry-run]
"""

import re
import sys
from pathlib import Path

REGISTRY = Path("docs/archive/atom-registry.yaml")


def parse_atoms(lines: list[str]) -> list[dict]:
    """Parse atom entries from registry YAML (simple line-based parser)."""
    atoms = []
    current = {}
    in_list = None

    for line in lines:
        # New atom starts with "  - id:"
        if re.match(r"  - id: ", line):
            if current:
                atoms.append(current)
            current = {"id": line.strip().split(": ", 1)[1]}
            in_list = None
            continue

        if not current:
            continue

        # List fields (nodes, github_issues, citationIds)
        m = re.match(r"    (\w+): \[", line)
        if m:
            current[m.group(1)] = line.strip()
            in_list = None
            continue

        # Scalar fields
        m = re.match(r"    (\w+): (.+)", line)
        if m:
            key = m.group(1)
            val = m.group(2).strip().strip('"')
            current[key] = val
            in_list = None

    if current:
        atoms.append(current)

    return atoms


def assign_merge_groups(atoms: list[dict]) -> dict[str, str]:
    """Assign merge groups. Returns {atom_id: merge_group_id}.

    Strategy: group all atoms within each (source_file, section) together,
    then sub-divide sections with >4 atoms at nature boundaries. This merges
    over-split prompt/response pairs while keeping large sections manageable.
    """
    from collections import defaultdict

    # Phase 1: bucket atoms by (source_file, section)
    buckets: dict[tuple, list[dict]] = defaultdict(list)
    for atom in atoms:
        key = (atom.get("source_file", ""), atom.get("section", ""))
        buckets[key].append(atom)

    # Phase 2: sub-divide large buckets at nature boundaries
    groups = {}
    group_num = 0

    for key, bucket in buckets.items():
        if len(bucket) <= 4:
            # Small section — keep as single merge group
            group_num += 1
            for atom in bucket:
                groups[atom["id"]] = f"MG-{group_num:04d}"
        else:
            # Large section — split at nature transitions
            current_nature = bucket[0].get("nature", "")
            run_start = 0
            for i, atom in enumerate(bucket):
                nature = atom.get("nature", "")
                # Break when nature changes OR run hits 5 atoms
                if nature != current_nature or (i - run_start) >= 5:
                    group_num += 1
                    for j in range(run_start, i):
                        groups[bucket[j]["id"]] = f"MG-{group_num:04d}"
                    run_start = i
                    current_nature = nature
            # Final run
            group_num += 1
            for j in range(run_start, len(bucket)):
                groups[bucket[j]["id"]] = f"MG-{group_num:04d}"

    return groups


def inject_merge_groups(lines: list[str], groups: dict[str, str]) -> list[str]:
    """Add merge_group field after the id field in each atom entry."""
    output = []
    current_id = None
    already_has_merge = False

    for line in lines:
        # Detect atom ID
        m = re.match(r"  - id: (.+)", line)
        if m:
            current_id = m.group(1).strip()
            already_has_merge = False
            output.append(line)
            # Insert merge_group right after id
            if current_id in groups:
                output.append(f"    merge_group: {groups[current_id]}\n")
            continue

        # Skip existing merge_group lines (idempotent)
        if re.match(r"    merge_group: ", line):
            already_has_merge = True
            continue

        output.append(line)

    return output


def main():
    dry_run = "--dry-run" in sys.argv

    text = REGISTRY.read_text()
    lines = text.splitlines(keepends=True)

    atoms = parse_atoms(lines)
    print(f"Parsed {len(atoms)} atoms")

    groups = assign_merge_groups(atoms)
    unique_groups = len(set(groups.values()))
    print(f"Assigned {unique_groups} merge groups (avg {len(atoms)/unique_groups:.1f} atoms/group)")

    # Distribution
    from collections import Counter
    group_sizes = Counter(groups.values())
    size_dist = Counter(group_sizes.values())
    print(f"\nGroup size distribution:")
    for size in sorted(size_dist):
        print(f"  {size} atoms: {size_dist[size]} groups")

    if dry_run:
        print("\n[DRY RUN] No changes written.")
        return

    updated = inject_merge_groups(lines, groups)
    REGISTRY.write_text("".join(updated))
    print(f"\nWrote updated registry with merge_group field.")


if __name__ == "__main__":
    main()
