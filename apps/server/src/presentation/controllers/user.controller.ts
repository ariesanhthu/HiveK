import { Controller, Get, Param } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { UserGetByIdQuery } from '@/application/queries';
import { UserDto } from '@/application/dtos';

@Controller('users')
export class UserController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get(':id')
  async getById(@Param('id') id: string): Promise<UserDto> {
    const user = await this.queryBus.execute<UserGetByIdQuery, UserDto>(
      new UserGetByIdQuery(id),
    );
    return user;
  }
}
