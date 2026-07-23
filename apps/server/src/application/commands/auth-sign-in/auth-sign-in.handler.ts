import { AuthService } from '@/application/services/auth.service';
import { ERoleType } from '@/core/enums';
import { InvalidCredentialsException } from '@/core/exceptions';
import { type IUserRepository, USER_REPOSITORY } from '@/core/interfaces/repositories';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthSignInCommand } from './auth-sign-in.command';
import { AuthSignInOutputDto } from './auth-sign-in.dto';

@CommandHandler(AuthSignInCommand)
export class AuthSignInCommandHandler
  implements ICommandHandler<AuthSignInCommand, AuthSignInOutputDto>
{
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    private readonly authService: AuthService,
  ) {}

  async execute(command: AuthSignInCommand): Promise<AuthSignInOutputDto> {
    const { input, isAdmin } = command;

    const normalizedEmail = this.authService.normalizeEmail(input.email);
    const user = await this.userRepository.findByEmail(normalizedEmail);
    if (!user) {
      throw new InvalidCredentialsException();
    }

    if (isAdmin && user.type !== ERoleType.ADMIN) {
      throw new InvalidCredentialsException();
    }

    const isPasswordValid = await this.authService.comparePassword(
      input.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new InvalidCredentialsException();
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.roleId,
      type: user.type,
    };

    const { accessToken, refreshToken } = await this.authService.generateTokens(payload);

    user.updateRefreshToken(refreshToken);
    await this.userRepository.save(user);

    return { accessToken, refreshToken };
  }
}
