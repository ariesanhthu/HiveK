---
name: testing-strategy
description: Guides black-box Jest test design for Domain logic, Handler classes, and gRPC controllers.
---

# Testing Strategy Skill

## Instructions

1. Core Layer Unit Tests (`tests/application/commands/<name>/`):
   - Test aggregate root invariants, factory `create()` validation, state machine methods, and domain event creation.
   - Zero framework or mock dependencies.
2. Handler Unit Tests (`tests/application/commands/<name>/`):
   - Test Command/Query handlers.
   - Mock repository ports (`I{Name}Repository`) and Unit of Work (`IUnitOfWork`).
3. API E2E Tests (`tests/e2e/`):
   - Test REST controllers with NestJS `Test.createTestingModule()`.
   - Verify response structure, guards, and error handling.
4. Execute via `npm test` (unit) or `npm run test:e2e` (E2E).
