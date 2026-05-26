import { Command } from '@nestjs/cqrs';
import { PlatformCreateInputDto } from './platform-create.dto';
import { PlatformDto } from '@/application/dtos';

export class PlatformCreateCommand extends Command<PlatformDto> {
  constructor(public readonly input: PlatformCreateInputDto) {
    super();
  }
}
