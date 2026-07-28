#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"

echo "==> [before-generate] Checking project documentation readiness..."

if [ ! -f "$ROOT_DIR/docs/architecture/service.md" ]; then
  echo "⚠️ WARNING: docs/architecture/service.md not found!"
  echo "   Run command 'init-project' or fill service context before generating code."
  exit 1
fi

echo "==> [before-generate] Project documentation verified."
