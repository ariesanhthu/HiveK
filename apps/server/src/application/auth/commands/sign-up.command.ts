import { Command } from '@nestjs/cqrs';
import { SignUpInputDto, SignUpOutputDto } from '../dtos';
import { UserType } from '@/core/enums';

export class SignUpCommand extends Command<SignUpOutputDto> {
  constructor(
    public readonly type: UserType,
    public readonly input: SignUpInputDto,
  ) {
    super();
  }
}
