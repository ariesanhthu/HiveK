import { Controller, Get, Param, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { GetKolProfilesQuery, GetKolProfileByIdQuery } from '@/application/kol-profiles/queries';
import { KolProfileDto, KolProfileFilterDto } from '@/application/kol-profiles/dtos';
import { PaginatedResponseDto } from '@/shared/dtos/pagination.dto';

@ApiTags('kol-profiles')
@Controller('kol-profiles')
export class KolProfileController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @ApiOperation({ summary: 'Search/List KOL profiles' })
  async findAll(@Query() filters: KolProfileFilterDto): Promise<PaginatedResponseDto<KolProfileDto>> {
    return this.queryBus.execute(new GetKolProfilesQuery(filters));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get KOL profile by ID' })
  async findById(@Param('id') id: string): Promise<KolProfileDto> {
    return this.queryBus.execute(new GetKolProfileByIdQuery(id));
  }
}
