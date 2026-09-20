#!/usr/bin/env python3
"""
Excavate atomic ideas from health/ archive files.
Marks each atom in-situ with HTML comment fences per the ATM-H-* spec.

Processing strategy:
- ChatGPT exports: each Prompt+Response pair = one atom (coupled sequence)
  Exception: very long responses (>2000 chars) with multiple ## subsections split.
- Gemini exports: same as ChatGPT (has ## Prompt: / ## Response: markers)
- .docx conversions: split on major ## headings, keeping coupled paragraphs together
"""

import os
import re
import sys
import yaml
from pathlib import Path
from dataclasses import dataclass, field
from typing import Optional

PROJECT_ROOT = Path(__file__).resolve().parent.parent
HEALTH_DIR = PROJECT_ROOT / "docs" / "archive" / "extracted" / "health"
ROOT_FILE = PROJECT_ROOT / "docs" / "archive" / "extracted" / "health-hormones-and-healing.md"

# Build-file topics for build_state comparison
BUILD_TOPICS = {
    "archetype-epsilon": ["gut", "hormone", "microbiome", "endocrine", "bloating", "serotonin", "cortisol", "estrogen", "molecular hydrogen", "H2", "gut lining", "gut flora"],
    "archetype-delta": ["archetype-delta", "conception", "pregnancy", "egg quality", "ovulation", "implantation", "reproductive", "sperm", "oocyte"],
    "archetype-beta": ["archetype-beta", "inflammation", "rheumatoid", "lupus", "flare", "immune", "NF-kB", "cytokine", "IL-6", "chronic inflammation"],
    "archetype-alpha": ["archetype-alpha", "performance", "lactate", "muscle", "endurance", "recovery", "fatigue", "exercise", "WADA"],
    "archetype-gamma": ["cancer", "chemotherapy", "radiation", "tumor", "oncology", "antitumor"],
    "archetype-zeta": ["archetype-zeta", "plastic", "bottled gateway", "environmental", "waste", "carbon footprint", "economic sovereignty"],
    "foundation-pillar": ["foundation sovereignty", "nervous system", "gateway", "mitochondrial", "cellular gateway", "minerals", "sleep", "energy"],
}

# Files that are empty (< meaningful content after frontmatter)
EMPTY_FILES = {"hormones-eating-cycles.md", "alzheimers-373-increase-explained.md"}

# Footer signatures to strip and re-append outside atoms
FOOTER_CHATGPT = "Powered by ChatGPT Exporter (https://www.chatgptexporter.com)"
FOOTER_GEMINI_MD = "Powered by [Gemini Exporter](https://www.ai-chat-exporter.com)"


@dataclass
class Atom:
    id: str
    content: str
    idea: str
    section: str
    position: int
    of_total: int
    prev: Optional[str]
    provenance: str
    nature: str
    nodes: list
    pillar: str
    build_state: str
    editorial: str
    strike_phase: str
    context_above: str = ""
    next_id: Optional[str] = None
    context_below: str = ""


def parse_frontmatter(text: str):
    """Extract frontmatter dict and body from markdown text."""
    if text.startswith("---"):
        parts = text.split("---", 2)
        if len(parts) >= 3:
            try:
                fm = yaml.safe_load(parts[1])
                body = parts[2]
                return fm or {}, body
            except yaml.YAMLError:
                pass
    return {}, text


def extract_frontmatter_text(text: str) -> str:
    """Extract raw frontmatter text including --- delimiters."""
    if text.startswith("---"):
        parts = text.split("---", 2)
        if len(parts) >= 3:
            return "---" + parts[1] + "---"
    return ""


def is_chatgpt_header_line(line: str) -> bool:
    """Check if a line is a ChatGPT/Gemini export metadata line (non-atom)."""
    stripped = line.strip()
    patterns = [
        r'^User:\s',
        r'^Created:\s',
        r'^Updated:\s',
        r'^Exported:\s',
        r'^Link:\s+https?://',
        r'^\*\*Exported:\*\*',
        r'^\*\*Link:\*\*',
    ]
    for p in patterns:
        if re.search(p, stripped):
            return True
    return False


