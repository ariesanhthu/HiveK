import { Command } from '@nestjs/cqrs';
import { PlatformUpdateInputDto } from './platform-update.dto';
import { PlatformDto } from '@/application/dtos';

export class PlatformUpdateCommand extends Command<PlatformDto> {
  constructor(
    public readonly id: string,
    public readonly input: PlatformUpdateInputDto,
  ) {
    super();
  }
}
