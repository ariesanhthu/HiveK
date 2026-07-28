---
name: add-endpoint
description: Expose an existing use case as an HTTP endpoint on the Presentation layer controller with auth guards and DTO validation.
---

# Command: add-endpoint

## Intent
Expose a use case via an HTTP endpoint in one of the Presentation controllers.

## Preconditions
- Domain name, controller tier (admin/client), HTTP method and path, use case to dispatch

## Steps
1. Activate [`api-designer`](../agents/api-designer.md) agent.
2. Read `docs/domains/<domain>/api.md`.
3. Run skill [`api-contract-design`](../skills/api-contract-design/SKILL.md).
4. Generate from template [`templates/api/controller.md`](../templates/api/controller.md) or update existing controller in:
   - `src/presentation/controllers/http/admin/<name>.controller.ts` (admin tier)
   - `src/presentation/controllers/http/client/<name>.controller.ts` (client tier)
5. Attach auth guards (`JwtAuthGuard`, `RolesGuard` with `@Roles(ERoleType.ENTERPRISE)`).
6. Update `docs/domains/<domain>/api.md` contract.
7. Run [`after-generate.sh`](../hooks/after-generate.sh).

## Deliverables
- REST Controller method dispatches Command/Query via `CommandBus`/`QueryBus`
- Updated `docs/domains/<domain>/api.md`
