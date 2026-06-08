# Core Layer Principles

The **Core** layer is the heart of the system. It contains **pure domain logic** that is completely independent of any framework, database or external service. The goal is to model the business concepts and rules in a way that can be understood and tested without any infrastructure concerns.

## What belongs here?
| Category | Description |
|----------|-------------|
| **Aggregate Roots** | Entry points for the application. They encapsulate a cluster of related entities and value objects and enforce invariants. Examples: `CampaignRoot`, `UserRoot`.
| **Entities** | Objects with a stable identity (`id`). They are usually simple data holders used by aggregates. |
| **Value Objects** | Immutable objects compared by their values, not by identity. Used to model concepts like `Money`, `EmailAddress`, `KolPlatformInfo`.
| **Domain Exceptions** | Specific error types that represent business rule violations (e.g., `CampaignException`). |
| **Interfaces** | Contracts that outer layers must implement, such as repository interfaces (`ICampaignRepository`) and storage service interfaces.
| **Base Classes** | Reusable abstract classes (`BaseEntity`, `BaseAggregateRoot`, `BaseValueObject`, `BaseRepository`) that provide common functionality.
| **Enums & Types** | Domain‑specific enumerations (`ECampaignStatus`, `EParticipantStatus`) and shared TypeScript types.

## Key Principles
1. **Pure TypeScript** – No imports from NestJS, Mongoose, Express, etc.
2. **Encapsulation** – All business rules live inside aggregates. External code can only interact through the aggregate’s public methods.
3. **Immutability** – Value objects are immutable; any change results in a new instance.
4. **Single Responsibility** – Each class has one clear responsibility (e.g., an aggregate manages its own invariants, a repository only persists aggregates).
5. **Dependency Inversion** – The core defines *interfaces*; concrete implementations live in the Infrastructure layer.
6. **DI Token Convention** – For every interface that acts as a port (e.g., repository or service contract), a corresponding `Symbol` token should be exported alongside the interface to be used for NestJS dependency injection.

## How to use it
* **Application layer** obtains an aggregate via a repository interface, calls a method on the aggregate (e.g., `campaignRoot.updateStatus(...)`), and then persists the aggregate using the same repository.
* **Unit tests** can instantiate aggregates directly, call methods, and assert state without any database or framework setup.

## Example (simplified)
```ts
// src/core/aggregate-roots/campaign.aggregate.ts
export class CampaignRoot extends BaseAggregateRoot {
  private constructor(private props: CampaignProps) { super(); }

  static create(props: CampaignProps): CampaignRoot {
    // validate invariants
    if (props.budget <= 0) throw new CampaignException('Budget must be positive');
    return new CampaignRoot(props);
  }

  updateStatus(newStatus: ECampaignStatus) {
    // enforce allowed transitions
    if (!isValidTransition(this.props.status, newStatus)) {
      throw new CampaignException('Invalid status transition');
    }
    this.props.status = newStatus;
  }
}
```

The above class contains **no NestJS decorators**, no database calls, and can be unit‑tested in isolation.

---

For a full overview of the folder layout, see the **Core Layer** section in `architecture.md`.
