import { Query } from '@nestjs/cqrs';
import { RoleDto } from '../../dtos/role.dto';

export class RoleGetByIdQuery extends Query<RoleDto> {
  constructor(public readonly id: string) {
    super();
  }
}
