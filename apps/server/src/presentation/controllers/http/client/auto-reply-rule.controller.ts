import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ForbiddenException,
  Inject,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { buildVersionedRoute } from '@presentation/utils';
import { JwtAuthGuard, RolesGuard, UserVerifiedGuard } from '@/presentation/middleware/guards';
import { CurrentUser } from '@/presentation/decorators/current-user.decorator';
import { Roles } from '@/presentation/decorators/roles.decorator';
import { ERoleType } from '@/core/enums';
import { ENTERPRISE_REPOSITORY, type IEnterpriseRepository } from '@/core/interfaces/repositories';
import {
  AutoReplyRuleCreateCommand,
  AutoReplyRuleUpdateCommand,
  AutoReplyRuleDeleteCommand,
  AutoReplyRuleCreateInputDto,
  AutoReplyRuleUpdateInputDto,
} from '@/application/commands';
import { AutoReplyRuleGetListQuery } from '@/application/queries';
import { AutoReplyRuleDto } from '@/application/dtos';

@ApiTags('CLIENT-auto-reply-rules')
@ApiBearerAuth()
@ApiSecurity('x-api-key')
@UseGuards(JwtAuthGuard, RolesGuard, UserVerifiedGuard)
@Roles(ERoleType.ENTERPRISE)
@Controller(buildVersionedRoute('client', 'auto-reply-rules', 1))
export class AutoReplyRuleController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    @Inject(ENTERPRISE_REPOSITORY)
    private readonly enterpriseRepository: IEnterpriseRepository,
  ) {}

  private async getEnterpriseId(userId: string): Promise<string> {
    const enterprise = await this.enterpriseRepository.findByUserId(userId);
    if (!enterprise) {
      throw new ForbiddenException('User is not associated with any enterprise profile.');
    }
    return enterprise.id!;
  }

  @Post()
  @ApiOperation({ summary: 'Create a new auto-reply rule' })
  async create(
    @CurrentUser('sub') userId: string,
    @Body() input: AutoReplyRuleCreateInputDto,
  ): Promise<AutoReplyRuleDto> {
    const enterpriseId = await this.getEnterpriseId(userId);
    return this.commandBus.execute(new AutoReplyRuleCreateCommand(enterpriseId, input));
  }

  @Get()
  @ApiOperation({ summary: 'Get all auto-reply rules for a connected social page' })
  async findAll(
    @CurrentUser('sub') userId: string,
    @Query('socialPageId') socialPageId: string,
  ): Promise<AutoReplyRuleDto[]> {
    const enterpriseId = await this.getEnterpriseId(userId);
    if (!socialPageId) {
      throw new Error('Query parameter socialPageId is required.');
    }
    return this.queryBus.execute(new AutoReplyRuleGetListQuery(socialPageId, enterpriseId));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an auto-reply rule' })
  async update(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() input: AutoReplyRuleUpdateInputDto,
  ): Promise<AutoReplyRuleDto> {
    const enterpriseId = await this.getEnterpriseId(userId);
    return this.commandBus.execute(new AutoReplyRuleUpdateCommand(id, enterpriseId, input));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete an auto-reply rule' })
  async delete(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
  ): Promise<{ success: boolean }> {
    const enterpriseId = await this.getEnterpriseId(userId);
    return this.commandBus.execute(new AutoReplyRuleDeleteCommand(id, enterpriseId));
  }
}
