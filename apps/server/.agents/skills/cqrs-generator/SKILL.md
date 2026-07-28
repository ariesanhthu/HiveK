---
name: cqrs-generator
description: Implements write-side commands and read-side queries with strict separation, Zod DTO validation, Transaction Runner session handling, and read repository projections. Use when creating a use case or when ADR selects CQRS.
---

# CQRS Generator Skill

## Instructions

1. Determine operation type:
   - **Command (Write)**: Modifies state, uses Aggregate Root, wrapped in `MongoTransactionRunnerPort.runInTransaction()`, saves via Repository Port, publishes domain events.
   - **Query (Read)**: Retrieves data, bypasses Aggregate Root, uses Read Repository Port directly, returns DTO, no Transaction Runner, no events.
2. Render the correct templates:
   - Commands → `.agents/templates/application/command-handler.md`
   - Queries → `.agents/templates/application/query-handler.md`
3. Ensure request DTOs are validated using Zod via `createZodDto()`.
4. Register handlers in target NestJS module providers array.

## Command Rules

| Aspect | Rule |
|--------|------|
| Transaction | Use `IUnitOfWork.execute()` for multi-repo operations, or direct `save()` for single-repo |
| Domain logic | Delegate to Aggregate Root methods (`create()`, `updateStatus()`, `softDelete()` etc) |
| Persistence | Use repository port `I{Name}Repository.save()` with UoW session |
| Events | Domain events are emitted via `this.addDomainEvent()` on aggregate root, processed by EventEmitter2 |
| Return | DTO (via mapper) or `void` |

## Query Rules

| Aspect | Rule |
|--------|------|
| Unit of Work | NEVER use — queries are read-only |
| Data access | Read Service Port (`I{Name}ReadService`) only — no Aggregate Roots |
| Events | NEVER publish events from queries |
| Return | DTO or DTO[] only |

## DTO Standards

- Input DTOs: Use `createZodDto(ZodSchema)` with `nestjs-zod`
- Output DTOs: Plain classes with Zod schemas using `z.iso.datetime()` for dates (not `z.date()`)
- Date fields must be serialized to ISO 8601 strings in mappers
