import { Command } from '@nestjs/cqrs';
import { ResetPasswordInputDto, ResetPasswordOutputDto } from '../dtos';

export class ResetPasswordCommand extends Command<ResetPasswordOutputDto> {
  constructor(public readonly input: ResetPasswordInputDto) {
    super();
  }
}
