import { Controller, Get, Post, Patch, Param, Query, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { CampaignCreateCommand, CampaignUpdateCommand, CampaignSoftDeleteCommand, CampaignRestoreCommand, CampaignCreateInputDto, CampaignUpdateInputDto } from '@/application/commands';
import { CampaignGetListQuery, CampaignGetByIdQuery, CampaignFilterDto } from '@/application/queries';
import { CampaignDto, SoftDeleteInputDto } from '@/application/dtos';
import { PaginatedResponseDto } from '@/application/dtos/pagination.dto';
import { JwtAuthGuard } from '@/presentation/middleware/guards';
import { CurrentUser } from '@/presentation/decorators/current-user.decorator';

import { CampaignInviteCollaboratorCommand, CampaignRevokeCollaboratorCommand, CampaignUpdateStatusCommand, CampaignUpdateStatusInputDto, CampaignInviteCollaboratorInputDto, CampaignRevokeCollaboratorInputDto } from '@/application/commands';

@ApiTags('campaigns')
@ApiBearerAuth()
@ApiSecurity('x-api-key')
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
  async create(
    @CurrentUser('sub') userId: string,
    @Body() input: CampaignCreateInputDto
  ): Promise<CampaignDto> {
    input.ownerId = userId;
    return this.commandBus.execute(new CampaignCreateCommand(input));
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update campaign' })
  async update(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() input: CampaignUpdateInputDto,
  ): Promise<CampaignDto> {
    return this.commandBus.execute(new CampaignUpdateCommand(id, userId, input));
  }

  @Patch(':id/soft-delete')
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restore soft deleted campaign' })
  async restore(@Param('id') id: string): Promise<void> {
    return this.commandBus.execute(new CampaignRestoreCommand(id));
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update campaign status' })
  async updateStatus(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() input: CampaignUpdateStatusInputDto,
  ): Promise<void> {
    return this.commandBus.execute(new CampaignUpdateStatusCommand(id, userId, input.status));
  }

  @Patch(':id/collaborators/invite')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Invite a collaborator to campaign' })
  async inviteCollaborator(
    @CurrentUser('sub') requestedBy: string,
    @Param('id') id: string,
    @Body() input: CampaignInviteCollaboratorInputDto,
  ): Promise<void> {
    return this.commandBus.execute(new CampaignInviteCollaboratorCommand(id, input.userId, requestedBy));
  }

  @Patch(':id/collaborators/revoke')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke a collaborator from campaign' })
  async revokeCollaborator(
    @CurrentUser('sub') requestedBy: string,
    @Param('id') id: string,
    @Body() input: CampaignRevokeCollaboratorInputDto,
  ): Promise<void> {
    return this.commandBus.execute(new CampaignRevokeCollaboratorCommand(id, input.userId, requestedBy));
  }
}
