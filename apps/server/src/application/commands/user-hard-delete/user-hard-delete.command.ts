import { Command } from '@nestjs/cqrs';

export class UserHardDeleteCommand extends Command<void> {
  constructor(public readonly id: string) {
    super();
  }
}
