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
import { JwtAuthGuard, RolesGuard } from '@/presentation/middleware/guards';
import { Public } from '@/presentation/decorators/public.decorator';
import { Roles } from '@/presentation/decorators/roles.decorator';
import { ERoleType } from '@/core/enums/role-type.enum';

@ApiTags('ADMIN-campaign-participants')
@ApiBearerAuth()
@ApiSecurity('x-api-key')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ERoleType.ADMIN)
@Controller(buildVersionedRoute('admin', 'campaign-participants', 1))
export class CampaignParticipantAdminController {
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
  @ApiOperation({ summary: 'Create new campaign participant' })
  async create(@Body() input: CampaignParticipantCreateInputDto): Promise<string> {
    return this.commandBus.execute(new CampaignParticipantCreateCommand(input));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update campaign participant' })
  async update(
    @Param('id') id: string,
    @Body() input: CampaignParticipantUpdateInputDto,
  ): Promise<void> {
    return this.commandBus.execute(new CampaignParticipantUpdateCommand(id, input));
  }

  @Patch(':id/soft-delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete campaign participant' })
  async delete(
    @Param('id') id: string,
    @Query() dto: SoftDeleteInputDto,
  ): Promise<void> {
    await this.commandBus.execute(new CampaignParticipantSoftDeleteCommand(id, dto.deletedBy));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Hard delete campaign participant' })
  async hardDelete(@Param('id') id: string): Promise<void> {
    await this.commandBus.execute(new CampaignParticipantHardDeleteCommand(id));
  }

  @Patch(':id/restore')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Restore soft deleted campaign participant' })
  async restore(@Param('id') id: string): Promise<void> {
    await this.commandBus.execute(new CampaignParticipantRestoreCommand(id));
  }
}
