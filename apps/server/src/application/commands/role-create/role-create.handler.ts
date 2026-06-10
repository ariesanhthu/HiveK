import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RoleCreateCommand } from './role-create.command';
import { Inject } from '@nestjs/common';
import { RoleConflictException } from '@/core/exceptions';
import { ROLE_REPOSITORY, type IRoleRepository } from '@/core/interfaces/repositories';
import { RoleRoot } from '@/core/aggregate-roots';

@CommandHandler(RoleCreateCommand)
export class RoleCreateCommandHandler implements ICommandHandler<RoleCreateCommand, string> {
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
  ) {}

  async execute(command: RoleCreateCommand): Promise<string> {
    const { input } = command;

    const existingRole = await this.roleRepository.findByTitle(input.title);
    if (existingRole) {
      throw new RoleConflictException(`Role with title '${input.title}' already exists`);
    }

    const role = RoleRoot.create({
      title: input.title,
      permissions: input.permissions,
      type: input.type,
    });

    await this.roleRepository.save(role);

    return role.id!;
  }
}
