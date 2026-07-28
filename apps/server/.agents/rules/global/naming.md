---
trigger: always_on
description: Naming conventions for classes, interfaces, files, and DI tokens
---

# Naming Conventions

## Class & File Naming Matrix

| Artifact | Class Pattern | File Pattern | Directory |
|----------|--------------|--------------|-----------|
| Aggregate Root | `{Name}Root` | `<name>.aggregate.ts` | `src/core/aggregate-roots/` |
| Entity | `{Name}Entity` | `<name>.entity.ts` | `src/core/entities/` |
| Value Object | `{Name}Vo` | `<name>.vo.ts` | `src/core/value-objects/` |
| Domain Event | `{Name}Event` | `<name>.domain-event.ts` | `src/core/events/` |
| Enum | `E{Name}` | `<name>.enum.ts` | `src/core/enums/` |
| Exception | `{Name}Exception` | `<name>.exception.ts` | `src/core/exceptions/` |
| Repository Port | `I{Name}Repository` | `<name>.repository.ts` | `src/core/interfaces/repositories/` |
| Read Service Port | `I{Name}ReadService` | `<name>.read-service.interface.ts` | `src/application/interfaces/read-service/` |
| Command | `{Feature}Command` | `<feature>.command.ts` | `src/application/commands/<feature>/` |
| Command Handler | `{Feature}CommandHandler` | `<feature>.handler.ts` | `src/application/commands/<feature>/` |
| Query | `{Feature}Query` | `<feature>.query.ts` | `src/application/queries/<feature>/` |
| Query Handler | `{Feature}QueryHandler` | `<feature>.handler.ts` | `src/application/queries/<feature>/` |
| DTO (command-level) | `{Feature}InputDto` | `<feature>.dto.ts` | `src/application/commands/<feature>/` |
| DTO (shared) | `{Feature}Dto` | `<feature>.dto.ts` | `src/application/dtos/` |
| Repository Impl | `Mongo{Name}Repository` | `<name>.repository.ts` | `src/infrastructure/mongo/repositories/` |
| Read Service Impl | `Mongo{Name}ReadService` | `<name>.read-service.ts` | `src/infrastructure/mongo/read-services/` |
| Mongoose Schema | `{Name}Model` / `{Name}Schema` | `<name>.schema.ts` | `src/infrastructure/mongo/schemas/` |
| REST Controller (admin) | `{Name}AdminController` | `<name>.controller.ts` | `src/presentation/controllers/http/admin/` |
| REST Controller (client) | `{Name}ClientController` | `<name>.controller.ts` | `src/presentation/controllers/http/client/` |
| GraphQL Resolver | `{Name}Resolver` | `<name>.resolver.ts` | `src/presentation/controllers/resolvers/` |
| RMQ Controller | `{Name}RmqController` | `<name>.rmq.controller.ts` | `src/presentation/controllers/rmq/` |

## Symbol Dependency Injection Tokens

Every port interface used in NestJS DI must export a `Symbol` constant in `SCREAMING_SNAKE_CASE`:

```typescript
// Repository tokens (defined in src/core/interfaces/repositories/)
export const CAMPAIGN_REPOSITORY = Symbol('CAMPAIGN_REPOSITORY'); 
export const USER_REPOSITORY = Symbol('IUserRepository');

// Application service tokens (defined in src/application/interfaces/)
export const UNIT_OF_WORK = Symbol('IUnitOfWork');
export const EVENT_SERVICE = Symbol('IEventService');
export const AUTH_JWT_SERVICE = Symbol('AUTH_JWT_SERVICE');

// Read service tokens (defined in src/application/interfaces/read-service/)
export const CAMPAIGN_READ_SERVICE = Symbol('CAMPAIGN_READ_SERVICE');
```

## Path Aliases

Use TypeScript path aliases defined in `tsconfig.json`:

| Alias | Maps To |
|-------|---------|
| `@/*` | `src/*` |
| `@core/*` | `src/core/*` |
| `@application/*` | `src/application/*` |
| `@infrastructure/*` | `src/infrastructure/*` |
| `@presentation/*` | `src/presentation/*` |
| `@shared/*` | `src/shared/*` |

## Database Schema Fields

Database schema fields (Mongoose props) MUST use `snake_case` in database storage while mapping to `camelCase` in TS properties.

Example from project:
```typescript
// Mongoose schema uses snake_case for DB field names
@Prop({ required: true, name: 'owner_id' })
ownerId: string;  // TS property is camelCase
```
