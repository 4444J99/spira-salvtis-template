#!/usr/bin/env bash
set -euo pipefail

# Walks docs/archive/extracted/**/*.md, parses ATM-*-* IN/OUT comment fences,
# and generates:
#   docs/archive/atom-registry.yaml
#   docs/archive/coverage/proof.md
#
# Usage: bash scripts/build-atom-registry.sh
# Regenerate anytime after excavation changes.

EXTRACTED_DIR="docs/archive/extracted"
OUTPUT_DIR="docs/archive"
COVERAGE_DIR="$OUTPUT_DIR/coverage"

mkdir -p "$COVERAGE_DIR"

REGISTRY="$OUTPUT_DIR/atom-registry.yaml"
PROOF="$COVERAGE_DIR/proof.md"

# --- Phase 1: Build registry header ---
cat > "$REGISTRY" <<HEADER
# AUTO-GENERATED — do not edit. Source of truth is the in-situ markers.
# Regenerate: bash scripts/build-atom-registry.sh
# Generated: $(date -u +%Y-%m-%dT%H:%M:%SZ)

atoms:
HEADER

# --- Phase 2: Parse all ATM-* IN fences ---
TOTAL=0

find "$EXTRACTED_DIR" -name "*.md" -type f | sort | while IFS= read -r file; do
  rel_file="${file#$EXTRACTED_DIR/}"

  # Extract each ATM IN block using awk
  awk '
    /^<!-- ATM-[A-Z]-[0-9]+ IN$/ || /^<!-- ATM-[A-Z]-[0-9]+ IN / {
      in_block = 1
      # Extract the ATM ID
      match($0, /ATM-[A-Z]-[0-9]+/)
      atm_id = substr($0, RSTART, RLENGTH)
      block = ""
      next
    }
    in_block && /^-->/ {
      in_block = 0
      # Parse fields from block
      idea = ""; section = ""; position = ""; of_total = ""
      prev = ""; provenance = ""; nature = ""; nodes = ""
      pillar = ""; build_state = ""; editorial = ""; tier = ""; strike_phase = ""

      n = split(block, lines, "\n")
      for (i = 1; i <= n; i++) {
        line = lines[i]
        if (match(line, /^idea: */))          idea = substr(line, RSTART+RLENGTH)
        if (match(line, /^section: */))       section = substr(line, RSTART+RLENGTH)
        if (match(line, /^position: */))      position = substr(line, RSTART+RLENGTH)
        if (match(line, /^of_total: */))      of_total = substr(line, RSTART+RLENGTH)
        if (match(line, /^prev: */))          prev = substr(line, RSTART+RLENGTH)
        if (match(line, /^provenance: */))    provenance = substr(line, RSTART+RLENGTH)
        if (match(line, /^nature: */))        nature = substr(line, RSTART+RLENGTH)
        if (match(line, /^nodes: */))         nodes = substr(line, RSTART+RLENGTH)
        if (match(line, /^pillar: */))        pillar = substr(line, RSTART+RLENGTH)
        if (match(line, /^build_state: */))   build_state = substr(line, RSTART+RLENGTH)
        if (match(line, /^editorial: */))     editorial = substr(line, RSTART+RLENGTH)
        if (match(line, /^tier: */))          tier = substr(line, RSTART+RLENGTH)
        if (match(line, /^strike_phase: */))  strike_phase = substr(line, RSTART+RLENGTH)
      }

      # Clean quotes from fields
      gsub(/^"/, "", idea); gsub(/"$/, "", idea)
      gsub(/^"/, "", section); gsub(/"$/, "", section)
      gsub(/^"/, "", pillar); gsub(/"$/, "", pillar)

      printf "  - id: %s\n", atm_id
      printf "    source_file: \"%s\"\n", source_file
      printf "    idea: \"%s\"\n", idea
      printf "    section: \"%s\"\n", section
      printf "    position: %s\n", position
      printf "    of_total: %s\n", of_total
      printf "    prev: %s\n", prev
      printf "    provenance: %s\n", provenance
      printf "    nature: %s\n", nature
      printf "    nodes: %s\n", nodes
      printf "    pillar: \"%s\"\n", pillar
      printf "    build_state: %s\n", build_state
      printf "    editorial: %s\n", editorial
      printf "    tier: %s\n", tier
      printf "    strike_phase: %s\n", strike_phase
      next
    }
    in_block { block = block $0 "\n" }
  ' source_file="$rel_file" "$file" >> "$REGISTRY"
done

# --- Phase 3: Compute statistics from registry ---
count_matches() {
  local result
  result=$(grep -c "$1" "$REGISTRY" 2>/dev/null || true)
  result="${result//[^0-9]/}"
  echo "${result:-0}"
}

