---
domain: "{{DomainName}}"
generated-by: agent
last-updated: "{{CurrentDate}}"
status: draft # draft | reviewed | approved
---

# {{DomainName}} Domain Specification

## 1. Domain Overview

- **Purpose**: Describe business problem solved by {{DomainName}}.
- **Bounded Context**: Boundary and ownership.
- **Key Concepts**:

| Term | Definition | Ubiquitous Language Symbol |
|------|------------|----------------------------|

- **Relations**: Interactions with other domains.

## 2. Domain Layer

### Aggregate Root: `{{DomainName}}Root`
- **File**: `src/domain/aggregate-roots/{{domainName}}.root.ts`
- **Properties**:

| Property | Type | Description |
|----------|------|-------------|

- **Factory Methods**:
  - `static create(input)` — Enforces initial invariants
  - `static rehydrateProps(props)` — Reconstitutes aggregate from DB

- **Domain Methods**:
  - `updateStatus(newStatus)` — Triggers state transition and emits `{{DomainName}}StatusChangedEvent`.

### Entities
- `src/domain/entities/`

### Value Objects
- `src/domain/value-objects/`

### Enums
- `src/domain/enums/`

### Domain Events
- `src/domain/events/`

### Exceptions
- `src/domain/exceptions/`

### Repository Port
- `src/domain/ports/repositories/{{domainName}}.repository.port.ts`
- **DI Token**: `{{DOMAIN_NAME}}_REPOSITORY`

### Read Repository Port
- `src/domain/ports/repositories/read/{{domainName}}-read.repository.port.ts`
- **DI Token**: `{{DOMAIN_NAME}}_READ_REPOSITORY`

## 3. State Machines

```
┌──────────┐     activate()      ┌──────────┐
│  DRAFT   ├────────────────────►│  ACTIVE  │
└──────────┘                     └──────────┘
```

| From Status | To Status | Method | Guard Invariants |
|-------------|-----------|--------|------------------|

## 4. Applications Layer

### Commands (Write Path)
| Command | Handler | DTO | Description |
|---------|---------|-----|-------------|

### Queries (Read Path)
| Query | Handler | Read Repository | Description |
|-------|---------|--------------|-------------|

## 5. Infrastructure Layer

- **Schema**: `src/infrastructure/persistence/mongoose/schemas/{{domainName}}.schema.ts` (`{{domainName}}s` collection)
- **Repository Implementation**: `Mongo{{DomainName}}Repository`
- **Read Repository**: `Mongo{{DomainName}}ReadRepository`
- **Module**: `src/infrastructure/modules/{{domainName}}.module.ts`

## 6. API Layer

| Method | Path | Guards | Controller | Description |
|--------|------|--------|------------|-------------|

## 7. End-to-End Workflow Flows

### Flow 1: Create {{DomainName}}
```
gRPC Controller → Zod DTO → CommandBus → Handler (TxRunner) → {{DomainName}}Root.create() → Repo.save() → Outbox
```

## 8. File Map

| Layer | File Path |
|-------|-----------|
| Domain | `src/domain/aggregate-roots/{{domainName}}.root.ts` |
| Applications | `src/applications/commands/` |
| Infrastructure | `src/infrastructure/persistence/mongoose/schemas/{{domainName}}.schema.ts` |
| API | `src/api/grpc/` |

## 9. Key Invariants

1. State changes MUST occur through Aggregate Root methods.
2. Database writes and outbox events MUST be executed inside Transaction Runner.
3. Read queries MUST bypass Aggregate Roots and use Read Repository Ports.
