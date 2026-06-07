import { Controller, Post, Body, HttpCode, HttpStatus, Get, UseGuards, Res, Req, BadRequestException } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import type { Response, Request } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiSecurity, ApiTooManyRequestsResponse } from '@nestjs/swagger';
import {
  AuthSignInCommand,
  AuthSignUpCommand,
  AuthSignOutCommand,
  AuthResetPasswordCommand,
  AuthRefreshTokenCommand,
  AuthSendOtpCommand,
  AuthChangePasswordCommand,
  AuthVerifyOtpCommand,
  AuthSignInInputDto,
  AuthSignUpInputDto,
  AuthResetPasswordInputDto,
  AuthSignOutInputDto,
  AuthRefreshTokenInputDto,
  AuthSendOtpInputDto,
  AuthChangePasswordInputDto,
  AuthVerifyOtpInputDto
} from '@/application/commands';
import { AuthGetProfileQuery } from '@/application/queries';
import { ERoleType } from '@/core/enums';
import { JwtAuthGuard } from '@/presentation/middleware/guards/jwt-auth.guard';
import { CurrentUser } from '@/presentation/decorators/current-user.decorator';
import { Public } from '@/presentation/decorators/public.decorator';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';

@ApiTags('auth')
@ApiBearerAuth()
@ApiSecurity('x-api-key')
@UseGuards(JwtAuthGuard)
@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) { }

  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth sign-in' })
  async googleAuth() {
    return;
  }

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth callback' })
  async googleAuthCallback(
    @Req() req: any,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = req.user;
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
  @Post('sign-up/kol')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Sign up as KOL (Rate limited: 5/min)' })
  @ApiTooManyRequestsResponse({ description: 'Too many requests' })
  async signUpKOL(@Body() input: AuthSignUpInputDto) {
    return this.commandBus.execute(new AuthSignUpCommand(ERoleType.KOL, input));
  }

  @Public()
  @Post('sign-up/enterprise')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Sign up as Enterprise (Rate limited: 5/min)' })
  @ApiTooManyRequestsResponse({ description: 'Too many requests' })
  async signUpEnterprise(@Body() input: AuthSignUpInputDto) {
    return this.commandBus.execute(new AuthSignUpCommand(ERoleType.ENTERPRISE, input));
  }

  @Public()
  @Post('sign-in')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign in (Rate limited: 5/min)' })
  @ApiTooManyRequestsResponse({ description: 'Too many requests' })
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
    @Req() req: Request,
    @Body() input: AuthRefreshTokenInputDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    let token = input.refreshToken;
    if (!token && req.cookies) {
      token = req.cookies['refresh_token'];
    }
    if (!token && req.headers?.cookie) {
      const match = req.headers.cookie.match(/(?:^|; )refresh_token=([^;]*)/);
      token = match ? decodeURIComponent(match[1]) : undefined;
    }

    if (!token) {
      throw new BadRequestException('Refresh token is required');
    }

    const result = await this.commandBus.execute(new AuthRefreshTokenCommand({ refreshToken: token }));
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

  @Post('sign-out')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign out current user' })
  async signOut(
    @CurrentUser('sub') userId: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    response.clearCookie('access_token');
    response.clearCookie('refresh_token');
    return this.commandBus.execute(new AuthSignOutCommand(userId));
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password' })
  async resetPassword(@Body() input: AuthResetPasswordInputDto) {
    return this.commandBus.execute(new AuthResetPasswordCommand(input));
  }

  @Public()
  @Post('send-otp')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send OTP verification code (Rate limited: 5/min)' })
  @ApiTooManyRequestsResponse({ description: 'Too many requests' })
  async sendOtp(@Body() input: AuthSendOtpInputDto) {
    return this.commandBus.execute(new AuthSendOtpCommand(input));
  }

  @Public()
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify OTP verification code' })
  async verifyOtp(@Body() input: AuthVerifyOtpInputDto) {
    return this.commandBus.execute(new AuthVerifyOtpCommand(input));
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change current user password' })
  async changePassword(
    @CurrentUser('sub') userId: string,
    @Body() input: AuthChangePasswordInputDto,
  ) {
    return this.commandBus.execute(new AuthChangePasswordCommand(userId, input));
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@CurrentUser('sub') userId: string) {
    return this.queryBus.execute(new AuthGetProfileQuery(userId));
  }
}
