#!/usr/bin/env python3
"""Grade atoms with tier: SIGNAL | CONTEXT | NOISE.

Reads all docs/archive/extracted/**/*.md files, finds ATM-*-* IN fences,
applies tier classification rules, and injects a `tier:` line into each
in-situ marker. Non-destructive: only adds the tier line, never modifies
existing content or other marker fields.

Usage: python3 scripts/grade-atoms.py [--dry-run]

Tier rules (applied in order — first match wins):
  NOISE:
    1. idea contains "Transcript Unavailable"
    2. LOCAL + CLAIM + idea matches ack pattern
    3. HYBRID + (CLAIM|NARRATIVE) + idea matches ChatGPT pleasantry pattern
    4. idea is very short (<15 chars) + (CLAIM|QUESTION) + not a meaningful short idea
  CONTEXT:
    5. LOCAL + QUESTION (admin asking ChatGPT to do something)
    6. LOCAL + INSTRUCTION (build directions)
    7. HYBRID + INSTRUCTION (co-created build directions)
  SIGNAL:
    8. Everything else (default)
"""

import os
import re
import sys
from collections import Counter
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
EXTRACTED_DIR = PROJECT_ROOT / "docs" / "archive" / "extracted"

DRY_RUN = "--dry-run" in sys.argv

# --- Tier classification patterns ---

# Ack/noise patterns for LOCAL + CLAIM atoms
ACK_PATTERNS = re.compile(
    r"^("
    r"[Yy]es+[!., ]|[Yy]ay+[!., ]|[Yy]eah+[!., ]|"
    r"[Tt]hank|[Tt]hanks|"
    r"[Uu]gh |[Oo]of |[Oo]h |[Oo]oh |[Oo]kay |"
    r"[Oo]m[fg]+[! ]|"  # Omg, Omfg, Omfggg etc.
    r"[Aa]mazing[! ]|[Pp]erfect[!., ]|[Ll]ove it|[Aa]wesome[! ]|"
    r"[Hh]aha|[Ll]ol|[Ww]ow |"
    r"[Oo]oo+[! ]|"
    r"[Aa]hh? |"
    r"[Oo]kays? |"
    r"[Gg]reat[! ]|[Nn]ice[! ]"
    r")",
    re.IGNORECASE,
)

# ChatGPT pleasantry patterns for HYBRID atoms
CHATGPT_PLEASANTRY = re.compile(
    r"^("
    r"[Aa]bsolutely[!., ]|"
    r"[Ss]ure[!., ]|"
    r"[Yy]ou'?re so welcome|"
    r"[Gg]reat question|"
    r"[Ii]'?d love to|"
    r"[Ii]'?m so glad|"
    r"[Ii] think you'?ve got|"
    r"[Hh]onestly,? I think|"
    r"[Yy]ay,? I'?m so|"
    r"[Tt]hanks for the video|"
    r"[Hh]ere'?s what"
    r")",
    re.IGNORECASE,
)

# Short filler — very short ideas that are just chat noise
SHORT_FILLER = re.compile(
    r"^("
    r"[A-Z]!|"               # "A!" single letter exclamation
    r".{1,6}[!?]+$|"         # very short exclamation/question
    r"[Yy]es please!?$|"
    r"[Ll]ove that!?$|"
    r"[Gg]ot it!?$"
    r")",
)


