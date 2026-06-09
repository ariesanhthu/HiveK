import { Controller, Get, Post, Patch, Param, Body, HttpCode, HttpStatus, UseGuards, Delete } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { EnterpriseGetByIdQuery } from '@/application/queries';
import {
  EnterpriseCreateCommand,
  EnterpriseUpdateCommand,
  EnterpriseCreateInputDto,
  EnterpriseUpdateInputDto,
  EnterpriseAddUserCommand,
  EnterpriseRevokeUserCommand,
  EnterpriseAddUserInputDto,
  EnterpriseRevokeUserInputDto,
} from '@/application/commands';
import { EnterpriseDto, EnterpriseDetailDto } from '@/application/dtos';
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

  @Post(':id/members')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
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
  @ApiOperation({ summary: 'Remove user from enterprise' })
  async removeUser(
    @CurrentUser('sub') requestedBy: string,
    @Param('id') enterpriseId: string,
    @Body() dto: EnterpriseRevokeUserInputDto,
  ): Promise<void> {
    return this.commandBus.execute(new EnterpriseRevokeUserCommand(enterpriseId, dto, requestedBy));
  }
}
