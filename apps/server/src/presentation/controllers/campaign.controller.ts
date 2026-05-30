import { Controller, Get, Post, Patch, Delete, Body, Param, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CampaignCreateCommand, CampaignUpdateCommand, CampaignSoftDeleteCommand, CampaignHardDeleteCommand, CampaignRestoreCommand, CampaignCreateInputDto, CampaignUpdateInputDto } from '@/application/commands';
import { CampaignGetListQuery, CampaignGetByIdQuery, CampaignFilterDto } from '@/application/queries';
import { CampaignDto, SoftDeleteInputDto } from '@/application/dtos';
import { PaginatedResponseDto } from '@/shared/dtos/pagination.dto';
import { JwtAuthGuard } from '../middleware/guards';

@ApiTags('campaigns')
@Controller('campaigns')
export class CampaignController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) { }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all campaigns' })
  async findAll(@Query() filters: CampaignFilterDto): Promise<PaginatedResponseDto<CampaignDto>> {
    return this.queryBus.execute(new CampaignGetListQuery(filters));
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get campaign by ID' })
  async findById(@Param('id') id: string): Promise<CampaignDto> {
    return this.queryBus.execute(new CampaignGetByIdQuery(id));
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create new campaign' })
  async create(@Body() input: CampaignCreateInputDto): Promise<CampaignDto> {
    return this.commandBus.execute(new CampaignCreateCommand(input));
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update campaign' })
  async update(
    @Param('id') id: string,
    @Body() input: CampaignUpdateInputDto,
  ): Promise<CampaignDto> {
    return this.commandBus.execute(new CampaignUpdateCommand(id, input));
  }

  @Patch(':id/soft-delete')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete campaign' })
  async delete(
    @Param('id') id: string,
    @Query() dto: SoftDeleteInputDto,
  ): Promise<void> {
    return this.commandBus.execute(new CampaignSoftDeleteCommand(id, dto.deletedBy));
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Hard delete campaign' })
  async hardDelete(@Param('id') id: string): Promise<void> {
    return this.commandBus.execute(new CampaignHardDeleteCommand(id));
  }

  @Patch(':id/restore')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restore soft deleted campaign' })
  async restore(@Param('id') id: string): Promise<void> {
    return this.commandBus.execute(new CampaignRestoreCommand(id));
  }
}
