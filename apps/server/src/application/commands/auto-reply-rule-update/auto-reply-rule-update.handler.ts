import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  AUTO_REPLY_RULE_REPOSITORY,
  type IAutoReplyRuleRepository,
} from '@/core/interfaces/repositories';
import {
  EVENT_SERVICE,
  type IEventService,
  UNIT_OF_WORK,
  type IUnitOfWork,
} from '@/application/interfaces';
import { AutoReplyRuleUpdateCommand } from './auto-reply-rule-update.command';
import { AutoReplyRuleDto } from '@/application/dtos';
import { AutoReplyRuleMapper } from '@/application/mappers';
import { InvalidOperationException } from '@/core/exceptions';

@CommandHandler(AutoReplyRuleUpdateCommand)
export class AutoReplyRuleUpdateHandler implements ICommandHandler<
  AutoReplyRuleUpdateCommand,
  AutoReplyRuleDto
> {
  constructor(
    @Inject(AUTO_REPLY_RULE_REPOSITORY)
    private readonly autoReplyRuleRepository: IAutoReplyRuleRepository,
    @Inject(EVENT_SERVICE)
    private readonly eventService: IEventService,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
  ) {}

  async execute(
    command: AutoReplyRuleUpdateCommand,
  ): Promise<AutoReplyRuleDto> {
    const { ruleId, enterpriseId, input } = command;

    await this.uow.startTransaction();
    try {
      const rule = await this.autoReplyRuleRepository.findById(ruleId);
      if (!rule) {
        throw new Error('Auto reply rule not found.');
      }
      if (rule.enterpriseId !== enterpriseId) {
        throw new InvalidOperationException(
          'Unauthorized enterprise operation on rule.',
        );
      }

      rule.updateRule(input.name, input.keywords, input.replyContent);

      if (input.isEnabled !== undefined) {
        if (input.isEnabled) {
          rule.enable();
        } else {
          rule.disable();
        }
      }

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
