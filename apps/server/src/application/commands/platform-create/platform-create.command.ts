import { PlatformDto } from '@/application/dtos';
import { Command } from '@nestjs/cqrs';
import { PlatformCreateInputDto } from './platform-create.dto';

export class PlatformCreateCommand extends Command<PlatformDto> {
  constructor(public readonly input: PlatformCreateInputDto) {
    super();
  }
}
