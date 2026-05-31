import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RoleUpdateCommand } from './role-update.command';
import { Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { ROLE_REPOSITORY, type IRoleRepository } from '@/core/interfaces/repositories';

@CommandHandler(RoleUpdateCommand)
export class RoleUpdateCommandHandler implements ICommandHandler<RoleUpdateCommand, void> {
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
  ) {}

  async execute(command: RoleUpdateCommand): Promise<void> {
    const { id, input } = command;

    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    if (input.title && input.title !== role.title) {
      const existingRole = await this.roleRepository.findByTitle(input.title);
      if (existingRole) {
        throw new ConflictException(`Role with title '${input.title}' already exists`);
      }
    }

    role.update({
      title: input.title,
      permissions: input.permissions,
      type: input.type,
    });

    await this.roleRepository.save(role);
  }
}