def is_footer_line(line: str) -> bool:
    stripped = line.strip()
    return (FOOTER_CHATGPT in stripped or
            FOOTER_GEMINI_MD in stripped or
            stripped == "---" and False)  # don't catch frontmatter delimiters


def classify_provenance(text: str, is_prompt: bool, is_response: bool, fm: dict) -> str:
    if is_prompt:
        return "LOCAL"
    if is_response:
        return "HYBRID"
    source = fm.get("source_file", "")
    if source and not source.endswith(".txt"):
        return "LOCAL"
    text_lower = text.lower()
    personal_signals = ["i ", "my ", "me ", "we ", "i'm", "i've", "admin", "kyle", "chloe"]
    if any(sig in text_lower for sig in personal_signals):
        return "LOCAL"
    return "ALIEN"


def classify_nature(text: str) -> str:
    text_lower = text.lower()
    if re.search(r'(caption|reel|script|slide \d|hook\b|cta\b)', text_lower) and re.search(r'(instagram|ig\b|story|stories|carousel|caption)', text_lower):
        return "SCRIPT"
    if re.search(r'(step \d|day \d|week \d|phase \d).*:', text, re.IGNORECASE) and len(text) > 300:
        return "PROTOCOL"
    if re.search(r'(published in|journal|systematic review|meta.analysis|randomized|placebo.controlled|et al)', text_lower):
        return "CITATION"
    if re.search(r'(\d+%|\d+\.\d+%|\d+ percent|million women)', text) and re.search(r'(study|research|trial|review|published|NIH|Harvard)', text_lower):
        return "STATISTIC"
    if re.search(r'(quiz|tracker|checklist|self.check|assessment|template|fillable)', text_lower) and len(text) < 600:
        return "TOOL"
    if re.search(r'(framework|hierarchy|system|model|4.pillar|spiral path)', text_lower) and re.search(r'(level|stage|tier|layer|phase)', text_lower):
        return "FRAMEWORK"
    if re.search(r'(revenue|business model|pricing|commission|subscription model|funnel model)', text_lower):
        return "MODEL"
    if re.search(r'(product|machine|device|subscription)', text_lower) and re.search(r'(pricing|cost|buy|purchase)', text_lower):
        return "PRODUCT"
    if text.strip().endswith('?') and len(text) < 400 and not re.search(r'(here|this|these|the|a )', text_lower[:30]):
        return "QUESTION"
    if re.search(r'^(can you|will you|help me|I want|I need|please|let\'s)', text_lower.strip()) and len(text) < 600:
        return "INSTRUCTION"
    if re.search(r'(I |my |me |we |our )', text) and re.search(r'(felt|feel|remember|experience|journey|story|woke up|period|bleed)', text_lower):
        return "NARRATIVE"
    if re.search(r'(grocery|meal plan|recipe|cook|prep)', text_lower) and len(text) > 200:
        return "PROTOCOL"
    return "CLAIM"


def classify_build_state(text: str) -> str:
    text_lower = text.lower()
    matches = {}
    for branch, keywords in BUILD_TOPICS.items():
        score = sum(1 for kw in keywords if kw.lower() in text_lower)
        if score > 0:
            matches[branch] = score
    if not matches:
        return "MISSING"
    best_score = max(matches.values())
    if best_score >= 3:
        return "EXISTS"
    elif best_score >= 1:
        return "PARTIAL"
    return "MISSING"


