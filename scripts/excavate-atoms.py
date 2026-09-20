#!/usr/bin/env python3
"""
Atomic content excavator for business/ and water/ extracted archives.
Decomposes files into atoms marked with HTML comment fences.

Usage: python3 scripts/excavate-atoms.py
"""

import os
import re
import yaml
from pathlib import Path
from typing import Optional

BASE = Path(__file__).resolve().parent.parent
EXTRACTED = BASE / "docs" / "archive" / "extracted"
BUSINESS_DIR = EXTRACTED / "business"
WATER_DIR = EXTRACTED / "water"
WATER_ROOT_FILE = EXTRACTED / "water-learn-more-about-erw.md"

# Build-state reference content (loaded at runtime from actual files)
FINANCIAL_PILLAR = (BASE / "src" / "content" / "pillars" / "financial.md").read_text() if (BASE / "src" / "content" / "pillars" / "financial.md").exists() else ""
PHYSICAL_PILLAR = (BASE / "src" / "content" / "pillars" / "physical.md").read_text() if (BASE / "src" / "content" / "pillars" / "physical.md").exists() else ""

BRANCH_CONTENT = ""
for branch_file in sorted((BASE / "src" / "content" / "branches").glob("*.md")):
    BRANCH_CONTENT += branch_file.read_text() + "\n"


def determine_provenance(text: str, has_prompt_header: bool, is_response: bool) -> str:
    """Determine provenance: LOCAL, HYBRID, or ALIEN."""
    if has_prompt_header and not is_response:
        return "LOCAL"
    if has_prompt_header and is_response:
        return "HYBRID"
    # Personal anecdotes, first-person narrative, named decisions
    local_signals = [
        r"\bI\s+(have|had|was|am|did|started|stopped|want|need|think|feel|love|got)\b",
        r"\bmy\s+(aunt|mom|dad|friend|story|journey|health|life|body|business)\b",
        r"\badmin\b", r"\bJessica\b", r"\bNatalie\b", r"\bLacey\b",
    ]
    for sig in local_signals:
        if re.search(sig, text, re.IGNORECASE):
            if is_response:
                return "HYBRID"
            return "LOCAL"
    return "ALIEN"


def determine_nature(text: str) -> str:
    """Classify nature of the atom."""
    lower = text.lower()

    # Questions
    if text.strip().startswith("## Prompt:") or text.strip().endswith("?"):
        if "?" in text and len(text) < 500:
            return "QUESTION"

    # Instructions / how-to
    instruction_signals = ["checklist", "step 1", "step 2", "day 1", "day 2", "action plan",
                           "✅", "🔹", "your assignment", "do this", "here's how"]
    for sig in instruction_signals:
        if sig in lower:
            return "INSTRUCTION"

    # Frameworks / models
    framework_signals = ["framework", "phase 1", "phase 2", "phase 3", "phase 4",
                        "the 20%", "80/20", "mvv", "minimum viable", "3-part",
                        "your spine", "content pillars", "sovereignty"]
    for sig in framework_signals:
        if sig in lower:
            return "FRAMEWORK"

    # Products
    product_signals = ["k8", "anespa", "enagic", "kangen machine", "ionizer",
                       "ukon", "discovery portal", "blueprint download"]
    for sig in product_signals:
        if sig in lower:
            return "PRODUCT"

    # Scripts / copy
    script_signals = ["caption:", "script:", "dm me", "dm script", "post copy",
                      "reel idea:", "hook:", "cta:"]
    for sig in script_signals:
        if sig in lower:
            return "SCRIPT"

    # Statistics
    stat_signals = [r"\$\d", r"\d+%", r"\d+\s*mg/l", r"\d+\s*sales", "commission"]
    for sig in stat_signals:
        if re.search(sig, lower):
            return "STATISTIC"

    # Protocols
    protocol_signals = ["protocol", "2.5 ph", "11.5", "6.0 water", "gargle", "rinse"]
    for sig in protocol_signals:
        if sig in lower:
            return "PROTOCOL"

    # Tools
    tool_signals = ["ghl", "notion", "canva", "trello", "google form", "typeform",
                    "credit karma", "experian"]
    for sig in tool_signals:
        if sig in lower:
            return "TOOL"

    # Citations
    citation_signals = ["pubmed", "google scholar", "study", "research", "published in",
                        "nature medicine", "pmc", "doi"]
    for sig in citation_signals:
        if sig in lower:
            return "CITATION"

    # Models
    model_signals = ["survival number", "freedom number", "stability number",
                     "financial survival", "financial stability", "financial freedom",
                     "financial legacy", "archetype"]
    for sig in model_signals:
        if sig in lower:
            return "MODEL"

    # Narrative (personal stories)
    narrative_signals = ["my journey", "my story", "i realized", "i used to",
                         "when i started", "i walked away", "i was so"]
    for sig in narrative_signals:
        if sig in lower:
            return "NARRATIVE"

    # Default
    return "CLAIM"


