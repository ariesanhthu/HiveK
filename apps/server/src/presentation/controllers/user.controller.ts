import { Controller, Get, Param } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { GetUserQuery } from '@/application/users/queries';
import { UserDto } from '@/application/users/dtos';

@Controller('users')
export class UserController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get(':id')
  async getById(@Param('id') id: string): Promise<UserDto> {
    const user = await this.queryBus.execute<GetUserQuery, UserDto>(
      new GetUserQuery(id),
    );
    return user;
  }
}
