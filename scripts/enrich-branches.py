#!/usr/bin/env python3
"""Sprint 2b: Enrich branch pages with PARTIAL SIGNAL atoms.

Matches atoms to branches by source file topic, extracts content,
and appends a "Research & Evidence" section to each branch page.

Only injects atoms with:
  - tier: SIGNAL
  - strike_phase: 2C (branch-enrichment)
  - build_state: PARTIAL or MISSING
  - editorial: CLEAN
  - nature in [CITATION, CLAIM, PROTOCOL, FRAMEWORK, NARRATIVE, TOOL]
"""

import re
from pathlib import Path
from collections import defaultdict

REGISTRY = Path("docs/archive/atom-registry.yaml")
EXTRACTED = Path("docs/archive/extracted")
BRANCHES_DIR = Path("src/content/branches")

# Map source file topics to branches
SOURCE_TO_BRANCH = {
    # gut-hormones
    "health/gut-rebuilding-diet": "gut-hormones",
    "health/hormone-cycle-guide": "gut-hormones",
    "health/inflammation-self-check": "gut-hormones",
    "health/cortisol-stress-carousel": "gut-hormones",
    "health/hydration-and-blood-sugar": "gut-hormones",
    "health/hemorrhoids-and-daily-discomfort": "gut-hormones",
    "health/period-related-rest": "gut-hormones",
    "health-hormones-and-healing": "gut-hormones",
    "health/aerosols-and-cleaning-products": "gut-hormones",
    # fertility
    "health/birth-control-resources-guide": "fertility",
    "health/endometriosis": "fertility",
    "health/medical-research-gender-gap": "fertility",
    "health/chlorine-absorption": "fertility",
    # autoimmune
    "health/fascia-and-emotions": "autoimmune",
    "health/heds-diagnosis": "autoimmune",
    "health/neurodivergence-and-autoimmune": "autoimmune",
    "health/heroin-healing-journey": "autoimmune",
    "health/heroines-healing-journey": "autoimmune",
    "health/sonoluminescence-phenomenon-explained": "autoimmune",
    "health/cellular-reprogramming-through-voice": "autoimmune",
    # athletic
    "health/30-day-acupressure-routine": "athletic",
    "health/bubble-butt-guide": "athletic",
    "health/feel-good-first-script": "athletic",
    "health/fda-just-a-little-bit-carcinogens": "athletic",
    # cancer-support
    "health/sulphur-and-glutathione": "cancer-support",
    "health/cancer-support-resources": "cancer-support",
    # sustainability
    "water/well-water-costs": "sustainability",
    "water/water-hub-design": "sustainability",
    "water/water-hub-framework-breakdown": "sustainability",
    "water/2-5-ph-acidic-water": "sustainability",
    "water/hydrogen-water-science-health-and-business": "sustainability",
    "water/ionized-water-benefits": "sustainability",
    "water/kangen-water-content-ideas": "sustainability",
    "water/water-sales-strategy-plan": "sustainability",
}


def match_branch(source_file):
    """Match a source file to a branch."""
    stem = Path(source_file).stem if source_file else ""
    # Try exact match first
    for pattern, branch in SOURCE_TO_BRANCH.items():
        if pattern in source_file or stem == pattern.split("/")[-1]:
            return branch
    # Heuristic: health/ files → gut-hormones as default
    if source_file.startswith("health/"):
        return "gut-hormones"
    if source_file.startswith("water/"):
        return "sustainability"
    return None


def parse_enrichment_atoms():
    """Extract branch-enrichment atoms from registry."""
    content = REGISTRY.read_text()
    blocks = re.split(r"\n  - id: ", content)
    atoms = []

    valid_natures = {"CITATION", "CLAIM", "PROTOCOL", "FRAMEWORK", "NARRATIVE", "TOOL"}
    # Only include HYBRID provenance (substantive responses, not admin's prompts)
    valid_provenance = {"HYBRID"}

    for block in blocks[1:]:
        block = "id: " + block
        tier = re.search(r"tier: (\S+)", block)
        if not tier or tier.group(1) != "SIGNAL":
            continue
        strike = re.search(r"strike_phase: (\S+)", block)
        if not strike or strike.group(1) != "2C":
            continue
        build_state = re.search(r"build_state: (\S+)", block)
        if not build_state or build_state.group(1) not in ("PARTIAL", "MISSING"):
            continue
        editorial = re.search(r"editorial: (\S+)", block)
        if not editorial or editorial.group(1) != "CLEAN":
            continue
        nature = re.search(r"nature: (\S+)", block)
        if not nature or nature.group(1) not in valid_natures:
            continue
        provenance = re.search(r"provenance: (\S+)", block)
        if not provenance or provenance.group(1) not in valid_provenance:
            continue

        atom_id = re.search(r"^id: (ATM-\S+)", block).group(1)
        source = re.search(r'source_file: "([^"]+)"', block)
        idea = re.search(r'idea: "([^"]*)"', block) or re.search(r"idea: (.+?)$", block, re.MULTILINE)

        source_file = source.group(1) if source else ""
        branch = match_branch(source_file)
        if not branch:
            continue

        atoms.append({
            "id": atom_id,
            "source_file": source_file,
            "idea": (idea.group(1) if idea else "").strip(),
            "nature": nature.group(1),
            "branch": branch,
        })

    return atoms


