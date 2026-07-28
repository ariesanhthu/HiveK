---
name: repair-kit
description: Validate all markdown relative file links across .agents/ and auto-repair broken references using validate-links.py.
---

# Command: repair-kit

## Intent
Validate all markdown relative file links in `.agents/` and auto-repair broken references.

## Preconditions
- `.agents/` kit directory

## Steps
1. Activate [`code-reviewer`](../agents/code-reviewer.md) agent.
2. Run [`validate-links.sh`](../hooks/validate-links.sh) with `--fix` flag.
3. Report any broken links that could not be auto-repaired.

## Deliverables
- Clean markdown link verification report
- Auto-repaired relative links across `.agents/` files