def determine_build_state(text: str, pillar: str) -> str:
    """Check if atom content exists in build targets."""
    if pillar == "Financial":
        ref = FINANCIAL_PILLAR.lower()
    elif pillar == "Physical":
        ref = (PHYSICAL_PILLAR + "\n" + BRANCH_CONTENT).lower()
    else:
        ref = (FINANCIAL_PILLAR + PHYSICAL_PILLAR + BRANCH_CONTENT).lower()

    if not ref.strip():
        return "N/A"

    lower = text.lower()

    # Extract key concepts from the atom
    concepts = set()
    # Get significant phrases (3+ word sequences that aren't common)
    words = re.findall(r'\b[a-z]{3,}\b', lower)
    for i in range(len(words) - 1):
        bigram = f"{words[i]} {words[i+1]}"
        concepts.add(bigram)

    matches = 0
    for concept in concepts:
        if concept in ref:
            matches += 1

    if matches >= 3:
        return "EXISTS"
    elif matches >= 1:
        return "PARTIAL"
    else:
        return "MISSING"


def determine_strike_phase(nature: str, nodes: list, pillar: str, editorial: str, prefix: str) -> str:
    """Determine strike phase based on rules."""
    if prefix == "B":
        if editorial == "FLAGGED":
            return "1B"
        if nature in ("QUESTION", "INSTRUCTION"):
            return "1C"
        if 13 in nodes:
            return "4A"
        if nature == "PRODUCT":
            return "4B"
        if nature == "SCRIPT":
            return "4C"
        return "4A"  # default business
    else:  # Water
        if editorial == "FLAGGED":
            return "1B"
        if any(n in nodes for n in [1, 2, 3, 4, 5]):
            return "2A"
        if nature == "TOOL":
            return "2D"
        # Water funnel content
        water_funnel_signals = ["funnel", "landing page", "quiz", "hub"]
        if any(s in str(nodes) or s in nature.lower() for s in water_funnel_signals):
            return "2B"
        # Branch enrichment
        if pillar == "Physical":
            return "2C"
        return "2B"  # default water


def parse_frontmatter(text: str):
    """Extract YAML frontmatter and return (frontmatter_dict, body_after_frontmatter)."""
    if text.startswith("---"):
        parts = text.split("---", 2)
        if len(parts) >= 3:
            try:
                fm = yaml.safe_load(parts[1])
                body = parts[2]
                return fm, body, f"---{parts[1]}---"
            except yaml.YAMLError:
                pass
    return {}, text, ""


def split_into_atoms(body: str, fm: dict):
    """Split body into atomic units — coupled sequences that need each other.

    Strategy: prefer LARGE atoms. Split only on:
    1. Prompt/Response boundaries (each prompt or response = one atom)
    2. For non-ChatGPT files: major structural sections
    3. Merge short prompts with their short responses
    """
    lines = body.split("\n")
    has_prompt_header = "## Prompt:" in body

    # First pass: identify block boundaries
    blocks = []
    current_block = []
    current_section = "Main"
    in_response = False

    for line in lines:
        stripped = line.strip()

        # Skip footer lines
        if "Powered by ChatGPT Exporter" in stripped or "Powered by [Gemini Exporter" in stripped:
            if current_block and any(l.strip() for l in current_block):
                blocks.append(("\n".join(current_block), current_section, in_response))
                current_block = []
            continue

        # ChatGPT-style files: split on ## Prompt: and ## Response:
        if has_prompt_header:
            if stripped.startswith("## Prompt:"):
                if current_block and any(l.strip() for l in current_block):
                    blocks.append(("\n".join(current_block), current_section, in_response))
                    current_block = []
                in_response = False
                current_section = "Prompt"
                current_block = [line]
                continue
            if stripped.startswith("## Response:"):
                if current_block and any(l.strip() for l in current_block):
                    blocks.append(("\n".join(current_block), current_section, in_response))
                    current_block = []
                in_response = True
                current_section = "Response"
                current_block = [line]
                continue
        else:
            # Non-ChatGPT files: split only on top-level headers (#, ##)
            if re.match(r'^#{1,2}\s+\S', stripped):
                if current_block and any(l.strip() for l in current_block):
                    blocks.append(("\n".join(current_block), current_section, in_response))
                    current_block = []
                section_match = re.match(r'^#{1,2}\s+(.+)', stripped)
                if section_match:
                    current_section = section_match.group(1).strip()
                    current_section = re.sub(r'[^\w\s\-:&/(),]+', '', current_section).strip() or "Main"
                current_block = [line]
                continue

        current_block.append(line)

    if current_block and any(l.strip() for l in current_block):
        blocks.append(("\n".join(current_block), current_section, in_response))

    # Second pass: merge short prompt+response pairs into single atoms
    merged = []
    i = 0
    while i < len(blocks):
        text, section, is_resp = blocks[i]
        non_empty = len([l for l in text.split("\n") if l.strip()])

        # Merge short prompt with following short response
        if (section == "Prompt" and i + 1 < len(blocks) and
            blocks[i+1][1] == "Response" and
            non_empty < 6 and
            len([l for l in blocks[i+1][0].split("\n") if l.strip()]) < 8):
            combined = text + "\n\n" + blocks[i+1][0]
            merged.append((combined, "Prompt-Response", True))
            i += 2
            continue

        # Skip blocks that are just empty or metadata
        if non_empty < 2 and not text.strip().startswith("## Prompt:"):
            if merged:
                prev_text, prev_section, prev_resp = merged[-1]
                merged[-1] = (prev_text + "\n" + text, prev_section, prev_resp)
            i += 1
            continue

        merged.append((text, section, is_resp))
        i += 1

    # Filter out blocks with no real content
    final = [(t, s, r) for t, s, r in merged if any(l.strip() for l in t.split("\n"))]

    return final


