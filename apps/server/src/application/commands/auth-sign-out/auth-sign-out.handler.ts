import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthSignOutCommand } from './auth-sign-out.command';
import { AuthSignOutOutputDto } from './auth-sign-out.dto';
import { Inject } from '@nestjs/common';
import { USER_REPOSITORY, type IUserRepository } from '@/core/interfaces/repositories';
import { WEBSOCKET_SERVICE, type IWebSocketService } from '@/application/interfaces';

@CommandHandler(AuthSignOutCommand)
export class AuthSignOutCommandHandler implements ICommandHandler<AuthSignOutCommand, AuthSignOutOutputDto> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(WEBSOCKET_SERVICE)
    private readonly webSocketService: IWebSocketService,
  ) {}

  async execute(command: AuthSignOutCommand): Promise<AuthSignOutOutputDto> {
    const { userId } = command.input;

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.updateRefreshToken(null);
    await this.userRepository.save(user);

    await this.webSocketService.disconnectUser(userId);

    return { success: true };
  }
}
