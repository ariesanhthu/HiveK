import { Controller, Get, Post, Patch, Body, Param, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CreatePlatformCommand, UpdatePlatformCommand } from '@/application/platforms/commands';
import { GetPlatformsQuery, GetPlatformByIdQuery } from '@/application/platforms/queries';
import { CreatePlatformInputDto, UpdatePlatformInputDto, PlatformDto } from '@/application/platforms/dtos';

@ApiTags('platforms')
@Controller('platforms')
export class PlatformController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all platforms' })
  async findAll(): Promise<PlatformDto[]> {
    return this.queryBus.execute(new GetPlatformsQuery({}));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get platform by ID' })
  async findById(@Param('id') id: string): Promise<PlatformDto> {
    return this.queryBus.execute(new GetPlatformByIdQuery(id));
  }

  @Post()
  @ApiOperation({ summary: 'Create new platform' })
  async create(@Body() input: CreatePlatformInputDto): Promise<PlatformDto> {
    return this.commandBus.execute(new CreatePlatformCommand(input));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update platform' })
  async update(
    @Param('id') id: string,
    @Body() input: UpdatePlatformInputDto,
  ): Promise<PlatformDto> {
    return this.commandBus.execute(new UpdatePlatformCommand(id, input));
  }
}
