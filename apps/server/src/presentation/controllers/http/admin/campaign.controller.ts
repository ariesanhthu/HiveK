import {
  CampaignCreateCommand,
  CampaignCreateInputDto,
  CampaignParticipantCreateCommand,
  CampaignParticipantCreateInputDto,
  CampaignParticipantHardDeleteCommand,
  CampaignParticipantRestoreCommand,
  CampaignParticipantSoftDeleteCommand,
  CampaignParticipantUpdateCommand,
  CampaignParticipantUpdateInputDto,
  CampaignRestoreCommand,
  CampaignSoftDeleteCommand,
  CampaignUpdateCommand,
  CampaignUpdateInputDto,
} from '@/application/commands';
import {
  CampaignInviteCollaboratorCommand,
  CampaignInviteCollaboratorInputDto,
  CampaignRevokeCollaboratorCommand,
  CampaignRevokeCollaboratorInputDto,
  CampaignUpdateStatusCommand,
  CampaignUpdateStatusInputDto,
} from '@/application/commands';
import { CampaignDto, SoftDeleteInputDto } from '@/application/dtos';
import { PaginatedResponseDto } from '@/application/dtos/pagination.dto';
import {
  CampaignFilterDto,
  CampaignGetByIdQuery,
  CampaignGetListQuery,
} from '@/application/queries';
import { ERoleType } from '@/core/enums/role-type.enum';
import { CurrentUser } from '@/presentation/decorators/current-user.decorator';
import { Roles } from '@/presentation/decorators/roles.decorator';
import { JwtAuthGuard, RolesGuard } from '@/presentation/middleware/guards';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { buildVersionedRoute } from '@presentation/utils';

@ApiTags('ADMIN-campaigns')
@ApiBearerAuth()
@ApiSecurity('x-api-key')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ERoleType.ADMIN)
@Controller(buildVersionedRoute('admin', 'campaigns', 1))
export class CampaignAdminController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all campaigns' })
  async findAll(
    @Query() filters: CampaignFilterDto,
  ): Promise<PaginatedResponseDto<CampaignDto>> {
    return this.queryBus.execute(new CampaignGetListQuery(filters));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get campaign by ID' })
  async findById(@Param('id') id: string): Promise<CampaignDto> {
    return this.queryBus.execute(new CampaignGetByIdQuery(id));
  }

  @Post()
  @ApiOperation({ summary: 'Create new campaign' })
  async create(
    @CurrentUser('sub') userId: string,
    @Body() input: CampaignCreateInputDto,
  ): Promise<CampaignDto> {
    input.ownerId = userId;
    return this.commandBus.execute(new CampaignCreateCommand(input));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update campaign' })
  async update(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() input: CampaignUpdateInputDto,
  ): Promise<CampaignDto> {
    return this.commandBus.execute(
      new CampaignUpdateCommand(id, userId, input),
    );
  }

  @Patch(':id/soft-delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete campaign' })
  async delete(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Query() dto: SoftDeleteInputDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new CampaignSoftDeleteCommand(id, userId, dto.deletedBy),
    );
  }

  @Patch(':id/restore')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Restore soft deleted campaign' })
  async restore(@Param('id') id: string): Promise<void> {
    await this.commandBus.execute(new CampaignRestoreCommand(id));
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Update campaign status' })
  async updateStatus(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() input: CampaignUpdateStatusInputDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new CampaignUpdateStatusCommand(id, userId, input.status),
    );
  }

  @Post(':id/collaborators')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Invite collaborators to campaign' })
  async inviteCollaborator(
    @CurrentUser('sub') requestedBy: string,
    @Param('id') id: string,
    @Body() input: CampaignInviteCollaboratorInputDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new CampaignInviteCollaboratorCommand(id, input, requestedBy),
    );
  }

  @Delete(':id/collaborators')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Revoke collaborators from campaign' })
  async revokeCollaborator(
    @CurrentUser('sub') requestedBy: string,
    @Param('id') id: string,
    @Body() input: CampaignRevokeCollaboratorInputDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new CampaignRevokeCollaboratorCommand(id, input, requestedBy),
    );
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
  @ApiOperation({ summary: 'Create new campaign participant' })
  async createParticipant(
    @Param('campaignId') campaignId: string,
    @Body() input: CampaignParticipantCreateInputDto,
  ): Promise<string> {
    input.campaignId = campaignId;
    return this.commandBus.execute(new CampaignParticipantCreateCommand(input));
  }

  @Patch(':campaignId/participants/:participantId')
  @ApiOperation({ summary: 'Update campaign participant' })
  async updateParticipant(
    @Param('campaignId') campaignId: string,
    @Param('participantId') participantId: string,
    @Body() input: CampaignParticipantUpdateInputDto,
  ): Promise<void> {
    return this.commandBus.execute(
      new CampaignParticipantUpdateCommand(participantId, input),
    );
  }

  @Patch(':campaignId/participants/:participantId/soft-delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete campaign participant' })
  async deleteParticipant(
    @Param('campaignId') campaignId: string,
    @Param('participantId') participantId: string,
    @Query() dto: SoftDeleteInputDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new CampaignParticipantSoftDeleteCommand(participantId, dto.deletedBy),
    );
  }

  @Delete(':campaignId/participants/:participantId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Hard delete campaign participant' })
  async hardDeleteParticipant(
    @Param('campaignId') campaignId: string,
    @Param('participantId') participantId: string,
  ): Promise<void> {
    await this.commandBus.execute(
      new CampaignParticipantHardDeleteCommand(participantId),
    );
  }

  @Patch(':campaignId/participants/:participantId/restore')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Restore soft deleted campaign participant' })
  async restoreParticipant(
    @Param('campaignId') campaignId: string,
    @Param('participantId') participantId: string,
  ): Promise<void> {
    await this.commandBus.execute(
      new CampaignParticipantRestoreCommand(participantId),
    );
  }
}
