# Architecture Decision Record (ADR)

## Title: 001 — Clean Architecture + DDD + CQRS + Event-Driven

- **Status**: Accepted
- **Date**: 2026-07-28
- **Author**: HiveK Engineering

## Context
The HiveK platform requires a backend architecture that can handle:
- Complex domain logic (campaign lifecycle, KOL recruitment, billing)
- Multiple entry points (REST, GraphQL, WebSocket, RMQ consumers)
- Read/write asymmetry (complex queries vs. transactional writes)
- Event-driven integrations (notifications, email, social posting)
- Future extraction into microservices

## Decision
Adopt a **Clean Architecture** with **DDD Tactical Patterns** + **CQRS** + **Event-Driven** approach:

- **Core Layer** (`src/core/`): Pure domain logic — aggregates, entities, value objects, domain events, repository interfaces. Zero framework dependencies.
- **Application Layer** (`src/application/`): CQRS commands/queries, mappers, DTOs, application services, event handlers.
- **Infrastructure Layer** (`src/infrastructure/`): Framework adapters — Mongoose schemas + repositories, RabbitMQ, JWT, Cloudinary, Mailer.
- **Presentation Layer** (`src/presentation/`): REST controllers, GraphQL resolvers, WebSocket gateways, RMQ controllers, guards, interceptors.

Key patterns:
- Aggregate Roots as transactional boundaries
- Repository pattern with Unit of Work for atomicity
- Transactional Outbox for reliable event delivery
- Read Services bypassing aggregates for optimized queries

## Consequences
### Positive
- Clear separation of concerns and testability
- Domain logic remains framework-agnostic
- CQRS enables independent optimization of read/write paths
- Outbox pattern guarantees at-least-once event delivery

### Negative / Trade-offs
- Higher initial complexity vs. simple CRUD approach
- More files per feature (command, handler, dto, schema, etc.)
- Requires disciplined enforcement of layer boundaries

## Compliance
Agents and engineers must follow this ADR unless explicitly superseded by a newer ADR.
