import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  EnterpriseNotFoundException,
  EnterpriseForbiddenException,
  EnterpriseConflictException,
  UserNotFoundException,
  InvalidUserTypeException,
} from '@/core/exceptions';
import {
  ENTERPRISE_REPOSITORY,
  USER_REPOSITORY,
  ENTERPRISE_INVITATION_REPOSITORY,
  type IEnterpriseRepository,
  type IUserRepository,
  type IEnterpriseInvitationRepository,
} from '@/core/interfaces/repositories';
import { EnterpriseUserRoot } from '@/core/aggregate-roots';
import { EnterpriseAcceptInvitationCommand } from './enterprise-accept-invitation.command';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/application/interfaces';

@CommandHandler(EnterpriseAcceptInvitationCommand)
export class EnterpriseAcceptInvitationCommandHandler implements ICommandHandler<
  EnterpriseAcceptInvitationCommand,
  void
> {
  constructor(
    @Inject(ENTERPRISE_REPOSITORY)
    private readonly enterpriseRepository: IEnterpriseRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(ENTERPRISE_INVITATION_REPOSITORY)
    private readonly invitationRepository: IEnterpriseInvitationRepository,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
  ) {}

  async execute(command: EnterpriseAcceptInvitationCommand): Promise<void> {
    await this.uow.execute(async () => {
      const { enterpriseId, invitationId, userId } = command;

      const invitation = await this.invitationRepository.findById(invitationId);
      if (!invitation || invitation.enterpriseId !== enterpriseId) {
        throw new UserNotFoundException(
          `Invitation with ID ${invitationId} not found for this enterprise`,
        );
      }

      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new UserNotFoundException(userId);
      }

      // Check email matches
      if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
        throw new EnterpriseForbiddenException(
          'Accepting user email does not match invitation email',
        );
      }

      // Check role type
      if (!(user instanceof EnterpriseUserRoot)) {
        throw new InvalidUserTypeException(
          'Only enterprise users can accept invitations',
        );
      }

      const enterprise = await this.enterpriseRepository.findById(enterpriseId);
      if (!enterprise) {
        throw new EnterpriseNotFoundException(enterpriseId);
      }

      // Apply acceptance state change
      invitation.accept();

      // Add to enterprise roster and user aggregate
      enterprise.addMember(userId, invitation.mode);
      user.addEnterprise(enterpriseId);

      // Save all aggregates
      await this.invitationRepository.save(invitation);
      await this.enterpriseRepository.save(enterprise);
      await this.userRepository.save(user);
    });
  }
}
