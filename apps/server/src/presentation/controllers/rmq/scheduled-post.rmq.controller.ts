import { Controller, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { RmqHandler } from '@/infrastructure/rabbitmq/rmq-consumer.registry';
import { ScheduledPostPublishCommand } from '@/application/commands';
import type { PostScheduledIntegrationPayload } from '@/application';

@Controller()
export class ScheduledPostRmqController {
  private readonly logger = new Logger(ScheduledPostRmqController.name);

  constructor(private readonly commandBus: CommandBus) {}

  @RmqHandler({ queue: 'scheduled_post_queue', pattern: 'post.scheduled' })
  async handlePostScheduled(data: PostScheduledIntegrationPayload) {
    console.log(data);
    const { postId } = data;
    this.logger.log(`📥 Received scheduled post event for postId: ${postId}`);

    await this.commandBus.execute(new ScheduledPostPublishCommand(postId));

    this.logger.log(`✅ Successfully processed scheduled post: ${postId}`);
  }
}
