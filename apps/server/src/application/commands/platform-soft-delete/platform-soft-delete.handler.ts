import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { PLATFORM_REPOSITORY, type IPlatformRepository } from '@/core/interfaces';
import { PlatformSoftDeleteCommand } from './platform-soft-delete.command';

@CommandHandler(PlatformSoftDeleteCommand)
export class PlatformSoftDeleteCommandHandler implements ICommandHandler<PlatformSoftDeleteCommand, void> {
  constructor(
    @Inject(PLATFORM_REPOSITORY)
    private readonly platformRepository: IPlatformRepository,
  ) {}

  async execute(command: PlatformSoftDeleteCommand): Promise<void> {
    const { id, deletedBy } = command;

    const platform = await this.platformRepository.findById(id);
    if (!platform) {
      throw new NotFoundException(`Platform with ID ${id} not found`);
    }

    platform.softDelete(deletedBy);
    await this.platformRepository.save(platform);
  }
}
