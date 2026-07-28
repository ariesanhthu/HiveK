---
template: health-report
placeholders: [DateStr, ShortHash, FullHash, LastHash, ScanMode]
generates: docs/health/{{DateStr}}-{{ShortHash}}.md
---

# Architecture Health Report

**Date**: {{DateStr}}  
**Commit**: {{FullHash}}  
**Previous baseline**: {{LastHash}}  
**Scan mode**: {{ScanMode}} # incremental | full  

## Trend Summary

| Category | Count |
|----------|-------|
| New violations | {{NewCount}} |
| Resolved since last check | {{ResolvedCount}} |
| Persisting (file touched, violation remains) | {{PersistingCount}} |

> Persisting violations are files that were modified in this diff but still contain a previously recorded violation.

## Violations

### NEW
| File | Line | Rule Violated | Risk |
|------|------|---------------|------|
<!-- Listed if new violations introduced in this run -->

### PERSISTING
| File | Line | Rule Violated | First Seen | Risk |
|------|------|---------------|------------|------|
<!-- Listed if file modified in diff still contains prior violation -->

### RESOLVED
| File | Rule | Resolved In |
|------|------|-------------|
<!-- Listed if previously reported violation was fixed in this run -->

## Notes & Recommendations
<!-- Architectural insights or recommended refactoring commands -->
