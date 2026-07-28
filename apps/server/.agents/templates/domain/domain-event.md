---
template: domain-event
placeholders: [EventName, eventName]
generates: src/core/events/{{eventName}}.domain-event.ts
---

# {{EventName}} Domain Event Template

Domain Event captured during aggregate state change.

## Code Blueprint

```typescript
// src/core/events/{{eventName}}.domain-event.ts
import { EAggregateType } from '@/core/enums/aggregate-type.enum';
import { DomainEvent } from '@/core/common/base.domain-event';

export interface {{EventName}}Payload {
  previousStatus: string;
  newStatus: string;
}

export class {{EventName}}Event extends DomainEvent<{{EventName}}Payload> {
  readonly eventType = '{{eventName}}';
  readonly aggregateType = EAggregateType.{{AGGREGATE_TYPE}};

  constructor(assetId: string, previousStatus: string, newStatus: string) {
    super(assetId, { previousStatus, newStatus });
  }
}
```

## Post-Generation Checklist
- [ ] Extends `DomainEvent<Payload>`
- [ ] `eventType` and `aggregateType` readonly properties
- [ ] File named `<name>.domain-event.ts` in `src/core/events/`
- [ ] Uses `@/core/` path alias
