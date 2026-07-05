import { Command } from '@nestjs/cqrs';

export class ReviewSoftDeleteCommand extends Command<void> {
  constructor(
    public readonly id: string,
    public readonly deletedBy: string,
  ) {
    super();
  }
}
