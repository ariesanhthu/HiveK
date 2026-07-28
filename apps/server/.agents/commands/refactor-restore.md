---
name: refactor-restore
description: Phase 2 of legacy refactoring — read pending Refactor Notes, re-implement blanked logic inside-out into correct layers, run tests, and mark notes as done.
---

# Command: refactor-restore

## Intent
Execute Phase 2 Logic Restoration. Read pending Refactor Notes in `docs/refactor/`, locate raw code snippets, re-implement logic inside-out into proper layers, run tests, and mark notes as completed (`status: done`).

## Preconditions
- Pending Refactor Note in `docs/refactor/` (status: `pending` or `in-progress`)

## Steps
1. Activate [`domain-modeler`](../agents/domain-modeler.md), [`database-engineer`](../agents/database-engineer.md), and [`api-designer`](../agents/api-designer.md) agents.
2. Run skill [`refactor-engine`](../skills/refactor-engine/SKILL.md).
3. Read target Refactor Note in `docs/refactor/`.
4. Restore logic inside-out:
   - **Step 1 Core**: Aggregate Root methods, Entities, VOs (`src/core/`)
   - **Step 2 Infrastructure**: Mongoose Schemas & Repository Adapters (`src/infrastructure/mongo/`)
   - **Step 3 Application**: Command/Query Handlers + IUnitOfWork (`src/application/`)
   - **Step 4 Presentation**: REST Controllers & Zod DTO Validation (`src/presentation/`)
5. Run unit & E2E tests (`npm test` / `npm run test:e2e`).
6. Update Refactor Note status to `done`.

## Deliverables
- Fully restored, working business logic in correct layers
- Refactor Note marked `done`
- Clean test execution & boundary validation
