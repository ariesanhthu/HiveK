import { Command } from '@nestjs/cqrs';
import { UpdateProfileInputDto, UpdateProfileOutputDto } from '../dtos';

export class UpdateProfileCommand extends Command<UpdateProfileOutputDto> {
  constructor(
    public readonly userId: string,
    public readonly input: UpdateProfileInputDto,
  ) {
    super();
  }
}
