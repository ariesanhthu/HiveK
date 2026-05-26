import { Command } from '@nestjs/cqrs';

export class KolProfileSoftDeleteCommand extends Command<void> {
  constructor(
    public readonly id: string,
    public readonly deletedBy: string = 'system',
  ) {
    super();
  }
}
