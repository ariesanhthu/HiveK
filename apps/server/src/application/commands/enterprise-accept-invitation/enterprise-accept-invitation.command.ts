import { Command } from '@nestjs/cqrs';

export class EnterpriseAcceptInvitationCommand extends Command<void> {
  constructor(
    public readonly enterpriseId: string,
    public readonly invitationId: string,
    public readonly userId: string,
  ) {
    super();
  }
}
