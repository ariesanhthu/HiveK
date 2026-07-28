---
name: uow-outbox
description: You are a Transactional Integrity & Event-Driven Architecture specialist. Your goal is to implement the Transaction Runner pattern and Outbox pattern for reliable event delivery across service boundaries.
category: infrastructure
displayName: UoW & Outbox Expert
bundle: [infrastructure-persistence]
---

# UoW & Outbox Pattern (Project Adaptation)

This skill adapts the Transaction Runner and Outbox pattern to the HiveK project.

## Unit of Work (MongoDB Transactions)

### How It Works

The project uses `IUnitOfWork` with `AsyncLocalStorage`-based session propagation. Sessions are NOT passed explicitly to repository methods — they are retrieved internally via `(this.uow as MongoUnitOfWork).getSession()`.

```typescript
// src/application/interfaces/uow.interface.ts
export const UNIT_OF_WORK = Symbol('IUnitOfWork');

export interface IUnitOfWork {
  execute<T>(operation: () => Promise<T>): Promise<T>;
}
```

### Usage in Handlers

```typescript
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UNIT_OF_WORK } from '@/application/interfaces';
import type { IUnitOfWork } from '@/application/interfaces';

@CommandHandler(AssetCreateCommand)
export class AssetCreateCommandHandler implements ICommandHandler<AssetCreateCommand> {
  constructor(
    @Inject(ASSET_REPOSITORY) private readonly repo: IAssetRepository,
    @Inject(UNIT_OF_WORK) private readonly uow: IUnitOfWork,
  ) {}

  async execute(command: AssetCreateCommand): Promise<AssetDto> {
    return this.uow.execute(async () => {
      const aggregate = AssetRoot.create(command.props);
      await this.repo.save(aggregate);
      // Domain events emitted via aggregate.addDomainEvent()
      return asset.id!;
    });
  }
}
```

### Key Rules

1. Multi-repo write operations should use `this.uow.execute()`.
2. Session is automatically propagated via `AsyncLocalStorage` — no explicit passing.
3. Repositories get session via `(this.uow as MongoUnitOfWork).getSession()`.
4. Read operations (queries) do NOT use Unit of Work.

## Outbox Pattern (Reliable Event Delivery via RabbitMQ)

The project uses the Transactional Outbox pattern to guarantee reliable event delivery: domain events are persisted as outbox records in MongoDB within the same Unit of Work transaction, then dispatched asynchronously to RabbitMQ.

### Flow

```
1. Handler saves aggregate (inside UoW)
2. Handler calls eventService.publishEvents(aggregate) — or, aggregate emits domain events via this.addDomainEvent()
3. EventService:
   a. Extracts domain events from aggregate(s)
   b. Maps them to integration events via DomainEventMapper
   c. Inserts outbox records into MongoDB (same UoW session!)
4. OutboxProcessorService (push via @OnEvent('outbox.new') + pull via @Cron every 10s):
   a. Reads pending outbox records (sorted, limited to 20)
   b. Dispatches to RabbitMQ via IMessageQueueService.emit(routingKey, payload)
   c. Marks as DONE (or FAILED after max_retry attempts)
5. RMQ consumers receive and process
```

### Outbox Schema (`src/infrastructure/mongo/schemas/outbox.schema.ts`)

```typescript
{
  event_type: string,       // e.g., 'campaign.created'
  payload: object,           // integration event data
  metadata: object | null,   // optional metadata (e.g., { deliverAt })
  transport: {               // RabbitMQ routing info
    routingKey: string,
    exchange?: string,
  } | null,
  status: 'pending' | 'processing' | 'done' | 'failed',
  retry_count: number,       // starts at 0
  max_retry: number,         // 5
  created_at: Date,
  available_at: Date,        // delayed delivery support
  processed_at: Date | null,
  error_reason: string | null,
}
```

### Event Service (`src/infrastructure/events/event.service.ts`)

```typescript
async publishEvents(
  aggregate: BaseAggregateRoot<unknown> | BaseAggregateRoot<unknown>[],
): Promise<void> {
  const aggregates = Array.isArray(aggregate) ? aggregate : [aggregate];
  const domainEvents = aggregates.flatMap(agg => {
    const events = [...agg.domainEvents];
    agg.clearDomainEvents();
    return events;
  });
  if (domainEvents.length === 0) return;

  const integrationEvents = this.eventMapper.mapToIntegrationEvents(domainEvents);
  if (integrationEvents.length === 0) return;

  const activeSession = this.uow.getSession?.();
  await this.outboxModel.insertMany(outboxRows, { session: activeSession });
}
```

### Key Rules

1. Call `eventService.publishEvents(aggregate)` after aggregate save inside `uow.execute()`.
2. `publishEvents` auto-extracts events from aggregate and clears them.
3. Outbox records share the same MongoDB transaction as the aggregate save.
4. OutboxProcessorService processes via both push (event emitter) and pull (cron every 10s).
5. Failed messages retry up to `max_retry` times before being marked as `failed`.
6. The `IMessageQueueService` interface abstracts the RabbitMQ client.

### See Also

- `src/infrastructure/events/event.service.ts` — EventService implementation
- `src/infrastructure/events/outbox/outbox-processor.service.ts` — OutboxProcessorService
- `src/infrastructure/events/domain-event.mapper.ts` — DomainEventMapper
- `src/infrastructure/rabbitmq/` — RabbitMQ integration