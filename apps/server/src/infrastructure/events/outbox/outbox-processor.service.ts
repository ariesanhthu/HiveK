import { Injectable, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  OutboxModel,
  OutboxDocument,
  EOutboxStatus,
} from '@/infrastructure/mongo/schemas/outbox.schema';
import {
  MESSAGE_QUEUE_SERVICE,
  type IMessageQueueService,
  UNIT_OF_WORK,
  type IUnitOfWork,
  LOGGER_SERVICE,
  type ILoggerService,
} from '@/application/interfaces';
import { errorMessage, toError } from '@/shared/utils';

@Injectable()
export class OutboxProcessorService {
  private isProcessing = false;

  constructor(
    @InjectModel(OutboxModel.name)
    private readonly outboxModel: Model<OutboxModel>,
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
   * Run immediately when triggered by the OutboxEventEmitter.
   */
  @OnEvent('outbox.new')
  async handleNewOutbox() {
    await this.process();
  }

  /**
   * Periodically poll the database for pending outbox messages and dispatch them.
   * Runs every 10 seconds by default.
   */
  @Cron(CronExpression.EVERY_10_SECONDS)
  async process() {
    if (this.isProcessing) {
      this.logger.debug(
        'Outbox processing is already in progress, skipping this tick.',
      );
      return;
    }
    this.isProcessing = true;

    try {
      const activeSession = this.uow.getSession?.() || undefined;
      const now = new Date();
      const pendingMessages = await this.outboxModel
        .find({
          status: EOutboxStatus.PENDING,
          $or: [
            { available_at: { $lte: now } },
            { available_at: { $exists: false } },
          ],
        })
        .sort({ created_at: 1 })
        .limit(20)
        .session(activeSession)
        .exec();

      if (pendingMessages.length === 0) {
        this.isProcessing = false;
        return;
      }

      this.logger.log(
        `Found ${pendingMessages.length} pending outbox messages.`,
      );

      for (const message of pendingMessages) {
        await this.dispatch(message);
      }
    } catch (error) {
      this.logger.error(
        'Error during outbox processing batch',
        toError(error).stack,
      );
    } finally {
      this.isProcessing = false;
    }
  }

  private async dispatch(message: OutboxDocument) {
    const activeSession = this.uow.getSession?.() || undefined;
    try {
      this.logger.debug(
        `Processing outbox message: ${message._id}`,
        undefined,
        { eventType: message.event_type },
      );

      // 1. Mark as processing to prevent other instances/concurrency issues
      message.status = EOutboxStatus.PROCESSING;
      await message.save({ session: activeSession });

      // 2. Dispatch to RabbitMQ
      if (message.transport && message.transport.routingKey) {
        await this.mqService.emit(
          message.transport.routingKey,
          message.payload,
        );
      } else {
        // Do not send if transport is not defined
        this.logger.debug('No transport defined for message', undefined, {
          messageId: message._id.toString(),
          eventType: message.event_type,
        });
      }

      // 3. Mark as done
      message.status = EOutboxStatus.DONE;
      message.processed_at = new Date();
      message.error_reason = undefined;
      await message.save({ session: activeSession });

      this.logger.log(
        `Successfully dispatched outbox message ${message._id} for eventType ${message.event_type}`,
      );
    } catch (error) {
      const reason = errorMessage(error);
      this.logger.warn(
        `Failed to dispatch outbox message ${message._id}: ${reason}`,
        undefined,
        {
          retryCount: message.retry_count,
          maxRetry: message.max_retry,
        },
      );

      // 4. Mark as failed (handles retry logic)
      message.retry_count += 1;
      message.error_reason = reason;
      if (message.retry_count >= message.max_retry) {
        message.status = EOutboxStatus.FAILED;
      } else {
        message.status = EOutboxStatus.PENDING; // Allow for retry
      }
      await message.save({ session: activeSession });
    }
  }
}
