import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { KOL_PROFILE_REPOSITORY, type IKolProfileRepository } from '@/core/interfaces';
import { KolProfileRestoreCommand } from './kol-profile-restore.command';

@CommandHandler(KolProfileRestoreCommand)
export class KolProfileRestoreCommandHandler implements ICommandHandler<KolProfileRestoreCommand, void> {
  constructor(
    @Inject(KOL_PROFILE_REPOSITORY)
    private readonly kolProfileRepository: IKolProfileRepository,
  ) {}

  async execute(command: KolProfileRestoreCommand): Promise<void> {
    const { id } = command;

    const profile = await this.kolProfileRepository.findById(id);
    if (!profile) {
      throw new NotFoundException(`KOL Profile with ID ${id} not found`);
    }

    profile.restore();
    await this.kolProfileRepository.save(profile);
  }
}
