import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { ROLE_REPOSITORY, type IRoleRepository } from '@/core/interfaces/repositories';
import { RoleRestoreCommand } from './role-restore.command';

@CommandHandler(RoleRestoreCommand)
export class RoleRestoreCommandHandler implements ICommandHandler<RoleRestoreCommand, void> {
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
  ) { }

  async execute(command: RoleRestoreCommand): Promise<void> {
    const { id } = command;

    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    role.restore();
    await this.roleRepository.save(role);
  }
}
