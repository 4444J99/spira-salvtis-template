#!/usr/bin/env python3
"""
Atomic content excavator for mindset-category files.
Decomposes files into atoms marked with HTML comment fences.
ATM-M- prefix, numbered sequentially across all 39 files.

Strategy: Each prompt = 1 atom. Each response = 1 atom UNLESS it contains
clearly delineated PARTS (PART I, PART II, etc. or major numbered sections
with distinct themes). In that case, each part = 1 atom.

"Prefer coupled sequences over aggressive splitting."
"""

import os
import re
import sys
import json
from pathlib import Path
from dataclasses import dataclass, field
from typing import Optional, List, Tuple

BASE = Path("/Users/4jp/Workspace/organvm-iii-ergon/sovereign-systems--spiral-template")
MINDSET_DIR = BASE / "docs/archive/extracted/mindset"
ROOT_FILE = BASE / "docs/archive/extracted/mindset-rhythms-and-rituals.md"

INNER_KEYWORDS = [
    "nervous system", "emotional authority", "spiral framework", "belief recalibration",
    "self-check-in", "vision anchoring", "awareness", "regulation", "installation",
    "embodiment", "expansion", "polyvagal", "respond rather than react"
]
IDENTITY_KEYWORDS = [
    "performance trap", "radical authenticity", "aesthetic sovereignty", "vocal authority",
    "personal brand", "boundary installation", "self-expression as practice",
    "structure sovereignty", "authorship", "who you present"
]


def determine_provenance(section_type, has_prompts):
    if section_type == "prompt":
        return "LOCAL"
    if has_prompts:
        return "HYBRID"
    return "ALIEN"


def determine_nature(text):
    lower = text.lower()
    if any(w in lower for w in ["step 1", "step 2", "practice:", "exercise:", "ritual", "how to use"]):
        if "journal" in lower or "prompt" in lower:
            return "TOOL"
        return "PROTOCOL"
    if any(w in lower for w in ["framework", "blueprint", "method", "system", "model", "phases", "stages", "roadmap"]):
        return "FRAMEWORK"
    if any(w in lower for w in ["affirmation", "mantra", "script", "track title", "spoken", "i am not", "i am safe"]):
        return "SCRIPT"
    if text.count("?") >= 3:
        return "QUESTION"
    if any(w in lower for w in ["would you like", "let me know", "want me to", "which one", "next we can"]):
        return "INSTRUCTION"
    if any(w in lower for w in ["study", "research", "percent", "%", "data shows"]):
        return "STATISTIC"
    if any(w in lower for w in ["product", "offer", "price", "$", "subscription", "funnel", "landing page", "webclass", "$99", "$47"]):
        return "PRODUCT"
    if any(w in lower for w in ["caption", "reel", "post", "carousel", "instagram", "highlight", "content"]):
        return "SCRIPT"
    if any(w in lower for w in ["my experience", "when i", "my journey", "i remember", "i was"]):
        return "NARRATIVE"
    if any(w in lower for w in ["book", "author", "according to", "taoism", "hermeticism", "gnosticism"]):
        return "CITATION"
    if any(w in lower for w in ["alchemy", "archetype", "magnum opus", "nigredo", "albedo", "rubedo"]):
        return "MODEL"
    if any(w in lower for w in ["chapter", "part i", "part ii", "book concept", "table of contents"]):
        return "FRAMEWORK"
    return "CLAIM"


def determine_build_state(text, pillar):
    lower = text.lower()
    if pillar == "System":
        matches = sum(1 for kw in INNER_KEYWORDS if kw.lower() in lower)
        if matches >= 2: return "EXISTS"
        elif matches == 1: return "PARTIAL"
        return "MISSING"
    elif pillar == "Structure":
        matches = sum(1 for kw in IDENTITY_KEYWORDS if kw.lower() in lower)
        if matches >= 2: return "EXISTS"
        elif matches == 1: return "PARTIAL"
        return "MISSING"
    elif pillar == "Vision":
        return "MISSING"
    return "N/A"


def determine_editorial(text, provenance):
    lower = text.lower()
    if provenance == "ALIEN":
        return "UNVERIFIED"
    if any(w in lower for w in ["quantum", "vibration", "frequency", "5d", "3d reality", "matrix"]):
        return "FLAGGED"
    return "CLEAN"


