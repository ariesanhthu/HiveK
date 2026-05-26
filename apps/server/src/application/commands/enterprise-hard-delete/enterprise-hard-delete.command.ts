import { Command } from '@nestjs/cqrs';

export class EnterpriseHardDeleteCommand extends Command<void> {
  constructor(public readonly id: string) {
    super();
  }
}
