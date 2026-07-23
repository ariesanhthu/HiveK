import { UserNotFoundException } from '@/core/exceptions';
import { type IKolProfileRepository, KOL_PROFILE_REPOSITORY } from '@/core/interfaces/repositories';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { KolProfileRestoreCommand } from './kol-profile-restore.command';

@CommandHandler(KolProfileRestoreCommand)
export class KolProfileRestoreCommandHandler
  implements ICommandHandler<KolProfileRestoreCommand, void>
{
  constructor(
    @Inject(KOL_PROFILE_REPOSITORY) private readonly kolProfileRepository: IKolProfileRepository,
  ) {}

  async execute(command: KolProfileRestoreCommand): Promise<void> {
    const { id } = command;

    const profile = await this.kolProfileRepository.findById(id);
    if (!profile) {
      throw new UserNotFoundException(id);
    }

    profile.restore();
    await this.kolProfileRepository.save(profile);
  }
}
