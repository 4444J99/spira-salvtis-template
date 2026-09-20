#!/usr/bin/env python3
"""Build admin Intent Register from CONTEXT-tier atoms.

Reads atom-registry.yaml, filters tier: CONTEXT, organizes by topic cluster,
and outputs docs/archive/admin-intent-register.md — a structured decision log
feeding SOP-SS-CLT-001.

Usage: python3 scripts/build-intent-register.py
"""

import os
import re
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
REGISTRY_PATH = PROJECT_ROOT / "docs" / "archive" / "atom-registry.yaml"
OUTPUT_PATH = PROJECT_ROOT / "docs" / "archive" / "admin-intent-register.md"


def load_registry():
    """Parse atom registry line-by-line (same approach as generate-coverage-strikes.py)."""
    atoms = []
    current = None

    with open(REGISTRY_PATH, "r") as f:
        for line in f:
            stripped = line.rstrip("\n")

            if stripped.startswith("  - id: "):
                if current is not None:
                    atoms.append(current)
                current = {"id": stripped[len("  - id: "):].strip()}
                continue

            if current is None:
                continue

            if stripped.startswith("    ") and ": " in stripped:
                key_val = stripped[4:]
                colon_pos = key_val.index(": ")
                key = key_val[:colon_pos]
                val = key_val[colon_pos + 2:]

                if val.startswith('"') and val.endswith('"'):
                    val = val[1:-1]
                elif val.startswith('"'):
                    val = val[1:]

                if key == "nodes":
                    val = val.strip()
                    if val == "[]":
                        val = []
                    elif val.startswith("[") and val.endswith("]"):
                        inner = val[1:-1]
                        val = [int(x.strip()) for x in inner.split(",") if x.strip()]
                    else:
                        val = []

                current[key] = val

    if current is not None:
        atoms.append(current)

    return atoms


# Topic classification for CONTEXT atoms
TOPIC_PATTERNS = {
    "Build Preferences": [
        r"(option|version|combine|merge|switch|change|format|layout|structure|grid|carousel|reel|caption)",
        r"(keep it|make it|more like|less|simple|short|direct|fun|easy|basic)",
    ],
    "Voice & Tone Direction": [
        r"(my voice|sound like|doesn't sound|in my voice|more like me|my style)",
        r"(hook|caption|CTA|hashtag|punchy|viral|shareable)",
    ],
    "Platform & Distribution": [
        r"(instagram|facebook|tiktok|youtube|social media|DM|email|google doc|PDF)",
        r"(post|content|calendar|schedule|30 day|grid|story|stories)",
    ],
    "Product & Offering Ideas": [
        r"(sell|product|subscription|course|retreat|ebook|book|guide|planner|workbook)",
        r"(pricing|revenue|income|business|funnel|lead magnet|landing page)",
    ],
    "Health & Science Queries": [
        r"(cortisol|hormone|gut|water|kangen|hydrogen|alkaline|inflammation)",
        r"(acupressure|fascia|endometriosis|autoimmune|neurodivergence|hEDS)",
        r"(research|study|source|resource|link|citation|evidence)",
    ],
    "Spiritual & Framework Queries": [
        r"(astrology|human design|chakra|manifestation|alchemy|frequency|vibration)",
        r"(yin|yang|feminine|masculine|moon|cycle|ritual|meditation|kundalini)",
    ],
    "Personal Journey": [
        r"(my story|my experience|I feel|I felt|personally|my life|my journey)",
        r"(healing|growth|shift|breakthrough|realization|scared|afraid|nervous)",
    ],
    "Tool & Integration Requests": [
        r"(GHL|Calendly|Twilio|Stripe|quiz|assessment|self-check|calculator)",
        r"(API|integration|embed|widget|form|automation|workflow)",
    ],
}


def classify_topic(idea: str) -> str:
    """Return the best-matching topic for a CONTEXT atom's idea."""
    idea_lower = idea.lower()
    scores = {}
    for topic, patterns in TOPIC_PATTERNS.items():
        score = 0
        for pattern in patterns:
            matches = re.findall(pattern, idea_lower)
            score += len(matches)
        if score > 0:
            scores[topic] = score

    if scores:
        return max(scores, key=scores.get)
    return "General Direction"


