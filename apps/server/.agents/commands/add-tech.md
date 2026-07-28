---
name: add-tech
description: Integrate a new infrastructure technology (Redis, WebSocket, RabbitMQ, Cloudinary, etc.) into the codebase, documenting the decision in docs/tech/ and wiring the adapter.
---

# Command: add-tech

## Intent
Integrate a new infrastructure technology (Redis cache, WebSocket gateway, RabbitMQ broker, Cloudinary uploader) into the codebase.

## Preconditions
- Technology name, purpose, target module

## Steps
1. Activate [`architect`](../agents/architect.md) agent.
2. Read `docs/tech/stack.md` and `docs/architecture/service.md`.
3. Check rules in [`.agents/rules/frameworks/`](../rules/frameworks/) and [`dependency-rule`](../rules/global/dependency-rule.md).
4. Document the tech integration approach in `docs/tech/integrations.md`.
5. Generate infrastructure module and adapter under `src/infrastructure/`.
6. Bind adapter to a Domain layer interface port using NestJS Symbol DI token.
7. Run [`after-generate.sh`](../hooks/after-generate.sh).

## Deliverables
- Infrastructure module & adapter implementation
- Symbol DI token binding
- Updated `docs/tech/integrations.md`
