import {
  KolProfileHardDeleteCommand,
  KolProfileUpdateCommand,
  UpdateKolProfileDto,
} from '@/application/commands';
import { KolProfileDto } from '@/application/dtos';
import {
  CursorPaginationRequestDto,
  PaginatedResponseDto,
} from '@/application/dtos/pagination.dto';
import {
  KolProfileFilterDto,
  KolProfileGetByIdQuery,
  KolProfileGetHandlesDevQuery,
  KolProfileGetListQuery,
} from '@/application/queries';
import { Public } from '@/presentation/decorators/public.decorator';
import {
  FacebookAuthGuard,
  JwtAuthGuard,
  YoutubeAuthGuard,
} from '@/presentation/middleware/guards';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { buildVersionedRoute } from '@presentation/utils';

@ApiTags('CLIENT-kol-profiles')
@ApiBearerAuth()
@ApiSecurity('x-api-key')
@Controller(buildVersionedRoute('client', 'kol-profiles', 1))
export class KolProfileClientController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get('verify/youtube')
  @UseGuards(JwtAuthGuard, YoutubeAuthGuard)
  @ApiOperation({ summary: 'Initiate YouTube verification flow for KOL' })
  async verifyYoutube() {
    // Handled by Passport strategy redirection
    return;
  }

  @Public()
  @Get('verify/youtube/callback')
  @UseGuards(AuthGuard('youtube'))
  @ApiOperation({ summary: 'YouTube OAuth callback' })
  async verifyYoutubeCallback(@Req() req: any) {
    // req.user contains the output from YoutubeStrategy.validate()
    return req.user;
  }

  @Get('verify/facebook')
  @UseGuards(JwtAuthGuard, FacebookAuthGuard)
  @ApiOperation({ summary: 'Initiate Facebook verification flow for KOL' })
  async verifyFacebook() {
    // Handled by Passport strategy redirection
    return;
  }

  @Public()
  @Get('verify/facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  @ApiOperation({ summary: 'Facebook OAuth callback' })
  async verifyFacebookCallback(@Req() req: any) {
    // req.user contains the output from FacebookStrategy.validate()
    return req.user;
  }

  @Get('verify/twitter')
  @UseGuards(JwtAuthGuard, AuthGuard('twitter'))
  @ApiOperation({ summary: 'Initiate Twitter verification flow for KOL' })
  async verifyTwitter() {
    // Handled by Passport strategy redirection
    return;
  }

  @Public()
  @Get('verify/twitter/callback')
  @UseGuards(JwtAuthGuard, AuthGuard('twitter'))
  @ApiOperation({ summary: 'Twitter OAuth callback' })
  async verifyTwitterCallback(@Req() req: any) {
    // req.user contains the output from TwitterStrategy.validate()
    return req.user;
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Search/List KOL profiles' })
  async findAll(
    @Query() filters: KolProfileFilterDto,
  ): Promise<PaginatedResponseDto<KolProfileDto>> {
    return this.queryBus.execute(new KolProfileGetListQuery(filters));
  }

  @Public()
  @Get('platforms')
  @ApiOperation({ summary: 'Get KOL profile handles mapping (for dev)' })
  async findHandlesDev(
    @Query() pagination: CursorPaginationRequestDto,
  ): Promise<PaginatedResponseDto<any>> {
    return this.queryBus.execute(new KolProfileGetHandlesDevQuery(pagination));
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get KOL profile by ID' })
  async findById(@Param('id') id: string): Promise<KolProfileDto> {
    return this.queryBus.execute(new KolProfileGetByIdQuery(id));
  }

  @Public()
  @Patch(':id')
  @ApiOperation({ summary: 'Update anything of an influencer (PATCH)' })
  async update(
    @Param('id') id: string,
    @Body() input: UpdateKolProfileDto,
  ): Promise<KolProfileDto> {
    return this.commandBus.execute(new KolProfileUpdateCommand(id, input));
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Hard delete KOL profile' })
  async hardDelete(@Param('id') id: string): Promise<void> {
    return this.commandBus.execute(new KolProfileHardDeleteCommand(id));
  }
}
