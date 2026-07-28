---
name: create-tests
description: Generate Jest unit tests for core aggregates and application handlers, plus integration/E2E tests for REST controllers.
---

# Command: create-tests

## Intent
Generate unit and integration tests for core aggregates, use cases, or controllers.

## Preconditions
- Target module or domain name, target layer (Core, Application, Presentation)

## Steps
1. Activate [`test-engineer`](../agents/test-engineer.md) agent.
2. Read domain invariants in `docs/domains/<domain>/domain.md`.
3. Run skill [`testing-strategy`](../skills/testing-strategy/SKILL.md).
4. Generate unit tests for Core classes in `tests/application/commands/<name>/`.
5. Generate unit tests for Handler classes with port mocks.
6. Generate E2E tests (`tests/e2e/\*.e2e-spec.ts`) for REST controllers using NestJS `Test.createTestingModule()`.
7. Run tests via `npm test` or `npm run test:e2e`.

## Deliverables
- Unit & E2E test files
- Passing test execution output
