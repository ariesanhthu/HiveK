import { Controller, Get, Param, Query, Body, Patch } from '@nestjs/common';
import { QueryBus, CommandBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { KolProfileGetListQuery, KolProfileGetByIdQuery, KolProfileGetHandlesDevQuery, KolProfileFilterDto } from '@/application/queries';
import { KolProfileUpdateCommand, UpdateKolProfileDto } from '@/application/commands';
import { KolProfileDto } from '@/application/dtos';
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
    return this.queryBus.execute(new KolProfileGetListQuery(filters));
  }

  @Get('platforms')
  @ApiOperation({ summary: 'Get KOL profile handles mapping (for dev)' })
  async findHandlesDev(@Query() pagination: CursorPaginationRequestDto): Promise<PaginatedResponseDto<any>> {
    return this.queryBus.execute(new KolProfileGetHandlesDevQuery(pagination));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get KOL profile by ID' })
  async findById(@Param('id') id: string): Promise<KolProfileDto> {
    return this.queryBus.execute(new KolProfileGetByIdQuery(id));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update anything of an influencer (PATCH)' })
  async update(@Param('id') id: string, @Body() input: UpdateKolProfileDto): Promise<KolProfileDto> {
    return this.commandBus.execute(new KolProfileUpdateCommand(id, input));
  }
}
