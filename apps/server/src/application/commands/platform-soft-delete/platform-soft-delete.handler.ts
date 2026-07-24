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
import { PlatformSoftDeleteCommand } from './platform-soft-delete.command';

@CommandHandler(PlatformSoftDeleteCommand)
export class PlatformSoftDeleteCommandHandler implements
  ICommandHandler<
    PlatformSoftDeleteCommand,
    void
  >
{
  constructor(
    @Inject(PLATFORM_REPOSITORY) private readonly platformRepository: IPlatformRepository,
    @Inject(KOL_PROFILE_REPOSITORY) private readonly kolProfileRepository: IKolProfileRepository,
    @Inject(UNIT_OF_WORK) private readonly uow: IUnitOfWork,
  ) {}

  async execute(command: PlatformSoftDeleteCommand): Promise<void> {
    await this.uow.execute(async () => {
      const { id, deletedBy } = command;

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

      platform.softDelete(deletedBy);
      await this.platformRepository.save(platform);
    });
  }
}
