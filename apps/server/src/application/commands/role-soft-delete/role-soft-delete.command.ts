import { Command } from '@nestjs/cqrs';

export class RoleSoftDeleteCommand extends Command<void> {
  constructor(
    public readonly id: string,
    public readonly deletedBy: string = 'system',
  ) {
    super();
  }
}
