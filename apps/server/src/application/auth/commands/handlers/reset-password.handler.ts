import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ResetPasswordCommand } from '../reset-password.command';
import { ResetPasswordOutputDto } from '../../dtos';

@CommandHandler(ResetPasswordCommand)
export class ResetPasswordCommandHandler implements ICommandHandler<ResetPasswordCommand, ResetPasswordOutputDto> {
  async execute(command: ResetPasswordCommand): Promise<ResetPasswordOutputDto> {
    // Logic for reset password goes here
    return { success: true };
  }
}
