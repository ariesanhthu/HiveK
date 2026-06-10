import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PlatformNotFoundException } from '@/core/exceptions';
import { PLATFORM_REPOSITORY, type IPlatformRepository } from '@/core/interfaces/repositories';
import { PlatformRestoreCommand } from './platform-restore.command';

@CommandHandler(PlatformRestoreCommand)
export class PlatformRestoreCommandHandler implements ICommandHandler<PlatformRestoreCommand, void> {
  constructor(
    @Inject(PLATFORM_REPOSITORY)
    private readonly platformRepository: IPlatformRepository,
  ) { }

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
