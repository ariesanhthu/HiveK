import { Controller, Get, Patch, Delete, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { UserGetByIdQuery } from '@/application/queries';
import { UserSoftDeleteCommand, UserHardDeleteCommand, UserRestoreCommand } from '@/application/commands';
import { UserDto, SoftDeleteInputDto } from '@/application/dtos';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) { }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  async getById(@Param('id') id: string): Promise<UserDto> {
    const user = await this.queryBus.execute<UserGetByIdQuery, UserDto>(
      new UserGetByIdQuery(id),
    );
    return user;
  }

  @Patch(':id/soft-delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete user' })
  async delete(
    @Param('id') id: string,
    @Query() dto: SoftDeleteInputDto,
  ): Promise<void> {
    return this.commandBus.execute(new UserSoftDeleteCommand(id, dto.deletedBy));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Hard delete user' })
  async hardDelete(@Param('id') id: string): Promise<void> {
    return this.commandBus.execute(new UserHardDeleteCommand(id));
  }

  @Patch(':id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restore soft deleted user' })
  async restore(@Param('id') id: string): Promise<void> {
    return this.commandBus.execute(new UserRestoreCommand(id));
  }
}
