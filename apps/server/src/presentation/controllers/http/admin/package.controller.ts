import { Controller, Get, Post, Patch, Delete, Param, Query, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { buildVersionedRoute } from '@/presentation/utils';
import {
  PackageCreateCommand,
  PackageCreateInputDto,
  PackageUpdateCommand,
  PackageUpdateInputDto,
  PackageUpdateStatusCommand,
  PackageUpdateStatusInputDto,
  PackageDeleteCommand,
  PackageDeleteInputDto,
} from '@/application/commands';
import { PackageGetListQuery, PackageGetByIdQuery, PackageFilterDto } from '@/application/queries';
import { PackageResponseDto } from '@/application/dtos';
import { PaginatedResponseDto } from '@/application/dtos/pagination.dto';
import { JwtAuthGuard, RolesGuard } from '@/presentation/middleware/guards';
import { CurrentUser, Roles, ApiOkResponseEnvelope, ApiPaginatedResponseEnvelope } from '@/presentation/decorators';
import { ERoleType } from '@/core/enums';
import type { IJwtPayload } from '@/application/interfaces';

@ApiTags('ADMIN-packages')
@ApiBearerAuth()
@ApiSecurity('x-api-key')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ERoleType.ADMIN)
@Controller(buildVersionedRoute('admin', 'packages', 1))
export class PackageAdminController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new package' })
  @ApiOkResponseEnvelope(PackageResponseDto)
  async create(@Body() input: PackageCreateInputDto): Promise<PackageResponseDto> {
    return this.commandBus.execute(new PackageCreateCommand(input));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a package' })
  @ApiOkResponseEnvelope(PackageResponseDto)
  async update(
    @Param('id') id: string,
    @Body() input: PackageUpdateInputDto,
  ): Promise<PackageResponseDto> {
    return this.commandBus.execute(new PackageUpdateCommand(id, input));
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update package status (publish/archive)' })
  @ApiOkResponseEnvelope(PackageResponseDto)
  async updateStatus(
    @Param('id') id: string,
    @Body() input: PackageUpdateStatusInputDto,
  ): Promise<PackageResponseDto> {
    return this.commandBus.execute(new PackageUpdateStatusCommand(id, input));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a package' })
  async delete(
    @CurrentUser() user: IJwtPayload,
    @Param('id') id: string,
  ): Promise<void> {
    const deleteInput = { id, deletedBy: user.sub as string } as PackageDeleteInputDto;
    return this.commandBus.execute(new PackageDeleteCommand(deleteInput));
  }

  @Get()
  @ApiOperation({ summary: 'Get all packages' })
  @ApiPaginatedResponseEnvelope(PackageResponseDto)
  async findAll(@Query() filters: PackageFilterDto): Promise<PaginatedResponseDto<PackageResponseDto>> {
    return this.queryBus.execute(new PackageGetListQuery(filters));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a package by ID' })
  @ApiOkResponseEnvelope(PackageResponseDto)
  async findById(@Param('id') id: string): Promise<PackageResponseDto | null> {
    return this.queryBus.execute(new PackageGetByIdQuery({ id }));
  }
}
