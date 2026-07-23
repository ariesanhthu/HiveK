import { PlatformNotFoundException } from '@/core/exceptions';
import { type IPlatformRepository, PLATFORM_REPOSITORY } from '@/core/interfaces/repositories';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PlatformRestoreCommand } from './platform-restore.command';

@CommandHandler(PlatformRestoreCommand)
export class PlatformRestoreCommandHandler
  implements ICommandHandler<PlatformRestoreCommand, void>
{
  constructor(
    @Inject(PLATFORM_REPOSITORY) private readonly platformRepository: IPlatformRepository,
  ) {}

  async execute(command: PlatformRestoreCommand): Promise<void> {
    const { id } = command;

    const platform = await this.platformRepository.findById(id);
    if (!platform) {
      throw new PlatformNotFoundException(id);
    }

    platform.restore();
    await this.platformRepository.save(platform);
  }
}
