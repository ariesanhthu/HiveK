import { Query } from '@nestjs/cqrs';
import { EnterpriseInvitationDto } from '@/application/dtos/enterprise-invitation.dto';

export class EnterpriseGetInvitationsQuery extends Query<
  EnterpriseInvitationDto[]
> {
  constructor(
    public readonly enterpriseId: string,
    public readonly requestedBy: string,
  ) {
    super();
  }
}
