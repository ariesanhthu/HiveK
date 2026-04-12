import { Command } from '@nestjs/cqrs';
import { SignOutInputDto, SignOutOutputDto } from '../dtos';

export class SignOutCommand extends Command<SignOutOutputDto> {
  constructor(public readonly input: SignOutInputDto) {
    super();
  }
}
