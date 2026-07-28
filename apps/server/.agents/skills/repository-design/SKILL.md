---
name: repository-design
description: Designs Mongoose database schemas, repository implementations, read repository ports, and Symbol DI token bindings.
---

# Repository Design Skill

## Instructions

1. Define repository port interface in Core layer (`src/core/interfaces/repositories/<name>.repository.ts`).
2. Export Symbol DI token in `SCREAMING_SNAKE_CASE` (e.g. `CAMPAIGN_REPOSITORY = Symbol('CAMPAIGN_REPOSITORY')`).
3. Define Read Service Port in Application layer (`src/application/interfaces/read-service/<name>.read-service.interface.ts`).
4. Define Mongoose Schema in Infrastructure layer (`src/infrastructure/mongo/schemas/<name>.schema.ts`) with `snake_case` fields.
5. Implement Mongo Repository (`src/infrastructure/mongo/repositories/<name>.repository.ts`):
   - Supports UoW session via `(this.uow as MongoUnitOfWork).getSession()`.
   - Maps bidirectional: Mongoose Document ↔ Aggregate Root using `mapToDomain()` and `mapToPersistence()`.
6. Implement Mongo Read Service (`src/infrastructure/mongo/read-services/<name>.read-service.ts`):
   - Returns DTOs directly without domain aggregates.
   - Uses `@InjectModel()` and optionally `@Inject(UNIT_OF_WORK)`.
