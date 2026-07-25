import { Query } from '@nestjs/cqrs';
import { EnterpriseInvitationDto } from '@/application/dtos/enterprise-invitation.dto';
import { PaginatedResponseDto } from '@/application/dtos/pagination.dto';
import { EnterpriseInvitationFilterDto } from './enterprise-get-my-invitations.dto';

export class EnterpriseGetMyInvitationsQuery extends Query<PaginatedResponseDto<EnterpriseInvitationDto>> {
  constructor(
    public readonly email: string,
    public readonly filters: EnterpriseInvitationFilterDto,
  ) {
    super();
  }
}
