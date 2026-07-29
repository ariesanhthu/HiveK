import { Injectable, Logger, Inject } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { RmqHandler } from '@/infrastructure/rabbitmq/rmq-consumer.registry';
import { CommentWebhookHandleCommand } from '@/application/commands';
import {
  CACHE_SERVICE,
  type ICacheService,
} from '@/application/interfaces/cache.interface';

@Injectable()
export class CommentWebhookConsumer {
  private readonly logger = new Logger(CommentWebhookConsumer.name);

  constructor(
    private readonly commandBus: CommandBus,
    @Inject(CACHE_SERVICE)
    private readonly cacheService: ICacheService,
  ) {}

  @RmqHandler({
    queue: 'comment_webhook_queue',
    pattern: 'webhook.facebook.comment',
  })
  async handleCommentEvent(data: Record<string, unknown>) {
    this.logger.log(`📥 Received facebook comment event via RMQ`);

    const entry = data.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const commentId = value?.comment_id;

    if (commentId) {
      const redisKey = `fb_comment:${commentId}`;
      const existing = await this.cacheService.get<string>(redisKey);
      if (existing) {
        this.logger.warn(
          `Duplicate webhook message detected, skipping processing for commentId ${commentId}`,
        );
        return;
      }
      // Set deduplication cache key (5 minutes expiry)
      await this.cacheService.set(redisKey, 'processed', 300);
    }

    const pageId = entry?.id;
    if (pageId) {
      const rateLimitKey = `fb_rate:${pageId}`;
      const currentRateStr = await this.cacheService.get<string>(rateLimitKey);
      const currentRate = currentRateStr ? parseInt(currentRateStr, 10) : 0;

      const maxRepliesPerHour = 100;
      if (currentRate >= maxRepliesPerHour) {
        this.logger.warn(
          `Rate limit exceeded for pageId ${pageId} (${currentRate}/${maxRepliesPerHour}). Skipping webhook reply.`,
        );
        return;
      }

      await this.cacheService.set(
        rateLimitKey,
        (currentRate + 1).toString(),
        3600,
      );
    }

    const result = await this.commandBus.execute(
      new CommentWebhookHandleCommand('facebook', data),
    );

    if (!result.success) {
      throw new Error(
        `Failed to handle comment webhook: ${result.reason || 'Unknown error'}`,
      );
    }
  }
}
