import { Controller, Get, Post, Patch, Param, Body, HttpCode, HttpStatus, UseGuards, Delete } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { EnterpriseGetByIdQuery, EnterpriseGetInvitationsQuery } from '@/application/queries';
import {
  EnterpriseCreateCommand,
  EnterpriseUpdateCommand,
  EnterpriseCreateInputDto,
  EnterpriseUpdateInputDto,
  EnterpriseAddUserCommand,
  EnterpriseAddUserInputDto,
  EnterpriseInviteMemberCommand,
  EnterpriseAcceptInvitationCommand,
  EnterpriseInviteMemberInputDto,
  EnterpriseRevokeMemberCommand,
  EnterpriseRevokeMemberInputDto,
  EnterpriseRevokeInvitationCommand,
  EnterpriseChangeMemberModeCommand,
  EnterpriseChangeMemberModeInputDto,
} from '@/application/commands';
import { EnterpriseDto, EnterpriseDetailDto, EnterpriseInvitationDto } from '@/application/dtos';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { buildVersionedRoute } from '@presentation/utils';
import { JwtAuthGuard, RolesGuard } from '@/presentation/middleware/guards';
import { CurrentUser } from '@/presentation/decorators/current-user.decorator';
import { Roles } from '@/presentation/decorators/roles.decorator';
import { ERoleType } from '@/core/enums/role-type.enum';

@ApiTags('CLIENT-enterprises')
@ApiBearerAuth()
@ApiSecurity('x-api-key')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ERoleType.ENTERPRISE)
@Controller(buildVersionedRoute('client', 'enterprises', 1))
export class EnterpriseClientController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) { }

  @Post()
  @ApiOperation({ summary: 'Create new enterprise profile' })
  async create(
    @CurrentUser('sub') userId: string,
    @Body() input: EnterpriseCreateInputDto,
  ): Promise<EnterpriseDto> {
    return this.commandBus.execute(new EnterpriseCreateCommand(userId, input));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update enterprise profile' })
  async update(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @Body() input: EnterpriseUpdateInputDto,
  ): Promise<EnterpriseDto> {
    return this.commandBus.execute(new EnterpriseUpdateCommand(id, userId, input));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get enterprise by ID' })
  async getById(@Param('id') id: string): Promise<EnterpriseDetailDto> {
    const enterprise = await this.queryBus.execute<EnterpriseGetByIdQuery, EnterpriseDetailDto>(
      new EnterpriseGetByIdQuery(id),
    );
    return enterprise;
  }

  @Post(':id/invitations')
  @ApiOperation({ summary: 'Invite a user to the enterprise' })
  async inviteMember(
    @Param('id') enterpriseId: string,
    @CurrentUser('sub') requestedBy: string,
    @Body() input: EnterpriseInviteMemberInputDto,
  ): Promise<EnterpriseInvitationDto> {
    return this.commandBus.execute(new EnterpriseInviteMemberCommand(enterpriseId, requestedBy, input));
  }

  @Post(':id/invitations/:invitationId/accept')
  @ApiOperation({ summary: 'Accept an enterprise invitation' })
  async acceptInvitation(
    @Param('id') enterpriseId: string,
    @Param('invitationId') invitationId: string,
    @CurrentUser('sub') userId: string,
  ): Promise<{ success: boolean }> {
    await this.commandBus.execute(new EnterpriseAcceptInvitationCommand(enterpriseId, invitationId, userId));
    return { success: true };
  }

  @Post(':id/members')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Add user to enterprise' })
  async addUser(
    @CurrentUser('sub') requestedBy: string,
    @Param('id') enterpriseId: string,
    @Body() dto: EnterpriseAddUserInputDto,
  ): Promise<void> {
    return this.commandBus.execute(new EnterpriseAddUserCommand(enterpriseId, dto, requestedBy));
  }

  @Delete(':id/members')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove user from enterprise (revoke membership)' })
  async removeUser(
    @CurrentUser('sub') requestedBy: string,
    @Param('id') enterpriseId: string,
    @Body() dto: EnterpriseRevokeMemberInputDto,
  ): Promise<void> {
    return this.commandBus.execute(new EnterpriseRevokeMemberCommand(enterpriseId, requestedBy, dto));
  }

  @Delete(':id/invitations/:invitationId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cancel/revoke a pending invitation' })
  async cancelInvitation(
    @Param('id') enterpriseId: string,
    @Param('invitationId') invitationId: string,
    @CurrentUser('sub') requestedBy: string,
  ): Promise<void> {
    return this.commandBus.execute(new EnterpriseRevokeInvitationCommand(enterpriseId, invitationId, requestedBy));
  }

  @Patch(':id/members/mode')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Change enterprise member role mode (promote/demote)' })
  async changeMemberMode(
    @Param('id') enterpriseId: string,
    @CurrentUser('sub') requestedBy: string,
    @Body() dto: EnterpriseChangeMemberModeInputDto,
  ): Promise<void> {
    return this.commandBus.execute(new EnterpriseChangeMemberModeCommand(enterpriseId, requestedBy, dto));
  }
}
