import { Controller, Get, Post, Patch, Delete, Body, Param, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { buildVersionedRoute } from '@presentation/utils';
import {
  CampaignParticipantCreateCommand,
  CampaignParticipantUpdateCommand,
  CampaignParticipantSoftDeleteCommand,
  CampaignParticipantHardDeleteCommand,
  CampaignParticipantRestoreCommand,
  CampaignParticipantUpdateStatusCommand,
  CampaignParticipantCreateInputDto,
  CampaignParticipantUpdateInputDto,
  CampaignParticipantUpdateStatusInputDto,
} from '@/application/commands';
import {
  CampaignParticipantGetByIdQuery,
  CampaignParticipantGetListQuery,
  CampaignParticipantFilterDto,
} from '@/application/queries';
import { CampaignParticipantDto, SoftDeleteInputDto } from '@/application/dtos';
import { PaginatedResponseDto } from '@/application/dtos/pagination.dto';
import { JwtAuthGuard, RolesGuard } from '@/presentation/middleware/guards';
import { Public } from '@/presentation/decorators/public.decorator';
import { ERoleType } from '@/core/enums';
import { Roles } from '@/presentation/decorators/roles.decorator';
import { CurrentUser } from '@/presentation/decorators/current-user.decorator';

@ApiTags('CLIENT-campaign-participants')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiSecurity('x-api-key')
@Controller(buildVersionedRoute('client', 'campaign-participants', 1))
export class CampaignParticipantClientController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all campaign participants' })
  async findAll(@Query() filters: CampaignParticipantFilterDto): Promise<PaginatedResponseDto<CampaignParticipantDto>> {
    return this.queryBus.execute(new CampaignParticipantGetListQuery(filters));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get campaign participant by ID' })
  async findById(@Param('id') id: string): Promise<CampaignParticipantDto> {
    return this.queryBus.execute(new CampaignParticipantGetByIdQuery(id));
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(ERoleType.ENTERPRISE)
  @ApiOperation({ summary: 'Create new campaign participant' })
  async create(@Body() input: CampaignParticipantCreateInputDto): Promise<string> {
    return this.commandBus.execute(new CampaignParticipantCreateCommand(input));
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(ERoleType.ENTERPRISE)
  @ApiOperation({ summary: 'Update campaign participant' })
  async update(
    @Param('id') id: string,
    @Body() input: CampaignParticipantUpdateInputDto,
  ): Promise<void> {
    return this.commandBus.execute(new CampaignParticipantUpdateCommand(id, input));
  }

  @Patch(':id/soft-delete')
  @UseGuards(RolesGuard)
  @Roles(ERoleType.ENTERPRISE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete campaign participant' })
  async delete(
    @Param('id') id: string,
    @Query() dto: SoftDeleteInputDto,
  ): Promise<void> {
    return this.commandBus.execute(new CampaignParticipantSoftDeleteCommand(id, dto.deletedBy));
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(ERoleType.ENTERPRISE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Hard delete campaign participant' })
  async hardDelete(@Param('id') id: string): Promise<void> {
    return this.commandBus.execute(new CampaignParticipantHardDeleteCommand(id));
  }

  @UseGuards(RolesGuard)
  @Roles(ERoleType.ENTERPRISE)
  @Patch(':id/restore')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Restore soft deleted campaign participant' })
  async restore(@Param('id') id: string): Promise<void> {
    return this.commandBus.execute(new CampaignParticipantRestoreCommand(id));
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(ERoleType.KOL)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Update campaign participant status by KOL' })
  async updateStatus(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @Body() input: CampaignParticipantUpdateStatusInputDto,
  ): Promise<void> {
    return this.commandBus.execute(new CampaignParticipantUpdateStatusCommand(id, userId, input));
  }
}
