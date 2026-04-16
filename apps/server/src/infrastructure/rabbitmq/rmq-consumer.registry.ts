import { SetMetadata } from '@nestjs/common';

export const RMQ_HANDLER_METADATA = 'RMQ_HANDLER_METADATA';

export interface RmqHandlerOptions {
  queue: string;
  pattern: string;
}

/**
 * Decorator to register a method as a RabbitMQ message handler
 */
export const RmqHandler = (options: RmqHandlerOptions) =>
  SetMetadata(RMQ_HANDLER_METADATA, options);

export interface RmqHandlerMetadata extends RmqHandlerOptions {
  target: any;
  methodName: string;
  callback: Function;
}

/**
 * Registry to store all discovered RMQ handlers
 */
export class RmqHandlerRegistry {
  private static handlers: RmqHandlerMetadata[] = [];

  static register(metadata: RmqHandlerMetadata) {
    this.handlers.push(metadata);
  }

  static getHandlersForQueue(queueName: string): RmqHandlerMetadata[] {
    return this.handlers.filter((h) => h.queue === queueName);
  }

  static getAllHandlers(): RmqHandlerMetadata[] {
    return this.handlers;
  }
}
