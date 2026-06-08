import { Controller, Get, Param, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { UserGetByIdQuery, UserGetListQuery } from '@/application/queries';
import { UserDto, UserFilterDto } from '@/application/dtos';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/presentation/middleware/guards';
import { UseGuards } from '@nestjs/common';
import { PaginatedResponseDto } from '@/application/dtos/pagination.dto';

@ApiTags('CLIENT-users')
@ApiBearerAuth()
@ApiSecurity('x-api-key')
@UseGuards(JwtAuthGuard)
@Controller('client/users')
export class UserClientController {
  constructor(
    private readonly queryBus: QueryBus,
  ) { }
  @Get()
  @ApiOperation({ summary: 'Get paginated list of users' })
  async findAll(@Query() filters: UserFilterDto): Promise<PaginatedResponseDto<UserDto>> {
    return this.queryBus.execute<UserGetListQuery, PaginatedResponseDto<UserDto>>(
      new UserGetListQuery(filters),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  async getById(@Param('id') id: string): Promise<UserDto> {
    const user = await this.queryBus.execute<UserGetByIdQuery, UserDto>(
      new UserGetByIdQuery(id),
    );
    return user;
  }
}
