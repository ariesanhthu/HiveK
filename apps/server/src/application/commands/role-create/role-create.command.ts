import { Command } from '@nestjs/cqrs';
import { RoleCreateInputDto } from './role-create.dto';

export class RoleCreateCommand extends Command<string> {
  constructor(public readonly input: RoleCreateInputDto) {
    super();
  }
}
