import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  EnterpriseNotFoundException,
  EnterpriseForbiddenException,
  UserNotFoundException,
} from '@/core/exceptions';
import {
  ENTERPRISE_REPOSITORY,
  type IEnterpriseRepository,
} from '@/core/interfaces/repositories';
import { EnterpriseChangeMemberModeCommand } from './enterprise-change-member-mode.command';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/application/interfaces';

@CommandHandler(EnterpriseChangeMemberModeCommand)
export class EnterpriseChangeMemberModeCommandHandler implements ICommandHandler<
  EnterpriseChangeMemberModeCommand,
  void
> {
  constructor(
    @Inject(ENTERPRISE_REPOSITORY)
    private readonly enterpriseRepository: IEnterpriseRepository,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
  ) {}

  async execute(command: EnterpriseChangeMemberModeCommand): Promise<void> {
    await this.uow.execute(async () => {
      const { enterpriseId, requestedBy, input } = command;
      const { userId: targetUserId, mode: newMode } = input;

      const enterprise = await this.enterpriseRepository.findById(enterpriseId);
      if (!enterprise) {
        throw new EnterpriseNotFoundException(enterpriseId);
      }

      // Check if target user is in the members roster
      const member = enterprise.members.find((m) => m.userId === targetUserId);
      if (!member) {
        throw new UserNotFoundException(
          `Member with ID ${targetUserId} not found in this enterprise`,
        );
      }

      // Hierarchical authorization guard (Option A): Only Owner can promote/demote Sub-Owners.
      const isOwner = enterprise.isOwner(requestedBy);
      if (!isOwner) {
        throw new EnterpriseForbiddenException(
          'Only the enterprise owner can promote or demote members',
        );
      }

      enterprise.changeMemberMode(targetUserId, newMode);

      await this.enterpriseRepository.save(enterprise);
    });
  }
}
