import { Injectable, Logger } from '@nestjs/common';
import { RmqHandler } from '@/infrastructure/rabbitmq/rmq-consumer.registry';

@Injectable()
export class TestRmqHandler {
  private readonly logger = new Logger(TestRmqHandler.name);

  @RmqHandler({ queue: 'hivek_queue', pattern: 'test_event' })
  handleTestEvent(data: Record<string, unknown>) {
    this.logger.log(`📥 Received test_event via RMQ: ${JSON.stringify(data)}`);
  }

  @RmqHandler({ queue: 'hivek_queue', pattern: 'default' })
  handleDefaultEvent(data: Record<string, unknown>) {
    this.logger.log(
      `📥 Received default event via RMQ: ${JSON.stringify(data)}`,
    );
  }
}
