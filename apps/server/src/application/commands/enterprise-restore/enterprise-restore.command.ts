import { Command } from '@nestjs/cqrs';

export class EnterpriseRestoreCommand extends Command<void> {
  constructor(public readonly id: string) {
    super();
  }
}
