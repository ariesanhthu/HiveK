import {
  ProposalCreateCommand,
  ProposalCreateInputDto,
  ProposalRestoreCommand,
  ProposalSoftDeleteCommand,
  ProposalUpdateCommand,
  ProposalUpdateInputDto,
  ProposalUpdateStatusCommand,
  ProposalUpdateStatusInputDto,
} from '@/application/commands';
import { ProposalDto, ProposalFilterDto as ProposalFilterInputDto } from '@/application/dtos';
import { PaginatedResponseDto } from '@/application/dtos/pagination.dto';
import {
  ProposalFilterDto,
  ProposalGetByIdQuery,
  ProposalGetListQuery,
} from '@/application/queries';
import { ERoleType } from '@/core/enums';
import { CurrentUser } from '@/presentation/decorators/current-user.decorator';
import { Roles } from '@/presentation/decorators/roles.decorator';
import { JwtAuthGuard, RolesGuard } from '@/presentation/middleware/guards';
import {
  Body,
  Controller,
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

@ApiTags('ADMIN-proposals')
@ApiBearerAuth()
@ApiSecurity('x-api-key')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ERoleType.ADMIN)
@Controller(buildVersionedRoute('admin', 'proposals', 1))
export class CampaignProposalAdminController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all campaign proposals' })
  async findAll(
    @Query() filters: ProposalFilterInputDto,
  ): Promise<PaginatedResponseDto<ProposalDto>> {
    return this.queryBus.execute(new ProposalGetListQuery(filters));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get campaign proposal by ID' })
  async findById(@Param('id') id: string): Promise<ProposalDto> {
    return this.queryBus.execute(new ProposalGetByIdQuery(id));
  }

  @Post()
  @ApiOperation({ summary: 'Create campaign proposal' })
  async create(
    @CurrentUser('sub') userId: string,
    @Body() input: ProposalCreateInputDto,
  ): Promise<ProposalDto> {
    return this.commandBus.execute(new ProposalCreateCommand(input, userId));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update campaign proposal' })
  async update(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() input: ProposalUpdateInputDto,
  ): Promise<ProposalDto> {
    return this.commandBus.execute(
      new ProposalUpdateCommand(id, input, userId),
    );
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Update campaign proposal status' })
  async updateStatus(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() input: ProposalUpdateStatusInputDto,
  ): Promise<void> {
    return this.commandBus.execute(
      new ProposalUpdateStatusCommand(id, input.status, userId),
    );
  }

  @Patch(':id/soft-delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete campaign proposal' })
  async softDelete(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.commandBus.execute(new ProposalSoftDeleteCommand(id, userId));
  }

  @Patch(':id/restore')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Restore soft deleted campaign proposal' })
  async restore(@Param('id') id: string): Promise<void> {
    return this.commandBus.execute(new ProposalRestoreCommand(id));
  }
}