def timestamp():
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def esc(text):
    if not text:
        return ""
    return str(text).replace("|", "\\|")


def truncate(text, maxlen=100):
    text = esc(text)
    if len(text) > maxlen:
        return text[:maxlen - 3] + "..."
    return text


def main():
    atoms = load_registry()
    context_atoms = [a for a in atoms if a.get("tier") == "CONTEXT"]

    # Classify by topic
    topic_groups = defaultdict(list)
    for atom in context_atoms:
        topic = classify_topic(atom.get("idea", ""))
        topic_groups[topic].append(atom)

    # Sort topics by count descending
    sorted_topics = sorted(topic_groups.keys(), key=lambda t: -len(topic_groups[t]))

    # Generate the register
    lines = [
        "# admin Intent Register",
        "",
        f"Generated: {timestamp()}",
        f"Source: atom-registry.yaml (tier: CONTEXT)",
        f"Total CONTEXT atoms: {len(context_atoms)}",
        f"Purpose: Structured decision log feeding SOP-SS-CLT-001",
        "",
        "This register captures admin's questions, preferences, build directions,",
        "and brainstorming ideas extracted from her ChatGPT conversations. These are",
        "not page content — they are the **intent layer** that informs build decisions.",
        "",
        "---",
        "",
        "## Topic Summary",
        "",
        "| Topic | Count | % | Key Themes |",
        "|-------|-------|---|------------|",
    ]

    for topic in sorted_topics:
        group = topic_groups[topic]
        pct = f"{len(group) * 100 / len(context_atoms):.1f}"
        # Extract key themes from ideas
        natures = defaultdict(int)
        for a in group:
            natures[a.get("nature", "")] += 1
        top_nature = max(natures, key=natures.get) if natures else ""
        lines.append(
            f"| {topic} | {len(group)} | {pct}% | Mostly {top_nature} |"
        )

    lines.extend(["", "---", ""])

    # Detail per topic
    for topic in sorted_topics:
        group = topic_groups[topic]
        lines.append(f"## {topic}")
        lines.append(f"**{len(group)} atoms**")
        lines.append("")

        # Nature breakdown
        nature_counts = defaultdict(int)
        for a in group:
            nature_counts[a.get("nature", "")] += 1
        nature_str = ", ".join(
            f"{n}: {c}" for n, c in sorted(nature_counts.items(), key=lambda x: -x[1])
        )
        lines.append(f"*Nature:* {nature_str}")
        lines.append("")

        # Provenance breakdown
        local_count = sum(1 for a in group if a.get("provenance") == "LOCAL")
        hybrid_count = sum(1 for a in group if a.get("provenance") == "HYBRID")
        lines.append(f"*Voice:* {local_count} admin (LOCAL), {hybrid_count} co-created (HYBRID)")
        lines.append("")

        # Atom table
        lines.append("| ID | Source | Idea | Nature | Provenance |")
        lines.append("|-----|--------|------|--------|------------|")

        # Sort: LOCAL first (admin's direct input), then HYBRID
        sorted_group = sorted(
            group,
            key=lambda a: (0 if a.get("provenance") == "LOCAL" else 1, a.get("id", "")),
        )
        for a in sorted_group:
            lines.append(
                f"| {a.get('id', '')} "
                f"| {esc(a.get('source_file', ''))} "
                f"| {truncate(a.get('idea', ''))} "
                f"| {a.get('nature', '')} "
                f"| {a.get('provenance', '')} |"
            )

        lines.extend(["", "---", ""])

    content = "\n".join(lines)

    with open(OUTPUT_PATH, "w") as f:
        f.write(content)
        f.write("\n")

    print(f"admin Intent Register built: {OUTPUT_PATH}")
    print(f"  {len(context_atoms)} CONTEXT atoms across {len(sorted_topics)} topics")
    for topic in sorted_topics:
        print(f"    {topic}: {len(topic_groups[topic])}")


if __name__ == "__main__":
    main()
