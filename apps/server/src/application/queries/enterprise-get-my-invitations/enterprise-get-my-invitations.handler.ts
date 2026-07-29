import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  ENTERPRISE_INVITATION_READ_SERVICE,
  type IEnterpriseInvitationReadService,
} from '@/application/interfaces';
import { EnterpriseGetMyInvitationsQuery } from './enterprise-get-my-invitations.query';
import { EnterpriseInvitationDto } from '@/application/dtos/enterprise-invitation.dto';
import { PaginatedResponseDto } from '@/application/dtos/pagination.dto';

@QueryHandler(EnterpriseGetMyInvitationsQuery)
export class EnterpriseGetMyInvitationsQueryHandler implements IQueryHandler<
  EnterpriseGetMyInvitationsQuery,
  PaginatedResponseDto<EnterpriseInvitationDto>
> {
  constructor(
    @Inject(ENTERPRISE_INVITATION_READ_SERVICE)
    private readonly readService: IEnterpriseInvitationReadService,
  ) {}

  async execute(
    query: EnterpriseGetMyInvitationsQuery,
  ): Promise<PaginatedResponseDto<EnterpriseInvitationDto>> {
    const { email, filters } = query;
    return this.readService.findAll({
      ...filters,
      email,
    });
  }
}