def classify_editorial(text: str, provenance: str) -> str:
    text_lower = text.lower()
    speculative = [
        "quantum coherence", "biophotonic", "wave function", "liquid crystal",
        "gateway memory", "cellular reprogramming through voice",
        "speaking to gateway", "talk to your cells",
        "frequency of truth", "observer effect", "liquid hard drive",
        "coherent domains", "gateway remembers",
    ]
    if any(sig in text_lower for sig in speculative):
        return "FLAGGED"
    if re.search(r'\d{2,}%', text) and not re.search(r'(study|research|source|published|journal|NIH|Harvard)', text_lower):
        return "UNVERIFIED"
    return "CLEAN"


def classify_strike_phase(nature: str, build_state: str, editorial: str, nodes: list, pillar: str) -> str:
    if editorial == "FLAGGED":
        return "1B"
    if nature == "TOOL":
        return "2D"
    if build_state == "PARTIAL":
        return "2C"
    physical_nodes = {1, 2, 3, 4, 5}
    water_nodes = {6, 7, 8}
    if any(n in water_nodes for n in nodes):
        return "2B"
    if any(n in physical_nodes for n in nodes):
        return "2A"
    return "2A"


def summarize_idea(text: str, max_len: int = 80) -> str:
    lines = [l.strip() for l in text.strip().split('\n') if l.strip() and not l.strip().startswith('<!--')]
    if not lines:
        return "Empty content"
    first = lines[0]
    # Skip ## Prompt: / ## Response: lines
    if first.startswith("## Prompt:") and len(lines) > 1:
        first = lines[1] if len(lines) > 1 else first
    elif first.startswith("## Response:") and len(lines) > 1:
        first = lines[1] if len(lines) > 1 else first
    first = re.sub(r'[*_`#\[\]()]', '', first)
    first = re.sub(r'\s+', ' ', first).strip()
    if len(first) > max_len:
        first = first[:max_len-3] + "..."
    return first.replace('"', "'")


def get_nodes(fm: dict) -> list:
    nodes = fm.get("nodes", [])
    if isinstance(nodes, list):
        return [int(n) for n in nodes if str(n).isdigit()]
    return []


def get_pillar(fm: dict) -> str:
    return fm.get("pillar", "Foundation")


def split_chatgpt_into_exchanges(body: str) -> tuple:
    """
    Split a ChatGPT/Gemini export body into:
    1. header_lines: non-atom metadata lines before first ## Prompt / ## Response
    2. exchanges: list of (section_name, content, is_prompt, is_response)
    3. footer_lines: footer text after last content

    Each exchange is a ## Prompt or ## Response block.
    """
    lines = body.split('\n')
    header_lines = []
    exchanges = []
    footer_lines = []
    current_section = None
    current_lines = []
    found_first_marker = False

    def flush():
        nonlocal current_lines, current_section
        if current_section and current_lines:
            content = '\n'.join(current_lines)
            is_prompt = current_section == "Prompt"
            is_response = current_section == "Response"
            exchanges.append({
                'section': current_section,
                'content': content,
                'is_prompt': is_prompt,
                'is_response': is_response,
            })
        current_lines = []

    for line in lines:
        stripped = line.strip()

        # Check for footer
        if is_footer_line(stripped):
            continue
        if stripped == "---" and found_first_marker and not current_lines:
            # Gemini uses --- before footer
            continue

        # Detect ## Prompt: or ## Response: markers
        if stripped.startswith("## Prompt:"):
            if not found_first_marker:
                found_first_marker = True
            flush()
            current_section = "Prompt"
            # Include the full ## Prompt: line AND any inline content
            current_lines.append(line)
            continue

        if stripped.startswith("## Response:"):
            if not found_first_marker:
                found_first_marker = True
            flush()
            current_section = "Response"
            current_lines.append(line)
            continue

        # Before first marker = header
        if not found_first_marker:
            # Check if it's a title-level heading or export metadata
            if stripped.startswith("# ") or is_chatgpt_header_line(line) or not stripped:
                header_lines.append(line)
                continue
            elif re.match(r'^[A-Z][\w\s]+$', stripped) and len(stripped) < 100:
                # Conversation title line (plain text, no punctuation)
                header_lines.append(line)
                continue
            else:
                # Non-header content before any prompt/response — might be main heading
                header_lines.append(line)
                continue

        current_lines.append(line)

    flush()

    return '\n'.join(header_lines), exchanges


