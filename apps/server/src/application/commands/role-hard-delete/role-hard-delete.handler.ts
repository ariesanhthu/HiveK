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
import { RoleHardDeleteCommand } from './role-hard-delete.command';

@CommandHandler(RoleHardDeleteCommand)
export class RoleHardDeleteCommandHandler implements ICommandHandler<RoleHardDeleteCommand, void> {
  constructor(
    @Inject(ROLE_REPOSITORY) private readonly roleRepository: IRoleRepository,
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(UNIT_OF_WORK) private readonly uow: IUnitOfWork,
  ) {}

  async execute(command: RoleHardDeleteCommand): Promise<void> {
    await this.uow.execute(async () => {
      const { id } = command;

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

      await this.roleRepository.delete(id);
    });
  }
}
