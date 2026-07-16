import { Command } from '@nestjs/cqrs';
import { EnterpriseRevokeMemberInputDto } from './enterprise-revoke-member.dto';

export class EnterpriseRevokeMemberCommand extends Command<void> {
  constructor(
    public readonly enterpriseId: string,
    public readonly requestedBy: string,
    public readonly input: EnterpriseRevokeMemberInputDto,
  ) {
    super();
  }
}
