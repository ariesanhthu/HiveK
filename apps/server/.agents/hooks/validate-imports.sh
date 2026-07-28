#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
SRC_DIR="$ROOT_DIR/src"

echo "==> [validate-imports] Checking Application layer imports..."

if [ ! -d "$SRC_DIR/application" ]; then
  echo "    No src/application directory found, skipping import check."
  exit 0
fi

# Application layer must not import concrete infrastructure classes or presentation controllers
# Check both relative imports (../../) and path alias imports (@/infrastructure, @/presentation)
VIOLATIONS=$(grep -rnE "from ['\"](\.\./infrastructure/|\.\./presentation|@/infrastructure/|@/presentation/)" "$SRC_DIR/application" || true)

if [ -n "$VIOLATIONS" ]; then
  echo "❌ IMPORT VIOLATION: Application layer imports concrete infrastructure repositories or presentation controllers!"
  echo "$VIOLATIONS"
  exit 1
else
  echo "✅ Application layer imports clean."
fi
