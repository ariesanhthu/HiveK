import { Controller, Get, Post, Patch, Delete, Param, Query, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { RoleGetByIdQuery, RoleGetListQuery } from '@/application/queries';
import {
  RoleCreateCommand,
  RoleUpdateCommand,
  RoleSoftDeleteCommand,
  RoleHardDeleteCommand,
  RoleRestoreCommand,
} from '@/application/commands';
import { RoleDto, RoleFilterDto, SoftDeleteInputDto } from '@/application/dtos';
import { JwtAuthGuard, RolesGuard } from '../middleware/guards';
import { Roles } from '@/presentation/decorators/roles.decorator';
import { ERoleType } from '@/core/enums';
import { PaginatedResponseDto } from '@/shared/dtos/pagination.dto';
import { RoleCreateInputDto } from '@/application/commands/role-create/role-create.dto';
import { RoleUpdateInputDto } from '@/application/commands/role-update/role-update.dto';

@ApiTags('roles')
@ApiBearerAuth()
@ApiSecurity('x-api-key')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ERoleType.ADMIN)
@Controller('roles')
export class RoleController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new role' })
  async create(@Body() input: RoleCreateInputDto): Promise<{ id: string }> {
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
  async findAll(@Query() filters: RoleFilterDto): Promise<PaginatedResponseDto<RoleDto>> {
    console.log("RUNNING")
    return this.queryBus.execute<RoleGetListQuery, PaginatedResponseDto<RoleDto>>(
      new RoleGetListQuery(filters),
    );
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
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restore soft deleted role' })
  async restore(@Param('id') id: string): Promise<void> {
    await this.commandBus.execute(new RoleRestoreCommand(id));
  }
}