TOTAL=$(count_matches "^  - id:")
TOTAL_EXISTS=$(count_matches "build_state: EXISTS")
TOTAL_PARTIAL=$(count_matches "build_state: PARTIAL")
TOTAL_MISSING=$(count_matches "build_state: MISSING")
TOTAL_NA=$(count_matches "build_state: N/A")
ACCOUNTED=$((TOTAL_EXISTS + TOTAL_PARTIAL + TOTAL_MISSING + TOTAL_NA))
UNACCOUNTED=$((TOTAL - ACCOUNTED))

# Count by provenance
LOCAL=$(count_matches "provenance: LOCAL")
HYBRID=$(count_matches "provenance: HYBRID")
ALIEN=$(count_matches "provenance: ALIEN")

# Count by nature
CLAIM=$(count_matches "nature: CLAIM")
FRAMEWORK=$(count_matches "nature: FRAMEWORK")
TOOL=$(count_matches "nature: TOOL")
SCRIPT=$(count_matches "nature: SCRIPT")
STATISTIC=$(count_matches "nature: STATISTIC")
PROTOCOL=$(count_matches "nature: PROTOCOL")
NARRATIVE=$(count_matches "nature: NARRATIVE")
CITATION=$(count_matches "nature: CITATION")
PRODUCT=$(count_matches "nature: PRODUCT")
MODEL=$(count_matches "nature: MODEL")
QUESTION=$(count_matches "nature: QUESTION")
INSTRUCTION=$(count_matches "nature: INSTRUCTION")

# Count FLAGGED
FLAGGED=$(count_matches "editorial: FLAGGED")

# Count by tier
SIGNAL=$(count_matches "tier: SIGNAL")
CONTEXT=$(count_matches "tier: CONTEXT")
NOISE=$(count_matches "tier: NOISE")

# --- Phase 4: Generate proof ---
if [ "$UNACCOUNTED" -eq 0 ] && [ "$TOTAL" -gt 0 ]; then
  PROOF_STATUS="**PROOF COMPLETE — every atom accounted for.**"
elif [ "$TOTAL" -eq 0 ]; then
  PROOF_STATUS="**NO ATOMS FOUND — excavation has not begun.**"
else
  PROOF_STATUS="**PROOF INCOMPLETE — $UNACCOUNTED atoms unaccounted.**"
fi

cat > "$PROOF" <<PROOF
# Coverage Proof

Generated: $(date -u +%Y-%m-%dT%H:%M:%SZ)
Source: docs/archive/extracted/**/*.md

## Summary

| Metric | Count |
|--------|-------|
| Total atoms registered | $TOTAL |
| EXISTS (fully in build) | $TOTAL_EXISTS |
| PARTIAL (partially in build) | $TOTAL_PARTIAL |
| MISSING (not in build) | $TOTAL_MISSING |
| N/A (no build target) | $TOTAL_NA |
| **Accounted** | **$ACCOUNTED** |
| **Unaccounted** | **$UNACCOUNTED** |

## By Provenance

| Provenance | Count |
|-----------|-------|
| LOCAL | $LOCAL |
| HYBRID | $HYBRID |
| ALIEN | $ALIEN |

## By Nature

| Nature | Count |
|--------|-------|
| CLAIM | $CLAIM |
| FRAMEWORK | $FRAMEWORK |
| TOOL | $TOOL |
| SCRIPT | $SCRIPT |
| STATISTIC | $STATISTIC |
| PROTOCOL | $PROTOCOL |
| NARRATIVE | $NARRATIVE |
| CITATION | $CITATION |
| PRODUCT | $PRODUCT |
| MODEL | $MODEL |
| QUESTION | $QUESTION |
| INSTRUCTION | $INSTRUCTION |

## By Tier

| Tier | Count |
|------|-------|
| SIGNAL | $SIGNAL |
| CONTEXT | $CONTEXT |
| NOISE | $NOISE |

## Editorial Flags

| Flag | Count |
|------|-------|
| FLAGGED | $FLAGGED |

## Proof Status

$PROOF_STATUS
PROOF

# --- Output ---
echo ""
echo "=== Atom Registry Built ==="
echo "Total atoms: $TOTAL"
echo "EXISTS: $TOTAL_EXISTS | PARTIAL: $TOTAL_PARTIAL | MISSING: $TOTAL_MISSING | N/A: $TOTAL_NA"
echo "Unaccounted: $UNACCOUNTED"
echo "LOCAL: $LOCAL | HYBRID: $HYBRID | ALIEN: $ALIEN"
echo "SIGNAL: $SIGNAL | CONTEXT: $CONTEXT | NOISE: $NOISE"
echo "FLAGGED: $FLAGGED"
echo ""
echo "Registry: $REGISTRY"
echo "Proof: $PROOF"
