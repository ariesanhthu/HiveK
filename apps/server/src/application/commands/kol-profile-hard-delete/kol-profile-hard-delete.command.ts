import { Command } from '@nestjs/cqrs';

export class KolProfileHardDeleteCommand extends Command<void> {
  constructor(public readonly id: string) {
    super();
  }
}
