---
description: CQRS pattern write-side commands vs read-side queries rules
---

# CQRS Rules

- **Write Side (Commands)**:
  - Modifies system state.
  - Executed via `CommandBus`.
  - Wrapped in Unit of Work (`IUnitOfWork`).
  - Interacts with Aggregate Roots and Repositories.
  - Emits Domain Events.
- **Read Side (Queries)**:
  - Read-only data retrieval.
  - Executed via `QueryBus`.
  - Bypasses Aggregate Roots and Unit of Work.
  - Queries Read Services / database projections directly.
  - Returns DTOs.
