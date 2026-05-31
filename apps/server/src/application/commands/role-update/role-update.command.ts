import { Command } from '@nestjs/cqrs';
import { RoleUpdateInputDto } from '../../dtos/role.dto';

export class RoleUpdateCommand extends Command<void> {
  constructor(
    public readonly id: string,
    public readonly input: RoleUpdateInputDto,
  ) {
    super();
  }
}
