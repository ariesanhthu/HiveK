import { Controller, Get, Param, Query, Body, Patch } from '@nestjs/common';
import { QueryBus, CommandBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { GetKolProfilesQuery, GetKolProfileByIdQuery, GetKolProfileHandlesDevQuery } from '@/application/kol-profiles/queries';
import { UpdateKolProfileCommand } from '@/application/kol-profiles/commands';
import { KolProfileDto, KolProfileFilterDto, UpdateKolProfileDto } from '@/application/kol-profiles/dtos';
import { PaginatedResponseDto, CursorPaginationRequestDto } from '@/shared/dtos/pagination.dto';

@ApiTags('kol-profiles')
@Controller('kol-profiles')
export class KolProfileController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Search/List KOL profiles' })
  async findAll(@Query() filters: KolProfileFilterDto): Promise<PaginatedResponseDto<KolProfileDto>> {
    return this.queryBus.execute(new GetKolProfilesQuery(filters));
  }

  @Get('platforms')
  @ApiOperation({ summary: 'Get KOL profile handles mapping (for dev)' })
  async findHandlesDev(@Query() pagination: CursorPaginationRequestDto): Promise<PaginatedResponseDto<any>> {
    return this.queryBus.execute(new GetKolProfileHandlesDevQuery(pagination));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get KOL profile by ID' })
  async findById(@Param('id') id: string): Promise<KolProfileDto> {
    return this.queryBus.execute(new GetKolProfileByIdQuery(id));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update anything of an influencer (PATCH)' })
  async update(@Param('id') id: string, @Body() input: UpdateKolProfileDto): Promise<KolProfileDto> {
    return this.commandBus.execute(new UpdateKolProfileCommand(id, input));
  }
}
