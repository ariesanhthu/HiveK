import { Command } from '@nestjs/cqrs';

export class EnterpriseSoftDeleteCommand extends Command<void> {
  constructor(
    public readonly id: string,
    public readonly requestedBy: string,
    public readonly deletedBy: string = 'system',
  ) {
    super();
  }
}
