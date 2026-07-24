import { type IUnitOfWork, UNIT_OF_WORK } from '@/application/interfaces';
import { InvalidOperationException, RoleNotFoundException } from '@/core/exceptions';
import {
  type IRoleRepository,
  type IUserRepository,
  ROLE_REPOSITORY,
  USER_REPOSITORY,
} from '@/core/interfaces/repositories';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RoleSoftDeleteCommand } from './role-soft-delete.command';

@CommandHandler(RoleSoftDeleteCommand)
export class RoleSoftDeleteCommandHandler implements
  ICommandHandler<
    RoleSoftDeleteCommand,
    void
  >
{
  constructor(
    @Inject(ROLE_REPOSITORY) private readonly roleRepository: IRoleRepository,
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(UNIT_OF_WORK) private readonly uow: IUnitOfWork,
  ) {}

  async execute(command: RoleSoftDeleteCommand): Promise<void> {
    await this.uow.execute(async () => {
      const { id, deletedBy } = command;

      const role = await this.roleRepository.findById(id);
      if (!role) {
        throw new RoleNotFoundException(id);
      }

      const hasUsers = await this.userRepository.existsByRoleId(id);
      if (hasUsers) {
        throw new InvalidOperationException(
          `Cannot delete role. There are users associated with it.`,
        );
      }

      role.softDelete(deletedBy);
      await this.roleRepository.save(role);
    });
  }
}