def annotate_file(filepath: Path, prefix: str, start_num: int, doc_num: int) -> tuple:
    """Process a single file and return (annotated_content, next_atom_num, atom_count)."""
    content = filepath.read_text()
    fm, body, fm_raw = parse_frontmatter(content)

    # Check for empty files
    if fm.get("readiness") == "Empty" or not body.strip():
        envelope = f"""<!-- DOC-ENVELOPE
id: DOC-{prefix}-{doc_num:02d}
total_sections: 0
total_atoms: 0
dominant_provenance: N/A
dominant_nature: N/A
sections: []
-->
"""
        return envelope + fm_raw + body, start_num, 0

    # Parse frontmatter fields
    nodes = fm.get("nodes", [])
    if isinstance(nodes, str):
        nodes = [int(x.strip()) for x in nodes.strip("[]").split(",") if x.strip()]
    pillar = fm.get("pillar", "Financial" if prefix == "B" else "Physical")
    has_prompt_header = "## Prompt:" in body

    # Split into atoms
    raw_atoms = split_into_atoms(body, fm)

    if not raw_atoms:
        envelope = f"""<!-- DOC-ENVELOPE
id: DOC-{prefix}-{doc_num:02d}
total_sections: 0
total_atoms: 0
dominant_provenance: N/A
dominant_nature: N/A
sections: []
-->
"""
        return envelope + fm_raw + body, start_num, 0

    # Assign atom metadata
    atom_data = []
    sections_map = {}
    for text, section, is_resp in raw_atoms:
        atm_num = start_num + len(atom_data)
        atm_id = f"ATM-{prefix}-{atm_num:03d}"

        prov = determine_provenance(text, has_prompt_header, is_resp)
        nature = determine_nature(text)
        build_state = determine_build_state(text, pillar)
        editorial = "CLEAN"

        # Flag contested science
        flagged_terms = ["pseudoscience", "not scientifically proven", "anecdotal",
                         "not FDA", "no clinical evidence", "disputed", "contested"]
        for ft in flagged_terms:
            if ft in text.lower():
                editorial = "FLAGGED"
                break

        strike = determine_strike_phase(nature, nodes, pillar, editorial, prefix)

        if section not in sections_map:
            sections_map[section] = []
        sections_map[section].append(atm_id)

        atom_data.append({
            "id": atm_id,
            "text": text,
            "section": section,
            "provenance": prov,
            "nature": nature,
            "build_state": build_state,
            "editorial": editorial,
            "strike_phase": strike,
            "nodes": nodes,
            "pillar": pillar,
        })

    # Generate idea summaries
    for ad in atom_data:
        # First non-empty, non-header line as idea
        for line in ad["text"].split("\n"):
            stripped = line.strip()
            if stripped and not stripped.startswith("#") and not stripped.startswith("## Prompt:") and not stripped.startswith("## Response:"):
                # Truncate to ~80 chars
                idea = stripped[:80].rstrip()
                if len(stripped) > 80:
                    idea += "..."
                # Remove quotes for YAML safety
                idea = idea.replace('"', "'")
                ad["idea"] = idea
                break
        if "idea" not in ad:
            ad["idea"] = "Content block"

    # Count dominants
    prov_counts = {}
    nature_counts = {}
    for ad in atom_data:
        prov_counts[ad["provenance"]] = prov_counts.get(ad["provenance"], 0) + 1
        nature_counts[ad["nature"]] = nature_counts.get(ad["nature"], 0) + 1

    dominant_prov = max(prov_counts, key=prov_counts.get) if prov_counts else "N/A"
    dominant_nature = max(nature_counts, key=nature_counts.get) if nature_counts else "N/A"

    # Build sections list for envelope
    sections_yaml = []
    for sname, sids in sections_map.items():
        safe_name = sname.replace('"', "'")
        sections_yaml.append(f'  - name: "{safe_name}"\n    atoms: [{", ".join(sids)}]')

    # Build DOC-ENVELOPE
    envelope = f"""<!-- DOC-ENVELOPE
id: DOC-{prefix}-{doc_num:02d}
total_sections: {len(sections_map)}
total_atoms: {len(atom_data)}
dominant_provenance: {dominant_prov}
dominant_nature: {dominant_nature}
sections:
{chr(10).join(sections_yaml)}
-->
"""

    # Build annotated body
    annotated_parts = []
    for i, ad in enumerate(atom_data):
        prev_id = atom_data[i-1]["id"] if i > 0 else "null"
        next_id = atom_data[i+1]["id"] if i < len(atom_data) - 1 else "null"
        prev_ctx = atom_data[i-1]["idea"] if i > 0 else "null"
        next_ctx = atom_data[i+1]["idea"] if i < len(atom_data) - 1 else "null"

        nodes_str = "[" + ", ".join(str(n) for n in ad["nodes"]) + "]"

        # Wrap prev/next context in quotes only if not null
        prev_ctx_fmt = f'"{prev_ctx}"' if prev_ctx != "null" else "null"
        next_ctx_fmt = f'"{next_ctx}"' if next_ctx != "null" else "null"

        in_fence = f"""<!-- {ad["id"]} IN
idea: "{ad["idea"]}"
section: "{ad["section"]}"
position: {i + 1}
of_total: {len(atom_data)}
prev: {prev_id}
context_above: {prev_ctx_fmt}
provenance: {ad["provenance"]}
nature: {ad["nature"]}
nodes: {nodes_str}
pillar: {ad["pillar"]}
build_state: {ad["build_state"]}
editorial: {ad["editorial"]}
strike_phase: {ad["strike_phase"]}
-->"""

        out_fence = f"""<!-- {ad["id"]} OUT
next: {next_id}
context_below: {next_ctx_fmt}
-->"""

        annotated_parts.append(f"{in_fence}\n\n{ad['text']}\n\n{out_fence}")

    annotated_body = "\n\n".join(annotated_parts)

    # Combine: envelope + frontmatter + annotated body
    result = envelope + fm_raw + "\n\n" + annotated_body + "\n"

    return result, start_num + len(atom_data), len(atom_data)


