import {
  EnterpriseAddUserCommand,
  EnterpriseAddUserInputDto,
  EnterpriseCreateCommand,
  EnterpriseCreateInputDto,
  EnterpriseRevokeUserCommand,
  EnterpriseRevokeUserInputDto,
  EnterpriseUpdateCommand,
  EnterpriseUpdateInputDto,
} from '@/application/commands';
import { EnterpriseDetailDto, EnterpriseDto } from '@/application/dtos';
import { EnterpriseGetByIdQuery } from '@/application/queries';
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
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { buildVersionedRoute } from '@presentation/utils';

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
  ) {}

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
  @ApiOperation({ summary: 'Remove user from enterprise' })
  async removeUser(
    @CurrentUser('sub') requestedBy: string,
    @Param('id') enterpriseId: string,
    @Body() dto: EnterpriseRevokeUserInputDto,
  ): Promise<void> {
    return this.commandBus.execute(new EnterpriseRevokeUserCommand(enterpriseId, dto, requestedBy));
  }
}
