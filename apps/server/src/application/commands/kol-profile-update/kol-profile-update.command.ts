import { Command } from '@nestjs/cqrs';
import { UpdateKolProfileDto } from './kol-profile-update.dto';
import { KolProfileDto } from '@/application/dtos';

export class KolProfileUpdateCommand extends Command<KolProfileDto> {
  constructor(
    public readonly id: string,
    public readonly input: UpdateKolProfileDto,
  ) {
    super();
  }
}
