import { Module } from '@nestjs/common';
import { OutboxService } from '@/application/services/outbox.service';
import { OutboxProcessorService } from '@/application/services/outbox-processor.service';
import { MongoModule } from '../mongo/mongo.module';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';

@Module({
  imports: [
    MongoModule,
    RabbitMQModule,
  ],
  providers: [
    OutboxService,
    OutboxProcessorService,
  ],
  exports: [
    OutboxService,
  ],
})
export class OutboxModule {}
