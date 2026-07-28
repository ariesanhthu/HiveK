---
trigger: always_on
description: Mandatory layer dependency rules for Clean / Hexagonal Architecture
---

# Layer Dependency Rule

## Core Rule

**Infrastructure / API → Applications → Domain**

Inner layers MUST NOT know about outer layers.

```
       ┌───────────────────────────┐
       │   Presentation Layer      │
       │  (Controllers, Resolvers, │
       │   Guards, Interceptors)   │
       └───────────┬───────────────┘
                   │
                   ▼
       ┌───────────────────────────┐
       │    Application Layer      │
       │  (Commands, Queries,      │
       │   Services, Events, DTOs) │
       └───────────┬───────────────┘
                   │
                   ▼
       ┌───────────────────────────┐
       │      Core Layer           │
       │  (Aggregates, Entities,   │
       │   VOs, Enums, Interfaces) │
       └───────────────────────────┘
                   ▲
                   │
       ┌───────────┴───────────────┐
       │   Infrastructure Layer    │
       │  (Mongo, Auth, RabbitMQ,  │
       │   Cloudinary, Mailer)     │
       └───────────────────────────┘
```

## Directives

1. **Core Layer (`src/core/`)**:
   - MUST contain pure domain logic only (Aggregates, Entities, Value Objects, Domain Events, Exceptions, Ports).
   - MUST NOT import NestJS, Mongoose, Express, Fastify, HTTP, or infrastructure libraries.
   - Prefixed with `@core/` path alias.
2. **Application Layer (`src/application/`)**:
   - MUST depend only on Core layer types and Port interfaces.
   - MUST NOT import concrete Mongoose repositories, API controllers, or HTTP server libraries.
   - Prefixed with `@application/` path alias.
3. **Infrastructure Layer (`src/infrastructure/`)**:
   - Implements ports declared in Core layer (Repositories, Mailers, Sockets, Event Bus).
   - MUST NOT be imported directly by Core or Presentation layers.
   - Prefixed with `@infrastructure/` path alias.
4. **Presentation Layer (`src/presentation/`)**:
   - Thin REST/GraphQL/WebSocket/RMQ controllers that parse request DTOs and dispatch Commands/Queries.
   - MUST NOT bypass Application layer to execute raw database queries or access Core aggregates directly.
   - Prefixed with `@presentation/` path alias.
5. **Shared Module (`src/shared/`)**:
   - Pure utilities (no framework imports).
   - Used by all layers.
   - Prefixed with `@shared/` path alias.
