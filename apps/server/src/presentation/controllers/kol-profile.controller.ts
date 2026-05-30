import { Controller, Get, Param, Query, Body, Patch, Delete, Post, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { QueryBus, CommandBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { KolProfileGetListQuery, KolProfileGetByIdQuery, KolProfileGetHandlesDevQuery, KolProfileFilterDto } from '@/application/queries';
import { KolProfileUpdateCommand, KolProfileSoftDeleteCommand, KolProfileHardDeleteCommand, KolProfileRestoreCommand, UpdateKolProfileDto } from '@/application/commands';
import { KolProfileDto, SoftDeleteInputDto } from '@/application/dtos';
import { PaginatedResponseDto, CursorPaginationRequestDto } from '@/shared/dtos/pagination.dto';
import { JwtAuthGuard } from '../middleware/guards';

@ApiTags('kol-profiles')
@Controller('kol-profiles')
export class KolProfileController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) { }

  @Get()
  @ApiOperation({ summary: 'Search/List KOL profiles' })
  async findAll(@Query() filters: KolProfileFilterDto): Promise<PaginatedResponseDto<KolProfileDto>> {
    return this.queryBus.execute(new KolProfileGetListQuery(filters));
  }

  @Get('platforms')
  @ApiOperation({ summary: 'Get KOL profile handles mapping (for dev)' })
  async findHandlesDev(@Query() pagination: CursorPaginationRequestDto): Promise<PaginatedResponseDto<any>> {
    return this.queryBus.execute(new KolProfileGetHandlesDevQuery(pagination));
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
