import {
  AuthChangePasswordCommand,
  AuthChangePasswordInputDto,
  AuthRefreshTokenCommand,
  AuthRefreshTokenInputDto,
  AuthResetPasswordCommand,
  AuthResetPasswordInputDto,
  AuthSendOtpCommand,
  AuthSendOtpInputDto,
  AuthSignInCommand,
  AuthSignInInputDto,
  AuthSignOutCommand,
  AuthVerifyOtpCommand,
  AuthVerifyOtpInputDto,
  UserUpdateCommand,
} from '@/application/commands';
import { UserUpdateInputDto } from '@/application/commands/user-update/user-update.dto';
import { AuthGetProfileQuery } from '@/application/queries';
import { ERoleType } from '@/core/enums';
import { CurrentUser } from '@/presentation/decorators/current-user.decorator';
import { Public } from '@/presentation/decorators/public.decorator';
import { Roles } from '@/presentation/decorators/roles.decorator';
import { RolesGuard } from '@/presentation/middleware/guards';
import { JwtAuthGuard } from '@/presentation/middleware/guards/jwt-auth.guard';
import { env } from '@/shared/utils';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiSecurity,
  ApiTags,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { buildVersionedRoute } from '@presentation/utils';
import type { Request, Response } from 'express';

@ApiTags('ADMIN-auth')
@ApiBearerAuth()
@ApiSecurity('x-api-key')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ERoleType.ADMIN)
@Controller(buildVersionedRoute('admin', 'auth', 1))
export class AuthAdminController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}
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
    const result = await this.commandBus.execute(new AuthSignInCommand(input, true));
    if (result && result.accessToken) {
      response.cookie('access_token', result.accessToken, {
        httpOnly: true,
        secure: env('NODE_ENV', 'development') === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });
    }
    if (result && result.refreshToken) {
      response.cookie('refresh_token', result.refreshToken, {
        httpOnly: true,
        secure: env('NODE_ENV', 'development') === 'production',
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

    const result = await this.commandBus.execute(
      new AuthRefreshTokenCommand({ refreshToken: token }),
    );
    if (result && result.accessToken) {
      response.cookie('access_token', result.accessToken, {
        httpOnly: true,
        secure: env('NODE_ENV', 'development') === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });
    }
    if (result && result.refreshToken) {
      response.cookie('refresh_token', result.refreshToken, {
        httpOnly: true,
        secure: env('NODE_ENV', 'development') === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
    }
    return result;
  }

  @Post('sign-out')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Sign out current user' })
  async signOut(
    @CurrentUser('sub') userId: string,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    response.clearCookie('access_token');
    response.clearCookie('refresh_token');
    await this.commandBus.execute(new AuthSignOutCommand(userId));
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@CurrentUser('sub') userId: string) {
    return this.queryBus.execute(new AuthGetProfileQuery(userId));
  }

  @Patch('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user profile' })
  async updateProfile(
    @CurrentUser('sub') userId: string,
    @Body() input: UserUpdateInputDto,
  ) {
    return this.commandBus.execute(new UserUpdateCommand(userId, input));
  }
}
