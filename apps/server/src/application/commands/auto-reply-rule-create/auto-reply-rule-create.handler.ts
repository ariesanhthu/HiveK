import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  SOCIAL_PAGE_REPOSITORY,
  type ISocialPageRepository,
  AUTO_REPLY_RULE_REPOSITORY,
  type IAutoReplyRuleRepository,
} from '@/core/interfaces/repositories';
import {
  EVENT_SERVICE,
  type IEventService,
  UNIT_OF_WORK,
  type IUnitOfWork,
} from '@/application/interfaces';
import { AutoReplyRuleRoot } from '@/core/aggregate-roots';
import { AutoReplyRuleCreateCommand } from './auto-reply-rule-create.command';
import { AutoReplyRuleDto } from '@/application/dtos';
import { AutoReplyRuleMapper } from '@/application/mappers';
import { InvalidOperationException } from '@/core/exceptions';

@CommandHandler(AutoReplyRuleCreateCommand)
export class AutoReplyRuleCreateHandler implements ICommandHandler<
  AutoReplyRuleCreateCommand,
  AutoReplyRuleDto
> {
  constructor(
    @Inject(SOCIAL_PAGE_REPOSITORY)
    private readonly socialPageRepository: ISocialPageRepository,
    @Inject(AUTO_REPLY_RULE_REPOSITORY)
    private readonly autoReplyRuleRepository: IAutoReplyRuleRepository,
    @Inject(EVENT_SERVICE)
    private readonly eventService: IEventService,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
  ) {}

  async execute(
    command: AutoReplyRuleCreateCommand,
  ): Promise<AutoReplyRuleDto> {
    const { enterpriseId, input } = command;

    await this.uow.startTransaction();
    try {
      const socialPage = await this.socialPageRepository.findById(
        input.socialPageId,
      );
      if (!socialPage) {
        throw new Error('Social page connection not found.');
      }
      if (socialPage.enterpriseId !== enterpriseId) {
        throw new InvalidOperationException(
          'Page connection does not belong to the requesting enterprise.',
        );
      }

      const rule = AutoReplyRuleRoot.create({
        enterpriseId,
        socialPageId: input.socialPageId,
        name: input.name,
        keywords: input.keywords,
        replyContent: input.replyContent,
      });

      await this.autoReplyRuleRepository.save(rule);
      await this.eventService.publishEvents(rule);
      await this.uow.commitTransaction();

      return AutoReplyRuleMapper.toDto(rule);
    } catch (error) {
      await this.uow.rollbackTransaction();
      throw error;
    }
  }
}
