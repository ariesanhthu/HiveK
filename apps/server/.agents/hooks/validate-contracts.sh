#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"

echo "==> [validate-contracts] Checking API documentation contract consistency..."

if [ ! -d "$ROOT_DIR/docs/domains" ]; then
  echo "    No docs/domains directory found, skipping contract check."
  exit 0
fi

# Check that each domain has required documentation files
VIOLATIONS=""
for domain_dir in "$ROOT_DIR"/docs/domains/*/; do
  [ -d "$domain_dir" ] || continue
  domain_name=$(basename "$domain_dir")

  for required_file in "domain.md" "api.md"; do
    if [ ! -f "$domain_dir$required_file" ]; then
      VIOLATIONS="$VIOLATIONS\n    Missing: docs/domains/$domain_name/$required_file"
    fi
  done
done

if [ -n "$VIOLATIONS" ]; then
  echo "❌ CONTRACT VIOLATION: Missing required domain documentation files!"
  echo -e "$VIOLATIONS"
  exit 1
else
  echo "✅ API contract verification passed."
fi
