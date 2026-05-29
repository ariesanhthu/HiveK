import { Controller, Post, Body, HttpCode, HttpStatus, Get, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
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
import { UserType } from '@/core/enums';
import { JwtAuthGuard } from '@/presentation/middleware/jwt-auth.guard';
import { CurrentUser } from '@/presentation/decorators/current-user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('sign-up/kol')
  @ApiOperation({ summary: 'Sign up as KOL' })
  async signUpKOL(@Body() input: AuthSignUpInputDto) {
    return this.commandBus.execute(new AuthSignUpCommand(UserType.KOL, input));
  }

  @Post('sign-up/enterprise')
  @ApiOperation({ summary: 'Sign up as Enterprise' })
  async signUpEnterprise(@Body() input: AuthSignUpInputDto) {
    return this.commandBus.execute(new AuthSignUpCommand(UserType.ENTERPRISE, input));
  }

  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign in' })
  async signIn(@Body() input: AuthSignInInputDto) {
    return this.commandBus.execute(new AuthSignInCommand(input));
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh tokens' })
  async refreshToken(@Body() input: AuthRefreshTokenInputDto) {
    return this.commandBus.execute(new AuthRefreshTokenCommand(input));
  }

  @Post('sign-out')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign out' })
  async signOut(@Body() input: AuthSignOutInputDto) {
    return this.commandBus.execute(new AuthSignOutCommand(input));
  }

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
