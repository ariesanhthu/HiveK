import * as amqp from 'amqplib';
import { RabbitMQConsumerConfig } from '@infrastructure/nest-config/types/rabbitmq.types';
import { ILoggerService } from '@/application/interfaces';
import { RmqHandlerRegistry } from './rmq-consumer.registry';

/**
 * Raw RabbitMQ Consumer Client using amqplib
 * Handles topology setup (exchanges, queues, bindings) and message consumption
 */
export class RawRabbitMQConsumerClient {
  private connection: amqp.Connection | null = null;
  private channel: amqp.Channel | null = null;
  private isConnected = false;
  private connectionAttempts = 0;
  private readonly config: RabbitMQConsumerConfig;
  private readonly logger: ILoggerService;

  constructor(config: RabbitMQConsumerConfig, logger: ILoggerService) {
    this.config = config;
    this.logger = logger;
  }

  /**
   * Connect to RabbitMQ and setup topology
   */
  async connect(): Promise<void> {
    if (this.isConnected && this.connection && this.channel) {
      return;
    }

    try {
      this.logger.log(`Connecting to RabbitMQ (Consumer) at ${this.config.connection.uri}...`);
      this.connection = await amqp.connect(this.config.connection.uri);

      this.connection.on('error', (error) => {
        this.logger.error(`RabbitMQ Consumer Connection Error: ${error.message}`);
        this.isConnected = false;
        this.reconnectWithBackoff();
      });

      this.connection.on('close', () => {
        this.logger.warn('RabbitMQ Consumer Connection closed');
        this.isConnected = false;
        this.reconnectWithBackoff();
      });

      this.channel = await this.connection.createChannel();
      
      this.channel.on('error', (error) => {
        this.logger.error(`RabbitMQ Consumer Channel Error: ${error.message}`);
        this.isConnected = false;
      });

      // Set prefetch
      if (this.config.consume.prefetch_count) {
        await this.channel.prefetch(this.config.consume.prefetch_count);
      }

      // Setup topology and start consumers
      await this.setupTopology();
      await this.startConsumers();

      this.isConnected = true;
      this.connectionAttempts = 0;
      this.logger.log(`✅ RabbitMQ Consumer connected and listeners started`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to start RabbitMQ Consumer: ${errorMessage}. Retrying in background...`);
      this.isConnected = false;
      
      // Start background reconnection
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
      this.logger.log('RabbitMQ Consumer disconnected');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error disconnecting RabbitMQ Consumer: ${errorMessage}`);
    }
  }

  /**
   * Setup exchanges, queues and bindings based on config
   */
  private async setupTopology(): Promise<void> {
    if (!this.channel) throw new Error('Channel not available');

    for (const queueConfig of this.config.queues) {
      // Declare queue
      const queueArguments = queueConfig.options.arguments || {};
      if (queueConfig.type === 'quorum') {
        queueArguments['x-queue-type'] = 'quorum';
      }

      await this.channel.assertQueue(queueConfig.name, {
        durable: queueConfig.options.durable,
        exclusive: queueConfig.options.exclusive,
        autoDelete: queueConfig.options.autoDelete,
        arguments: queueArguments,
      });

      this.logger.debug(`Queue "${queueConfig.name}" declared`);

      // Declare bindings and implicitly exchanges if needed
      for (const binding of queueConfig.bindings) {
        // We assume exchange exists or we can assert it if we had its type here.
        // Usually, in this custom pattern, producer asserts the exchange.
        // But for safety, one might want to assert it as 'topic' by default or based on some convention.
        // Here we just bind assuming exchange exists.
        await this.channel.bindQueue(queueConfig.name, binding.exchange, binding.routing_key);
        this.logger.debug(
          `Bound queue "${queueConfig.name}" to exchange "${binding.exchange}" with routing key "${binding.routing_key}"`
        );
      }
    }
  }

  /**
   * Start consuming from all configured queues
   */
  private async startConsumers(): Promise<void> {
    if (!this.channel) throw new Error('Channel not available');

    for (const queueConfig of this.config.queues) {
      const handlers = RmqHandlerRegistry.getHandlersForQueue(queueConfig.name);
      
      if (handlers.length === 0) {
        this.logger.warn(`No handlers registered for queue "${queueConfig.name}"`);
        continue;
      }

      this.logger.log(`Starting consumer for queue "${queueConfig.name}" with ${handlers.length} handlers`);

      await this.channel.consume(
        queueConfig.name,
        async (msg) => {
          if (msg) {
            await this.handleMessage(msg, handlers, queueConfig.name);
          }
        },
        { noAck: this.config.consume.no_ack }
      );
    }
  }

  /**
   * Route incoming message to appropriate handler
   */
  private async handleMessage(
    msg: amqp.ConsumeMessage,
    handlers: any[],
    queueName: string
  ): Promise<void> {
    if (!this.channel) return;

    const content = msg.content.toString();
    const routingKey = msg.fields.routingKey;
    
    try {
      const parsedMessage = JSON.parse(content);
      // NestJS protocol check: messages from our producer have { pattern: routingKey, data: ... }
      const pattern = parsedMessage.pattern || routingKey;
      const data = parsedMessage.data !== undefined ? parsedMessage.data : parsedMessage;

      const handler = handlers.find((h) => this.matchPattern(h.pattern, pattern));

      if (handler) {
        this.logger.debug(`Routing message with pattern "${pattern}" to ${handler.methodName}`);
        await handler.callback.apply(handler.target, [data, msg]);
        
        if (!this.config.consume.no_ack && this.config.consume.manual_ack) {
          this.channel.ack(msg);
        }
      } else {
        this.logger.warn(`No handler found for pattern "${pattern}" in queue "${queueName}"`);
        // If no handler, we might want to ack anyway or nack/requeue
        if (!this.config.consume.no_ack) {
          this.channel.ack(msg);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error handling RMQ message from ${queueName}: ${errorMessage}`);
      
      if (!this.config.consume.no_ack) {
        this.channel.nack(msg, false, this.config.consume.requeue_on_error);
      }
    }
  }

  /**
   * Simple pattern matching (exact match or * wildcard)
   */
  private matchPattern(handlerPattern: string, incomingPattern: string): boolean {
    if (handlerPattern === incomingPattern) return true;
    if (handlerPattern === '*') return true;
    
    // Support simple topic wildcard (strip.pattern.*)
    const regex = new RegExp('^' + handlerPattern.replace(/\./g, '\\.').replace(/\*/g, '[^.]+') + '$');
    return regex.test(incomingPattern);
  }

  /**
   * Reconnect wrapper (can be called periodically or on connection loss)
   */
  async ensureConnected(): Promise<void> {
    if (!this.isConnected || !this.connection || !this.channel) {
      await this.reconnectWithBackoff();
    }
  }

  private async reconnectWithBackoff(): Promise<void> {
    const config = this.config.connection.reconnect;
    if (config.max_retries !== -1 && this.connectionAttempts >= config.max_retries) {
      throw new Error(`Max reconnection attempts reached for RMQ Consumer`);
    }

    const delayMs = Math.min(
      config.initial_delay_ms * Math.pow(config.factor, this.connectionAttempts),
      config.max_delay_ms
    );

    this.connectionAttempts++;
    this.logger.warn(`Consumer reconnection attempt ${this.connectionAttempts} in ${delayMs}ms...`);

    await new Promise((resolve) => setTimeout(resolve, delayMs));

    try {
      await this.connect();
    } catch (error) {
      await this.reconnectWithBackoff();
    }
  }
}