def classify_atom(idea: str, provenance: str, nature: str) -> str:
    """Return SIGNAL, CONTEXT, or NOISE for an atom."""
    idea = idea.strip().strip('"')

    # --- NOISE rules ---

    # Rule 1: Transcript Unavailable
    if "Transcript Unavailable" in idea:
        return "NOISE"

    # Rule 2: LOCAL acks — short ones are NOISE
    if provenance == "LOCAL" and nature == "CLAIM" and ACK_PATTERNS.search(idea):
        if len(idea) < 80:
            return "NOISE"

    # Rule 3: ChatGPT pleasantries — short responses are NOISE
    if provenance == "HYBRID" and nature in ("CLAIM", "NARRATIVE"):
        if CHATGPT_PLEASANTRY.search(idea):
            if len(idea) < 100:
                return "NOISE"

    # Rule 4: Very short filler
    if nature in ("CLAIM", "QUESTION") and len(idea) < 15:
        if SHORT_FILLER.search(idea):
            return "NOISE"

    # Rule 4b: File/media reference fragments
    if re.match(r"^[A-F0-9]{8}-", idea):
        return "NOISE"
    if re.search(r"\.(MP4|mp4|MOV|mov|PNG|png|JPG|jpg)$", idea):
        return "NOISE"

    # Rule 4c: File title atoms — short title-case strings that are just headers
    # e.g. "Credit Report Review Guide", "Dream retreat vision", "20!80 rule focus"
    if provenance == "LOCAL" and nature == "CLAIM":
        cleaned = re.sub(r"[!?]+$", "", idea).strip()
        if len(cleaned) < 50 and not re.search(r"[.;:]", cleaned) and re.match(r"^[A-Z0-9]", cleaned):
            words = cleaned.split()
            if len(words) <= 6:
                return "NOISE"

    # Rule 4d: "This is perfect/great/amazing thank you" — ack combo
    if provenance == "LOCAL" and nature == "CLAIM":
        if re.match(r"^This is (perfect|great|amazing|wonderful)", idea, re.IGNORECASE):
            if len(idea) < 80:
                return "NOISE"

    # --- CONTEXT rules ---

    # Rule 5: admin's questions to ChatGPT
    if provenance == "LOCAL" and nature == "QUESTION":
        return "CONTEXT"

    # Rule 6: LOCAL build instructions
    if provenance == "LOCAL" and nature == "INSTRUCTION":
        return "CONTEXT"

    # Rule 7: HYBRID build instructions (co-created directions)
    if provenance == "HYBRID" and nature == "INSTRUCTION":
        return "CONTEXT"

    # Rule 8: LOCAL CLAIM that's a directive, not content
    if provenance == "LOCAL" and nature == "CLAIM":
        if re.match(
            r"^(Can you|Can I|Can we|Will you|Do I|Do the|Should I|Should we|"
            r"Could you|Please |Let'?s |Just |How do|How can|How many|"
            r"What are|What is|What'?re|Where |Since I|"
            r"Out of everything|I need|I want|I don'?t|No I'?m|"
            r"And then|And it|And we|Tying these|Maybe for|"
            r"\"Hey|\"Yeah|\"No|\"I )",
            idea, re.IGNORECASE,
        ):
            return "CONTEXT"

    # Rule 8b: LOCAL CLAIM with ack pattern but longer (> 80 chars) — excitement with ideas
    # These are admin brainstorming, not page content
    if provenance == "LOCAL" and nature == "CLAIM" and ACK_PATTERNS.search(idea):
        if len(idea) >= 80:
            return "CONTEXT"

    # Rule 8c: ALL CAPS excitement — admin brainstorming in caps
    if provenance == "LOCAL" and nature == "CLAIM":
        caps_ratio = sum(1 for c in idea if c.isupper()) / max(len(idea), 1)
        if caps_ratio > 0.5 and len(idea) > 15:
            return "CONTEXT"

    # Rule 9: LOCAL NARRATIVE that's really a request or preference
    if provenance == "LOCAL" and nature == "NARRATIVE":
        if re.match(
            r"^(Can you|Will you|Can we|I want|I don'?t|I like|I think|I need|"
            r"No,? I|And |Or |But |Maybe |So |Okay )",
            idea, re.IGNORECASE,
        ):
            if len(idea) < 150:
                return "CONTEXT"

    # Rule 10: HYBRID + CLAIM/NARRATIVE with ChatGPT pleasantry but longer (> 100 chars)
    # These contain substance but are ChatGPT-voiced, not admin-voiced
    if provenance == "HYBRID" and nature in ("CLAIM", "NARRATIVE"):
        if CHATGPT_PLEASANTRY.search(idea):
            if len(idea) >= 100:
                return "CONTEXT"

    # --- SIGNAL (default) ---
    return "SIGNAL"


