import { Command } from '@nestjs/cqrs';
import { CreatePlatformInputDto, PlatformDto } from '../dtos';

export class CreatePlatformCommand extends Command<PlatformDto> {
  constructor(public readonly input: CreatePlatformInputDto) {
    super();
  }
}