def split_docx_into_sections(body: str) -> list:
    """
    Split a .docx-converted markdown body into meaningful sections.
    Uses ## headings as boundaries. Groups small heading-only sections with their content.
    Returns list of (section_name, content).
    """
    # First pass: split on ## headings
    raw_sections = []
    current_name = "Main"
    current_lines = []

    for line in body.split('\n'):
        stripped = line.strip()
        if stripped.startswith("## ") or stripped.startswith("# "):
            if current_lines:
                raw_sections.append((current_name, '\n'.join(current_lines)))
                current_lines = []
            heading = re.sub(r'^#+\s+', '', stripped).strip()
            heading = re.sub(r'[*_`]', '', heading)
            # Check if it's a very short heading (subtitle fragment)
            if len(heading) < 5 and heading.isupper():
                # Append to previous section name
                if raw_sections:
                    prev_name, prev_content = raw_sections[-1]
                    raw_sections[-1] = (prev_name + " " + heading, prev_content)
                    current_name = raw_sections[-1][0]
                else:
                    current_name = heading
            else:
                current_name = heading
            current_lines.append(line)
        else:
            current_lines.append(line)

    if current_lines:
        raw_sections.append((current_name, '\n'.join(current_lines)))

    # Second pass: merge tiny sections (< 50 chars) with next section
    merged = []
    for name, content in raw_sections:
        clean_content = re.sub(r'^#+\s+.*$', '', content, flags=re.MULTILINE).strip()
        if len(clean_content) < 30 and merged:
            # Merge with previous
            prev_name, prev_content = merged[-1]
            merged[-1] = (prev_name, prev_content + '\n\n' + content)
        else:
            merged.append((name, content))

    return merged


def process_chatgpt_file(filepath: Path, atom_counter: int) -> tuple:
    """Process a ChatGPT/Gemini export. Each Prompt or Response block = one atom."""
    text = filepath.read_text(encoding='utf-8')
    fm, body = parse_frontmatter(text)
    pillar = get_pillar(fm)
    nodes = get_nodes(fm)

    if filepath.name in EMPTY_FILES or not body.strip() or len(body.strip()) < 50:
        return [], atom_counter, fm, ""

    header_text, exchanges = split_chatgpt_into_exchanges(body)

    atoms = []
    for exch in exchanges:
        content = exch['content'].strip()
        if len(content) < 5:
            continue

        provenance = classify_provenance(content, exch['is_prompt'], exch['is_response'], fm)
        nature = classify_nature(content)
        editorial = classify_editorial(content, provenance)
        build_state = classify_build_state(content)
        strike_phase = classify_strike_phase(nature, build_state, editorial, nodes, pillar)
        idea = summarize_idea(content)

        atom_id = f"ATM-H-{atom_counter:03d}"
        atom = Atom(
            id=atom_id,
            content=content,
            idea=idea,
            section=exch['section'],
            position=0,
            of_total=0,
            prev=None,
            provenance=provenance,
            nature=nature,
            nodes=nodes,
            pillar=pillar,
            build_state=build_state,
            editorial=editorial,
            strike_phase=strike_phase,
        )
        atoms.append(atom)
        atom_counter += 1

    # Link atoms
    for i, atom in enumerate(atoms):
        atom.position = i + 1
        atom.of_total = len(atoms)
        if i > 0:
            atom.prev = atoms[i-1].id
            atom.context_above = atoms[i-1].idea
        if i < len(atoms) - 1:
            atom.next_id = atoms[i+1].id
            atom.context_below = atoms[i+1].idea

    return atoms, atom_counter, fm, header_text


