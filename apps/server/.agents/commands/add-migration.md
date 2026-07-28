---
name: add-migration
description: Create a database migration or schema evolution script to handle data model changes in MongoDB.
---

# Command: add-migration

## Intent
Create a database migration or schema evolution script for data model changes.

## Preconditions
- Migration target (collection), change summary (indexes, new fields, data backfill)

## Steps
1. Activate [`database-engineer`](../agents/database-engineer.md) agent.
2. Read target domain schema in `src/infrastructure/mongo/schemas/` or `docs/domains/<domain>/domain.md`.
3. Create migration script in `src/infrastructure/mongo/seeding/` or run via `scripts/`.
4. Ensure migration contains both `up()` (apply) and `down()` (rollback) steps.
5. Update `docs/domains/<domain>/domain.md` schema documentation.
6. Run [`after-generate.sh`](../hooks/after-generate.sh).

## Deliverables
- Executable migration script with `up` and `down` handlers
- Updated schema documentation

