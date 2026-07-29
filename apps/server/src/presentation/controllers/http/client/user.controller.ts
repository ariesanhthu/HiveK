import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { UserGetByIdQuery, UserGetListQuery } from '@/application/queries';
import { UserFilterDto, UserDetailDto, AdminDto } from '@/application/dtos';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiSecurity,
} from '@nestjs/swagger';
import { buildVersionedRoute } from '@presentation/utils';
import { JwtAuthGuard } from '@/presentation/middleware/guards';
import {
  ApiOkResponseEnvelope,
  ApiPaginatedResponseEnvelope,
} from '@/presentation/decorators';
import { PaginatedResponseDto } from '@/application/dtos/pagination.dto';

@ApiTags('CLIENT-users')
@ApiBearerAuth()
@ApiSecurity('x-api-key')
@UseGuards(JwtAuthGuard)
@Controller(buildVersionedRoute('client', 'users', 1))
export class UserClientController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @ApiOperation({ summary: 'Get paginated list of users' })
  @ApiPaginatedResponseEnvelope(AdminDto)
  async findAll(
    @Query() filters: UserFilterDto,
  ): Promise<PaginatedResponseDto<unknown>> {
    return this.queryBus.execute(new UserGetListQuery(filters));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiOkResponseEnvelope(UserDetailDto)
  async getById(@Param('id') id: string): Promise<unknown> {
    return this.queryBus.execute(new UserGetByIdQuery(id));
  }
}
