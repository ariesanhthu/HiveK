import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  ForbiddenException,
  Inject,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { buildVersionedRoute } from '@presentation/utils';
import { JwtAuthGuard, RolesGuard, UserVerifiedGuard } from '@/presentation/middleware/guards';
import { CurrentUser, Roles, ApiOkResponseEnvelope, ApiPaginatedResponseEnvelope } from '@/presentation/decorators';
import { ERoleType } from '@/core/enums';
import { ENTERPRISE_REPOSITORY, type IEnterpriseRepository } from '@/core/interfaces/repositories';
import {
  ScheduledPostCreateCommand,
  ScheduledPostCancelCommand,
  ScheduledPostRescheduleCommand,
  ScheduledPostCreateInputDto,
  ScheduledPostCreateAndPublishCommand,
  ScheduledPostCreateAndPublishInputDto,
} from '@/application/commands';
import { ScheduledPostGetListQuery, ScheduledPostGetByIdQuery } from '@/application/queries';
import { ScheduledPostDto } from '@/application/dtos';

@ApiTags('CLIENT-scheduled-posts')
@ApiBearerAuth()
@ApiSecurity('x-api-key')
@UseGuards(JwtAuthGuard, RolesGuard, UserVerifiedGuard)
@Roles(ERoleType.ENTERPRISE)
@Controller(buildVersionedRoute('client', 'scheduled-posts', 1))
export class ScheduledPostController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    @Inject(ENTERPRISE_REPOSITORY)
    private readonly enterpriseRepository: IEnterpriseRepository,
  ) {}

  private async getEnterpriseId(userId: string): Promise<string> {
    const enterprise = await this.enterpriseRepository.findByUserId(userId);
    if (!enterprise) {
      throw new ForbiddenException('User is not associated with any enterprise profile.');
    }
    return enterprise.id!;
  }

  @Post()
  @ApiOperation({ summary: 'Create and optionally schedule a new social post' })
  @ApiOkResponseEnvelope(ScheduledPostDto)
  async create(
    @CurrentUser('sub') userId: string,
    @Body() input: ScheduledPostCreateInputDto,
  ): Promise<ScheduledPostDto> {
    const enterpriseId = await this.getEnterpriseId(userId);
    return this.commandBus.execute(new ScheduledPostCreateCommand(enterpriseId, userId, input));
  }

  @Get()
  @ApiOperation({ summary: 'Get all scheduled posts' })
  @ApiPaginatedResponseEnvelope(ScheduledPostDto)
  async findAll(@CurrentUser('sub') userId: string): Promise<ScheduledPostDto[]> {
    const enterpriseId = await this.getEnterpriseId(userId);
    return this.queryBus.execute(new ScheduledPostGetListQuery(enterpriseId));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get scheduled post details by ID' })
  @ApiOkResponseEnvelope(ScheduledPostDto)
  async findById(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
  ): Promise<ScheduledPostDto> {
    const enterpriseId = await this.getEnterpriseId(userId);
    return this.queryBus.execute(new ScheduledPostGetByIdQuery(id, enterpriseId));
  }

  @Post('test')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[TEST] Create a post and publish it immediately (bypasses outbox delay)' })
  @ApiOkResponseEnvelope(ScheduledPostDto)
  async createAndPublish(
    @CurrentUser('sub') userId: string,
    @Body() input: ScheduledPostCreateAndPublishInputDto,
  ): Promise<ScheduledPostDto> {
    const enterpriseId = await this.getEnterpriseId(userId);
    return this.commandBus.execute(new ScheduledPostCreateAndPublishCommand(enterpriseId, userId, input));
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel a pending scheduled post' })
  @ApiOkResponseEnvelope()
  async cancel(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
  ): Promise<{ success: boolean }> {
    const enterpriseId = await this.getEnterpriseId(userId);
    return this.commandBus.execute(new ScheduledPostCancelCommand(id, enterpriseId));
  }

  @Post(':id/reschedule')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reschedule a post for a new publish time' })
  @ApiOkResponseEnvelope(ScheduledPostDto)
  async reschedule(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body('scheduledAt') scheduledAt: string,
  ): Promise<ScheduledPostDto> {
    const enterpriseId = await this.getEnterpriseId(userId);
    if (!scheduledAt) {
      throw new Error('New scheduledAt timestamp is required.');
    }
    return this.commandBus.execute(new ScheduledPostRescheduleCommand(id, enterpriseId, new Date(scheduledAt)));
  }
}

