---
name: refactor-align
description: Phase 1 of legacy refactoring — restructure messy modules into Clean/Core layers, blank tangled logic, insert inline backlinks, and write Refactor Notes in docs/refactor/.
---

# Command: refactor-align

## Intent
Execute Phase 1 Architecture Alignment on a messy legacy module. Restructure files into Clean Architecture layers, blank out tangled DB/external logic, insert inline backlinks (`// see: docs/refactor/...`), create Refactor Notes in `docs/refactor/`, and verify boundary hooks pass.

## Preconditions
- Messy legacy module path

## Steps
1. Activate [`architect`](../agents/architect.md) and [`code-reviewer`](../agents/code-reviewer.md) agents.
2. Run skill [`refactor-engine`](../skills/refactor-engine/SKILL.md).
3. Move files to correct layers:
   - Core logic → `src/core/` (aggregates, entities, VOs, enums, interfaces)
   - Use cases → `src/application/` (commands, queries, services)
   - Schemas & Repos → `src/infrastructure/` (mongo, modules, auth, etc.)
   - Controllers → `src/presentation/` (controllers, resolvers, guards)
4. Apply Decision Matrix:
   - Blank out DB calls, external calls, and entangled rules.
   - Insert inline backlink: `// see: docs/refactor/YYYYMMDD-seq-name.md`.
5. Create Refactor Note in `docs/refactor/` using [`templates/refactor/note.md`](../templates/refactor/note.md) containing raw legacy code snippets.
6. Run [`after-generate.sh`](../hooks/after-generate.sh) to verify structural boundary compliance.

## Deliverables
- Restructured code passing `.agents/hooks/after-generate.sh`
- Open Refactor Note in `docs/refactor/` with raw code snippets & inline backlinks
