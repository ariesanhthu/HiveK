import { type IUnitOfWork, UNIT_OF_WORK } from '@/application/interfaces';
import { InvalidOperationException, PlatformNotFoundException } from '@/core/exceptions';
import {
  type IKolProfileRepository,
  type IPlatformRepository,
  KOL_PROFILE_REPOSITORY,
  PLATFORM_REPOSITORY,
} from '@/core/interfaces/repositories';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PlatformHardDeleteCommand } from './platform-hard-delete.command';

@CommandHandler(PlatformHardDeleteCommand)
export class PlatformHardDeleteCommandHandler implements
  ICommandHandler<
    PlatformHardDeleteCommand,
    void
  >
{
  constructor(
    @Inject(PLATFORM_REPOSITORY) private readonly platformRepository: IPlatformRepository,
    @Inject(KOL_PROFILE_REPOSITORY) private readonly kolProfileRepository: IKolProfileRepository,
    @Inject(UNIT_OF_WORK) private readonly uow: IUnitOfWork,
  ) {}

  async execute(command: PlatformHardDeleteCommand): Promise<void> {
    await this.uow.execute(async () => {
      const { id } = command;

      const platform = await this.platformRepository.findById(id);
      if (!platform) {
        throw new PlatformNotFoundException(id);
      }

      const hasKols = await this.kolProfileRepository.existsByPlatformId(id);
      if (hasKols) {
        throw new InvalidOperationException(
          `Cannot delete platform. There are KOL profiles associated with it.`,
        );
      }

      await this.platformRepository.delete(id);
    });
  }
}
