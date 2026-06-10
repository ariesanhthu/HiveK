import { Command } from '@nestjs/cqrs';
import { RoleUpdateInputDto } from './role-update.dto';

export class RoleUpdateCommand extends Command<void> {
  constructor(
    public readonly id: string,
    public readonly input: RoleUpdateInputDto,
  ) {
    super();
  }
}
