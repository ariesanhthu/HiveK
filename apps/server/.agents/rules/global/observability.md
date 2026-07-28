---
trigger: always_on
description: Structured logging, correlation IDs, and metrics requirements
---

# Observability Rules

## Structured Logging

- Log in JSON format in production.
- Every log entry MUST include:
  - `timestamp` (ISO 8601)
  - `level` (`info`, `warn`, `error`, `debug`)
  - `correlationId` / `traceId` (propagated via `AsyncLocalStorage` middleware)
  - `domain` or `context` module name

## Correlation ID Propagation

- Propagate `x-correlation-id` header across HTTP requests, transactional outbox events, and RabbitMQ message headers.
- Include `correlationId` when executing Unit of Work transactions.
