import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { KOL_PROFILE_REPOSITORY, type IKolProfileRepository } from '@/core/interfaces/repositories';
import { KolProfileSoftDeleteCommand } from './kol-profile-soft-delete.command';

@CommandHandler(KolProfileSoftDeleteCommand)
export class KolProfileSoftDeleteCommandHandler implements ICommandHandler<KolProfileSoftDeleteCommand, void> {
  constructor(
    @Inject(KOL_PROFILE_REPOSITORY)
    private readonly kolProfileRepository: IKolProfileRepository,
  ) { }

  async execute(command: KolProfileSoftDeleteCommand): Promise<void> {
    const { id, deletedBy } = command;

    const profile = await this.kolProfileRepository.findById(id);
    if (!profile) {
      throw new NotFoundException(`KOL Profile with ID ${id} not found`);
    }

    profile.softDelete(deletedBy);
    await this.kolProfileRepository.save(profile);
  }
}
