import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  EnterpriseNotFoundException,
  EnterpriseForbiddenException,
} from '@/core/exceptions';
import {
  ENTERPRISE_REPOSITORY,
  ENTERPRISE_INVITATION_REPOSITORY,
  type IEnterpriseRepository,
  type IEnterpriseInvitationRepository,
} from '@/core/interfaces/repositories';
import { EnterpriseGetInvitationsQuery } from './enterprise-get-invitations.query';
import { EnterpriseInvitationDto } from '@/application/dtos/enterprise-invitation.dto';
import { EnterpriseInvitationMapper } from '@/application/mappers';

@QueryHandler(EnterpriseGetInvitationsQuery)
export class EnterpriseGetInvitationsQueryHandler implements IQueryHandler<
  EnterpriseGetInvitationsQuery,
  EnterpriseInvitationDto[]
> {
  constructor(
    @Inject(ENTERPRISE_REPOSITORY)
    private readonly enterpriseRepository: IEnterpriseRepository,
    @Inject(ENTERPRISE_INVITATION_REPOSITORY)
    private readonly invitationRepository: IEnterpriseInvitationRepository,
  ) {}

  async execute(
    query: EnterpriseGetInvitationsQuery,
  ): Promise<EnterpriseInvitationDto[]> {
    const { enterpriseId, requestedBy } = query;

    const enterprise = await this.enterpriseRepository.findById(enterpriseId);
    if (!enterprise) {
      throw new EnterpriseNotFoundException(enterpriseId);
    }

    if (
      !enterprise.isOwner(requestedBy) &&
      !enterprise.isSubOwner(requestedBy)
    ) {
      throw new EnterpriseForbiddenException();
    }

    const invitations =
      await this.invitationRepository.findByEnterpriseId(enterpriseId);
    return EnterpriseInvitationMapper.toListDto(invitations);
  }
}
