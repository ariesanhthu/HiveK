import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiSecurity,
} from '@nestjs/swagger';
import { buildVersionedRoute } from '@presentation/utils';
import {
  PlatformCreateCommand,
  PlatformUpdateCommand,
  PlatformSoftDeleteCommand,
  PlatformHardDeleteCommand,
  PlatformRestoreCommand,
  PlatformCreateInputDto,
  PlatformUpdateInputDto,
} from '@/application/commands';
import {
  PlatformGetListQuery,
  PlatformGetByIdQuery,
  PlatformFilterDto,
} from '@/application/queries';
import {
  PlatformDto,
  PlatformDetailDto,
  SoftDeleteInputDto,
} from '@/application/dtos';
import { PaginatedResponseDto } from '@/application/dtos/pagination.dto';
import { JwtAuthGuard, RolesGuard } from '@/presentation/middleware/guards';
import { Public, Roles, ApiOkResponseEnvelope, ApiPaginatedResponseEnvelope } from '@/presentation/decorators';
import { ERoleType } from '@/core/enums/role-type.enum';

@ApiTags('ADMIN-platforms')
@ApiBearerAuth()
@ApiSecurity('x-api-key')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ERoleType.ADMIN)
@Controller(buildVersionedRoute('admin', 'platforms', 1))
export class PlatformAdminController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

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

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create new platform' })
  @ApiOkResponseEnvelope(PlatformDto)
  async create(@Body() input: PlatformCreateInputDto): Promise<PlatformDto> {
    return this.commandBus.execute(new PlatformCreateCommand(input));
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update platform' })
  @ApiOkResponseEnvelope(PlatformDto)
  async update(
    @Param('id') id: string,
    @Body() input: PlatformUpdateInputDto,
  ): Promise<PlatformDto> {
    return this.commandBus.execute(new PlatformUpdateCommand(id, input));
  }

  @Patch(':id/soft-delete')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete platform' })
  async delete(
    @Param('id') id: string,
    @Query() dto: SoftDeleteInputDto,
  ): Promise<void> {
    return this.commandBus.execute(
      new PlatformSoftDeleteCommand(id, dto.deletedBy),
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Hard delete platform' })
  async hardDelete(@Param('id') id: string): Promise<void> {
    await this.commandBus.execute(new PlatformHardDeleteCommand(id));
  }

  @Public()
  @Patch(':id/restore')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Restore soft deleted platform' })
  async restore(@Param('id') id: string): Promise<void> {
    return this.commandBus.execute(new PlatformRestoreCommand(id));
  }
}

