import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiSecurity,
} from '@nestjs/swagger';
import {
  JwtAuthGuard,
  RolesGuard,
  UserVerifiedGuard,
} from '@/presentation/middleware/guards';
import {
  Roles,
  ApiOkResponseEnvelope,
  ApiPaginatedResponseEnvelope,
} from '@/presentation/decorators';
import { ERoleType } from '@/core/enums';
import { PackageResponseDto } from '@/application/dtos';
import {
  PackageGetListQuery,
  PackageGetByIdQuery,
  PackageFilterDto,
} from '@/application/queries';
import { PaginatedResponseDto } from '@/application/dtos/pagination.dto';
import { buildVersionedRoute } from '@/presentation/utils';

@ApiTags('CLIENT-packages')
@ApiBearerAuth()
@ApiSecurity('x-api-key')
@UseGuards(JwtAuthGuard, UserVerifiedGuard)
@Controller(buildVersionedRoute('client', 'packages', 1))
export class PackageClientController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @ApiOperation({ summary: 'Get list of packages' })
  @ApiPaginatedResponseEnvelope(PackageResponseDto)
  async findAll(
    @Query() filters: PackageFilterDto,
  ): Promise<PaginatedResponseDto<PackageResponseDto>> {
    return this.queryBus.execute(new PackageGetListQuery(filters));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a package by ID' })
  @ApiOkResponseEnvelope(PackageResponseDto)
  async findById(@Param('id') id: string): Promise<PackageResponseDto | null> {
    return this.queryBus.execute(new PackageGetByIdQuery({ id }));
  }
}
