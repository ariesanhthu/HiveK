import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession } from 'mongoose';
import { IEventService } from '@/application/interfaces/event-service.interface';
import { DOMAIN_EVENT_MAPPER, type IDomainEventMapper } from '@/application/interfaces/domain-event-mapper.interface';
import { BaseAggregateRoot } from '@/core/common';
import { OutboxModel, EOutboxStatus } from '../mongo/schemas/outbox.schema';
import { OutboxEventEmitter } from './outbox/outbox-event.emitter';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/application/interfaces';

@Injectable()
export class EventService implements IEventService {
  constructor(
    @Inject(DOMAIN_EVENT_MAPPER)
    private readonly eventMapper: IDomainEventMapper,
    @InjectModel(OutboxModel.name)
    private readonly outboxModel: Model<OutboxModel>,
    private readonly outboxEmitter: OutboxEventEmitter,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
  ) {}

  async publishEvents(
    aggregate: BaseAggregateRoot<unknown> | BaseAggregateRoot<unknown>[],
  ): Promise<void> {
    const aggregates = Array.isArray(aggregate) ? aggregate : [aggregate];
    
    // Extract domain events and clear them from aggregates
    const domainEvents = aggregates.flatMap((agg) => {
      const events = [...agg.domainEvents];
      agg.clearDomainEvents();
      return events;
    });
    
    if (domainEvents.length === 0) return;

    const integrationEvents = this.eventMapper.mapToIntegrationEvents(domainEvents);
    if (integrationEvents.length === 0) return;

    // Convert integration events to Outbox Mongoose documents
    const outboxRows = integrationEvents.map(event => ({
      event_type: event.eventType,
      payload: event.payload,
      metadata: event.metadata ?? null,
      transport: event.transport ?? null,
      status: EOutboxStatus.PENDING,
      retry_count: 0,
      max_retry: 5,
      created_at: new Date(),
    }));

    const activeSession = this.uow.getSession?.();
    await this.outboxModel.insertMany(outboxRows, { session: activeSession as ClientSession });
    
    // Notify the outbox processor to run immediately
    this.outboxEmitter.emit();
  }
}
