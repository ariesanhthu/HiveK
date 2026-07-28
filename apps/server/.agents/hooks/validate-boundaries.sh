#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
SRC_DIR="$ROOT_DIR/src"

echo "==> [validate-boundaries] Checking Core layer dependency boundaries..."

if [ ! -d "$SRC_DIR/core" ]; then
  echo "    No src/core directory found, skipping boundary check."
  exit 0
fi

# Core layer must not import NestJS, Mongoose, Express, Fastify, or outer layers
# Check both relative imports (../../) and path alias imports (@/infrastructure, @/presentation, @/application)
VIOLATIONS=$(grep -rnE "from ['\"](@nestjs|mongoose|express|fastify|\.\./infrastructure|\.\./presentation|\.\./application|@/infrastructure/|@/presentation/|@/application/)" "$SRC_DIR/core" || true)

if [ -n "$VIOLATIONS" ]; then
  echo "❌ CRITICAL BOUNDARY VIOLATION: Core layer imports infrastructure/framework packages!"
  echo "$VIOLATIONS"
  exit 1
else
  echo "✅ Core layer boundaries clean."
fi
