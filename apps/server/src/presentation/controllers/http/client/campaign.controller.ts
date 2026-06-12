import { Controller, Get, Post, Patch, Param, Query, Body, HttpCode, HttpStatus, UseGuards, Delete } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { buildVersionedRoute } from '@presentation/utils';
import {
  CampaignCreateCommand,
  CampaignUpdateCommand,
  CampaignSoftDeleteCommand,
  CampaignRestoreCommand,
  CampaignCreateInputDto,
  CampaignUpdateInputDto,
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
import { CampaignGetListQuery, CampaignGetByIdQuery, CampaignFilterDto } from '@/application/queries';
import { CampaignDto, SoftDeleteInputDto } from '@/application/dtos';
import { PaginatedResponseDto } from '@/application/dtos/pagination.dto';
import { JwtAuthGuard, RolesGuard } from '@/presentation/middleware/guards';
import { CurrentUser } from '@/presentation/decorators/current-user.decorator';
import { CampaignInviteCollaboratorCommand, CampaignRevokeCollaboratorCommand, CampaignUpdateStatusCommand, CampaignUpdateStatusInputDto, CampaignInviteCollaboratorInputDto, CampaignRevokeCollaboratorInputDto } from '@/application/commands';
import { Roles } from '@/presentation/decorators/roles.decorator';
import { ERoleType } from '@/core/enums';

@ApiTags('CLIENT-campaigns')
@ApiBearerAuth()
@ApiSecurity('x-api-key')
@UseGuards(JwtAuthGuard)
@Controller(buildVersionedRoute('client', 'campaigns', 1))
export class CampaignClientController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) { }

  @Get()
  @ApiOperation({ summary: 'Get all campaigns' })
  async findAll(@Query() filters: CampaignFilterDto): Promise<PaginatedResponseDto<CampaignDto>> {
    return this.queryBus.execute(new CampaignGetListQuery(filters));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get campaign by ID' })
  async findById(@Param('id') id: string): Promise<CampaignDto> {
    return this.queryBus.execute(new CampaignGetByIdQuery(id));
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(ERoleType.ENTERPRISE)
  @ApiOperation({ summary: 'Create new campaign' })
  async create(
    @CurrentUser('sub') userId: string,
    @Body() input: CampaignCreateInputDto
  ): Promise<CampaignDto> {
    input.ownerId = userId;
    return this.commandBus.execute(new CampaignCreateCommand(input));
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(ERoleType.ENTERPRISE)
  @ApiOperation({ summary: 'Update campaign' })
  async update(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() input: CampaignUpdateInputDto,
  ): Promise<CampaignDto> {
    return this.commandBus.execute(new CampaignUpdateCommand(id, userId, input));
  }

  @Patch(':id/soft-delete')
  @UseGuards(RolesGuard)
  @Roles(ERoleType.ENTERPRISE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete campaign' })
  async delete(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Query() dto: SoftDeleteInputDto,
  ): Promise<void> {
    return this.commandBus.execute(new CampaignSoftDeleteCommand(id, userId, dto.deletedBy));
  }

  @Patch(':id/restore')
  @UseGuards(RolesGuard)
  @Roles(ERoleType.ENTERPRISE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Restore soft deleted campaign' })
  async restore(@Param('id') id: string): Promise<void> {
    return this.commandBus.execute(new CampaignRestoreCommand(id));
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(ERoleType.ENTERPRISE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Update campaign status' })
  async updateStatus(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() input: CampaignUpdateStatusInputDto,
  ): Promise<void> {
    return this.commandBus.execute(new CampaignUpdateStatusCommand(id, userId, input.status));
  }

  @Post(':id/collaborators/invite')
  @UseGuards(RolesGuard)
  @Roles(ERoleType.ENTERPRISE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Invite collaborators to campaign' })
  async inviteCollaborator(
    @CurrentUser('sub') requestedBy: string,
    @Param('id') id: string,
    @Body() input: CampaignInviteCollaboratorInputDto,
  ): Promise<void> {
    return this.commandBus.execute(new CampaignInviteCollaboratorCommand(id, input, requestedBy));
  }

  @Delete(':id/collaborators/revoke')
  @UseGuards(RolesGuard)
  @Roles(ERoleType.ENTERPRISE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Revoke collaborators from campaign' })
  async revokeCollaborator(
    @CurrentUser('sub') requestedBy: string,
    @Param('id') id: string,
    @Body() input: CampaignRevokeCollaboratorInputDto,
  ): Promise<void> {
    return this.commandBus.execute(new CampaignRevokeCollaboratorCommand(id, input, requestedBy));
  }

  // --- Campaign Participant Routes ---

  // @Get(':campaignId/participants')
  // @ApiOperation({ summary: 'Get all campaign participants' })
  // async findAllParticipants(@Query() filters: CampaignParticipantFilterDto): Promise<PaginatedResponseDto<CampaignParticipantDto>> {
  //   return this.queryBus.execute(new CampaignParticipantGetListQuery(filters));
  // }

  // @Get(':campaignId/participants/:participantId')
  // @ApiOperation({ summary: 'Get campaign participant by ID' })
  // async findParticipantById(@Param('participantId') participantId: string): Promise<CampaignParticipantDto> {
  //   return this.queryBus.execute(new CampaignParticipantGetByIdQuery(participantId));
  // }

  @Post(':campaignId/participants')
  @UseGuards(RolesGuard)
  @Roles(ERoleType.ENTERPRISE)
  @ApiOperation({ summary: 'Create new campaign participant' })
  async createParticipant(
    @Param('campaignId') campaignId: string,
    @Body() input: CampaignParticipantCreateInputDto,
  ): Promise<string> {
    input.campaignId = campaignId;
    return this.commandBus.execute(new CampaignParticipantCreateCommand(input));
  }

  @Patch(':campaignId/participants/:participantId')
  @UseGuards(RolesGuard)
  @Roles(ERoleType.ENTERPRISE)
  @ApiOperation({ summary: 'Update campaign participant' })
  async updateParticipant(
    @Param('campaignId') campaignId: string,
    @Param('participantId') participantId: string,
    @Body() input: CampaignParticipantUpdateInputDto,
  ): Promise<void> {
    return this.commandBus.execute(new CampaignParticipantUpdateCommand(participantId, input));
  }

  @Patch(':campaignId/participants/:participantId/soft-delete')
  @UseGuards(RolesGuard)
  @Roles(ERoleType.ENTERPRISE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete campaign participant' })
  async deleteParticipant(
    @Param('campaignId') campaignId: string,
    @Param('participantId') participantId: string,
    @Query() dto: SoftDeleteInputDto,
  ): Promise<void> {
    return this.commandBus.execute(new CampaignParticipantSoftDeleteCommand(participantId, dto.deletedBy));
  }

  @Delete(':campaignId/participants/:participantId')
  @UseGuards(RolesGuard)
  @Roles(ERoleType.ENTERPRISE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Hard delete campaign participant' })
  async hardDeleteParticipant(
    @Param('campaignId') campaignId: string,
    @Param('participantId') participantId: string,
  ): Promise<void> {
    return this.commandBus.execute(new CampaignParticipantHardDeleteCommand(participantId));
  }

  @UseGuards(RolesGuard)
  @Roles(ERoleType.ENTERPRISE)
  @Patch(':campaignId/participants/:participantId/restore')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Restore soft deleted campaign participant' })
  async restoreParticipant(
    @Param('campaignId') campaignId: string,
    @Param('participantId') participantId: string,
  ): Promise<void> {
    return this.commandBus.execute(new CampaignParticipantRestoreCommand(participantId));
  }

  @Patch(':campaignId/participants/:participantId/status')
  @UseGuards(RolesGuard)
  @Roles(ERoleType.KOL)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Update campaign participant status by KOL' })
  async updateParticipantStatus(
    @Param('campaignId') campaignId: string,
    @Param('participantId') participantId: string,
    @CurrentUser('sub') userId: string,
    @Body() input: CampaignParticipantUpdateStatusInputDto,
  ): Promise<void> {
    return this.commandBus.execute(new CampaignParticipantUpdateStatusCommand(participantId, userId, input));
  }
}
