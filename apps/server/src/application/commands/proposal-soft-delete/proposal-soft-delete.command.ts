import { Command } from '@nestjs/cqrs';

export class ProposalSoftDeleteCommand extends Command<void> {
  constructor(
    public readonly id: string,
    public readonly deletedBy: string,
  ) {
    super();
  }
}
