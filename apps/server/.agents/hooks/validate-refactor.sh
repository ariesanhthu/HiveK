#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
REFACTOR_DIR="$ROOT_DIR/docs/refactor"

echo "==> [validate-refactor] Checking refactor notes status in docs/refactor/..."

if [ ! -d "$REFACTOR_DIR" ]; then
    echo "    No docs/refactor directory found, skipping check."
    exit 0
fi

PENDING_COUNT=0
DONE_COUNT=0

for note in "$REFACTOR_DIR"/*.md; do
    [ -e "$note" ] || continue
    if grep -q "status: pending\|status: in-progress" "$note"; then
        PENDING_COUNT=$((PENDING_COUNT + 1))
        echo "    ⚠️ Pending refactor note: $(basename "$note")"
    elif grep -q "status: done" "$note"; then
        DONE_COUNT=$((DONE_COUNT + 1))
    fi
done

if [ "$PENDING_COUNT" -gt 0 ]; then
    echo "ℹ️  Found $PENDING_COUNT open refactor note(s) pending Phase 2 restoration ($DONE_COUNT completed)."
else
    echo "✅ All refactor notes in docs/refactor/ are restored and marked done ($DONE_COUNT total)."
fi
