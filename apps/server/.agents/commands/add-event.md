---
name: add-event
description: Add a domain event or integration event with Transactional Outbox publishing or RabbitMQ consumer, including schema documentation in docs/domains/<x>/events.md.
---

# Command: add-event

## Intent
Add a domain event or integration event with Outbox transactional publishing or RabbitMQ consumption.

## Preconditions
- Domain name, event name (e.g. `CampaignCreated`), producer vs consumer context

## Steps
1. Activate [`event-designer`](../agents/event-designer.md) agent.
2. Read `docs/domains/<domain>/events.md`.
3. Run skill [`event-contract-design`](../skills/event-contract-design/SKILL.md).
4. Generate code from templates:
   - [`templates/domain/domain-event.md`](../templates/domain/domain-event.md) → `src/core/events/<event>.domain-event.ts`
   - [`templates/infrastructure/outbox-producer.md`](../templates/infrastructure/outbox-producer.md) → `src/infrastructure/events/<event>.producer.ts`
5. If consumer: generate message handler in `src/presentation/controllers/rmq/`.
6. Update `docs/domains/<domain>/events.md`.
7. Run [`after-generate.sh`](../hooks/after-generate.sh).

## Deliverables
- Typed Domain/Integration Event classes
- Outbox transaction publishing wiring
- Documented event schema in `docs/domains/<domain>/events.md`
