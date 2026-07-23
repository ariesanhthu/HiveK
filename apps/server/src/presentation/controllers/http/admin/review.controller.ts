import {
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
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { buildVersionedRoute } from '@presentation/utils';

@ApiTags('ADMIN-reviews')
@ApiBearerAuth()
@ApiSecurity('x-api-key')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ERoleType.ADMIN)
@Controller(buildVersionedRoute('admin', 'reviews', 1))
export class PublicReviewAdminController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all reviews' })
  async findAll(@Query() filters: ReviewFilterInputDto): Promise<PaginatedResponseDto<ReviewDto>> {
    return this.queryBus.execute(new ReviewGetListQuery(filters));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get review by ID' })
  async findById(@Param('id') id: string): Promise<ReviewDto> {
    return this.queryBus.execute(new ReviewGetByIdQuery(id));
  }

  @Patch(':id/moderate')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Approve or reject a review' })
  async moderate(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() input: ReviewModerateInputDto,
  ): Promise<void> {
    return this.commandBus.execute(new ReviewModerateCommand(id, input.action, userId));
  }

  @Patch(':id/soft-delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a review' })
  async softDelete(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.commandBus.execute(new ReviewSoftDeleteCommand(id, userId));
  }

  @Patch(':id/restore')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Restore a soft deleted review' })
  async restore(@Param('id') id: string): Promise<void> {
    return this.commandBus.execute(new ReviewRestoreCommand(id));
  }
}
