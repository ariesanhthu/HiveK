import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { KOL_PROFILE_REPOSITORY, type IKolProfileRepository } from '@/core/interfaces/repositories';
import { KolProfileHardDeleteCommand } from './kol-profile-hard-delete.command';

@CommandHandler(KolProfileHardDeleteCommand)
export class KolProfileHardDeleteCommandHandler implements ICommandHandler<KolProfileHardDeleteCommand, void> {
  constructor(
    @Inject(KOL_PROFILE_REPOSITORY)
    private readonly kolProfileRepository: IKolProfileRepository,
  ) { }

  async execute(command: KolProfileHardDeleteCommand): Promise<void> {
    const { id } = command;

    const profile = await this.kolProfileRepository.findById(id);
    if (!profile) {
      throw new NotFoundException(`KOL Profile with ID ${id} not found`);
    }

    await this.kolProfileRepository.delete(id);
  }
}
