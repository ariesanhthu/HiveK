import { Command } from '@nestjs/cqrs';

export class PlatformRestoreCommand extends Command<void> {
  constructor(public readonly id: string) {
    super();
  }
}
