import { Command } from '@nestjs/cqrs';

export class ProposalUpdateStatusCommand extends Command<void> {
  constructor(
    public readonly id: string,
    public readonly status: string,
    public readonly requestedBy: string,
  ) {
    super();
  }
}
