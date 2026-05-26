import { Controller, Get, Post, Patch, Body, Param, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PlatformCreateCommand, PlatformUpdateCommand, PlatformCreateInputDto, PlatformUpdateInputDto } from '@/application/commands';
import { PlatformGetListQuery, PlatformGetByIdQuery, PlatformFilterDto } from '@/application/queries';
import { PlatformDto } from '@/application/dtos';
import { PaginatedResponseDto } from '@/shared/dtos/pagination.dto';

@ApiTags('platforms')
@Controller('platforms')
export class PlatformController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all platforms' })
  async findAll(@Query() filters: PlatformFilterDto): Promise<PaginatedResponseDto<PlatformDto>> {
    return this.queryBus.execute(new PlatformGetListQuery(filters));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get platform by ID' })
  async findById(@Param('id') id: string): Promise<PlatformDto> {
    return this.queryBus.execute(new PlatformGetByIdQuery(id));
  }

  @Post()
  @ApiOperation({ summary: 'Create new platform' })
  async create(@Body() input: PlatformCreateInputDto): Promise<PlatformDto> {
    return this.commandBus.execute(new PlatformCreateCommand(input));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update platform' })
  async update(
    @Param('id') id: string,
    @Body() input: PlatformUpdateInputDto,
  ): Promise<PlatformDto> {
    return this.commandBus.execute(new PlatformUpdateCommand(id, input));
  }
}
