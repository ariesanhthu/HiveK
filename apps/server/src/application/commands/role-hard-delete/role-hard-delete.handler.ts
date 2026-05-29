import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { ROLE_REPOSITORY, type IRoleRepository } from '@/core/interfaces/repositories';
import { RoleHardDeleteCommand } from './role-hard-delete.command';

@CommandHandler(RoleHardDeleteCommand)
export class RoleHardDeleteCommandHandler implements ICommandHandler<RoleHardDeleteCommand, void> {
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
  ) { }

  async execute(command: RoleHardDeleteCommand): Promise<void> {
    const { id } = command;

    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    await this.roleRepository.delete(id);
  }
}
