import { Command } from '@nestjs/cqrs';

export class PlatformSoftDeleteCommand extends Command<void> {
  constructor(
    public readonly id: string,
    public readonly deletedBy: string = 'system',
  ) {
    super();
  }
}
