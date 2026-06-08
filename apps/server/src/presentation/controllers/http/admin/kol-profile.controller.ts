import { Controller, Get, Param, Query, Body, Patch, Delete, Post, HttpCode, HttpStatus, UseGuards, Req, Res, Injectable } from '@nestjs/common';
import { QueryBus, CommandBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { buildVersionedRoute } from '@presentation/utils';
import { KolProfileGetListQuery, KolProfileGetByIdQuery, KolProfileGetHandlesDevQuery, KolProfileFilterDto } from '@/application/queries';
import { KolProfileUpdateCommand, KolProfileSoftDeleteCommand, KolProfileHardDeleteCommand, KolProfileRestoreCommand, UpdateKolProfileDto } from '@/application/commands';
import { KolProfileDto, SoftDeleteInputDto } from '@/application/dtos';
import { PaginatedResponseDto, CursorPaginationRequestDto } from '@/application/dtos/pagination.dto';
import { JwtAuthGuard, YoutubeAuthGuard, FacebookAuthGuard, RolesGuard } from '@/presentation/middleware/guards';
import { Public } from '@/presentation/decorators/public.decorator';
import { AuthGuard } from '@nestjs/passport';
import { ERoleType } from '@/core/enums/role-type.enum';
import { Roles } from '@/presentation/decorators/roles.decorator';

@ApiTags('ADMIN-kol-profiles')
@ApiBearerAuth()
@ApiSecurity('x-api-key')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ERoleType.ADMIN)
@Controller(buildVersionedRoute('admin', 'kol-profiles', 1))
export class KolProfileAdminController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) { }
  @Get()
  @ApiOperation({ summary: 'Search/List KOL profiles' })
  async findAll(@Query() filters: KolProfileFilterDto): Promise<PaginatedResponseDto<KolProfileDto>> {
    return this.queryBus.execute(new KolProfileGetListQuery(filters));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get KOL profile by ID' })
  async findById(@Param('id') id: string): Promise<KolProfileDto> {
    return this.queryBus.execute(new KolProfileGetByIdQuery(id));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update anything of an influencer (PATCH)' })
  async update(@Param('id') id: string, @Body() input: UpdateKolProfileDto): Promise<KolProfileDto> {
    return this.commandBus.execute(new KolProfileUpdateCommand(id, input));
  }

  @Patch(':id/soft-delete')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete KOL profile' })
  async delete(
    @Param('id') id: string,
    @Query() dto: SoftDeleteInputDto,
  ): Promise<void> {
    return this.commandBus.execute(new KolProfileSoftDeleteCommand(id, dto.deletedBy));
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Hard delete KOL profile' })
  async hardDelete(@Param('id') id: string): Promise<void> {
    return this.commandBus.execute(new KolProfileHardDeleteCommand(id));
  }

  @Patch(':id/restore')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Restore soft deleted KOL profile' })
  async restore(@Param('id') id: string): Promise<void> {
    return this.commandBus.execute(new KolProfileRestoreCommand(id));
  }
}
