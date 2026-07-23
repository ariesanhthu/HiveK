import { PlatformDto } from '@/application/dtos';
import { Command } from '@nestjs/cqrs';
import { PlatformUpdateInputDto } from './platform-update.dto';

export class PlatformUpdateCommand extends Command<PlatformDto> {
  constructor(
    public readonly id: string,
    public readonly input: PlatformUpdateInputDto,
  ) {
    super();
  }
}
