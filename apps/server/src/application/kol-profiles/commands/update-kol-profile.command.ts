import { Command } from '@nestjs/cqrs';
import { UpdateKolProfileDto } from '../dtos';
import { KolProfileDto } from '../dtos';

export class UpdateKolProfileCommand extends Command<KolProfileDto> {
  constructor(
    public readonly id: string,
    public readonly input: UpdateKolProfileDto,
  ) {
    super();
  }
}
