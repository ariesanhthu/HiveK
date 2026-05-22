import { Controller, Get, Post, Patch, Delete, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CreateCampaignCommand, UpdateCampaignCommand, DeleteCampaignCommand } from '@/application/campaigns/commands';
import { GetCampaignsQuery, GetCampaignByIdQuery } from '@/application/campaigns/queries';
import { CreateCampaignInputDto, UpdateCampaignInputDto, CampaignDto, CampaignFilterDto } from '@/application/campaigns/dtos';
import { PaginatedResponseDto } from '@/shared/dtos/pagination.dto';

@ApiTags('campaigns')
@Controller('campaigns')
export class CampaignController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all campaigns' })
  async findAll(@Query() filters: CampaignFilterDto): Promise<PaginatedResponseDto<CampaignDto>> {
    return this.queryBus.execute(new GetCampaignsQuery(filters));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get campaign by ID' })
  async findById(@Param('id') id: string): Promise<CampaignDto> {
    return this.queryBus.execute(new GetCampaignByIdQuery(id));
  }

  @Post()
  @ApiOperation({ summary: 'Create new campaign' })
  async create(@Body() input: CreateCampaignInputDto): Promise<CampaignDto> {
    return this.commandBus.execute(new CreateCampaignCommand(input));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update campaign' })
  async update(
    @Param('id') id: string,
    @Body() input: UpdateCampaignInputDto,
  ): Promise<CampaignDto> {
    return this.commandBus.execute(new UpdateCampaignCommand(id, input));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete campaign' })
  async delete(@Param('id') id: string): Promise<void> {
    return this.commandBus.execute(new DeleteCampaignCommand(id));
  }
}
