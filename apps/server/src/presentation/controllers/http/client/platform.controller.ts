import { Controller, Get, Param, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiSecurity,
} from '@nestjs/swagger';
import { buildVersionedRoute } from '@presentation/utils';
import {
  PlatformGetListQuery,
  PlatformGetByIdQuery,
  PlatformFilterDto,
} from '@/application/queries';
import { PlatformDetailDto } from '@/application/dtos';
import { PaginatedResponseDto } from '@/application/dtos/pagination.dto';
import {
  Public,
  ApiOkResponseEnvelope,
  ApiPaginatedResponseEnvelope,
} from '@/presentation/decorators';

@ApiTags('CLIENT-platforms')
@ApiBearerAuth()
@ApiSecurity('x-api-key')
@Controller(buildVersionedRoute('client', 'platforms', 1))
export class PlatformClientController {
  constructor(private readonly queryBus: QueryBus) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all platforms' })
  @ApiPaginatedResponseEnvelope(PlatformDetailDto)
  async findAll(
    @Query() filters: PlatformFilterDto,
  ): Promise<PaginatedResponseDto<PlatformDetailDto>> {
    return this.queryBus.execute(new PlatformGetListQuery(filters));
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get platform by ID' })
  @ApiOkResponseEnvelope(PlatformDetailDto)
  async findById(@Param('id') id: string): Promise<PlatformDetailDto> {
    return this.queryBus.execute(new PlatformGetByIdQuery(id));
  }
}
