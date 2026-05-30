import { Controller, Get, Post, Patch, Delete, Param, Query, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { EnterpriseGetByIdQuery } from '@/application/queries';
import {
  EnterpriseCreateCommand,
  EnterpriseUpdateCommand,
  EnterpriseSoftDeleteCommand,
  EnterpriseHardDeleteCommand,
  EnterpriseRestoreCommand,
  EnterpriseCreateInputDto,
  EnterpriseUpdateInputDto,
} from '@/application/commands';
import { EnterpriseDto, SoftDeleteInputDto } from '@/application/dtos';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/presentation/middleware/guards/jwt-auth.guard';
import { CurrentUser } from '@/presentation/decorators/current-user.decorator';

@ApiTags('enterprises')
@Controller('enterprises')
export class EnterpriseController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new enterprise profile' })
  async create(
    @CurrentUser('sub') userId: string,
    @Body() input: EnterpriseCreateInputDto,
  ): Promise<EnterpriseDto> {
    return this.commandBus.execute(new EnterpriseCreateCommand(userId, input));
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update enterprise profile' })
  async update(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @Body() input: EnterpriseUpdateInputDto,
  ): Promise<EnterpriseDto> {
    return this.commandBus.execute(new EnterpriseUpdateCommand(id, userId, input));
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get enterprise by ID' })
  async getById(@Param('id') id: string): Promise<EnterpriseDto> {
    const enterprise = await this.queryBus.execute<EnterpriseGetByIdQuery, EnterpriseDto>(
      new EnterpriseGetByIdQuery(id),
    );
    return enterprise;
  }

  @Patch(':id/soft-delete')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete enterprise' })
  async delete(
    @Param('id') id: string,
    @Query() dto: SoftDeleteInputDto,
  ): Promise<void> {
    return this.commandBus.execute(new EnterpriseSoftDeleteCommand(id, dto.deletedBy));
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Hard delete enterprise' })
  async hardDelete(@Param('id') id: string): Promise<void> {
    return this.commandBus.execute(new EnterpriseHardDeleteCommand(id));
  }

  @Patch(':id/restore')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Restore soft deleted enterprise' })
  async restore(@Param('id') id: string): Promise<void> {
    return this.commandBus.execute(new EnterpriseRestoreCommand(id));
  }
}
