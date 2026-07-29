import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  EnterpriseNotFoundException,
  EnterpriseForbiddenException,
  UserNotFoundException,
} from '@/core/exceptions';
import {
  ENTERPRISE_REPOSITORY,
  ENTERPRISE_INVITATION_REPOSITORY,
  type IEnterpriseRepository,
  type IEnterpriseInvitationRepository,
} from '@/core/interfaces/repositories';
import { EnterpriseRevokeInvitationCommand } from './enterprise-revoke-invitation.command';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/application/interfaces';

@CommandHandler(EnterpriseRevokeInvitationCommand)
export class EnterpriseRevokeInvitationCommandHandler implements ICommandHandler<
  EnterpriseRevokeInvitationCommand,
  void
> {
  constructor(
    @Inject(ENTERPRISE_REPOSITORY)
    private readonly enterpriseRepository: IEnterpriseRepository,
    @Inject(ENTERPRISE_INVITATION_REPOSITORY)
    private readonly invitationRepository: IEnterpriseInvitationRepository,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
  ) {}

  async execute(command: EnterpriseRevokeInvitationCommand): Promise<void> {
    await this.uow.execute(async () => {
      const { enterpriseId, invitationId, requestedBy } = command;

      const invitation = await this.invitationRepository.findById(invitationId);
      if (!invitation || invitation.enterpriseId !== enterpriseId) {
        throw new UserNotFoundException(
          `Invitation with ID ${invitationId} not found for this enterprise`,
        );
      }

      const enterprise = await this.enterpriseRepository.findById(enterpriseId);
      if (!enterprise) {
        throw new EnterpriseNotFoundException(enterpriseId);
      }

      // Check if requester is Owner or Sub-Owner
      if (
        !enterprise.isOwner(requestedBy) &&
        !enterprise.isSubOwner(requestedBy)
      ) {
        throw new EnterpriseForbiddenException();
      }

      invitation.revoke();

      await this.invitationRepository.save(invitation);
    });
  }
}
