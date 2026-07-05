import { Command } from '@nestjs/cqrs';

export class ReviewModerateCommand extends Command<void> {
  constructor(
    public readonly id: string,
    public readonly action: 'approve' | 'reject',
    public readonly requestedBy: string,
  ) {
    super();
  }
}
