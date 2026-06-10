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
  async enqueue(topic: string, payload: any, maxRetry: number = 5): Promise<void> {
    this.logger.debug(`Enqueuing outbox message for topic: ${topic}`, undefined, { payload });
    const outbox = OutboxEntity.create({
      topic,
      payload,
      maxRetry,
    });

    await this.outboxRepository.save(outbox);
    this.logger.debug(`Successfully saved outbox message with ID: ${outbox.id}`);
  }

  /**
   * Bulk enqueue multiple messages.
   */
  async enqueueMany(messages: Array<{ topic: string; payload: any; maxRetry?: number }>): Promise<void> {
    this.logger.debug(`Bulk enqueuing ${messages.length} outbox messages`);
    const entities = messages.map(msg => OutboxEntity.create({
      topic: msg.topic,
      payload: msg.payload,
      maxRetry: msg.maxRetry,
    }));

    await this.outboxRepository.saveMany(entities);
    this.logger.debug(`Successfully saved ${entities.length} outbox messages`);
  }
}
