import { Command } from '@nestjs/cqrs';

export class ReviewRestoreCommand extends Command<void> {
  constructor(
    public readonly id: string,
  ) {
    super();
  }
}
