import {
  ReviewCreateCommand,
  ReviewCreateInputDto,
  ReviewModerateCommand,
  ReviewModerateInputDto,
  ReviewRestoreCommand,
  ReviewSoftDeleteCommand,
} from '@/application/commands';
import { ReviewDto, ReviewFilterDto as ReviewFilterInputDto } from '@/application/dtos';
import { PaginatedResponseDto } from '@/application/dtos/pagination.dto';
import { ReviewFilterDto, ReviewGetByIdQuery, ReviewGetListQuery } from '@/application/queries';
import { ERoleType } from '@/core/enums';
import { CurrentUser } from '@/presentation/decorators/current-user.decorator';
import { Public } from '@/presentation/decorators/public.decorator';
import { Roles } from '@/presentation/decorators/roles.decorator';
import { JwtAuthGuard, RecaptchaGuard, RolesGuard } from '@/presentation/middleware/guards';
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
import { Throttle } from '@nestjs/throttler';
import { buildVersionedRoute } from '@presentation/utils';

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
  async create(@Body() input: ReviewCreateInputDto): Promise<ReviewDto> {
    return this.commandBus.execute(new ReviewCreateCommand(input));
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get approved reviews' })
  async findAll(@Query() filters: ReviewFilterInputDto): Promise<PaginatedResponseDto<ReviewDto>> {
    const safeFilters = { ...filters, status: 'approved' };
    return this.queryBus.execute(new ReviewGetListQuery(safeFilters));
  }

  // --- Enterprise Moderation Endpoints ---

  @Get()
  @ApiBearerAuth()
  @ApiSecurity('x-api-key')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ERoleType.ENTERPRISE)
  @ApiOperation({ summary: 'Get all reviews (including pending) for moderation' })
  async findAllForModeration(
    @Query() filters: ReviewFilterInputDto,
  ): Promise<PaginatedResponseDto<ReviewDto>> {
    return this.queryBus.execute(new ReviewGetListQuery(filters));
  }

  // @Patch(':id/moderate')
  // @ApiBearerAuth()
  // @ApiSecurity('x-api-key')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(ERoleType.ENTERPRISE)
  // @HttpCode(HttpStatus.NO_CONTENT)
  // @ApiOperation({ summary: 'Approve or reject a review' })
  // async moderate(
  //   @CurrentUser('sub') userId: string,
  //   @Param('id') id: string,
  //   @Body() input: ReviewModerateInputDto,
  // ): Promise<void> {
  //   return this.commandBus.execute(new ReviewModerateCommand(id, input.action, userId));
  // }
}