def process_docx_file(filepath: Path, atom_counter: int) -> tuple:
    """Process a .docx-converted markdown file."""
    text = filepath.read_text(encoding='utf-8')
    fm, body = parse_frontmatter(text)
    pillar = get_pillar(fm) if fm else "Foundation"
    nodes = get_nodes(fm) if fm else []

    if not body.strip() or len(body.strip()) < 50:
        return [], atom_counter, fm, ""

    sections = split_docx_into_sections(body)
    atoms = []

    for section_name, section_content in sections:
        content = section_content.strip()
        if len(content) < 20:
            continue

        provenance = "LOCAL"
        nature = classify_nature(content)
        editorial = classify_editorial(content, provenance)
        build_state = classify_build_state(content)
        strike_phase = classify_strike_phase(nature, build_state, editorial, nodes, pillar)
        idea = summarize_idea(content)

        atom_id = f"ATM-H-{atom_counter:03d}"
        atom = Atom(
            id=atom_id,
            content=content,
            idea=idea,
            section=section_name,
            position=0,
            of_total=0,
            prev=None,
            provenance=provenance,
            nature=nature,
            nodes=nodes,
            pillar=pillar,
            build_state=build_state,
            editorial=editorial,
            strike_phase=strike_phase,
        )
        atoms.append(atom)
        atom_counter += 1

    # Link atoms
    for i, atom in enumerate(atoms):
        atom.position = i + 1
        atom.of_total = len(atoms)
        if i > 0:
            atom.prev = atoms[i-1].id
            atom.context_above = atoms[i-1].idea
        if i < len(atoms) - 1:
            atom.next_id = atoms[i+1].id
            atom.context_below = atoms[i+1].idea

    return atoms, atom_counter, fm, ""


def render_atom(atom: Atom) -> str:
    nodes_str = "[" + ", ".join(str(n) for n in atom.nodes) + "]"
    prev_str = atom.prev if atom.prev else "null"
    next_str = atom.next_id if atom.next_id else "null"
    ctx_above = atom.context_above if atom.context_above else "null"
    ctx_below = atom.context_below if atom.context_below else "null"

    in_fence = f"""<!-- {atom.id} IN
idea: "{atom.idea}"
section: "{atom.section}"
position: {atom.position}
of_total: {atom.of_total}
prev: {prev_str}
context_above: "{ctx_above}"
provenance: {atom.provenance}
nature: {atom.nature}
nodes: {nodes_str}
pillar: {atom.pillar}
build_state: {atom.build_state}
editorial: {atom.editorial}
strike_phase: {atom.strike_phase}
-->"""

    out_fence = f"""<!-- {atom.id} OUT
next: {next_str}
context_below: "{ctx_below}"
-->"""

    return f"{in_fence}\n\n{atom.content}\n\n{out_fence}"


def render_doc_envelope(doc_num: int, atoms: list, fm: dict) -> str:
    if not atoms:
        dominant_provenance = fm.get("pillar", "LOCAL") if fm else "LOCAL"
        dominant_provenance = "LOCAL"
        dominant_nature = "N/A"
    else:
        prov_counts = {}
        nat_counts = {}
        for a in atoms:
            prov_counts[a.provenance] = prov_counts.get(a.provenance, 0) + 1
            nat_counts[a.nature] = nat_counts.get(a.nature, 0) + 1
        dominant_provenance = max(prov_counts, key=prov_counts.get)
        dominant_nature = max(nat_counts, key=nat_counts.get)

    sections = {}
    for a in atoms:
        if a.section not in sections:
            sections[a.section] = []
        sections[a.section].append(a.id)

    sections_yaml = ""
    for name, ids in sections.items():
        ids_str = ", ".join(ids)
        safe_name = name.replace('"', "'")
        sections_yaml += f'\n  - name: "{safe_name}"\n    atoms: [{ids_str}]'

    return f"""<!-- DOC-ENVELOPE
id: DOC-H-{doc_num:02d}
total_sections: {len(sections)}
total_atoms: {len(atoms)}
dominant_provenance: {dominant_provenance}
dominant_nature: {dominant_nature}
sections:{sections_yaml}
-->"""