def process_file(filepath: Path) -> dict:
    """Process a single extracted file, injecting tier into ATM IN fences.

    Returns counts dict: {SIGNAL: n, CONTEXT: n, NOISE: n}
    """
    counts = Counter()

    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # Find all ATM IN blocks and inject tier
    # Pattern: <!-- ATM-X-NNN IN\n...fields...\n-->
    def inject_tier(match):
        block = match.group(0)

        # Skip if tier already present
        if "\ntier: " in block:
            # Extract existing tier for counting
            tier_match = re.search(r"\ntier: (\w+)", block)
            if tier_match:
                counts[tier_match.group(1)] += 1
            return block

        # Parse fields we need for classification
        idea_match = re.search(r'\nidea: "?(.+?)"?\s*$', block, re.MULTILINE)
        prov_match = re.search(r"\nprovenance: (\w+)", block)
        nature_match = re.search(r"\nnature: (\w+)", block)

        idea = idea_match.group(1) if idea_match else ""
        provenance = prov_match.group(1) if prov_match else ""
        nature = nature_match.group(1) if nature_match else ""

        tier = classify_atom(idea, provenance, nature)
        counts[tier] += 1

        # Inject tier line before strike_phase (or before closing -->)
        if "\nstrike_phase:" in block:
            block = block.replace(
                "\nstrike_phase:",
                f"\ntier: {tier}\nstrike_phase:",
            )
        elif block.endswith("\n-->"):
            block = block[:-4] + f"\ntier: {tier}\n-->"
        else:
            # Fallback: insert before closing -->
            block = re.sub(
                r"\n-->",
                f"\ntier: {tier}\n-->",
                block,
                count=1,
            )

        return block

    # Match ATM IN blocks (multiline, non-greedy)
    pattern = re.compile(
        r"<!-- ATM-[A-Z]-\d+ IN\n.*?\n-->",
        re.DOTALL,
    )

    new_content = pattern.sub(inject_tier, content)

    if not DRY_RUN and new_content != content:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(new_content)

    return counts


def main():
    if DRY_RUN:
        print("=== DRY RUN — no files will be modified ===\n")

    total_counts = Counter()
    file_count = 0

    # Process all extracted markdown files
    for md_file in sorted(EXTRACTED_DIR.rglob("*.md")):
        counts = process_file(md_file)
        total_counts += counts
        file_count += 1

        if any(counts.values()):
            sig = counts.get("SIGNAL", 0)
            ctx = counts.get("CONTEXT", 0)
            noi = counts.get("NOISE", 0)
            total = sig + ctx + noi
            rel = md_file.relative_to(EXTRACTED_DIR)
            print(f"  {rel}: {total} atoms (S:{sig} C:{ctx} N:{noi})")

    # Summary
    sig = total_counts.get("SIGNAL", 0)
    ctx = total_counts.get("CONTEXT", 0)
    noi = total_counts.get("NOISE", 0)
    total = sig + ctx + noi

    print(f"\n{'=' * 50}")
    print(f"Files processed: {file_count}")
    print(f"Total atoms graded: {total}")
    print(f"  SIGNAL:  {sig:>5}  ({sig/total*100:.1f}%)" if total else "  SIGNAL:  0")
    print(f"  CONTEXT: {ctx:>5}  ({ctx/total*100:.1f}%)" if total else "  CONTEXT: 0")
    print(f"  NOISE:   {noi:>5}  ({noi/total*100:.1f}%)" if total else "  NOISE:   0")
    print(f"{'=' * 50}")

    if total != 1821:
        print(f"\n⚠ WARNING: Expected 1821 atoms, found {total}")
        print("  Check for missing or malformed ATM IN fences.")

    if DRY_RUN:
        print("\nDry run complete. Run without --dry-run to apply changes.")


if __name__ == "__main__":
    main()
