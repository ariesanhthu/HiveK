import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SignOutCommand } from '../sign-out.command';
import { SignOutOutputDto } from '../../dtos';

@CommandHandler(SignOutCommand)
export class SignOutCommandHandler implements ICommandHandler<SignOutCommand, SignOutOutputDto> {
  async execute(command: SignOutCommand): Promise<SignOutOutputDto> {
    // Logic for signout (e.g. blacklisting token) goes here
    return { success: true };
  }
}
