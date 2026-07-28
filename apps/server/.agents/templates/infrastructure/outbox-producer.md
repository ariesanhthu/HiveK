---
template: outbox-producer
placeholders: [DomainName, EventName, domainName, eventName]
generates: src/infrastructure/events/{{domainName}}-{{eventName}}.producer.ts
---

# Outbox Event Producer Template

Maps domain events to integration events and writes to Transactional Outbox.

## Code Blueprint

```typescript
// src/infrastructure/events/{{domainName}}-{{eventName}}.producer.ts
import { Injectable } from '@nestjs/common';
import { {{EventName}}Event } from '@/core/events/{{domainName}}-{{eventName}}.domain-event';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OutboxModel } from '@/infrastructure/mongo/schemas/outbox.schema';

@Injectable()
export class {{EventName}}Producer {
  constructor(
    @InjectModel(OutboxModel.name) private readonly outboxModel: Model<OutboxModel>,
  ) {}

  async produce(event: {{EventName}}Event, session?: unknown): Promise<void> {
    await this.outboxModel.create(
      [
        {
          event_type: event.eventType,
          payload: event.payload,
          status: 'pending',
        },
      ],
      { session },
    );
  }
}
```

## Post-Generation Checklist
- [ ] Uses `@/core/events/` path alias
- [ ] `session` parameter for transaction support
- [ ] Outbox schema from `@/infrastructure/mongo/schemas/`
- [ ] File in `src/infrastructure/events/`