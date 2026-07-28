---
template: aggregate
placeholders: [DomainName, domainName, DOMAIN_NAME]
generates: src/core/aggregate-roots/{{domainName}}.aggregate.ts
---

# {{DomainName}} Aggregate Root Template

Aggregate Root encapsulating state transitions, business invariants, and domain events.

## Code Blueprint

```typescript
// src/core/aggregate-roots/{{domainName}}.aggregate.ts
import { BaseAggregateRoot } from '@/core/common/base.aggregate-root';
import { E{{DomainName}}Status } from '@/core/enums/{{domainName}}-status.enum';
import { {{DomainName}}Exception } from '@/core/exceptions/{{domainName}}.exception';
import { {{DomainName}}StatusChangedEvent } from '@/core/events/{{domainName}}-status-changed.domain-event';

export interface {{DomainName}}Props {
  ownerId: string;
  status: E{{DomainName}}Status;
  // WHY: Props contain pure domain attributes only (no MongoDB _id or DB timestamps)
  createdAt: Date;
  updatedAt: Date;
}

export type {{DomainName}}CreateProps = Pick<{{DomainName}}Props, 'ownerId'> & Partial<Pick<{{DomainName}}Props, 'status'>>;

export class {{DomainName}}Root extends BaseAggregateRoot<{{DomainName}}Props> {
  protected constructor(props: {{DomainName}}Props, id?: string) {
    super(props, id);
  }

  // ---- Factory Methods ----

  // WHY: create() is used for instantiating new domain concepts. It enforces initial invariants.
  static create(input: {{DomainName}}CreateProps): {{DomainName}}Root {
    if (!input.ownerId) {
      throw new {{DomainName}}Exception('Owner ID is required', '{{DOMAIN_NAME}}_INVALID_OWNER');
    }
    const now = new Date();
    return new {{DomainName}}Root({
      ownerId: input.ownerId,
      status: input.status || E{{DomainName}}Status.DRAFT,
      createdAt: now,
      updatedAt: now,
    });
  }

  // WHY: instantiate() is used by Repositories to reconstitute existing aggregates from database storage.
  static instantiate(id: string, props: {{DomainName}}Props): {{DomainName}}Root {
    return new {{DomainName}}Root(props, id);
  }

  // ---- Getters ----

  get ownerId(): string {
    return this.props.ownerId;
  }

  get status(): E{{DomainName}}Status {
    return this.props.status;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // ---- Domain Methods ----

  updateStatus(newStatus: E{{DomainName}}Status): void {
    // WHY: Fail fast with private assertion guard
    this.assertValidStatusTransition(newStatus);

    const previousStatus = this.props.status;
    this.props.status = newStatus;
    this.props.updatedAt = new Date();

    // WHY: Record domain event on aggregate root for downstream side-effects
    this.addDomainEvent(
      new {{DomainName}}StatusChangedEvent(
        this.id!,
        previousStatus,
        newStatus,
      ),
    );
  }

  // ---- Private Guard Clauses ----

  private assertValidStatusTransition(newStatus: E{{DomainName}}Status): void {
    if (this.props.status === E{{DomainName}}Status.CANCELLED) {
      throw new {{DomainName}}Exception(
        'Cannot change status of cancelled {{domainName}}',
        '{{DOMAIN_NAME}}_CANCELLED',
      );
    }
  }
}
```

## Post-Generation Checklist
- [ ] Factory methods `create()` and `instantiate()` defined
- [ ] Business invariants guarded via fail-fast exceptions
- [ ] Domain events added via `this.addDomainEvent()`
- [ ] `protected constructor` (not public)
- [ ] Uses `@/core/` path alias