def determine_strike_phase(nature, editorial, nodes, pillar):
    if editorial == "FLAGGED": return "1B"
    if nature in ("QUESTION", "INSTRUCTION"): return "1C"
    if nodes:
        node_ints = [n for n in nodes if isinstance(n, int)]
        if any(6 <= n <= 9 for n in node_ints): return "3A"
        if any(10 <= n <= 12 for n in node_ints): return "3B"
    if nature == "TOOL": return "3C"
    if nature == "PRODUCT": return "4B"
    if nature == "SCRIPT": return "4C"
    if pillar == "System": return "3A"
    if pillar == "Structure": return "3B"
    if pillar == "Vision": return "4B"
    return "3A"


def is_chatgpt_footer(text):
    return "Powered by ChatGPT Exporter" in text or "chatgptexporter.com" in text


def summarize_atom(text):
    """One-line summary, max ~100 chars."""
    clean = re.sub(r'[#*_`→🌀✨🌿🔥💡🧠⚡💔🌱🪞🚧💸🔱✅💧🎤🧲🧬📘📚🎁🕊🌙💬⚖️❤️🌐🔄🧭💥🔁🌕🔧🧪🎥🐣🔌🛡️💃🔓🌟🗝️📡🐚🌬️📿☁️🫂🧠🌑🌳🍵🦾🚫🔮🎯📌🌊🎧📍🧿✦⭐️🔎🔐🔑💛📬👉☑️⚠️💰🧲💎❌]', '', text)
    clean = re.sub(r'\s+', ' ', clean).strip()
    if len(clean) > 100:
        for i in range(80, min(120, len(clean))):
            if clean[i] in '.!?;':
                clean = clean[:i+1]
                break
        else:
            clean = clean[:100] + "..."
    return clean.replace('"', "'")


def parse_frontmatter(lines):
    if not lines or lines[0].strip() != "---":
        return [], lines, {}
    end_idx = None
    for i in range(1, len(lines)):
        if lines[i].strip() == "---":
            end_idx = i
            break
    if end_idx is None:
        return [], lines, {}
    fm_lines = lines[:end_idx + 1]
    content_lines = lines[end_idx + 1:]
    metadata = {}
    for line in fm_lines[1:end_idx]:
        if ":" in line:
            key, _, val = line.partition(":")
            key = key.strip()
            val = val.strip().strip('"').strip("'")
            if key == "nodes":
                try: val = json.loads(val.replace("'", '"'))
                except: val = []
            metadata[key] = val
    return fm_lines, content_lines, metadata


def split_response_into_parts(lines):
    """Split a response into major parts if it has PART I/II/etc. or numbered major sections.
    Returns list of (part_name, lines) tuples.
    Only splits on VERY major boundaries: PART headings or if there are 5+ major numbered sections."""
    text = '\n'.join(lines)

    # Check for PART markers
    part_pattern = re.compile(r'^(PART\s+[IVX]+|PART\s+\d+)', re.MULTILINE)
    part_matches = list(part_pattern.finditer(text))

    if len(part_matches) >= 2:
        # Split on PART boundaries
        parts = []
        positions = [m.start() for m in part_matches]
        line_positions = []

        cumulative = 0
        line_starts = []
        for i, line in enumerate(lines):
            line_starts.append(cumulative)
            cumulative += len(line) + 1

        for pos in positions:
            for i, ls in enumerate(line_starts):
                if ls >= pos:
                    line_positions.append(i)
                    break

        for i, lp in enumerate(line_positions):
            end = line_positions[i+1] if i+1 < len(line_positions) else len(lines)
            part_lines = lines[lp:end]
            part_name = lines[lp].strip()
            parts.append((part_name, part_lines))

        # Add any content before first PART as its own block
        if line_positions[0] > 0:
            pre_lines = lines[:line_positions[0]]
            if any(l.strip() for l in pre_lines):
                parts.insert(0, ("Introduction", pre_lines))

        return parts

    # Also check for major E.A.U phase headers
    eau_pattern = re.compile(r'^(ELEVATE|ALIGN|UNLOCK)\s', re.MULTILINE)
    eau_matches = list(eau_pattern.finditer(text))
    if len(eau_matches) >= 2:
        parts = []
        positions = [m.start() for m in eau_matches]
        line_positions = []
        cumulative = 0
        line_starts = []
        for i, line in enumerate(lines):
            line_starts.append(cumulative)
            cumulative += len(line) + 1
        for pos in positions:
            for i, ls in enumerate(line_starts):
                if ls >= pos:
                    line_positions.append(i)
                    break
        for i, lp in enumerate(line_positions):
            end = line_positions[i+1] if i+1 < len(line_positions) else len(lines)
            parts.append((lines[lp].strip()[:50], lines[lp:end]))
        if line_positions[0] > 0:
            pre = lines[:line_positions[0]]
            if any(l.strip() for l in pre):
                parts.insert(0, ("Introduction", pre))
        return parts

    # Default: entire response is one atom
    return [("Response", lines)]


