import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventService } from './event.service';
import { DomainEventMapper } from './domain-event.mapper';
import { OutboxEventEmitter } from './outbox/outbox-event.emitter';
import { OutboxProcessorService } from './outbox/outbox-processor.service';
import { EVENT_SERVICE } from '@/application/interfaces/event-service.interface';
import { DOMAIN_EVENT_MAPPER } from '@/application/interfaces/domain-event-mapper.interface';
import { OutboxModel, OutboxSchema } from '../mongo/schemas/outbox.schema';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OutboxModel.name, schema: OutboxSchema },
    ]),
    RabbitMQModule,
  ],
  providers: [
    {
      provide: EVENT_SERVICE,
      useClass: EventService,
    },
    {
      provide: DOMAIN_EVENT_MAPPER,
      useClass: DomainEventMapper,
    },
    OutboxEventEmitter,
    OutboxProcessorService,
  ],
  exports: [EVENT_SERVICE, OutboxEventEmitter, OutboxProcessorService],
})
export class EventsModule {}
