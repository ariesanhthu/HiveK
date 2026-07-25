import { Injectable, Logger, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CommandBus } from '@nestjs/cqrs';
import { SCHEDULED_POST_REPOSITORY, type IScheduledPostRepository } from '@/core/interfaces/repositories';
import { ScheduledPostPublishCommand } from '@/application/commands';

@Injectable()
export class PostPublishJob {
  private readonly logger = new Logger(PostPublishJob.name);
  private isRunning = false;

  constructor(
    @Inject(SCHEDULED_POST_REPOSITORY)
    private readonly scheduledPostRepository: IScheduledPostRepository,
    private readonly commandBus: CommandBus,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    if (this.isRunning) {
      this.logger.debug('Post publishing job is already running. Skipping tick.');
      return;
    }
    this.isRunning = true;

    try {
      const now = new Date();
      const duePosts = await this.scheduledPostRepository.findDueForPublishing(now, 50);

      if (duePosts.length === 0) {
        this.isRunning = false;
        return;
      }

      this.logger.log(`Found ${duePosts.length} posts due for publishing.`);

      for (const post of duePosts) {
        try {
          await this.commandBus.execute(new ScheduledPostPublishCommand(post.id!));
        } catch (error: any) {
          this.logger.error(`Failed to publish post ${post.id}: ${error.message}`);
        }
      }
    } catch (error: any) {
      this.logger.error(`Error during post publishing cron job: ${error.message}`);
    } finally {
      this.isRunning = false;
    }
  }
}
