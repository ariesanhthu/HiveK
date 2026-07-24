import {
  RoleCreateCommand,
  RoleHardDeleteCommand,
  RoleRestoreCommand,
  RoleSoftDeleteCommand,
  RoleUpdateCommand,
} from '@/application/commands';
import { RoleCreateInputDto } from '@/application/commands/role-create/role-create.dto';
import { RoleUpdateInputDto } from '@/application/commands/role-update/role-update.dto';
import { RoleDto, RoleFilterDto, SoftDeleteInputDto } from '@/application/dtos';
import { PaginatedResponseDto } from '@/application/dtos/pagination.dto';
import { RoleGetByIdQuery, RoleGetListQuery } from '@/application/queries';
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
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { buildVersionedRoute } from '@presentation/utils';

@ApiTags('ADMIN-roles')
@ApiBearerAuth()
@ApiSecurity('x-api-key')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ERoleType.ADMIN)
@Controller(buildVersionedRoute('admin', 'roles', 1))
export class RoleAdminController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new role' })
  async create(@Body() input: RoleCreateInputDto): Promise<{ id: string; }> {
    const id = await this.commandBus.execute<RoleCreateCommand, string>(
      new RoleCreateCommand(input),
    );
    return { id };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a role' })
  async update(
    @Param('id') id: string,
    @Body() input: RoleUpdateInputDto,
  ): Promise<void> {
    await this.commandBus.execute(new RoleUpdateCommand(id, input));
  }

  @Get()
  @ApiOperation({ summary: 'Get paginated list of roles' })
  async findAll(
    @Query() filters: RoleFilterDto,
  ): Promise<PaginatedResponseDto<RoleDto>> {
    return this.queryBus.execute<
      RoleGetListQuery,
      PaginatedResponseDto<RoleDto>
    >(new RoleGetListQuery(filters));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get role by ID' })
  async findById(@Param('id') id: string): Promise<RoleDto> {
    return this.queryBus.execute<RoleGetByIdQuery, RoleDto>(
      new RoleGetByIdQuery(id),
    );
  }

  @Patch(':id/soft-delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete role' })
  async delete(
    @Param('id') id: string,
    @Query() dto: SoftDeleteInputDto,
  ): Promise<void> {
    await this.commandBus.execute(new RoleSoftDeleteCommand(id, dto.deletedBy));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Hard delete role' })
  async hardDelete(@Param('id') id: string): Promise<void> {
    await this.commandBus.execute(new RoleHardDeleteCommand(id));
  }

  @Patch(':id/restore')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Restore soft deleted role' })
  async restore(@Param('id') id: string): Promise<void> {
    await this.commandBus.execute(new RoleRestoreCommand(id));
  }
}
