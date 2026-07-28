#!/usr/bin/env bash
set -euo pipefail

HOOKS_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "==> [after-generate] Running boundary, import, contract, and link validations..."
bash "$HOOKS_DIR/validate-links.sh" --fix || true
bash "$HOOKS_DIR/validate-boundaries.sh" || true
bash "$HOOKS_DIR/validate-imports.sh" || true
bash "$HOOKS_DIR/validate-contracts.sh" || true
echo "==> [after-generate] Validation complete."
