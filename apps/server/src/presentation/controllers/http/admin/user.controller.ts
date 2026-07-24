import {
  UserCreateCommand,
  UserHardDeleteCommand,
  UserRestoreCommand,
  UserSoftDeleteCommand,
  UserUpdateCommand,
} from '@/application/commands';
import { UserCreateInputDto } from '@/application/commands/user-create/user-create.dto';
import { UserUpdateInputDto } from '@/application/commands/user-update/user-update.dto';
import { SoftDeleteInputDto, UserDto, UserFilterDto } from '@/application/dtos';
import { PaginatedResponseDto } from '@/application/dtos/pagination.dto';
import { UserGetByIdQuery, UserGetListQuery } from '@/application/queries';
import { ERoleType } from '@/core/enums';
import { Roles } from '@/presentation/decorators/roles.decorator';
import { JwtAuthGuard, RolesGuard } from '@/presentation/middleware/guards';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { buildVersionedRoute } from '@presentation/utils';

@ApiTags('ADMIN-users')
@ApiBearerAuth()
@ApiSecurity('x-api-key')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ERoleType.ADMIN)
@Controller(buildVersionedRoute('admin', 'users', 1))
export class UserAdminController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  async create(@Body() input: UserCreateInputDto): Promise<{ id: string; }> {
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
  async findAll(
    @Query() filters: UserFilterDto,
  ): Promise<PaginatedResponseDto<UserDto>> {
    return this.queryBus.execute<
      UserGetListQuery,
      PaginatedResponseDto<UserDto>
    >(new UserGetListQuery(filters));
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
    return this.commandBus.execute(
      new UserSoftDeleteCommand(id, dto.deletedBy),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Hard delete user' })
  async hardDelete(@Param('id') id: string): Promise<void> {
    await this.commandBus.execute(new UserHardDeleteCommand(id));
  }

  @Patch(':id/restore')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Restore soft deleted user' })
  async restore(@Param('id') id: string): Promise<void> {
    await this.commandBus.execute(new UserRestoreCommand(id));
  }
}