def process_file(filepath, atom_counter, doc_counter):
    """Process a single file. Returns (new_content, atom_count, atom_counter)."""
    with open(filepath, 'r', encoding='utf-8') as f:
        raw = f.read()
    lines = raw.split('\n')

    # Special case: send-pdf-to-kindle.md
    if filepath.name == "send-pdf-to-kindle.md":
        envelope = f"""<!-- DOC-ENVELOPE
id: DOC-M-{doc_counter:02d}
total_sections: 0
total_atoms: 0
dominant_provenance: N/A
dominant_nature: N/A
sections: []
-->
"""
        return envelope + raw, 0, atom_counter

    fm_lines, content_lines, metadata = parse_frontmatter(lines)
    nodes = metadata.get("nodes", [])
    if isinstance(nodes, str):
        try: nodes = json.loads(nodes)
        except: nodes = []
    pillar = metadata.get("pillar", "Cross-cutting")

    # Parse into prompt/response pairs
    # Find all ## Prompt: and ## Response: markers
    segments = []  # list of (type, start_line_idx, end_line_idx)
    current_type = "header"
    current_start = 0

    for i, line in enumerate(content_lines):
        stripped = line.strip()
        if stripped.startswith("## Prompt:") or stripped == "## Prompt:":
            if current_start < i:
                segments.append((current_type, current_start, i))
            current_type = "prompt"
            current_start = i
        elif stripped.startswith("## Response:") or stripped == "## Response:":
            if current_start < i:
                segments.append((current_type, current_start, i))
            current_type = "response"
            current_start = i

    if current_start < len(content_lines):
        segments.append((current_type, current_start, len(content_lines)))

    has_prompts = any(t == "prompt" for t, _, _ in segments)

    # For files with no prompt/response structure, treat as single-section content
    if not has_prompts:
        # Check for ## headers
        has_headers = any(content_lines[i].strip().startswith("## ") for i in range(len(content_lines)))
        if has_headers:
            # Split on ## headers
            new_segments = []
            current_start = 0
            for i, line in enumerate(content_lines):
                if line.strip().startswith("## ") and i > 0:
                    new_segments.append(("content", current_start, i))
                    current_start = i
            new_segments.append(("content", current_start, len(content_lines)))
            segments = new_segments
        else:
            segments = [("content", 0, len(content_lines))]

    # Build atoms from segments
    all_atoms = []
    section_atom_map = {}

    # Header segment: identify and preserve the header lines (doc title, user info, dates, link)
    # Only for files WITH prompts (ChatGPT exports have title + user/date metadata before first ## Prompt:)
    header_end = 0
    if has_prompts:
        for i, line in enumerate(content_lines):
            stripped = line.strip()
            if stripped == "":
                continue
            if stripped.startswith("## "):
                header_end = i
                break
            if re.match(r'^(User|Created|Updated|Exported|Link):', stripped):
                header_end = i + 1
                continue
            if i < 8 and not stripped.startswith("## "):
                header_end = i + 1
                continue
            header_end = i
            break

    header_lines = content_lines[:header_end]

    for seg_type, seg_start, seg_end in segments:
        seg_lines = content_lines[seg_start:seg_end]

        # Skip header segments
        if seg_type == "header":
            continue

        # Skip segments that are only whitespace or ChatGPT footer
        seg_text = '\n'.join(seg_lines)
        if not seg_text.strip():
            continue
        if all(is_chatgpt_footer(l) or l.strip() == "" for l in seg_lines):
            continue

        # Clean: remove the ## Prompt: or ## Response: header line from atom content
        atom_content_lines = []
        section_header_line = None
        for line in seg_lines:
            stripped = line.strip()
            if stripped.startswith("## Prompt:") or stripped == "## Prompt:":
                section_header_line = line
                # If the prompt text is on the same line as ## Prompt:
                after = stripped[len("## Prompt:"):].strip()
                if after:
                    atom_content_lines.append(after)
                continue
            if stripped.startswith("## Response:") or stripped == "## Response:":
                section_header_line = line
                after = stripped[len("## Response:"):].strip()
                if after:
                    atom_content_lines.append(after)
                continue
            if stripped.startswith("## ") and seg_type == "content":
                section_header_line = line
                continue
            atom_content_lines.append(line)

        # Remove ChatGPT footer, timestamps, "Updated saved memory"
        cleaned = []
        for line in atom_content_lines:
            stripped = line.strip()
            if is_chatgpt_footer(stripped): continue
            if re.match(r'^\d{2}:\d{2}$', stripped): continue
            if stripped == "Updated saved memory": continue
            cleaned.append(line)

        # Strip leading/trailing blank lines
        while cleaned and not cleaned[0].strip():
            cleaned.pop(0)
        while cleaned and not cleaned[-1].strip():
            cleaned.pop()

        if not cleaned:
            continue

        # For prompts: always 1 atom
        if seg_type == "prompt":
            atom_counter += 1
            atom_id = f"ATM-M-{atom_counter:03d}"
            text = '\n'.join(cleaned)
            prov = "LOCAL"
            nature = determine_nature(text)
            # Prompts are usually QUESTION or NARRATIVE
            if "?" in text:
                nature = "QUESTION"
            else:
                nature = "NARRATIVE"
            build = determine_build_state(text, pillar)
            editorial = determine_editorial(text, prov)
            strike = determine_strike_phase(nature, editorial, nodes, pillar)

            all_atoms.append({
                "id": atom_id,
                "idea": summarize_atom(text),
                "section": "Prompt",
                "provenance": prov,
                "nature": nature,
                "nodes": nodes,
                "pillar": pillar,
                "build_state": build,
                "editorial": editorial,
                "strike_phase": strike,
                "lines": cleaned,
                "header_line": section_header_line,
            })
            section_atom_map.setdefault("Prompt", []).append(atom_id)

        elif seg_type == "response":
            # Try to split into major parts
            parts = split_response_into_parts(cleaned)

            for part_name, part_lines in parts:
                # Strip leading/trailing blanks
                while part_lines and not part_lines[0].strip():
                    part_lines.pop(0)
                while part_lines and not part_lines[-1].strip():
                    part_lines.pop()
                if not part_lines:
                    continue

                # Skip if only "Would you like..." type ending
                part_text = '\n'.join(part_lines)
                if len(part_lines) <= 3 and all(
                    any(w in l.lower() for w in ["would you like", "let me know", "want me to", "just tell me"])
                    for l in part_lines if l.strip()
                ):
                    # This is a closing prompt, still make it an atom but mark as INSTRUCTION
                    atom_counter += 1
                    atom_id = f"ATM-M-{atom_counter:03d}"
                    all_atoms.append({
                        "id": atom_id,
                        "idea": summarize_atom(part_text),
                        "section": "Response",
                        "provenance": "HYBRID",
                        "nature": "INSTRUCTION",
                        "nodes": nodes,
                        "pillar": pillar,
                        "build_state": "N/A",
                        "editorial": "CLEAN",
                        "strike_phase": "1C",
                        "lines": part_lines,
                        "header_line": section_header_line if part_name == parts[0][0] else None,
                    })
                    section_atom_map.setdefault("Response", []).append(atom_id)
                    section_header_line = None  # Only first part gets the header
                    continue

                atom_counter += 1
                atom_id = f"ATM-M-{atom_counter:03d}"
                prov = determine_provenance("response", has_prompts)
                nature = determine_nature(part_text)
                build = determine_build_state(part_text, pillar)
                editorial = determine_editorial(part_text, prov)
                strike = determine_strike_phase(nature, editorial, nodes, pillar)

                all_atoms.append({
                    "id": atom_id,
                    "idea": summarize_atom(part_text),
                    "section": "Response",
                    "provenance": prov,
                    "nature": nature,
                    "nodes": nodes,
                    "pillar": pillar,
                    "build_state": build,
                    "editorial": editorial,
                    "strike_phase": strike,
                    "lines": part_lines,
                    "header_line": section_header_line if part_name == parts[0][0] else None,
                })
                section_atom_map.setdefault("Response", []).append(atom_id)
                section_header_line = None

        elif seg_type == "content":
            # Non-prompt/response content (rare case)
            atom_counter += 1
            atom_id = f"ATM-M-{atom_counter:03d}"
            text = '\n'.join(cleaned)
            prov = "ALIEN"
            nature = determine_nature(text)
            build = determine_build_state(text, pillar)
            editorial = determine_editorial(text, prov)
            strike = determine_strike_phase(nature, editorial, nodes, pillar)

            all_atoms.append({
                "id": atom_id,
                "idea": summarize_atom(text),
                "section": "Content",
                "provenance": prov,
                "nature": nature,
                "nodes": nodes,
                "pillar": pillar,
                "build_state": build,
                "editorial": editorial,
                "strike_phase": strike,
                "lines": cleaned,
                "header_line": section_header_line,
            })
            section_atom_map.setdefault("Content", []).append(atom_id)

    total = len(all_atoms)

    # Set position, prev/next, context
    for i, atom in enumerate(all_atoms):
        atom["position"] = i + 1
        atom["of_total"] = total
        atom["prev"] = all_atoms[i-1]["id"] if i > 0 else None
        atom["context_above"] = all_atoms[i-1]["idea"] if i > 0 else None
        atom["next_id"] = all_atoms[i+1]["id"] if i < total - 1 else None
        atom["context_below"] = all_atoms[i+1]["idea"] if i < total - 1 else None

    # Dominant provenance/nature
    if all_atoms:
        prov_counts = {}
        nature_counts = {}
        for a in all_atoms:
            prov_counts[a["provenance"]] = prov_counts.get(a["provenance"], 0) + 1
            nature_counts[a["nature"]] = nature_counts.get(a["nature"], 0) + 1
        dominant_prov = max(prov_counts, key=prov_counts.get)
        dominant_nature = max(nature_counts, key=nature_counts.get)
    else:
        dominant_prov = "N/A"
        dominant_nature = "N/A"

    # Build envelope
    sections_list = []
    for sec_name in section_atom_map:
        ids = ", ".join(section_atom_map[sec_name])
        sections_list.append(f'  - name: "{sec_name}"\n    atoms: [{ids}]')

    envelope = f"""<!-- DOC-ENVELOPE
id: DOC-M-{doc_counter:02d}
total_sections: {len(section_atom_map)}
total_atoms: {total}
dominant_provenance: {dominant_prov}
dominant_nature: {dominant_nature}
sections:
{chr(10).join(sections_list)}
-->"""

    # Reconstruct file
    output_parts = [envelope]
    output_parts.append('\n'.join(fm_lines))

    # Write header lines
    if header_lines:
        output_parts.append('\n'.join(header_lines))

    # Write atoms in order
    for atom in all_atoms:
        # Write section header if this atom starts a new section
        if atom["header_line"]:
            output_parts.append("")
            output_parts.append(atom["header_line"])

        # IN fence
        nodes_str = json.dumps(atom["nodes"])
        prev_str = atom["prev"] if atom["prev"] else "null"
        ctx_above = f'"{atom["context_above"]}"' if atom["context_above"] else "null"

        in_fence = f"""
<!-- {atom["id"]} IN
idea: "{atom["idea"]}"
section: "{atom["section"]}"
position: {atom["position"]}
of_total: {atom["of_total"]}
prev: {prev_str}
context_above: {ctx_above}
provenance: {atom["provenance"]}
nature: {atom["nature"]}
nodes: {nodes_str}
pillar: {atom["pillar"]}
build_state: {atom["build_state"]}
editorial: {atom["editorial"]}
strike_phase: {atom["strike_phase"]}
-->"""
        output_parts.append(in_fence)

        # Original content
        output_parts.append('\n'.join(atom["lines"]))

        # OUT fence
        next_str = atom["next_id"] if atom["next_id"] else "null"
        ctx_below = f'"{atom["context_below"]}"' if atom["context_below"] else "null"

        out_fence = f"""<!-- {atom["id"]} OUT
next: {next_str}
context_below: {ctx_below}
-->"""
        output_parts.append(out_fence)

    # Add footer if present
    if is_chatgpt_footer(raw):
        output_parts.append("")
        output_parts.append("")
        output_parts.append("Powered by ChatGPT Exporter (https://www.chatgptexporter.com)")

    return '\n'.join(output_parts), total, atom_counter


def main():
    mindset_files = sorted(MINDSET_DIR.glob("*.md"))
    all_files = list(mindset_files) + [ROOT_FILE]

    atom_counter = 0
    doc_counter = 0
    results = []

    for filepath in all_files:
        doc_counter += 1
        print(f"Processing DOC-M-{doc_counter:02d}: {filepath.name}...", file=sys.stderr)
        new_content, file_atoms, atom_counter = process_file(filepath, atom_counter, doc_counter)
        # Write file
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        results.append((filepath.name, doc_counter, file_atoms))
        print(f"  -> {file_atoms} atoms (running total: {atom_counter})", file=sys.stderr)

    print("\n=== ATOMIZATION SUMMARY ===", file=sys.stderr)
    print(f"Total files: {len(all_files)}", file=sys.stderr)
    print(f"Total atoms: {atom_counter}", file=sys.stderr)
    for name, doc_id, count in results:
        print(f"  DOC-M-{doc_id:02d} {name}: {count}", file=sys.stderr)

    print(f"TOTAL_ATOMS={atom_counter}")


if __name__ == "__main__":
    main()
