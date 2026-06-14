import { Command } from '@nestjs/cqrs';

export class ProposalUpdateMetricsCommand extends Command<void> {
  constructor(
    public readonly id: string,
    public readonly key: string,
    public readonly value: number,
  ) {
    super();
  }
}
