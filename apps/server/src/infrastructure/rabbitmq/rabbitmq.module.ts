import { Global, Module, Logger, OnModuleDestroy, Inject, OnApplicationBootstrap } from '@nestjs/common';
import { RabbitMQService, RABBITMQ_PRODUCER_CLIENT, RABBITMQ_CONFIG } from './rabbitmq.service';
import { LOGGER_SERVICE, MESSAGE_QUEUE_SERVICE } from '@application/interfaces';
import { NestConfigService } from '@infrastructure/nest-config/nest-config.service';
import { NestConfigModule } from '@infrastructure/nest-config/nest-config.module';
import { RawRabbitMQProducerClient } from './raw-rabbitmq-producer';
import { RawRabbitMQConsumerClient } from './raw-rabbitmq-consumer';
import { ModulesContainer, MetadataScanner, Reflector } from '@nestjs/core';
import { RMQ_HANDLER_METADATA, RmqHandlerOptions, RmqHandlerRegistry } from './rmq-consumer.registry';

export const RABBITMQ_CONSUMER_CONFIG = Symbol('RABBITMQ_CONSUMER_CONFIG');
export const RABBITMQ_CONSUMER_CLIENT = Symbol('RABBITMQ_CONSUMER_CLIENT');

@Global()
@Module({
  imports: [NestConfigModule],
  providers: [
    MetadataScanner,
    Reflector,
    // Provider for RabbitMQ Producer Config
    {
      provide: RABBITMQ_CONFIG,
      useFactory: (nestConfigService: NestConfigService) => {
        return nestConfigService.readRMQProducerConfig('rmq/rmq.producer.minimal.json');
      },
      inject: [NestConfigService],
    },
    // Provider for RabbitMQ Consumer Config
    {
      provide: RABBITMQ_CONSUMER_CONFIG,
      useFactory: (nestConfigService: NestConfigService) => {
        return nestConfigService.readRMQConsumerConfig('rmq/rmq.consumer.minimal.json');
      },
      inject: [NestConfigService],
    },
    // Provider for Raw RabbitMQ Producer Client
    {
      provide: RABBITMQ_PRODUCER_CLIENT,
      useFactory: (config, logger) => {
        const client = new RawRabbitMQProducerClient(config, logger);
        client.connect().catch(() => {}); // Start connection in background
        return client;
      },
      inject: [RABBITMQ_CONFIG, LOGGER_SERVICE],
    },
    // Provider for Raw RabbitMQ Consumer Client
    {
      provide: RABBITMQ_CONSUMER_CLIENT,
      useFactory: (config, logger) => {
        return new RawRabbitMQConsumerClient(config, logger);
      },
      inject: [RABBITMQ_CONSUMER_CONFIG, LOGGER_SERVICE],
    },
    // Provider for Message Queue Service
    {
      provide: MESSAGE_QUEUE_SERVICE,
      useFactory: (producer, config) => {
        return new RabbitMQService(producer, config);
      },
      inject: [RABBITMQ_PRODUCER_CLIENT, RABBITMQ_CONFIG],
    },
  ],
  exports: [MESSAGE_QUEUE_SERVICE, RABBITMQ_CONSUMER_CLIENT],
})
export class RabbitMQModule implements OnModuleDestroy, OnApplicationBootstrap {
  private readonly logger = new Logger(RabbitMQModule.name);

  constructor(
    @Inject(RABBITMQ_PRODUCER_CLIENT) private readonly producer: RawRabbitMQProducerClient,
    @Inject(RABBITMQ_CONSUMER_CLIENT) private readonly consumer: RawRabbitMQConsumerClient,
    private readonly modulesContainer: ModulesContainer,
    private readonly metadataScanner: MetadataScanner,
    private readonly reflector: Reflector,
  ) {}

  async onApplicationBootstrap() {
    this.discoverHandlers();
    this.consumer.connect().catch(() => {}); // Start connection in background
  }

  private discoverHandlers() {
    const modules = [...this.modulesContainer.values()];
    
    modules.forEach((module) => {
      module.providers.forEach((wrapper) => {
        const { instance } = wrapper;
        if (!instance || !Object.getPrototypeOf(instance)) {
          return;
        }

        this.metadataScanner.getAllMethodNames(Object.getPrototypeOf(instance)).forEach((methodName) => {
          const handlerOptions = this.reflector.get<RmqHandlerOptions>(
            RMQ_HANDLER_METADATA,
            instance[methodName],
          );

          if (handlerOptions) {
            RmqHandlerRegistry.register({
              ...handlerOptions,
              target: instance,
              methodName,
              callback: instance[methodName],
            });
            this.logger.log(
              `Registered RMQ handler: ${instance.constructor.name}.${methodName} for queue "${handlerOptions.queue}"`,
            );
          }
        });
      });
    });
  }

  async onModuleDestroy() {
    this.logger.log('Disconnecting RabbitMQ clients...');
    await Promise.all([
      this.producer.disconnect(),
      this.consumer.disconnect(),
    ]);
  }
}
