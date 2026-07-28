---
description: Event-Driven architecture and Outbox pattern rules
---

# Event-Driven Architecture Rules

- Use Transactional Outbox pattern to guarantee eventual consistency between database state and message broker.
- Outbox events MUST be written in the same DB transaction as the Aggregate Root state change.
- Integration event schemas MUST be versioned and documented in `docs/domains/<domain>/events.md`.
- Message consumers MUST be idempotent.
