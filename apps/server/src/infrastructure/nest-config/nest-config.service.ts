import { Injectable, Logger, BadRequestException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Transport, RmqOptions } from "@nestjs/microservices";
import * as fs from "fs";
import * as path from "path";
import {
  RabbitMQProducerConfig,
  RabbitMQConsumerConfig,
} from "./types/rabbitmq.types";

@Injectable()
export class NestConfigService extends ConfigService {
  private readonly logger = new Logger(NestConfigService.name);

  /**
   * Read and parse RabbitMQ Producer configuration from JSON file
   * @param filePath - Path to producer config JSON file (can be relative or absolute)
   * @returns Parsed producer configuration object
   * @throws BadRequestException if file not found or invalid JSON
   */
  readRMQProducerConfig(filePath: string): RabbitMQProducerConfig {
    try {
      const resolvedPath = this.resolvePath(filePath);
      this.logger.debug(`Reading RMQ producer config from: ${resolvedPath}`);

      const fileContent = fs.readFileSync(resolvedPath, "utf-8");
      const config = JSON.parse(fileContent) as RabbitMQProducerConfig;

      if (config.role !== "producer") {
        throw new BadRequestException(
          `Invalid producer config: expected role "producer", got "${config.role}"`
        );
      }

      this.logger.log(`✓ RMQ producer config loaded successfully`);
      return config;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to read RMQ producer config: ${message}`);
      throw new BadRequestException(`Failed to read RMQ producer config: ${message}`);
    }
  }

  /**
   * Read and parse RabbitMQ Consumer configuration from JSON file
   * @param filePath - Path to consumer config JSON file (can be relative or absolute)
   * @returns Parsed consumer configuration object
   * @throws BadRequestException if file not found or invalid JSON
   */
  readRMQConsumerConfig(filePath: string): RabbitMQConsumerConfig {
    try {
      const resolvedPath = this.resolvePath(filePath);
      this.logger.debug(`Reading RMQ consumer config from: ${resolvedPath}`);

      const fileContent = fs.readFileSync(resolvedPath, "utf-8");
      const config = JSON.parse(fileContent) as RabbitMQConsumerConfig;

      if (config.role !== "consumer") {
        throw new BadRequestException(
          `Invalid consumer config: expected role "consumer", got "${config.role}"`
        );
      }

      this.logger.log(`✓ RMQ consumer config loaded successfully`);
      return config;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to read RMQ consumer config: ${message}`);
      throw new BadRequestException(`Failed to read RMQ consumer config: ${message}`);
    }
  }

  /**
   * Resolve file path - handle relative paths based on config directory
   * @param filePath - File path to resolve
   * @returns Absolute file path
   */
  private resolvePath(filePath: string): string {
    if (path.isAbsolute(filePath)) {
      return filePath;
    }

    // If relative, resolve from config directory (src/config)
    const configDir = path.join(process.cwd(), "src/config");
    return path.join(configDir, filePath);
  }

  /**
   * Convert RabbitMQ Producer config to NestJS ClientProxy options (for clients/producers)
   * Maps available config fields to NestJS RmqOptions
   * @param config - Producer configuration object
   * @returns NestJS ClientOptions for ClientsModule.register()
   */
  toNestJSClientOptions(config: RabbitMQProducerConfig): RmqOptions {
    const firstRoutingKey = Object.values(config.routes)[0];
    return {
      transport: Transport.RMQ,
      options: {
        urls: [config.connection.uri],
        // queue: config.exchange_contract.name,
        exchange: config.exchange_contract.name,
        exchangeType: config.exchange_contract.type,
        routingKey: firstRoutingKey || config.exchange_contract.name,
        persistent: config.publish.persistent,
        noAssert: false,
        maxConnectionAttempts: Math.max(
          config.connection.reconnect.max_retries,
          1
        ),
        socketOptions: {
          heartbeat: config.connection.heartbeat,
        },
        queueOptions: {
          durable: config.exchange_contract.options.durable,
        },
      },
    };
  }

  /**
   * Convert RabbitMQ Consumer config to NestJS MicroserviceOptions (for microservice transport)
   * Maps available config fields to NestJS RmqOptions
   * @param config - Consumer configuration object
   * @returns NestJS MicroserviceOptions for app.connectMicroservice()
   */
  toNestJSMicroserviceOptions(config: RabbitMQConsumerConfig): RmqOptions {
    const primaryQueue = config.queues[0];
    const primaryBinding = primaryQueue?.bindings[0];

    if (!primaryQueue) {
      throw new BadRequestException("Consumer config must have at least one queue");
    }

    return {
      transport: Transport.RMQ,
      options: {
        urls: [config.connection.uri],
        queue: primaryQueue.name,
        exchange: primaryBinding?.exchange || primaryQueue.name,
        exchangeType: "direct", // Always use "direct" for explicit bindings
        // routingKey: routingKey, // NestJS uses this for the queue declaration
        prefetchCount: config.consume.prefetch_count,
        isGlobalPrefetchCount: false,
        noAck: config.consume.no_ack,
        noAssert: false, // Important: false so RabbitMQ doesn't skip assertion
        maxConnectionAttempts: Math.max(
          config.connection.reconnect.max_retries,
          1
        ),
        socketOptions: {
          heartbeat: config.connection.heartbeat,
        },
        queueOptions: {
          durable: primaryQueue.options.durable,
          arguments: primaryQueue.options.arguments,
        },
      },
    };
  }

  /**
   * Convert Producer config to RMQ exchange declaration for explicit setup
   * @param config - Producer configuration object
   * @returns Object with exchange name, type, and options
   */
  toRMQExchangeDeclaration(config: RabbitMQProducerConfig) {
    return {
      exchange: config.exchange_contract.name,
      type: config.exchange_contract.type,
      options: config.exchange_contract.options,
    };
  }

  /**
   * Convert Consumer queues to RMQ queue/binding declarations for explicit setup
   * @param config - Consumer configuration object
   * @returns Array of objects with queue name, options, and bindings
   */
  toRMQQueueDeclarations(config: RabbitMQConsumerConfig) {
    return config.queues.map((queue) => ({
      queue: queue.name,
      options: queue.options,
      bindings: queue.bindings,
    }));
  }
}