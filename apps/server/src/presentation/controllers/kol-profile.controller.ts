import { Controller, Get, Param, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { GetKolProfilesQuery, GetKolProfileByIdQuery } from '@/application/kol-profiles/queries';
import { KolProfileDto } from '@/application/kol-profiles/dtos';
import { JsonRecord } from '@/shared/types';

@ApiTags('kol-profiles')
@Controller('kol-profiles')
export class KolProfileController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @ApiOperation({ summary: 'Search/List KOL profiles' })
  async findAll(): Promise<KolProfileDto[]> {
    return this.queryBus.execute(new GetKolProfilesQuery({}));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get KOL profile by ID' })
  async findById(@Param('id') id: string): Promise<KolProfileDto> {
    return this.queryBus.execute(new GetKolProfileByIdQuery(id));
  }
}
