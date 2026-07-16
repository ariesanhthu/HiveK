import { Command } from '@nestjs/cqrs';
import { EnterpriseInviteMemberInputDto } from './enterprise-invite-member.dto';
import { EnterpriseInvitationDto } from '@/application/dtos/enterprise-invitation.dto';

export class EnterpriseInviteMemberCommand extends Command<EnterpriseInvitationDto> {
  constructor(
    public readonly enterpriseId: string,
    public readonly requestedBy: string,
    public readonly input: EnterpriseInviteMemberInputDto,
  ) {
    super();
  }
}
