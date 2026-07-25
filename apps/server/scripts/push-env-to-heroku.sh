#!/usr/bin/env bash
#
# push-env-to-heroku.sh
#
# Reads a .env file and pushes each variable to Heroku config vars.
#
# Usage:
#   ./scripts/push-env-to-heroku.sh <app-name> [env-file]
#
# Examples:
#   ./scripts/push-env-to-heroku.sh hivek-main-backend
#   ./scripts/push-env-to-heroku.sh hivek-main-backend .env.production
#   ./scripts/push-env-to-heroku.sh hivek-main-backend .env
#

set -euo pipefail

# ─── Colors ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ─── Help ─────────────────────────────────────────────────────────────────────
usage() {
  echo "Usage: $0 <heroku-app-name> [env-file]"
  echo ""
  echo "Arguments:"
  echo "  <heroku-app-name>   Heroku app name (required)"
  echo "  [env-file]          Path to .env file (default: .env.production)"
  echo ""
  echo "Examples:"
  echo "  $0 hivek-main-backend"
  echo "  $0 hivek-main-backend .env.production"
  echo "  $0 hivek-main-backend .env"
  exit 1
}

# ─── Parse arguments ──────────────────────────────────────────────────────────
HEROKU_APP="${1:-}"
ENV_FILE="${2:-.env.production}"

if [[ -z "$HEROKU_APP" ]]; then
  usage
fi

if [[ ! -f "$ENV_FILE" ]]; then
  echo -e "${RED}Error: File '$ENV_FILE' not found.${NC}"
  exit 1
fi

# ─── Check Heroku CLI ─────────────────────────────────────────────────────────
if ! command -v heroku &>/dev/null; then
  echo -e "${RED}Error: Heroku CLI is not installed.${NC}"
  echo "Install: npm install -g heroku"
  exit 1
fi

# ─── Check login status ───────────────────────────────────────────────────────
if ! heroku auth:whoami &>/dev/null; then
  echo -e "${RED}Error: Not logged in to Heroku. Run 'heroku login' first.${NC}"
  exit 1
fi

# ─── Parse .env file ──────────────────────────────────────────────────────────
echo -e "${YELLOW}Reading variables from: $ENV_FILE${NC}"
echo -e "${YELLOW}Target Heroku app:   $HEROKU_APP${NC}"
echo ""

VARS=()
SKIPPED=0
COUNT=0

while IFS= read -r line || [[ -n "$line" ]]; do
  # Strip leading/trailing whitespace
  trimmed="$(echo "$line" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')"

  # Skip empty lines and full-line comments
  if [[ -z "$trimmed" || "$trimmed" == \#* ]]; then
    continue
  fi

  # Extract key=value (stop at inline comment after a space)
  # e.g. SMTP_HOST=smtp.gmail.com # some comment
  clean="$(echo "$trimmed" | sed 's/[[:space:]]*#.*$//')"

  # Ensure it looks like KEY=VALUE or KEY='VALUE' or KEY="VALUE"
  if [[ ! "$clean" =~ ^[A-Za-z_][A-Za-z0-9_]*= ]]; then
    echo -e "${YELLOW}  ⚠ Skipping malformed line: $trimmed${NC}"
    ((SKIPPED++)) || true
    continue
  fi

  VARS+=("$clean")
  ((COUNT++)) || true
done < "$ENV_FILE"

if [[ ${#VARS[@]} -eq 0 ]]; then
  echo -e "${RED}No variables found in '$ENV_FILE'.${NC}"
  exit 0
fi

echo -e "${GREEN}Found $COUNT variables to push.${NC}"

# ─── Confirmation ─────────────────────────────────────────────────────────────
echo ""
echo "Variables to push:"
for v in "${VARS[@]}"; do
  echo "  ${v%%=*}=***"
done
echo ""
read -p "Push these $COUNT variables to Heroku app '$HEROKU_APP'? (y/N) " -r
if [[ ! "$REPLY" =~ ^[Yy]$ ]]; then
  echo "Aborted."
  exit 0
fi

# ─── Push to Heroku ───────────────────────────────────────────────────────────
echo ""
echo -e "${YELLOW}Pushing to Heroku...${NC}"

# Build the heroku config:set command with all variables
# We use -- to separate the app name from the vars, and handle quoting
CMD=("heroku" "config:set")
for v in "${VARS[@]}"; do
  CMD+=("$v")
done
CMD+=("-a" "$HEROKU_APP")

echo ""
echo "Running: heroku config:set ... -a $HEROKU_APP"
echo ""

if "${CMD[@]}"; then
  echo ""
  echo -e "${GREEN}✅ Successfully pushed $COUNT variables to '$HEROKU_APP'.${NC}"
  echo -e "${GREEN}   Skipped: $SKIPPED malformed lines.${NC}"
else
  echo ""
  echo -e "${RED}❌ Failed to push variables. Check the error above.${NC}"
  exit 1
fi