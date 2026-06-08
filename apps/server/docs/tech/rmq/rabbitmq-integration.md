# RabbitMQ Integration Strategy

This document outlines the strategy for integrating RabbitMQ into the `apps/server` NestJS project using `@nestjs/microservices`. The design follows Clean Architecture principles by abstracting the messaging logic behind an interface in the application layer.

## 1. Core Abstraction (Application Layer)

Create `apps/server/src/application/interfaces/message-queue.interface.ts` to define the contract for any message bus implementation.

```typescript
export interface IMessageQueueService {
  /**
   * Emit a fire-and-forget event.
   * @param pattern The message pattern (topic/routing key).
   * @param data The payload to send.
   */
  emit<TEvent = string, TData = any>(pattern: TEvent, data: TData): void;

  /**
   * Send a request-response message (RPC).
   * @param pattern The message pattern.
   * @param data The payload to send.
   * @returns A promise resolving to the result.
   */
  send<TResult = any, TInput = any>(pattern: any, data: TInput): Promise<TResult>;
}
```

## 2. Infrastructure Implementation

Create `apps/server/src/infrastructure/messaging/rabbitmq.service.ts`. This service implements the interface and wraps the NestJS `ClientProxy`.

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { IMessageQueueService } from '../../application/interfaces/message-queue.interface';

@Injectable()
export class RabbitMQService implements IMessageQueueService {
  constructor(
    @Inject('RABBITMQ_CLIENT') private readonly client: ClientProxy,
  ) {}

  emit<TEvent = string, TData = any>(pattern: TEvent, data: TData): void {
    this.client.emit(pattern, data);
  }

  async send<TResult = any, TInput = any>(pattern: any, data: TInput): Promise<TResult> {
    return firstValueFrom(this.client.send<TResult, TInput>(pattern, data));
  }
}
```

## 3. Configuration & Module

Create `apps/server/src/infrastructure/modules/messaging.module.ts`. This module configures the RabbitMQ client and provides the service.

```typescript
import { Global, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { RabbitMQService } from '../messaging/rabbitmq.service';

@Global()
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'RABBITMQ_CLIENT',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URI') || 'amqp://localhost:5672'],
            queue: configService.get<string>('RABBITMQ_QUEUE') || 'main_queue',
            queueOptions: {
              durable: true,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [
    {
      provide: 'IMessageQueueService',
      useClass: RabbitMQService,
    },
  ],
  exports: ['IMessageQueueService'],
})
export class MessagingModule {}
```

## 4. Integration Steps

1.  **Install Dependencies:**
    ```bash
    yarn workspace server add @nestjs/microservices amqplib amqp-connection-manager
    ```
2.  **Add Configuration:**
    Ensure `RABBITMQ_URI` and `RABBITMQ_QUEUE` are defined in the `.env` file and correctly loaded by `ConfigService`.
3.  **Import Module:**
    Add `MessagingModule` to the `imports` array of `AppModule`.
4.  **Inject and Use:**
    Inject the service into any application service or controller using `@Inject('IMessageQueueService')`.

## 5. Rationale

- **Decoupling:** The application layer only depends on the `IMessageQueueService` interface, not the specific RabbitMQ or NestJS implementation.
- **Testability:** Mocking the `IMessageQueueService` interface in unit tests is straightforward.
- **Consistency:** Follows the existing architectural patterns (core, application, infrastructure).
- **Flexibility:** Switching from RabbitMQ to another message broker (like Redis or Kafka) would only require a new implementation in the infrastructure layer.

