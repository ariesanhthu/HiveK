---
name: event-contract-design
description: Designs domain events, integration events, transactional outbox producers, and idempotent message queue consumers.
---

# Event Contract Design Skill

## Instructions

1. Distinguish event scopes:
   - **Domain Event**: Internal fact in Core layer (`src/core/events/<name>.domain-event.ts`).
   - **Integration Event**: Public contract sent via Outbox + RabbitMQ (`src/infrastructure/events/`).
2. Implement Outbox pattern:
   - Domain event mapped to Integration Event via `DomainEventMapper`.
   - Inserted into `outbox` collection within the aggregate's IUnitOfWork session.
   - Delivered to RabbitMQ by `OutboxProcessorService` (cron every 10s + event-driven).
3. Render templates:
   - Event class: `.agents/templates/domain/domain-event.md`
   - Outbox producer: `.agents/templates/infrastructure/outbox-producer.md`
4. Document event contracts in `docs/domains/<domain>/events.md`.
