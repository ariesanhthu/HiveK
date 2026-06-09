import { Controller, Get, Post, Patch, Param, Query, Body, HttpCode, HttpStatus, UseGuards, Delete } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { buildVersionedRoute } from '@presentation/utils';
import { CampaignCreateCommand, CampaignUpdateCommand, CampaignSoftDeleteCommand, CampaignRestoreCommand, CampaignCreateInputDto, CampaignUpdateInputDto } from '@/application/commands';
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
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restore soft deleted campaign' })
  async restore(@Param('id') id: string): Promise<void> {
    return this.commandBus.execute(new CampaignRestoreCommand(id));
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(ERoleType.ENTERPRISE)
  @HttpCode(HttpStatus.OK)
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
  @HttpCode(HttpStatus.OK)
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
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke collaborators from campaign' })
  async revokeCollaborator(
    @CurrentUser('sub') requestedBy: string,
    @Param('id') id: string,
    @Body() input: CampaignRevokeCollaboratorInputDto,
  ): Promise<void> {
    return this.commandBus.execute(new CampaignRevokeCollaboratorCommand(id, input, requestedBy));
  }
}
