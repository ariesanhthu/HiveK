import { Controller, Post, Body, HttpCode, HttpStatus, Get, UseGuards, Res } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  AuthSignInCommand,
  AuthSignUpCommand,
  AuthSignOutCommand,
  AuthResetPasswordCommand,
  AuthRefreshTokenCommand,
  AuthSignInInputDto,
  AuthSignUpInputDto,
  AuthResetPasswordInputDto,
  AuthSignOutInputDto,
  AuthRefreshTokenInputDto
} from '@/application/commands';
import { AuthGetProfileQuery } from '@/application/queries';
import { ERoleType } from '@/core/enums';
import { JwtAuthGuard } from '@/presentation/middleware/guards/jwt-auth.guard';
import { CurrentUser } from '@/presentation/decorators/current-user.decorator';
import { Public } from '@/presentation/decorators/public.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) { }

  @Public()
  @Post('sign-up/kol')
  @ApiOperation({ summary: 'Sign up as KOL' })
  async signUpKOL(@Body() input: AuthSignUpInputDto) {
    return this.commandBus.execute(new AuthSignUpCommand(ERoleType.KOL, input));
  }

  @Public()
  @Post('sign-up/enterprise')
  @ApiOperation({ summary: 'Sign up as Enterprise' })
  async signUpEnterprise(@Body() input: AuthSignUpInputDto) {
    return this.commandBus.execute(new AuthSignUpCommand(ERoleType.ENTERPRISE, input));
  }

  @Public()
  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign in' })
  async signIn(
    @Body() input: AuthSignInInputDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.commandBus.execute(new AuthSignInCommand(input));
    if (result && result.accessToken) {
      response.cookie('access_token', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });
    }
    if (result && result.refreshToken) {
      response.cookie('refresh_token', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
    }
    return result;
  }

  @Public()
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh tokens' })
  async refreshToken(
    @Body() input: AuthRefreshTokenInputDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.commandBus.execute(new AuthRefreshTokenCommand(input));
    if (result && result.accessToken) {
      response.cookie('access_token', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });
    }
    if (result && result.refreshToken) {
      response.cookie('refresh_token', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
    }
    return result;
  }

  @Public()
  @Post('sign-out')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign out' })
  async signOut(
    @Body() input: AuthSignOutInputDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    response.clearCookie('access_token');
    response.clearCookie('refresh_token');
    return this.commandBus.execute(new AuthSignOutCommand(input));
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password' })
  async resetPassword(@Body() input: AuthResetPasswordInputDto) {
    return this.commandBus.execute(new AuthResetPasswordCommand(input));
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@CurrentUser('sub') userId: string) {
    return this.queryBus.execute(new AuthGetProfileQuery(userId));
  }
}
