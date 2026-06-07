import { Controller, Get, Post, Patch, Param, Query, Body, HttpCode, HttpStatus, UseGuards, Delete } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { EnterpriseGetByIdQuery, EnterpriseGetListQuery } from '@/application/queries';
import {
  EnterpriseCreateCommand,
  EnterpriseUpdateCommand,
  EnterpriseSoftDeleteCommand,
  EnterpriseRestoreCommand,
  EnterpriseCreateInputDto,
  EnterpriseUpdateInputDto,
  EnterpriseAddUserCommand,
  EnterpriseRevokeUserCommand,
} from '@/application/commands';
import { EnterpriseDto, EnterpriseDetailDto, SoftDeleteInputDto } from '@/application/dtos';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/presentation/middleware/guards/jwt-auth.guard';
import { CurrentUser } from '@/presentation/decorators/current-user.decorator';
import { PaginatedResponseDto } from '@/shared/dtos/pagination.dto';
import { EnterpriseFilterDto } from '@/application/queries/enterprise-get-list/enterprise-get-list.dto';

@ApiTags('enterprises')
@ApiBearerAuth()
@ApiSecurity('x-api-key')
@Controller('enterprises')
export class EnterpriseController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new enterprise profile' })
  async create(
    @CurrentUser('sub') userId: string,
    @Body() input: EnterpriseCreateInputDto,
  ): Promise<EnterpriseDto> {
    return this.commandBus.execute(new EnterpriseCreateCommand(userId, input));
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update enterprise profile' })
  async update(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @Body() input: EnterpriseUpdateInputDto,
  ): Promise<EnterpriseDto> {
    return this.commandBus.execute(new EnterpriseUpdateCommand(id, userId, input));
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get list of enterprises' })
  async getList(@Query() filters: EnterpriseFilterDto): Promise<PaginatedResponseDto<EnterpriseDetailDto>> {
    return this.queryBus.execute(new EnterpriseGetListQuery(filters));
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get enterprise by ID' })
  async getById(@Param('id') id: string): Promise<EnterpriseDetailDto> {
    const enterprise = await this.queryBus.execute<EnterpriseGetByIdQuery, EnterpriseDetailDto>(
      new EnterpriseGetByIdQuery(id),
    );
    return enterprise;
  }

  @Patch(':id/soft-delete')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete enterprise' })
  async delete(
    @CurrentUser('sub') requestedBy: string,
    @Param('id') id: string,
    @Query() dto: SoftDeleteInputDto,
  ): Promise<void> {
    return this.commandBus.execute(new EnterpriseSoftDeleteCommand(id, requestedBy, dto.deletedBy));
  }

  @Patch(':id/restore')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Restore soft deleted enterprise' })
  async restore(@Param('id') id: string): Promise<void> {
    return this.commandBus.execute(new EnterpriseRestoreCommand(id));
  }

  @Post(':id/users/:userId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Add user to enterprise' })
  async addUser(
    @CurrentUser('sub') requestedBy: string,
    @Param('id') enterpriseId: string,
    @Param('userId') userId: string,
  ): Promise<void> {
    return this.commandBus.execute(new EnterpriseAddUserCommand({ enterpriseId, userId }, requestedBy));
  }

  @Delete(':id/users/:userId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Revoke user from enterprise' })
  async revokeUser(
    @CurrentUser('sub') requestedBy: string,
    @Param('id') enterpriseId: string,
    @Param('userId') userId: string,
  ): Promise<void> {
    return this.commandBus.execute(new EnterpriseRevokeUserCommand({ enterpriseId, userId }, requestedBy));
  }
}
