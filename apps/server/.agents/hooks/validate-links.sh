#!/usr/bin/env bash
set -euo pipefail

HOOKS_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "==> [validate-links] Checking markdown relative links inside .agents/..."
python3 "$HOOKS_DIR/validate-links.py" "$@"
