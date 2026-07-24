import { type IWebSocketService, WEBSOCKET_SERVICE } from '@/application/interfaces';
import { UserNotFoundException } from '@/core/exceptions';
import { type IUserRepository, USER_REPOSITORY } from '@/core/interfaces/repositories';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthSignOutCommand } from './auth-sign-out.command';
import { AuthSignOutOutputDto } from './auth-sign-out.dto';

@CommandHandler(AuthSignOutCommand)
export class AuthSignOutCommandHandler implements
  ICommandHandler<
    AuthSignOutCommand,
    AuthSignOutOutputDto
  >
{
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(WEBSOCKET_SERVICE) private readonly webSocketService: IWebSocketService,
  ) {}

  async execute(command: AuthSignOutCommand): Promise<AuthSignOutOutputDto> {
    const { userId } = command;

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException(userId);
    }

    user.updateRefreshToken(null);
    await this.userRepository.save(user);

    await this.webSocketService.disconnectUser(userId);

    return { success: true };
  }
}
