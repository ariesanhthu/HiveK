import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { RoleNotFoundException } from '@/core/exceptions';
import { ROLE_REPOSITORY, type IRoleRepository } from '@/core/interfaces/repositories';
import { RoleSoftDeleteCommand } from './role-soft-delete.command';

@CommandHandler(RoleSoftDeleteCommand)
export class RoleSoftDeleteCommandHandler implements ICommandHandler<RoleSoftDeleteCommand, void> {
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
  ) { }

  async execute(command: RoleSoftDeleteCommand): Promise<void> {
    const { id, deletedBy } = command;

    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw new RoleNotFoundException(id);
    }

    role.softDelete(deletedBy);
    await this.roleRepository.save(role);
  }
}
