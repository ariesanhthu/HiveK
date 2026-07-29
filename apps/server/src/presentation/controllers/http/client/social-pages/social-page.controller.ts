import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  ForbiddenException,
  Inject,
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
  JwtAuthGuard,
  RolesGuard,
  UserVerifiedGuard,
} from '@/presentation/middleware/guards';
import {
  CurrentUser,
  Roles,
  ApiOkResponseEnvelope,
  ApiPaginatedResponseEnvelope,
} from '@/presentation/decorators';
import { ERoleType } from '@/core/enums';
import {
  ENTERPRISE_REPOSITORY,
  type IEnterpriseRepository,
} from '@/core/interfaces/repositories';
import {
  SocialPageConnectCommand,
  SocialPageDisconnectCommand,
  SocialPageConnectInputDto,
  SocialPageRefreshTokenCommand,
} from '@/application/commands';
import { SocialPageGetListQuery } from '@/application/queries';
import { SocialPageDto } from '@/application/dtos';

@ApiTags('CLIENT-social-pages')
@ApiBearerAuth()
@ApiSecurity('x-api-key')
@UseGuards(JwtAuthGuard, RolesGuard, UserVerifiedGuard)
@Roles(ERoleType.ENTERPRISE)
@Controller(buildVersionedRoute('client', 'social-pages', 1))
export class SocialPageController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    @Inject(ENTERPRISE_REPOSITORY)
    private readonly enterpriseRepository: IEnterpriseRepository,
  ) {}

  private async getEnterpriseId(userId: string): Promise<string> {
    const enterprise = await this.enterpriseRepository.findByUserId(userId);
    if (!enterprise) {
      throw new ForbiddenException(
        'User is not associated with any enterprise profile.',
      );
    }
    return enterprise.id;
  }

  @Get()
  @ApiOperation({ summary: 'Get all connected social pages' })
  @ApiPaginatedResponseEnvelope(SocialPageDto)
  async findAll(@CurrentUser('sub') userId: string): Promise<SocialPageDto[]> {
    const enterpriseId = await this.getEnterpriseId(userId);
    return this.queryBus.execute(new SocialPageGetListQuery(enterpriseId));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Disconnect a social page' })
  @ApiOkResponseEnvelope()
  async disconnect(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
  ): Promise<{ success: boolean }> {
    const enterpriseId = await this.getEnterpriseId(userId);
    return this.commandBus.execute(
      new SocialPageDisconnectCommand(id, enterpriseId, userId),
    );
  }

  @Post('facebook/connect')
  @ApiOperation({
    summary: 'Link a selected Facebook page to the enterprise account',
  })
  @ApiOkResponseEnvelope(SocialPageDto)
  async connectPage(
    @CurrentUser('sub') userId: string,
    @Body() input: SocialPageConnectInputDto,
  ): Promise<SocialPageDto> {
    const enterpriseId = await this.getEnterpriseId(userId);
    return this.commandBus.execute(
      new SocialPageConnectCommand(enterpriseId, input),
    );
  }

  @Post('facebook/refresh-token')
  @ApiOperation({
    summary: 'Refresh Facebook page access token using user credentials',
  })
  @ApiOkResponseEnvelope(SocialPageDto)
  async refreshToken(
    @CurrentUser('sub') userId: string,
    @Body('socialPageId') socialPageId: string,
    @Body('accessToken') userAccessToken: string,
  ): Promise<SocialPageDto> {
    const enterpriseId = await this.getEnterpriseId(userId);
    return this.commandBus.execute(
      new SocialPageRefreshTokenCommand(
        socialPageId,
        enterpriseId,
        userAccessToken,
      ),
    );
  }
}
