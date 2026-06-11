import { Injectable, Inject } from '@nestjs/common';
import { OUTBOX_REPOSITORY, type IOutboxRepository } from '@/core/interfaces/repositories';
import { OutboxEntity } from '@/core/entities/outbox.entity';
import { LOGGER_SERVICE, type ILoggerService } from '@/application/interfaces';

@Injectable()
export class OutboxService {
  constructor(
    @Inject(OUTBOX_REPOSITORY)
    private readonly outboxRepository: IOutboxRepository,
    @Inject(LOGGER_SERVICE)
    private readonly logger: ILoggerService,
  ) {
    this.logger.setContext(OutboxService.name);
  }

  /**
   * Enqueue a message to be dispatched asynchronously via the Outbox pattern.
   * This should be called within a UnitOfWork/Transaction context to guarantee atomicity.
   */
  async enqueue(
    eventType: string,
    payload: any,
    metadata?: Record<string, unknown>,
    transport?: Record<string, unknown>,
    maxRetry: number = 5,
  ): Promise<void> {
    this.logger.debug(`Enqueuing outbox message for eventType: ${eventType}`, undefined, { payload });
    const outbox = OutboxEntity.create({
      eventType,
      payload,
      metadata: metadata ?? null,
      transport: transport ?? null,
      maxRetry,
    });

    await this.outboxRepository.save(outbox);
    this.logger.debug(`Successfully saved outbox message with ID: ${outbox.id}`);
  }

  /**
   * Bulk enqueue multiple messages.
   */
  async enqueueMany(
    messages: Array<{
      eventType: string;
      payload: any;
      metadata?: Record<string, unknown>;
      transport?: Record<string, unknown>;
      maxRetry?: number;
    }>,
  ): Promise<void> {
    this.logger.debug(`Bulk enqueuing ${messages.length} outbox messages`);
    const entities = messages.map(msg => OutboxEntity.create({
      eventType: msg.eventType,
      payload: msg.payload,
      metadata: msg.metadata ?? null,
      transport: msg.transport ?? null,
      maxRetry: msg.maxRetry,
    }));

    await this.outboxRepository.saveMany(entities);
    this.logger.debug(`Successfully saved ${entities.length} outbox messages`);
  }
}
