#!/usr/bin/env bash
set -euo pipefail

HOOKS_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "==> [check-health] Running Git-anchored architecture health check..."
python3 "$HOOKS_DIR/check-health.py" "$@"
