import { Command } from '@nestjs/cqrs';

export class PlatformHardDeleteCommand extends Command<void> {
  constructor(public readonly id: string) {
    super();
  }
}
