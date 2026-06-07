import { Command } from '@nestjs/cqrs';

export class EnterpriseHardDeleteCommand extends Command<void> {
  constructor(
    public readonly id: string,
    public readonly requestedBy: string,
  ) {
    super();
  }
}
