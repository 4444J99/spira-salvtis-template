#!/usr/bin/env bash
set -euo pipefail

# add-issue-to-board.sh — Add an existing GitHub issue to the configured Project.
#
# This keeps project-board membership changes script-mediated and audit-logged.
#
# Usage:
#   bash scripts/add-issue-to-board.sh <issue#> [--reason "..."]
#
# Override config: BOARD_CONFIG=/path/to/board.config.json bash scripts/add-issue-to-board.sh ...

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG="${BOARD_CONFIG:-${SCRIPT_DIR}/../.config/board.config.json}"

if [[ ! -f ${CONFIG} ]] || [[ ! -r ${CONFIG} ]]; then
  echo "ERROR: board.config.json not found at: ${CONFIG}" >&2
  exit 1
fi

OWNER=$(
  python3 - "${CONFIG}" <<'PY'
import json
import sys
with open(sys.argv[1]) as f:
    cfg = json.load(f)
print(cfg["owner"])
PY
)
REPO=$(
  python3 - "${CONFIG}" <<'PY'
import json
import sys
with open(sys.argv[1]) as f:
    cfg = json.load(f)
print(cfg["repo"])
PY
)
PROJECT_NUM=$(
  python3 - "${CONFIG}" <<'PY'
import json
import sys
with open(sys.argv[1]) as f:
    cfg = json.load(f)
print(cfg["project_num"])
PY
)
AUDIT_LOG=$(
  python3 - "${CONFIG}" <<'PY'
import json
import sys
with open(sys.argv[1]) as f:
    cfg = json.load(f)
print(cfg["audit_log"])
PY
)

REPO_SLUG="${REPO}"
if [[ ${REPO_SLUG} != */* ]]; then
  REPO_SLUG="${OWNER}/${REPO_SLUG}"
fi

usage() {
  echo 'Usage: add-issue-to-board.sh <issue#> [--reason "..."]' >&2
  exit 1
}

log_event() {
  local issue="$1" event_type="$2" detail="$3" reason="${4-}"
  local ts
  ts=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  local entry="${ts} | #${issue} | ${event_type} | ${detail}"
  if [[ -n ${reason} ]]; then
    entry="${entry} | reason: ${reason}"
  fi
  if [[ -z ${AUDIT_LOG} ]]; then
    echo "ERROR: audit_log is empty in board config." >&2
    exit 1
  fi
  mkdir -p "$(dirname "${AUDIT_LOG}")"
  echo "${entry}" >>"${AUDIT_LOG}"
  echo "  LOGGED: ${entry}"
}

if [[ $# -lt 1 ]]; then
  usage
fi

ISSUE_NUM="$1"
shift
REASON=""

while [[ $# -gt 0 ]]; do
  case "$1" in
  --reason)
    REASON="$2"
    shift 2
    ;;
  *)
    echo "Unknown arg: $1" >&2
    usage
    ;;
  esac
done

echo "=== Board Add: Issue #${ISSUE_NUM} ==="

existing_item_id=$(
  gh project item-list "${PROJECT_NUM}" --owner "${OWNER}" --format json --limit 1000 2>/dev/null |
    python3 -c "
import json
import sys
issue_num = int(sys.argv[1])
data = json.load(sys.stdin)
for item in data.get('items', []):
    content = item.get('content', {})
    if content and content.get('number') == issue_num:
        print(item['id'])
        sys.exit(0)
sys.exit(1)
" "${ISSUE_NUM}" 2>/dev/null || true
)

if [[ -n ${existing_item_id} ]]; then
  echo "  Issue #${ISSUE_NUM} is already on project #${PROJECT_NUM}"
  echo "=== Done ==="
  exit 0
fi

issue_url=$(gh issue view "${ISSUE_NUM}" --repo "${REPO_SLUG}" --json url --jq .url)
if [[ -z ${issue_url} ]]; then
  echo "ERROR: could not resolve issue URL for #${ISSUE_NUM}" >&2
  exit 1
fi

gh project item-add "${PROJECT_NUM}" --owner "${OWNER}" --url "${issue_url}" --format json >/dev/null

log_event "${ISSUE_NUM}" "BOARD_ADD" "Added to project #${PROJECT_NUM}" "${REASON}"
echo "  Added: ${issue_url}"
echo "=== Done ==="
