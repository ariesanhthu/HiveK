import { Controller, Get, Post, Patch, Delete, Body, Param, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import {
  CampaignParticipantCreateCommand,
  CampaignParticipantUpdateCommand,
  CampaignParticipantSoftDeleteCommand,
  CampaignParticipantHardDeleteCommand,
  CampaignParticipantRestoreCommand,
  CampaignParticipantCreateInputDto,
  CampaignParticipantUpdateInputDto,
} from '@/application/commands';
import {
  CampaignParticipantGetByIdQuery,
  CampaignParticipantGetListQuery,
  CampaignParticipantFilterDto,
} from '@/application/queries';
import { CampaignParticipantDto, SoftDeleteInputDto } from '@/application/dtos';
import { PaginatedResponseDto } from '@/application/dtos/pagination.dto';
import { JwtAuthGuard } from '../middleware/guards';
import { Public } from '@/presentation/decorators/public.decorator';

@ApiTags('campaign-participants')
@ApiBearerAuth()
@ApiSecurity('x-api-key')
@Controller('campaign-participants')
export class CampaignParticipantController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all campaign participants' })
  async findAll(@Query() filters: CampaignParticipantFilterDto): Promise<PaginatedResponseDto<CampaignParticipantDto>> {
    return this.queryBus.execute(new CampaignParticipantGetListQuery(filters));
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get campaign participant by ID' })
  async findById(@Param('id') id: string): Promise<CampaignParticipantDto> {
    return this.queryBus.execute(new CampaignParticipantGetByIdQuery(id));
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create new campaign participant' })
  async create(@Body() input: CampaignParticipantCreateInputDto): Promise<string> {
    return this.commandBus.execute(new CampaignParticipantCreateCommand(input));
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update campaign participant' })
  async update(
    @Param('id') id: string,
    @Body() input: CampaignParticipantUpdateInputDto,
  ): Promise<void> {
    return this.commandBus.execute(new CampaignParticipantUpdateCommand(id, input));
  }

  @Patch(':id/soft-delete')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete campaign participant' })
  async delete(
    @Param('id') id: string,
    @Query() dto: SoftDeleteInputDto,
  ): Promise<void> {
    return this.commandBus.execute(new CampaignParticipantSoftDeleteCommand(id, dto.deletedBy));
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Hard delete campaign participant' })
  async hardDelete(@Param('id') id: string): Promise<void> {
    return this.commandBus.execute(new CampaignParticipantHardDeleteCommand(id));
  }

  @Public()
  @Patch(':id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restore soft deleted campaign participant' })
  async restore(@Param('id') id: string): Promise<void> {
    return this.commandBus.execute(new CampaignParticipantRestoreCommand(id));
  }
}
