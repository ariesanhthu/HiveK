import { Controller, Get, Param, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { PlatformGetListQuery, PlatformGetByIdQuery, PlatformFilterDto } from '@/application/queries';
import { PlatformDetailDto } from '@/application/dtos';
import { PaginatedResponseDto } from '@/application/dtos/pagination.dto';
import { Public } from '@/presentation/decorators/public.decorator';

@ApiTags('CLIENT-platforms')
@ApiBearerAuth()
@ApiSecurity('x-api-key')
@Controller('client/platforms')
export class PlatformClientController {
  constructor(
    private readonly queryBus: QueryBus,
  ) { }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all platforms' })
  async findAll(@Query() filters: PlatformFilterDto): Promise<PaginatedResponseDto<PlatformDetailDto>> {
    return this.queryBus.execute(new PlatformGetListQuery(filters));
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get platform by ID' })
  async findById(@Param('id') id: string): Promise<PlatformDetailDto> {
    return this.queryBus.execute(new PlatformGetByIdQuery(id));
  }
}
