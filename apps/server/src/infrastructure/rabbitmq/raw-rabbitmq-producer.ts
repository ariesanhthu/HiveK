import * as amqp from 'amqplib';
import { RabbitMQProducerConfig } from '@infrastructure/nest-config/types/rabbitmq.types';
import { randomUUID } from 'crypto';
import { ILoggerService } from '@/application/interfaces';
import { Logger } from '@nestjs/common';

/**
 * Raw RabbitMQ Producer Client using amqplib
 * Handles direct AMQP connection, channel management, and message publishing
 */
export class RawRabbitMQProducerClient {
  private connection: amqp.Connection | null = null;
  private channel: amqp.ConfirmChannel | null = null;
  private isConnected = false;
  private connectionAttempts = 0;
  private readonly config: RabbitMQProducerConfig;
  private readonly logger: ILoggerService

  constructor(config: RabbitMQProducerConfig, logger: ILoggerService) {
    this.config = config;
    this.logger = logger;
    this.logger.setContext(RawRabbitMQProducerClient.name)
  }

  /**
   * Connect to RabbitMQ and declare exchange
   */
  async connect(): Promise<void> {
    if (this.isConnected && this.connection && this.channel) {
      this.logger.debug('Already connected to RabbitMQ');
      return;
    }

    try {
      this.logger.log(`Connecting to RabbitMQ at ${this.config.connection.uri}...`);
      this.connection = await amqp.connect(this.config.connection.uri);

      // Handle connection errors
      this.connection.on('error', (error) => {
        this.logger.error(`RabbitMQ Connection Error: ${error.message}`);
        this.isConnected = false;
        this.reconnectWithBackoff();
      });

      this.connection.on('close', () => {
        this.logger.warn('RabbitMQ Connection closed');
        this.isConnected = false;
        this.reconnectWithBackoff();
      });

      // Create ConfirmChannel for publisher confirms
      this.channel = await this.connection.createConfirmChannel();

      // Handle channel errors
      this.channel.on('error', (error) => {
        this.logger.error(`RabbitMQ Channel Error: ${error.message}`);
        this.isConnected = false;
      });

      // Declare exchange
      await this.declareExchange();

      this.isConnected = true;
      this.connectionAttempts = 0;
      this.logger.log(`✅ Connected to RabbitMQ successfully`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to connect to RabbitMQ: ${errorMessage}. Retrying in background...`);
      this.isConnected = false;
      
      // Start background reconnection since the initial attempt failed
      this.reconnectWithBackoff();
    }
  }

  /**
   * Disconnect from RabbitMQ
   */
  async disconnect(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
        this.channel = null;
      }
      if (this.connection) {
        await this.connection.close();
        this.connection = null;
      }
      this.isConnected = false;
      this.logger.log('Disconnected from RabbitMQ');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error disconnecting from RabbitMQ: ${errorMessage}`);
    }
  }

  /**
   * Ensure connection is alive, reconnect if needed
   */
  async ensureConnected(): Promise<void> {
    if (!this.isConnected || !this.connection || !this.channel) {
      this.logger.warn('Connection lost, attempting to reconnect...');
      await this.reconnectWithBackoff();
    }
  }

  /**
   * Publish message to exchange with routing key
   * Formats message in NestJS RMQ protocol format so consumers can recognize the pattern
   */
  async publish<T = any>(
    routingKey: string,
    message: T,
    options?: PublishOptions
  ): Promise<void> {
    await this.ensureConnected();

    if (!this.channel) {
      throw new Error('Channel not available');
    }

    try {
      // Format message in NestJS RMQ protocol format: { id, pattern, data }
      // This allows NestJS consumers to properly extract the pattern
      const nestRmqMessage = {
        id: randomUUID(),
        pattern: routingKey, // NestJS uses pattern to route to @EventPattern
        data: message,
      };

      const buffer = this.encodeMessage(nestRmqMessage);
      const publishOptions = this.buildPublishOptions(options);

      return new Promise((resolve, reject) => {
        this.channel!.publish(
          this.config.exchange_contract.name,
          routingKey,
          buffer,
          publishOptions,
          (error: Error | null, ok?: any) => {
            if (error) {
              this.logger.error(`Failed to publish message: ${error.message}`);
              reject(error);
            } else {
              this.logger.debug(
                `Message published successfully to routing key: ${routingKey}`
              );
              resolve();
            }
          }
        );
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error publishing message: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Declare exchange if it doesn't exist
   */
  private async declareExchange(): Promise<void> {
    if (!this.channel) {
      throw new Error('Channel not available');
    }

    const { name, type, options } = this.config.exchange_contract;

    try {
      await this.channel.assertExchange(name, type, {
        durable: options.durable,
        internal: options.internal,
        autoDelete: options.autoDelete,
      });

      this.logger.debug(
        `Exchange "${name}" (${type}) declared successfully`
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to declare exchange: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Reconnect with exponential backoff
   */
  private async reconnectWithBackoff(): Promise<void> {
    const config = this.config.connection.reconnect;

    if (config.max_retries !== -1 && this.connectionAttempts >= config.max_retries) {
      throw new Error(
        `Max reconnection attempts (${config.max_retries}) reached`
      );
    }

    const delayMs = Math.min(
      config.initial_delay_ms * Math.pow(config.factor, this.connectionAttempts),
      config.max_delay_ms
    );

    this.connectionAttempts++;
    this.logger.warn(
      `Reconnection attempt ${this.connectionAttempts}, waiting ${delayMs}ms...`
    );

    await this.sleep(delayMs);

    try {
      await this.connect();
    } catch (error) {
      await this.reconnectWithBackoff();
    }
  }

  /**
   * Build RabbitMQ publish options from config
   */
  private buildPublishOptions(
    options?: PublishOptions
  ): amqp.Options.Publish {
    const config = this.config.publish;
    const headers = {
      message_id: randomUUID(),
      correlation_id: options?.correlationId || randomUUID(),
      timestamp: new Date().toISOString(),
      ...(options?.headers || {}),
    };

    return {
      contentType: 'application/json',
      contentEncoding: 'utf-8',
      headers,
      persistent: config.persistent,
      mandatory: config.mandatory,
      deliveryMode: config.delivery_mode,
      ...options,
    };
  }

  /**
   * Encode message to buffer
   */
  private encodeMessage(message: any): Buffer {
    try {
      const json = JSON.stringify(message);
      return Buffer.from(json, 'utf-8');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to encode message: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get connection status
   */
  isHealthy(): boolean {
    return this.isConnected && this.connection !== null && this.channel !== null;
  }
}

/**
 * Publish options interface
 */
export interface PublishOptions extends amqp.Options.Publish {
  correlationId?: string;
  headers?: Record<string, any>;
}
