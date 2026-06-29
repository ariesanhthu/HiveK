import { Injectable, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OUTBOX_REPOSITORY, type IOutboxRepository } from '@/core/interfaces/repositories';
import { MESSAGE_QUEUE_SERVICE, type IMessageQueueService, UNIT_OF_WORK, type IUnitOfWork, LOGGER_SERVICE, type ILoggerService } from '@/application/interfaces';
import { OutboxEntity } from '@/core/entities/outbox.entity';
import { errorMessage, toError } from '@/shared/utils';

@Injectable()
export class OutboxProcessorService {
  private isProcessing = false;

  constructor(
    @Inject(OUTBOX_REPOSITORY)
    private readonly outboxRepository: IOutboxRepository,
    @Inject(MESSAGE_QUEUE_SERVICE)
    private readonly mqService: IMessageQueueService,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
    @Inject(LOGGER_SERVICE)
    private readonly logger: ILoggerService,
  ) {
    this.logger.setContext(OutboxProcessorService.name);
  }

  /**
   * Periodically poll the database for pending outbox messages and dispatch them.
   * Runs every 10 seconds by default.
   */
  @Cron(CronExpression.EVERY_10_SECONDS)
  async process() {
    if (this.isProcessing) {
      this.logger.debug('Outbox processing is already in progress, skipping this tick.');
      return;
    }
    this.isProcessing = true;

    try {
      const pendingMessages = await this.outboxRepository.findPending(20); // Process batch of 20
      if (pendingMessages.length === 0) {
        this.isProcessing = false;
        return;
      }

      this.logger.log(`Found ${pendingMessages.length} pending outbox messages.`);

      for (const message of pendingMessages) {
        await this.dispatch(message);
      }
    } catch (error) {
      this.logger.error('Error during outbox processing batch', toError(error).stack);
    } finally {
      this.isProcessing = false;
    }
  }

  private async dispatch(message: OutboxEntity) {
    try {
      this.logger.debug(`Processing outbox message: ${message.id}`, undefined, { eventType: message.eventType });

      // 1. Mark as processing to prevent other instances/concurrency issues
      message.markAsProcessing();
      await this.outboxRepository.save(message);

      // 2. Dispatch to RabbitMQ
      if (message.transport && message.transport.routingKey) {
        await (this.mqService.emit)(message.transport.routingKey, message.payload);
      } else {
        // Do not send if transport is not defined
        this.logger.debug('No transport defined for message', undefined, { messageId: message.id, eventType: message.eventType });
      }

      // 3. Mark as done
      message.markAsDone();
      await this.outboxRepository.save(message);
      
      this.logger.log(`Successfully dispatched outbox message ${message.id} for eventType ${message.eventType}`);
    } catch (error) {
      const reason = errorMessage(error);
      this.logger.warn(`Failed to dispatch outbox message ${message.id}: ${reason}`, undefined, { 
        retryCount: message.retryCount,
        maxRetry: message.maxRetry 
      });
      
      // 4. Mark as failed (handles retry logic internally)
      message.markAsFailed(reason);
      await this.outboxRepository.save(message);
    }
  }
}
