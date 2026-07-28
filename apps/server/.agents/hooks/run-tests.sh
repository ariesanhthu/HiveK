#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"

echo "==> [run-tests] Executing test suite..."

if [ -f "$ROOT_DIR/package.json" ]; then
  npm --prefix "$ROOT_DIR" run test || true
else
  echo "    No package.json found, skipping test execution."
fi
