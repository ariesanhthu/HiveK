import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { AUTO_REPLY_RULE_REPOSITORY, type IAutoReplyRuleRepository } from '@/core/interfaces/repositories';
import { UNIT_OF_WORK, type IUnitOfWork } from '@/application/interfaces';
import { AutoReplyRuleDeleteCommand } from './auto-reply-rule-delete.command';
import { InvalidOperationException } from '@/core/exceptions';

@CommandHandler(AutoReplyRuleDeleteCommand)
export class AutoReplyRuleDeleteHandler implements ICommandHandler<AutoReplyRuleDeleteCommand, { success: boolean }> {
  constructor(
    @Inject(AUTO_REPLY_RULE_REPOSITORY)
    private readonly autoReplyRuleRepository: IAutoReplyRuleRepository,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
  ) {}

  async execute(command: AutoReplyRuleDeleteCommand): Promise<{ success: boolean }> {
    await this.uow.startTransaction();
    try {
      const rule = await this.autoReplyRuleRepository.findById(command.ruleId);
      if (!rule) {
        throw new Error('Auto reply rule not found.');
      }
      if (rule.enterpriseId !== command.enterpriseId) {
        throw new InvalidOperationException('Unauthorized enterprise operation on rule.');
      }

      await this.autoReplyRuleRepository.delete(command.ruleId);
      await this.uow.commitTransaction();

      return { success: true };
    } catch (error) {
      await this.uow.rollbackTransaction();
      throw error;
    }
  }
}
