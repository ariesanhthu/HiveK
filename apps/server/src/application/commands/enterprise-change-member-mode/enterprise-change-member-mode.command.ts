import { Command } from '@nestjs/cqrs';
import { EnterpriseChangeMemberModeInputDto } from './enterprise-change-member-mode.dto';

export class EnterpriseChangeMemberModeCommand extends Command<void> {
  constructor(
    public readonly enterpriseId: string,
    public readonly requestedBy: string,
    public readonly input: EnterpriseChangeMemberModeInputDto,
  ) {
    super();
  }
}
