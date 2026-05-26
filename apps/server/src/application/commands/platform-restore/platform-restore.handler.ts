import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { PLATFORM_REPOSITORY, type IPlatformRepository } from '@/core/interfaces';
import { PlatformRestoreCommand } from './platform-restore.command';

@CommandHandler(PlatformRestoreCommand)
export class PlatformRestoreCommandHandler implements ICommandHandler<PlatformRestoreCommand, void> {
  constructor(
    @Inject(PLATFORM_REPOSITORY)
    private readonly platformRepository: IPlatformRepository,
  ) {}

  async execute(command: PlatformRestoreCommand): Promise<void> {
    const { id } = command;

    const platform = await this.platformRepository.findById(id);
    if (!platform) {
      throw new NotFoundException(`Platform with ID ${id} not found`);
    }

    platform.restore();
    await this.platformRepository.save(platform);
  }
}
