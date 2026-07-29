import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import {
  SOCIAL_PAGE_REPOSITORY,
  type ISocialPageRepository,
  AUTO_REPLY_RULE_REPOSITORY,
  type IAutoReplyRuleRepository,
} from '@/core/interfaces/repositories';
import {
  COMMENT_REPLIER_DISCOVERY,
  type ICommentReplierDiscovery,
} from '@/core/interfaces';
import { CommentWebhookHandleCommand } from './comment-webhook-handle.command';

@CommandHandler(CommentWebhookHandleCommand)
export class CommentWebhookHandleHandler implements ICommandHandler<
  CommentWebhookHandleCommand,
  { success: boolean; reason?: string }
> {
  private readonly logger = new Logger(CommentWebhookHandleHandler.name);

  constructor(
    @Inject(SOCIAL_PAGE_REPOSITORY)
    private readonly socialPageRepository: ISocialPageRepository,
    @Inject(AUTO_REPLY_RULE_REPOSITORY)
    private readonly autoReplyRuleRepository: IAutoReplyRuleRepository,
    @Inject(COMMENT_REPLIER_DISCOVERY)
    private readonly commentReplierDiscovery: ICommentReplierDiscovery,
  ) {}

  async execute(
    command: CommentWebhookHandleCommand,
  ): Promise<{ success: boolean; reason?: string }> {
    const { platformCode, payload } = command;

    const entry = payload.entry?.[0];
    const pageId = entry?.id;
    if (!pageId) {
      return { success: false, reason: 'No pageId found in webhook payload.' };
    }

    const change = entry?.changes?.[0];
    const value = change?.value;
    if (!value || value.item !== 'comment' || value.verb !== 'add') {
      return {
        success: false,
        reason: 'Payload is not a new comment addition event.',
      };
    }

    const commentId = value.comment_id;
    const message = value.message || '';
    const senderId = value.from?.id;

    if (!commentId || !senderId) {
      return {
        success: false,
        reason: 'Missing commentId or senderId in payload.',
      };
    }

    // 1. Loop Guard: If comment sender is the page itself, drop immediately
    if (senderId === pageId) {
      this.logger.debug(
        `Infinite loop guard triggered: drop self-comment event for pageId ${pageId}.`,
      );
      return { success: true, reason: 'Self-comment ignored.' };
    }

    // 2. Fetch the SocialPage
    const socialPage = await this.socialPageRepository.findByPageId(
      platformCode,
      pageId,
    );
    if (!socialPage || !socialPage.isActive) {
      return {
        success: false,
        reason: 'Active social page connection not found for page ID.',
      };
    }

    // 3. Find active auto-reply rules
    const rules = await this.autoReplyRuleRepository.findActiveByPageId(
      socialPage.id,
    );
    if (rules.length === 0) {
      return {
        success: true,
        reason: 'No active auto-reply rules configured for page.',
      };
    }

    // 4. Match rule by keywords (case-insensitive)
    const lowerMessage = message.toLowerCase();
    let matchedRule = rules.find((rule) => {
      if (rule.keywords.length === 0) return false; // Match exact keyword rules first
      return rule.keywords.some((keyword) =>
        lowerMessage.includes(keyword.toLowerCase()),
      );
    });

    // Fallback: rule with empty keywords matches any comment
    if (!matchedRule) {
      matchedRule = rules.find((rule) => rule.keywords.length === 0);
    }

    if (!matchedRule) {
      return {
        success: true,
        reason: 'No matching rule found for comment text.',
      };
    }

    // 5. Send comment reply
    try {
      const replier = this.commentReplierDiscovery.findByCode(
        socialPage.platformCode,
      );
      await replier.replyToComment({
        pageToken: socialPage.encryptedToken, // Plain access token in core
        commentId,
        message: matchedRule.replyContent,
      });

      this.logger.log(
        `Successfully replied to comment ${commentId} using rule: ${matchedRule.name}`,
      );
      return { success: true };
    } catch (err: any) {
      this.logger.error(
        `Failed to reply to comment ${commentId}: ${err.message}`,
      );
      return { success: false, reason: err.message };
    }
  }
}
