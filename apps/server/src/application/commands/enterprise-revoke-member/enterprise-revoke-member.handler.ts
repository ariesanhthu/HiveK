import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  EnterpriseNotFoundException,
  EnterpriseForbiddenException,
  UserNotFoundException,
} from '@/core/exceptions';
import {
  ENTERPRISE_REPOSITORY,
  USER_REPOSITORY,
  type IEnterpriseRepository,
  type IUserRepository,
} from '@/core/interfaces/repositories';
import { EnterpriseUserRoot } from '@/core/aggregate-roots';
import { EnterpriseRevokeMemberCommand } from './enterprise-revoke-member.command';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/application/interfaces';

@CommandHandler(EnterpriseRevokeMemberCommand)
export class EnterpriseRevokeMemberCommandHandler implements ICommandHandler<
  EnterpriseRevokeMemberCommand,
  void
> {
  constructor(
    @Inject(ENTERPRISE_REPOSITORY)
    private readonly enterpriseRepository: IEnterpriseRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
  ) {}

  async execute(command: EnterpriseRevokeMemberCommand): Promise<void> {
    await this.uow.execute(async () => {
      const { enterpriseId, requestedBy, input } = command;
      const { userId: targetUserId } = input;

      const enterprise = await this.enterpriseRepository.findById(enterpriseId);
      if (!enterprise) {
        throw new EnterpriseNotFoundException(enterpriseId);
      }

      const user = await this.userRepository.findById(targetUserId);
      if (!user) {
        throw new UserNotFoundException(targetUserId);
      }

      // Check hierarchical authorization guards
      const isOwner = enterprise.isOwner(requestedBy);
      const isSubOwner = enterprise.isSubOwner(requestedBy);

      if (!isOwner && !isSubOwner) {
        throw new EnterpriseForbiddenException();
      }

      if (isSubOwner) {
        // Sub-owner cannot revoke owner or another sub-owner
        const targetMember = enterprise.members.find(
          (m) => m.userId === targetUserId,
        );
        if (
          targetUserId === enterprise.userId ||
          (targetMember && targetMember.mode === 'sub_owner')
        ) {
          throw new EnterpriseForbiddenException(
            'Sub-owners cannot revoke the owner or other sub-owners',
          );
        }
      }

      enterprise.removeMember(targetUserId);

      if (user instanceof EnterpriseUserRoot) {
        user.revokeEnterprise(enterpriseId);
      }

      await this.enterpriseRepository.save(enterprise);
      await this.userRepository.save(user);
    });
  }
}
