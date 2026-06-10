import { Command } from '@nestjs/cqrs';

export class RoleRestoreCommand extends Command<void> {
  constructor(public readonly id: string) {
    super();
  }
}
