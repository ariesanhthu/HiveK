import { Command } from '@nestjs/cqrs';
import { PlatformDto, UpdatePlatformInputDto } from '../dtos';

export class UpdatePlatformCommand extends Command<PlatformDto> {
  constructor(
    public readonly id: string,
    public readonly input: UpdatePlatformInputDto,
  ) {
    super();
  }
}