def write_processed_file(filepath: Path, fm_text: str, envelope: str, header_text: str, atoms: list, footer_text: str = ""):
    parts = [envelope, "", fm_text]

    if header_text.strip():
        parts.append("")
        parts.append(header_text)

    for atom in atoms:
        parts.append("")
        parts.append(render_atom(atom))

    if footer_text.strip():
        parts.append("")
        parts.append(footer_text)

    content = '\n'.join(parts) + '\n'
    filepath.write_text(content, encoding='utf-8')


def detect_file_type(filepath: Path, fm: dict) -> str:
    """Detect if file is chatgpt export, gemini export, or docx conversion."""
    source = fm.get("source_file", "")
    if filepath == ROOT_FILE:
        return "docx"
    if source.startswith("Gemini-"):
        return "gemini"  # same processing as chatgpt
    if source.endswith(".txt"):
        return "chatgpt"
    return "docx"


def get_footer_text(text: str) -> str:
    if FOOTER_CHATGPT in text:
        return f"\n\n{FOOTER_CHATGPT}"
    if FOOTER_GEMINI_MD in text:
        return f"\n\n---\n{FOOTER_GEMINI_MD}"
    return ""


def main():
    health_files = sorted(HEALTH_DIR.glob("*.md"))
    all_files = health_files + [ROOT_FILE]

    print(f"Found {len(health_files)} files in health/ + 1 root file = {len(all_files)} total")
    assert len(health_files) == 30, f"Expected 30 health files, got {len(health_files)}"

    atom_counter = 1
    doc_counter = 1
    total_atoms = 0

    for filepath in all_files:
        filename = filepath.name
        text = filepath.read_text(encoding='utf-8')

        # Strip any existing DOC-ENVELOPE (from prior runs)
        text = re.sub(r'<!-- DOC-ENVELOPE\n.*?-->\n*', '', text, flags=re.DOTALL)
        # Strip any existing ATM fences (from prior runs)
        text = re.sub(r'<!-- ATM-H-\d+ (?:IN|OUT)\n.*?-->\n*', '', text, flags=re.DOTALL)

        fm_text = extract_frontmatter_text(text)
        fm, body = parse_frontmatter(text)

        print(f"\nProcessing [{doc_counter:02d}]: {filename}")

        # Handle empty files
        if filename in EMPTY_FILES or not body.strip() or len(body.strip()) < 50:
            envelope = render_doc_envelope(doc_counter, [], fm)
            write_processed_file(filepath, fm_text, envelope, body.strip(), [])
            print(f"  -> EMPTY (0 atoms)")
            doc_counter += 1
            continue

        file_type = detect_file_type(filepath, fm)
        footer_text = get_footer_text(text)

        if file_type in ("chatgpt", "gemini"):
            atoms, atom_counter, fm, header_text = process_chatgpt_file(filepath, atom_counter)
        else:
            atoms, atom_counter, fm, header_text = process_docx_file(filepath, atom_counter)

        envelope = render_doc_envelope(doc_counter, atoms, fm)
        write_processed_file(filepath, fm_text, envelope, header_text, atoms, footer_text)

        total_atoms += len(atoms)
        if atoms:
            print(f"  -> {len(atoms)} atoms (ATM-H-{atom_counter - len(atoms):03d} to ATM-H-{atom_counter - 1:03d})")
        else:
            print(f"  -> 0 atoms")

        doc_counter += 1

    print(f"\n{'='*60}")
    print(f"TOTAL: {total_atoms} atoms across {len(all_files)} files")
    print(f"ATM-H-001 through ATM-H-{atom_counter - 1:03d}")
    print(f"DOC-H-01 through DOC-H-{doc_counter - 1:02d}")


if __name__ == "__main__":
    main()
