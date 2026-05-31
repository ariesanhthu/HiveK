import { Command } from '@nestjs/cqrs';
import { RoleCreateInputDto } from '../../dtos/role.dto';

export class RoleCreateCommand extends Command<string> {
  constructor(public readonly input: RoleCreateInputDto) {
    super();
  }
}
