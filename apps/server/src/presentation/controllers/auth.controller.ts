import { Controller, Post, Body, HttpCode, HttpStatus, Get, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SignInCommand, SignUpCommand, SignOutCommand, ResetPasswordCommand } from '@/application/auth/commands';
import { GetProfileQuery } from '@/application/auth/queries';
import { SignInInputDto, SignUpInputDto, ResetPasswordInputDto, SignOutInputDto } from '@/application/auth/dtos';
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
  async signUpKOL(@Body() input: SignUpInputDto) {
    return this.commandBus.execute(new SignUpCommand(UserType.KOL, input));
  }

  @Post('sign-up/enterprise')
  @ApiOperation({ summary: 'Sign up as Enterprise' })
  async signUpEnterprise(@Body() input: SignUpInputDto) {
    return this.commandBus.execute(new SignUpCommand(UserType.ENTERPRISE, input));
  }

  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign in' })
  async signIn(@Body() input: SignInInputDto) {
    return this.commandBus.execute(new SignInCommand(input));
  }

  @Post('sign-out')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign out' })
  async signOut(@Body() input: SignOutInputDto) {
    return this.commandBus.execute(new SignOutCommand(input));
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password' })
  async resetPassword(@Body() input: ResetPasswordInputDto) {
    return this.commandBus.execute(new ResetPasswordCommand(input));
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@CurrentUser('sub') userId: string) {
    return this.queryBus.execute(new GetProfileQuery(userId));
  }
}
