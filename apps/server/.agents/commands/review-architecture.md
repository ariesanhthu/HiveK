---
name: review-architecture
description: Audit the codebase for architectural drift using a Git-anchored incremental health check, categorizing violations as NEW, PERSISTING, or RESOLVED since the last baseline.
---

# Command: review-architecture

## Intent
Audit the codebase for architectural drift using a Git-anchored, incremental health check anchored to the latest commit baseline.

## Preconditions
- Clean Git working directory (all changes must be committed before execution)
- Active codebase under `src/`

## Steps
1. Activate [`architect`](../agents/architect.md) and [`code-reviewer`](../agents/code-reviewer.md) agents.
2. Verify Git working directory is clean (`git status --porcelain`).
   - If dirty, prompt developer to commit changes first.
3. Check for `docs/health/latest.md`:
   - If missing or `--full` passed → Run **Bootstrap Mode** (Full scan of `src/`).
   - If present → Run **Incremental Mode** (`git diff {last_hash}..HEAD -- src/`).
4. Run validation script:
   - [`check-health.sh`](../hooks/check-health.sh)
5. Generate report files:
   - Copy [`templates/health/report.md`](../templates/health/report.md) → `docs/health/{YYYYMMDD}-{short_hash}.md`
   - Update `docs/health/latest.md`
6. Categorize violations:
   - **NEW**: Violations introduced in this diff
   - **PERSISTING**: Modified files still containing previously recorded violations
   - **RESOLVED**: Violations resolved since previous baseline

## Deliverables
- `docs/health/{YYYYMMDD}-{short_hash}.md` report
- Updated `docs/health/latest.md` pointing to current commit baseline
- Note: This command does NOT auto-fix violations. Fixing is triggered via [`refactor-align`](refactor-align.md) / [`refactor-restore`](refactor-restore.md).