def extract_atom_content(atom):
    """Extract full content of an atom from its source file."""
    source_path = EXTRACTED / atom["source_file"]
    if not source_path.exists():
        return None

    text = source_path.read_text()
    atom_id = atom["id"]

    in_pattern = rf"<!-- {re.escape(atom_id)} IN\n.*?-->\n(.*?)(?:<!-- {re.escape(atom_id)} OUT|<!-- ATM-\w+-\d+ IN|\Z)"
    match = re.search(in_pattern, text, re.DOTALL)
    if match:
        content = match.group(1).strip()
        content = re.sub(r"^## (?:Response|Prompt):?\s*\n?", "", content).strip()
        # Strip image references (from .docx pandoc conversions)
        content = re.sub(r"!\[.*?\]\(media/[^)]+\)\{[^}]*\}", "", content)
        content = re.sub(r"!\[.*?\]\(media/[^)]+\)", "", content)
        # Strip "Updated saved memory" artifacts
        content = re.sub(r"^Updated saved memory\s*$", "", content, flags=re.MULTILINE)
        # Strip lone heading markers
        content = re.sub(r"^#+ *$", "", content, flags=re.MULTILINE)
        # Collapse excessive whitespace
        content = re.sub(r"\n{3,}", "\n\n", content).strip()
        # Skip very short content (< 50 chars) or placeholder content
        if len(content) < 50:
            return None
        if "transcript unavailable" in content.lower():
            return None
        # Filter out chat artifacts and low-quality content
        chat_markers = [
            "updated saved memory", "yes please", "yay!!", "awesome!",
            "absolutely!", "perfect!", "you're welcome", "i'm glad",
            "thank you", "let me know", "lol", "omg", "ooo",
        ]
        lower = content.lower()
        # If >50% of the content is a chat marker, skip it
        for marker in chat_markers:
            if lower.startswith(marker) and len(content) < 100:
                return None
        return content
    return None


def build_enrichment_section(branch_atoms):
    """Build a research & evidence section from atoms."""
    citations = []
    protocols = []
    frameworks = []
    narratives = []

    for atom in branch_atoms:
        content = extract_atom_content(atom)
        if not content:
            continue

        # Truncate very long content to first meaningful paragraph
        paragraphs = [p.strip() for p in content.split("\n\n") if p.strip()]
        if len(paragraphs) > 3:
            content = "\n\n".join(paragraphs[:3])

        entry = {"id": atom["id"], "nature": atom["nature"], "content": content}

        if atom["nature"] == "CITATION":
            citations.append(entry)
        elif atom["nature"] == "PROTOCOL":
            protocols.append(entry)
        elif atom["nature"] == "FRAMEWORK":
            frameworks.append(entry)
        elif atom["nature"] in ("NARRATIVE", "CLAIM", "TOOL"):
            narratives.append(entry)

    if not any([citations, protocols, frameworks, narratives]):
        return None

    lines = ["", "## Research & Evidence", ""]

    if frameworks:
        lines.append("### Key Frameworks")
        lines.append("")
        for f in frameworks[:3]:  # Cap at 3 per section
            lines.append(f"{f['content']}")
            lines.append("")

    if citations:
        lines.append("### Supporting Research")
        lines.append("")
        for c in citations[:5]:
            lines.append(f"- {c['content']}")
            lines.append("")

    if protocols:
        lines.append("### Protocols")
        lines.append("")
        for p in protocols[:3]:
            lines.append(f"{p['content']}")
            lines.append("")

    if narratives:
        lines.append("### From admin's Research")
        lines.append("")
        for n in narratives[:4]:
            # Take first paragraph only for narratives
            first_para = n["content"].split("\n\n")[0]
            if len(first_para) > 300:
                first_para = first_para[:297] + "..."
            lines.append(f"> {first_para}")
            lines.append("")

    return "\n".join(lines)


def main():
    atoms = parse_enrichment_atoms()
    print(f"Found {len(atoms)} enrichment atoms (SIGNAL, 2C, PARTIAL/MISSING, CLEAN)")

    by_branch = defaultdict(list)
    for a in atoms:
        by_branch[a["branch"]].append(a)

    print(f"\nBranch distribution:")
    for branch, batch in sorted(by_branch.items()):
        print(f"  {branch}: {len(batch)} atoms")

    enriched = 0
    for branch, batch in sorted(by_branch.items()):
        branch_file = BRANCHES_DIR / f"{branch}.md"
        if not branch_file.exists():
            print(f"  SKIP {branch} — file not found")
            continue

        section = build_enrichment_section(batch)
        if not section:
            print(f"  SKIP {branch} — no extractable content")
            continue

        current = branch_file.read_text()

        # Check if already enriched
        if "## Research & Evidence" in current:
            print(f"  SKIP {branch} — already enriched")
            continue

        # Insert before ## Resources section (or at end)
        if "## Resources" in current:
            current = current.replace("## Resources", section + "\n## Resources")
        elif "## CTA" in current:
            current = current.replace("## CTA", section + "\n## CTA")
        else:
            current = current + section

        branch_file.write_text(current)
        enriched += 1
        print(f"  ENRICHED {branch} with {len(batch)} atoms")

    print(f"\nEnriched {enriched} branch pages")


if __name__ == "__main__":
    main()
