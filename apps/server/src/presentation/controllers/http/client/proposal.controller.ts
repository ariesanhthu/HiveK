import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiSecurity,
} from '@nestjs/swagger';
import { buildVersionedRoute } from '@presentation/utils';
import {
  ProposalCreateCommand,
  ProposalCreateInputDto,
  ProposalUpdateCommand,
  ProposalUpdateInputDto,
  ProposalUpdateStatusCommand,
  ProposalUpdateStatusInputDto,
  ProposalSoftDeleteCommand,
  ProposalRestoreCommand,
} from '@/application/commands';
import {
  ProposalGetBySlugQuery,
  ProposalGetByIdQuery,
  ProposalGetListQuery,
} from '@/application/queries';
import {
  ProposalDto,
  ProposalFilterDto as ProposalFilterInputDto,
} from '@/application/dtos';
import { PaginatedResponseDto } from '@/application/dtos/pagination.dto';
import { JwtAuthGuard, RolesGuard } from '@/presentation/middleware/guards';
import {
  CurrentUser,
  Public,
  Roles,
  ApiOkResponseEnvelope,
  ApiPaginatedResponseEnvelope,
} from '@/presentation/decorators';
import { ERoleType } from '@/core/enums';

@ApiTags('CLIENT-proposals')
@ApiBearerAuth()
@ApiSecurity('x-api-key')
@Controller(buildVersionedRoute('client', 'proposals', 1))
export class CampaignProposalClientController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  // --- Public Endpoints ---

  @Public()
  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get campaign proposal by slug (public)' })
  @ApiOkResponseEnvelope(ProposalDto)
  async findBySlug(@Param('slug') slug: string): Promise<ProposalDto> {
    return this.queryBus.execute(new ProposalGetBySlugQuery(slug));
  }

  // --- Protected Endpoints (Enterprise) ---

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all campaign proposals' })
  @ApiPaginatedResponseEnvelope(ProposalDto)
  async findAll(
    @Query() filters: ProposalFilterInputDto,
  ): Promise<PaginatedResponseDto<ProposalDto>> {
    return this.queryBus.execute(new ProposalGetListQuery(filters));
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get campaign proposal by ID' })
  @ApiOkResponseEnvelope(ProposalDto)
  async findById(@Param('id') id: string): Promise<ProposalDto> {
    return this.queryBus.execute(new ProposalGetByIdQuery(id));
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ERoleType.ENTERPRISE)
  @ApiOperation({ summary: 'Create campaign proposal' })
  @ApiOkResponseEnvelope(ProposalDto)
  async create(
    @CurrentUser('sub') userId: string,
    @Body() input: ProposalCreateInputDto,
  ): Promise<ProposalDto> {
    return this.commandBus.execute(new ProposalCreateCommand(input, userId));
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ERoleType.ENTERPRISE)
  @ApiOperation({ summary: 'Update campaign proposal' })
  @ApiOkResponseEnvelope(ProposalDto)
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ERoleType.ENTERPRISE)
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ERoleType.ENTERPRISE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete campaign proposal' })
  async softDelete(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.commandBus.execute(new ProposalSoftDeleteCommand(id, userId));
  }

  @Patch(':id/restore')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ERoleType.ENTERPRISE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Restore soft deleted campaign proposal' })
  async restore(@Param('id') id: string): Promise<void> {
    return this.commandBus.execute(new ProposalRestoreCommand(id));
  }
}
