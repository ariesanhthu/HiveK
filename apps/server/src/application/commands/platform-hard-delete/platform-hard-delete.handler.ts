import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { PLATFORM_REPOSITORY, type IPlatformRepository } from '@/core/interfaces/repositories';
import { PlatformHardDeleteCommand } from './platform-hard-delete.command';

@CommandHandler(PlatformHardDeleteCommand)
export class PlatformHardDeleteCommandHandler implements ICommandHandler<PlatformHardDeleteCommand, void> {
  constructor(
    @Inject(PLATFORM_REPOSITORY)
    private readonly platformRepository: IPlatformRepository,
  ) { }

  async execute(command: PlatformHardDeleteCommand): Promise<void> {
    const { id } = command;

    const platform = await this.platformRepository.findById(id);
    if (!platform) {
      throw new NotFoundException(`Platform with ID ${id} not found`);
    }

    await this.platformRepository.delete(id);
  }
}
