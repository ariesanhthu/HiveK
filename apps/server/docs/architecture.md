# Clean Architecture, DDD, & CQRS Convention

This document outlines the architecture, layer constraints, and implementation details for the `apps/server` project. It aims to maintain a strict separation of concerns following Clean Architecture, Domain-Driven Design (DDD), and CQRS principles.

The architectural layers dependency diagram:
`Infrastructure <-> Presentation -> Application -> Core`

**Rule of Dependency**: Inner layers MUST NOT know about outer layers.

---

## 1. Core Layer (`src/core`)
The innermost layer. It encapsulates enterprise-wide business rules and domain knowledge. Completely isolated from any frameworks, libraries (like NestJS or Mongoose), or external dependencies.

### Constraints & Implementation Details:
*   **Aggregate Roots (`core/aggregates` or `core/entities`)**:
    *   The **only entry point** for the Application layer to interact with the domain.
    *   Encapsulates multiple related Entities and Value Objects to maintain transactional consistency boundaries.
    *   The Application layer MUST ONLY touch and manipulate Aggregate Roots directly, never inner child Entities.
*   **Entities (`core/entities`)**: 
    *   Must extend the abstract `BaseEntity` class.
    *   Have identity (an `id`).
    *   Implement two main creation methods:
        *   `create(props)`: Static factory method. Used when creating a completely *new* entity.
        *   `constructor(id, props)`: Instantiates an entity that already exists in the system.
*   **Value Objects (`core/value-objects`)**:
    *   Must extend the abstract `BaseValueObject` class.
    *   Compared solely by value, no identity (`id`).
*   **Exceptions (`core/exceptions`)**:
    *   Domain-specific custom exceptions (e.g., `UserNotFoundException`).
*   **Interfaces (`core/interfaces`)**:
    *   Define contracts for Repositories and external services.
    *   **Repositories MUST return and save Aggregate Roots**.
    *   Dependency Injection Tokens: Inject using exported `Symbols`.

---

## 2. Application Layer (`src/application`)
Contains application-specific business rules. **We strictly apply the CQRS (Command Query Responsibility Segregation) pattern in this layer.**

### Constraints & Implementation Details:
*   **CQRS Segregation**:
    *   Use-cases are heavily split into **Commands** (Write operations) and **Queries** (Read operations).
*   **Commands (`application/commands`)**:
    *   Execute mutations and complex state changes.
    *   **Must use the Core Layer (Aggregate Roots + Repositories)** to enforce business rules.
    *   Must rely on the **Unit of Work (UoW)** pattern for transactional consistency across multiple repository actions.
*   **Queries & ReadServices (`application/queries` & `application/interfaces`)**:
    *   **Queries DO NOT use Aggregate Roots or Repositories**.
    *   This layer defines `I<Name>ReadService` interfaces (e.g., `IUserReadService`).
    *   These ReadServices are used purely for querying data and return **DTOs directly**. They completely bypass the Core Domain for maximum read performance and prevent domain logic bloat.
*   **DTOs (`application/dtos`)**:
    *   Data Transfer Objects strictly defining the shapes of inputs and outputs.
    *   Validation is performed using **Zod**.
*   **Mappers (`application/mappers`)**:
    *   Used purely to map from Domain `Aggregate Root` to Application `DTO` responses (Usually for Command responses).

---

## 3. Infrastructure Layer (`src/infrastructure`)
The outermost layer corresponding to I/O operations. 

### Constraints & Implementation Details:
*   **Repositories (`infrastructure/repositories/<db-name>`)**:
    *   Implement domain Repository interfaces.
    *   Handle translating DB documents ONLY into complete **Aggregate Roots** (and vice-versa).
*   **ReadService Implementations (`infrastructure/read-services`)**:
    *   Implement the `I<Name>ReadService` defined in the Application layer.
    *   Make highly optimized, database-specific queries (e.g., Mongoose aggregations, `.lean()`) that map directly into DTOs.
    *   Skip Domain model hydration entirely.
*   **Database Mappers (`infrastructure/repositories/<db-name>/mappers`)**:
    *   Handle `Document -> Aggregate Root` and `Aggregate Root -> Document`.
*   **Unit of Work Implementation (`infrastructure/common/uow`)**:
    *   Contains the concrete implementation of the `IUnitOfWork` interface (e.g., Mongoose `ClientSession` management).
*   **Modules (`infrastructure/modules`)**:
    *   NestJS specific configuration modules digesting all implementations.

---

## 4. Presentation Layer (`src/presentation`)
Responsible for delivering the application to external actors.

### Constraints & Implementation Details:
*   **Controllers (`presentation/controllers`)**:
    *   Delegate execution strictly to Command Handlers or Query Handlers.
    *   Do *not* contain business logic.
    *   Apply Zod validation pipes to incoming payloads.
*   **Middleware/Filters (`presentation/middleware`)**:
    *   Global exception filters that transform `core/exceptions` to HTTP error responses.

---

## 5. Shared Module (`src/shared`)
A cross-cutting layer used across all other layers to reduce boilerplate. 

### Constraints & Implementation Details:
*   **Must remain absolutely pure.** No dependencies on frameworks or infrastructure.
*   Contains only generic TypeScript utilities (`Nullable`, `Optional`), global constants, and simple helpers.
*   Does not contain business logic.
