import { RoleNotFoundException } from '@/core/exceptions';
import { type IRoleRepository, ROLE_REPOSITORY } from '@/core/interfaces/repositories';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RoleRestoreCommand } from './role-restore.command';

@CommandHandler(RoleRestoreCommand)
export class RoleRestoreCommandHandler implements
  ICommandHandler<
    RoleRestoreCommand,
    void
  >
{
  constructor(
    @Inject(ROLE_REPOSITORY) private readonly roleRepository: IRoleRepository,
  ) {}

  async execute(command: RoleRestoreCommand): Promise<void> {
    const { id } = command;

    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw new RoleNotFoundException(id);
    }

    role.restore();
    await this.roleRepository.save(role);
  }
}
