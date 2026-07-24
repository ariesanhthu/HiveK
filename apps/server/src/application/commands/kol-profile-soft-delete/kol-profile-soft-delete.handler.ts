import { UserNotFoundException } from '@/core/exceptions';
import { type IKolProfileRepository, KOL_PROFILE_REPOSITORY } from '@/core/interfaces/repositories';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { KolProfileSoftDeleteCommand } from './kol-profile-soft-delete.command';

@CommandHandler(KolProfileSoftDeleteCommand)
export class KolProfileSoftDeleteCommandHandler implements
  ICommandHandler<
    KolProfileSoftDeleteCommand,
    void
  >
{
  constructor(
    @Inject(KOL_PROFILE_REPOSITORY) private readonly kolProfileRepository: IKolProfileRepository,
  ) {}

  async execute(command: KolProfileSoftDeleteCommand): Promise<void> {
    const { id, deletedBy } = command;

    const profile = await this.kolProfileRepository.findById(id);
    if (!profile) {
      throw new UserNotFoundException(id);
    }

    profile.softDelete(deletedBy);
    await this.kolProfileRepository.save(profile);
  }
}
