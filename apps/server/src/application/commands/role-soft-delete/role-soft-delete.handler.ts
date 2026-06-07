import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { RoleNotFoundException, InvalidOperationException } from '@/core/exceptions';
import { ROLE_REPOSITORY, USER_REPOSITORY, type IRoleRepository, type IUserRepository } from '@/core/interfaces/repositories';
import { RoleSoftDeleteCommand } from './role-soft-delete.command';
import { IUnitOfWork, UNIT_OF_WORK } from '@/application/interfaces';

@CommandHandler(RoleSoftDeleteCommand)
export class RoleSoftDeleteCommandHandler implements ICommandHandler<RoleSoftDeleteCommand, void> {
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
  ) { }

  async execute(command: RoleSoftDeleteCommand): Promise<void> {
    await this.uow.execute(async () => {
        const { id, deletedBy } = command;

        const role = await this.roleRepository.findById(id);
        if (!role) {
            throw new RoleNotFoundException(id);
        }

        const hasUsers = await this.userRepository.existsByRoleId(id);
        if (hasUsers) {
            throw new InvalidOperationException(`Cannot delete role. There are users associated with it.`);
        }

        role.softDelete(deletedBy);
        await this.roleRepository.save(role);
    });
  }
}
