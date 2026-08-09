import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  RoleNotFoundException,
  InvalidOperationException,
} from '@/core/exceptions';
import {
  ROLE_REPOSITORY,
  USER_REPOSITORY,
  type IRoleRepository,
  type IUserRepository,
} from '@/core/interfaces/repositories';
import { RoleHardDeleteCommand } from './role-hard-delete.command';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/application/interfaces';

@CommandHandler(RoleHardDeleteCommand)
export class RoleHardDeleteCommandHandler implements ICommandHandler<
  RoleHardDeleteCommand,
  void
> {
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
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
