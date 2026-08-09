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
import {
  EnterpriseInvitationRoot,
  EnterpriseUserRoot,
} from '@/core/aggregate-roots';
import { EnterpriseInviteMemberCommand } from './enterprise-invite-member.command';
import { EnterpriseInvitationDto } from '@/application/dtos/enterprise-invitation.dto';
import { EnterpriseInvitationMapper } from '@/application/mappers';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/application/interfaces';

@CommandHandler(EnterpriseInviteMemberCommand)
export class EnterpriseInviteMemberCommandHandler implements ICommandHandler<
  EnterpriseInviteMemberCommand,
  EnterpriseInvitationDto
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

  async execute(
    command: EnterpriseInviteMemberCommand,
  ): Promise<EnterpriseInvitationDto> {
    return this.uow.execute(async () => {
      const { enterpriseId, requestedBy, input } = command;

      const enterprise = await this.enterpriseRepository.findById(enterpriseId);
      if (!enterprise) {
        throw new EnterpriseNotFoundException(enterpriseId);
      }

      // Authorization guard: must be owner or sub-owner
      if (
        !enterprise.isOwner(requestedBy) &&
        !enterprise.isSubOwner(requestedBy)
      ) {
        throw new EnterpriseForbiddenException();
      }

      // Check if target user exists
      const user = await this.userRepository.findByEmail(input.email);
      if (!user) {
        throw new UserNotFoundException(
          `User with email ${input.email} not found`,
        );
      }

      // Target user must be an enterprise user
      if (!(user instanceof EnterpriseUserRoot)) {
        throw new InvalidUserTypeException(
          'Invited user must be an enterprise user',
        );
      }

      // User must not already be a member/owner
      if (enterprise.isMember(user.id) || enterprise.isOwner(user.id)) {
        throw new EnterpriseConflictException(
          'User is already a member or owner of this enterprise',
        );
      }

      // Check for active pending invitation
      const pending =
        await this.invitationRepository.findPendingByEmailAndEnterpriseId(
          input.email,
          enterpriseId,
        );
      if (pending) {
        throw new EnterpriseConflictException(
          'There is already a pending invitation for this user',
        );
      }

      // Create invitation
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // Expiration in 7 days

      const invitation = EnterpriseInvitationRoot.create({
        enterpriseId,
        email: input.email.toLowerCase(),
        mode: input.mode,
        inviterId: requestedBy,
        expiresAt,
      });

      await this.invitationRepository.save(invitation);

      return EnterpriseInvitationMapper.toDto(invitation);
    });
  }
}
