import { Controller, Get, Param, Query, Body, Patch, Delete, Post, HttpCode, HttpStatus, UseGuards, Req, Res, Injectable } from '@nestjs/common';
import { QueryBus, CommandBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { KolProfileGetListQuery, KolProfileGetByIdQuery, KolProfileGetHandlesDevQuery, KolProfileFilterDto } from '@/application/queries';
import { KolProfileUpdateCommand, KolProfileSoftDeleteCommand, KolProfileHardDeleteCommand, KolProfileRestoreCommand, UpdateKolProfileDto } from '@/application/commands';
import { KolProfileDto, SoftDeleteInputDto } from '@/application/dtos';
import { PaginatedResponseDto, CursorPaginationRequestDto } from '@/application/dtos/pagination.dto';
import { JwtAuthGuard, YoutubeAuthGuard, FacebookAuthGuard } from '@/presentation/middleware/guards';
import { Public } from '@/presentation/decorators/public.decorator';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('kol-profiles')
@ApiBearerAuth()
@ApiSecurity('x-api-key')
@Controller('kol-profiles')
export class KolProfileController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) { }

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
  async findAll(@Query() filters: KolProfileFilterDto): Promise<PaginatedResponseDto<KolProfileDto>> {
    return this.queryBus.execute(new KolProfileGetListQuery(filters));
  }

  @Public()
  @Get('platforms')
  @ApiOperation({ summary: 'Get KOL profile handles mapping (for dev)' })
  async findHandlesDev(@Query() pagination: CursorPaginationRequestDto): Promise<PaginatedResponseDto<any>> {
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
  async update(@Param('id') id: string, @Body() input: UpdateKolProfileDto): Promise<KolProfileDto> {
    return this.commandBus.execute(new KolProfileUpdateCommand(id, input));
  }

  @Patch(':id/soft-delete')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete KOL profile' })
  async delete(
    @Param('id') id: string,
    @Query() dto: SoftDeleteInputDto,
  ): Promise<void> {
    return this.commandBus.execute(new KolProfileSoftDeleteCommand(id, dto.deletedBy));
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Hard delete KOL profile' })
  async hardDelete(@Param('id') id: string): Promise<void> {
    return this.commandBus.execute(new KolProfileHardDeleteCommand(id));
  }

  @Patch(':id/restore')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Restore soft deleted KOL profile' })
  async restore(@Param('id') id: string): Promise<void> {
    return this.commandBus.execute(new KolProfileRestoreCommand(id));
  }
}
