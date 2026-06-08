import { Injectable, Logger } from '@nestjs/common';
import { RmqHandler } from '@/infrastructure/rabbitmq/rmq-consumer.registry';

@Injectable()
export class TestRmqHandler {
  private readonly logger = new Logger(TestRmqHandler.name);

  @RmqHandler({ queue: 'hivek_queue', pattern: 'test_event' })
  async handleTestEvent(data: any) {
    this.logger.log(`📥 Received test_event via RMQ: ${JSON.stringify(data)}`);
  }

  @RmqHandler({ queue: 'hivek_queue', pattern: 'default' })
  async handleDefaultEvent(data: any) {
    this.logger.log(`📥 Received default event via RMQ: ${JSON.stringify(data)}`);
  }
}