def process_directory(directory: Path, prefix: str, start_num: int = 1, extra_files: list = None) -> int:
    """Process all markdown files in a directory alphabetically."""
    files = sorted(directory.glob("*.md"))
    if extra_files:
        files.extend(extra_files)

    total_atoms = 0
    current_num = start_num
    doc_num = 1

    for filepath in files:
        print(f"  Processing: {filepath.name}")
        annotated, current_num, atom_count = annotate_file(filepath, prefix, current_num, doc_num)
        filepath.write_text(annotated)
        total_atoms += atom_count
        doc_num += 1
        print(f"    -> {atom_count} atoms (ATM-{prefix}-{start_num:03d} to ATM-{prefix}-{current_num - 1:03d})" if atom_count > 0 else f"    -> 0 atoms (empty)")
        start_num = current_num

    return total_atoms


def main():
    print("=" * 60)
    print("ATOMIC CONTENT EXCAVATOR")
    print("=" * 60)

    print("\n--- Processing Business Files ---")
    b_count = process_directory(BUSINESS_DIR, "B", start_num=1)
    print(f"\nBusiness total: {b_count} atoms (ATM-B-*)")

    print("\n--- Processing Water Files ---")
    w_count = process_directory(WATER_DIR, "W", start_num=1, extra_files=[WATER_ROOT_FILE])
    print(f"\nWater total: {w_count} atoms (ATM-W-*)")

    print(f"\n{'=' * 60}")
    print(f"GRAND TOTAL: {b_count + w_count} atoms ({b_count} ATM-B-* + {w_count} ATM-W-*)")
    print(f"{'=' * 60}")


if __name__ == "__main__":
    main()
