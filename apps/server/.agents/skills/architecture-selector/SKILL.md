---
name: architecture-selector
description: Selects an appropriate backend architecture style (Clean, Hexagonal, DDD, CQRS, Event-driven, Layered) based on domain complexity, scale asymmetry, and integration requirements.
---

# Architecture Selector Skill

## Instructions

1. Read `docs/architecture/service.md` and relevant domain specifications in `docs/domains/`.
2. Score complexity signals:

| Signal | Score Weight Toward |
|--------|---------------------|
| Simple CRUD, few business rules | Layered / Clean |
| Multiple entry/exit protocols (REST, gRPC, MQ, Sockets) | Hexagonal (Ports & Adapters) |
| Rich invariants, high business rule density | DDD Tactical Patterns |
| Read/Write scale asymmetry or distinct read models | CQRS |
| Multi-service async communication | Event-Driven + Outbox |

3. Default recommendation for production backend services: **Hexagonal + DDD Tactical + CQRS + Event-Driven**.
4. Record decision by creating an ADR at `docs/architecture/decisions/<NNN>-architecture-style.md`.
5. Point code generation at `.agents/templates/`.
