import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UserNotFoundException } from '@/core/exceptions';
import {
  KOL_PROFILE_REPOSITORY,
  type IKolProfileRepository,
} from '@/core/interfaces/repositories';
import { KolProfileHardDeleteCommand } from './kol-profile-hard-delete.command';

@CommandHandler(KolProfileHardDeleteCommand)
export class KolProfileHardDeleteCommandHandler implements ICommandHandler<
  KolProfileHardDeleteCommand,
  void
> {
  constructor(
    @Inject(KOL_PROFILE_REPOSITORY)
    private readonly kolProfileRepository: IKolProfileRepository,
  ) {}

  async execute(command: KolProfileHardDeleteCommand): Promise<void> {
    const { id } = command;

    const profile = await this.kolProfileRepository.findById(id);
    if (!profile) {
      throw new UserNotFoundException(id);
    }

    await this.kolProfileRepository.delete(id);
  }
}
