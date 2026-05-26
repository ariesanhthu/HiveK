import { Controller, Get, Post, Delete, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { EnterpriseGetByIdQuery } from '@/application/queries';
import { EnterpriseSoftDeleteCommand, EnterpriseHardDeleteCommand, EnterpriseRestoreCommand } from '@/application/commands';
import { EnterpriseDto, SoftDeleteInputDto } from '@/application/dtos';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('enterprises')
@Controller('enterprises')
export class EnterpriseController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get enterprise by ID' })
  async getById(@Param('id') id: string): Promise<EnterpriseDto> {
    const enterprise = await this.queryBus.execute<EnterpriseGetByIdQuery, EnterpriseDto>(
      new EnterpriseGetByIdQuery(id),
    );
    return enterprise;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete enterprise' })
  async delete(
    @Param('id') id: string,
    @Query() dto: SoftDeleteInputDto,
  ): Promise<void> {
    return this.commandBus.execute(new EnterpriseSoftDeleteCommand(id, dto.deletedBy));
  }

  @Delete(':id/hard')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Hard delete enterprise' })
  async hardDelete(@Param('id') id: string): Promise<void> {
    return this.commandBus.execute(new EnterpriseHardDeleteCommand(id));
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restore soft deleted enterprise' })
  async restore(@Param('id') id: string): Promise<void> {
    return this.commandBus.execute(new EnterpriseRestoreCommand(id));
  }
}
