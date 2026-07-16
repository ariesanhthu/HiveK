import { Command } from '@nestjs/cqrs';

export class EnterpriseRevokeInvitationCommand extends Command<void> {
  constructor(
    public readonly enterpriseId: string,
    public readonly invitationId: string,
    public readonly requestedBy: string,
  ) {
    super();
  }
}
