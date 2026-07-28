---
name: add-use-case
description: Add a new CQRS command handler (write) or query handler (read) to an existing domain, including DTO validation and module provider registration.
---

# Command: add-use-case

## Intent
Add a new CQRS command handler or query handler to an existing domain.

## Preconditions
- Domain name, use case name (e.g. `CreateCampaign`, `GetCampaignList`), input parameters

## Steps
1. Read `docs/domains/<domain>/domain.md` and `docs/domains/<domain>/api.md`.
2. Determine type: Write operation (Command) vs Read operation (Query).
3. Activate [`domain-modeler`](../agents/domain-modeler.md) (if command) or [`database-engineer`](../agents/database-engineer.md) (if query).
4. Run skill [`cqrs-generator`](../skills/cqrs-generator/SKILL.md).
5. Generate code from templates:
   - If Command:
     - [`templates/application/command.md`](../templates/application/command.md) → `src/application/commands/<name>/<name>.command.ts`
     - Create input DTO `src/application/commands/<name>/<name>.dto.ts` (or use shared [`templates/application/dto.md`](../templates/application/dto.md))
     - [`templates/application/command-handler.md`](../templates/application/command-handler.md) → `src/application/commands/<name>/<name>.handler.ts`
   - If Query:
     - [`templates/application/query.md`](../templates/application/query.md) → `src/application/queries/<name>/<name>.query.ts`
     - [`templates/application/query-handler.md`](../templates/application/query-handler.md) → `src/application/queries/<name>/<name>.handler.ts`
6. Register handler in `<domain>.module.ts` providers.
7. Update `docs/domains/<domain>/api.md` with new use case details.
8. Run [`after-generate.sh`](../hooks/after-generate.sh).

## Deliverables
- Command / Query handler files with Zod DTO validation
- Module provider registration
- Updated domain API contract docs

