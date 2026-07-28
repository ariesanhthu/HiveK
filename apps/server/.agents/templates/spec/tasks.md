---
template: tasks
placeholders: [FeatureName, FeatureNumber]
generates: specs/{{FeatureNumber}}-{{featureName}}/tasks.md
---

# Tasks Checklist: {{FeatureName}}

**Feature**: `specs/{{FeatureNumber}}-{{featureName}}`

> ⚠️ **Execution Rule**: The agent MUST update this file immediately (mark `[x]`) after completing each individual granular task item before moving to the next item.

## Phase 1: Domain Layer
- [ ] Task 1.1: Define domain status enum in `src/domain/enums/`
- [ ] Task 1.2: Implement Value Objects in `src/domain/value-objects/`
- [ ] Task 1.3: Implement Domain Entities in `src/domain/entities/`
- [ ] Task 1.4: Implement Aggregate Root `create()` & domain methods in `src/domain/aggregate-roots/`
- [ ] Task 1.5: Define Domain Events in `src/domain/events/`
- [ ] Task 1.6: Define Repository Port & Symbol DI token in `src/domain/ports/repositories/`
- [ ] Task 1.7: Define Read Repository Port in `src/domain/ports/repositories/read/`

## Phase 2: Applications Layer
- [ ] Task 2.1: Define Command class & Zod DTO schema
- [ ] Task 2.2: Implement Command Handler with Transaction Runner wrap
- [ ] Task 2.3: Define Query class & Query Handler with Read Repository projection
- [ ] Task 2.4: Implement DTO Mappers

## Phase 3: Infrastructure & API
- [ ] Task 3.1: Define Mongoose Schema in `src/infrastructure/persistence/mongoose/schemas/`
- [ ] Task 3.2: Implement Mongo Repository Adapter in `src/infrastructure/persistence/mongoose/repositories/`
- [ ] Task 3.3: Implement Mongo Read Repository in `src/infrastructure/persistence/mongoose/repositories/`
- [ ] Task 3.4: Wire providers & Symbol DI tokens in Feature Module `src/infrastructure/modules/`
- [ ] Task 3.5: Implement gRPC Controller with guards in `src/api/grpc/`

## Phase 4: Verification & Docs Convergence
- [ ] Task 4.1: Write Domain & Handler unit tests
- [ ] Task 4.2: Execute `.agents/hooks/after-generate.sh` boundary validations
- [ ] Task 4.3: Sync domain state back to `docs/domains/` and set `spec.md` status to completed
