import { Injectable, Inject, Logger } from '@nestjs/common';
import { IMessageQueueService } from '@application/interfaces';
import { RawRabbitMQProducerClient } from './raw-rabbitmq-producer';
import type { RabbitMQProducerConfig } from '@infrastructure/nest-config/types/rabbitmq.types';

export const RABBITMQ_PRODUCER_CLIENT = 'RABBITMQ_PRODUCER_CLIENT';
export const RABBITMQ_CONFIG = 'RABBITMQ_CONFIG';

@Injectable()
export class RabbitMQService implements IMessageQueueService {
  private readonly logger = new Logger(RabbitMQService.name);

  constructor(
    @Inject(RABBITMQ_PRODUCER_CLIENT)
    private readonly producer: RawRabbitMQProducerClient,
    @Inject(RABBITMQ_CONFIG)
    private readonly config: RabbitMQProducerConfig,
  ) {}

  /**
   * Emit event to RabbitMQ exchange with routing key
   */
  async emit<TEvent = string, TData = any>(pattern: TEvent, data: TData): Promise<void> {
    try {
      const routingKey = this.resolveRoutingKey(pattern as string);
      this.logger.debug(
        `Emitting event "${pattern}" with routing key "${routingKey}": ${JSON.stringify(data)}`
      );
      await this.producer.publish(routingKey, data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to emit event "${pattern}": ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Send RPC request (not supported in direct exchange mode)
   * @deprecated Use emit() for event-based messaging instead
   */
  async send<TResult = any, TInput = any>(
    pattern: any,
    data: TInput
  ): Promise<TResult> {
    const errorMsg = 'RPC send() not supported. Use emit() for event-based messaging.';
    this.logger.error(errorMsg);
    throw new Error(errorMsg);
  }

  /**
   * Resolve event pattern to routing key from config
   */
  private resolveRoutingKey(pattern: string): string {
    const routingKey = this.config.routes[pattern];
    if (!routingKey) {
      this.logger.warn(
        `No routing key found for pattern "${pattern}", using pattern as routing key`
      );
      return pattern;
    }
    return routingKey;
  }

  /**
   * Get producer health status
   */
  isHealthy(): boolean {
    return this.producer.isHealthy();
  }
}
