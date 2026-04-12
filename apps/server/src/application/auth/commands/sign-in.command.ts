import { Command } from '@nestjs/cqrs';
import { SignInInputDto, SignInOutputDto } from '../dtos';

export class SignInCommand extends Command<SignInOutputDto> {
  constructor(public readonly input: SignInInputDto) {
    super();
  }
}
