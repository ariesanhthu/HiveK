import { Controller, Get, Post, Patch, Delete, Param, Query, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { UserGetByIdQuery, UserGetListQuery } from '@/application/queries';
import { UserCreateCommand, UserUpdateCommand, UserSoftDeleteCommand, UserHardDeleteCommand, UserRestoreCommand } from '@/application/commands';
import { UserDto, UserFilterDto, UserCreateInputDto, UserUpdateInputDto, SoftDeleteInputDto } from '@/application/dtos';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../middleware/guards';
import { UseGuards } from '@nestjs/common';
import { Roles } from '@/presentation/decorators/roles.decorator';
import { ERoleType } from '@/core/enums';
import { PaginatedResponseDto } from '@/shared/dtos/pagination.dto';

@ApiTags('users')
@UseGuards(JwtAuthGuard)
@Roles(ERoleType.ADMIN)
@Controller('users')
export class UserController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) { }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  async create(@Body() input: UserCreateInputDto): Promise<{ id: string }> {
    const id = await this.commandBus.execute<UserCreateCommand, string>(
      new UserCreateCommand(input),
    );
    return { id };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user' })
  async update(
    @Param('id') id: string,
    @Body() input: UserUpdateInputDto,
  ): Promise<void> {
    await this.commandBus.execute(new UserUpdateCommand(id, input));
  }

  @Get()
  @ApiOperation({ summary: 'Get paginated list of users' })
  async findAll(@Query() filters: UserFilterDto): Promise<PaginatedResponseDto<UserDto>> {
    return this.queryBus.execute<UserGetListQuery, PaginatedResponseDto<UserDto>>(
      new UserGetListQuery(filters),
    );
  }

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
