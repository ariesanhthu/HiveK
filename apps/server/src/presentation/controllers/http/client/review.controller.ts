import { Controller, Get, Post, Patch, Param, Query, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { buildVersionedRoute } from '@presentation/utils';
import {
  ReviewCreateCommand,
  ReviewCreateInputDto,
  ReviewModerateCommand,
  ReviewModerateInputDto,
  ReviewSoftDeleteCommand,
  ReviewRestoreCommand,
} from '@/application/commands';
import { ReviewGetListQuery, ReviewGetByIdQuery } from '@/application/queries';
import { ReviewDto, ReviewFilterDto as ReviewFilterInputDto } from '@/application/dtos';
import { PaginatedResponseDto } from '@/application/dtos/pagination.dto';
import { JwtAuthGuard, RolesGuard, RecaptchaGuard } from '@/presentation/middleware/guards';
import { CurrentUser, Public, Roles, ApiOkResponseEnvelope, ApiPaginatedResponseEnvelope } from '@/presentation/decorators';
import { EReviewStatus, ERoleType } from '@/core/enums';
import { Throttle } from '@nestjs/throttler';

@ApiTags('CLIENT-reviews')
@Controller(buildVersionedRoute('client', 'reviews', 1))
export class PublicReviewClientController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  // --- Public Endpoints ---

  @Public()
  @Post()
  @UseGuards(RecaptchaGuard)
  @Throttle({ default: { limit: 3, ttl: 5 * 60 * 1000 } })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit a public review (with reCAPTCHA & rate limiting)' })
  @ApiOkResponseEnvelope(ReviewDto)
  async create(@Body() input: ReviewCreateInputDto): Promise<ReviewDto> {
    return this.commandBus.execute(new ReviewCreateCommand(input));
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get approved reviews' })
  @ApiPaginatedResponseEnvelope(ReviewDto)
  async findAll(@Query() filters: ReviewFilterInputDto): Promise<PaginatedResponseDto<ReviewDto>> {
    const safeFilters = { ...filters, status: EReviewStatus.APPROVED };
    return this.queryBus.execute(new ReviewGetListQuery(safeFilters));
  }

  // --- Enterprise Moderation Endpoints ---

  @Get()
  @ApiBearerAuth()
  @ApiSecurity('x-api-key')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ERoleType.ENTERPRISE)
  @ApiOperation({ summary: 'Get all reviews (including pending) for moderation' })
  @ApiPaginatedResponseEnvelope(ReviewDto)
  async findAllForModeration(@Query() filters: ReviewFilterInputDto): Promise<PaginatedResponseDto<ReviewDto>> {
    return this.queryBus.execute(new ReviewGetListQuery(filters));
  }
}

