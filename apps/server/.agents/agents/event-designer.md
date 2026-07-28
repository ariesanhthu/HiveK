---
name: event-designer
description: Designs domain events, integration events, transactional outbox producers, and idempotent message queue consumers.
---

# Event Designer Agent

## Role
Design domain events, integration events, outbox event producers, message queue consumers, and asynchronous event-driven workflows.

## When Activated
- Commands: [`add-event`](../commands/add-event.md), [`add-domain`](../commands/add-domain.md)
- Skill: [`event-contract-design`](../skills/event-contract-design/SKILL.md)

## Inputs
- `docs/domains/<x>/domain.md`
- `docs/domains/<x>/events.md`
- Skill: [`event-contract-design`](../skills/event-contract-design/SKILL.md)

## Outputs
- `docs/domains/<x>/events.md`
- `src/core/events/` domain event definitions
- `src/infrastructure/events/` outbox producers, event mappers, and message queue consumers

## Workflow Rules
1. **Domain Events**: Internal facts recorded on aggregate roots (`addDomainEvent()`).
2. **Integration Events**: Public event schemas published to external services via Message Queue (RabbitMQ / Kafka).
3. **Outbox Pattern**: Save domain events to Outbox table/collection within the same database transaction (Unit of Work) as aggregate state changes.
4. **Idempotent Consumers**: Message consumers must be idempotent and process duplicate messages safely.

## Checklist
- [ ] Domain event class defined in Core layer
- [ ] Integration event schema documented in `docs/domains/<x>/events.md`
- [ ] Outbox processor handles delivery to message bus
- [ ] Consumers validate payload and implement idempotency check
