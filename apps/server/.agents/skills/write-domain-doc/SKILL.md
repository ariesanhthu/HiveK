---
name: write-domain-doc
description: Generate or update comprehensive Clean Architecture domain documentation under docs/domains/<name>/domain.md. Supports two modes: 'generate' (new domain from business rules) and 'document' (scan existing codebase).
---

# Write Domain Documentation Skill

This skill creates or updates a domain specification in `docs/domains/<domain>/domain.md` following the 4-layer pattern (Core → Application → Infrastructure → Presentation).

## Modes of Operation

1. **`generate` mode** (New domain): Writes domain doc from user prompt/business description before code is generated. Frontmatter is set to `status: draft`.
2. **`document` mode** (Existing domain): Scans source code under `src/` to reverse-engineer and document implemented behavior. Frontmatter is set to `status: reviewed`.

## Document Frontmatter Format

```yaml
---
domain: Campaign
generated-by: agent
last-updated: 2026-07-23
status: draft # draft | reviewed | approved
---
```

## Mandatory 9-Section Structure

The generated document MUST contain these 9 sections:

```markdown
# {Domain} Domain Specification

## 1. Domain Overview
- **Purpose**: Business problem solved
- **Bounded Context**: Domain boundary and ownership
- **Key Concepts**: Table of core nouns and definitions
- **Relations**: Dependencies on other domains

## 2. Core Layer
- **Aggregate Root**: `{Domain}Root` (`src/core/aggregate-roots/<domain>.aggregate.ts`)
- **Entities**: Identifiable sub-components (`src/core/entities/`)
- **Value Objects**: Immutable attributes (`src/core/value-objects/`)
- **Enums**: Domain state and type enums (`src/core/enums/`)
- **Domain Events**: Internal facts raised by state changes (`src/core/events/`)
- **Exceptions**: Custom domain error classes (`src/core/exceptions/`)
- **Repository Port**: Interface definition (`src/core/interfaces/repositories/`)

## 3. State Machines
- **Diagram**: ASCII diagram of status transitions
- **Transition Table**:

| From Status | To Status | Trigger Method | Invariant Guard |
|-------------|-----------|----------------|-----------------|
| `DRAFT`     | `ACTIVE`  | `activate()`   | `assertHasItems()` |

## 4. Application Layer
- **Commands**: Write operations (`src/application/commands/`)
- **Queries**: Read operations (`src/application/queries/`)
- **Command Flow Diagram**:
```
Controller → Zod DTO → CommandBus → Handler (UoW) → Aggregate → Repo.save() → Events
```
- **Query Flow Diagram**:
```
Controller → QueryBus → Handler → ReadService (Mongoose Projection) → DTO
```

## 5. Infrastructure Layer
- **Mongoose Schema**: DB fields in `snake_case`, indexes, collection name
- **Repository Implementation**: `Mongo{Domain}Repository`
- **Read Service**: `Mongo{Domain}ReadService`
- **Module Wiring**: NestJS `@Module` with Symbol DI tokens (`{DOMAIN}_REPOSITORY`)

## 6. Presentation Layer
- **Controllers**: `AdminController`, `ClientController`
- **Endpoints Table**:

| Method | Path | Auth / Guards | Handler Method | Description |
|--------|------|---------------|----------------|-------------|

## 7. End-to-End Workflow Flows
- ASCII sequence diagrams for key user flows (e.g. Create, Transition Status, Process Action)

## 8. File Map
- Table listing every file involved across all 4 layers

## 9. Key Invariants
- Summary list of non-negotiable business rules
```

## Execution Steps

1. **Extract Domain Name**: PascalCase (e.g., `Campaign`, `Order`).
2. **Determine Mode**:
   - If `src/core/aggregate-roots/<domain>.aggregate.ts` exists → `document` mode.
   - If creating new domain → `generate` mode.
3. **Execute Mode Flow**:
   - **In `generate` mode**: Clone `templates/docs/domain.md` → `docs/domains/<domain>/domain.md`, fill sections from requirements, set `status: draft`.
   - **In `document` mode**: Scan all 4 layers under `src/`, extract properties and methods, fill sections, set `status: reviewed`.
4. **Update Glossary**: Append new ubiquitous language terms to `docs/architecture/glossary.md`.
