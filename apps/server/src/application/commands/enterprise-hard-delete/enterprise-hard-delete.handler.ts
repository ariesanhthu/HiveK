import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { ENTERPRISE_REPOSITORY, type IEnterpriseRepository } from '@/core/interfaces/repositories';
import { EnterpriseHardDeleteCommand } from './enterprise-hard-delete.command';

@CommandHandler(EnterpriseHardDeleteCommand)
export class EnterpriseHardDeleteCommandHandler implements ICommandHandler<EnterpriseHardDeleteCommand, void> {
  constructor(
    @Inject(ENTERPRISE_REPOSITORY)
    private readonly enterpriseRepository: IEnterpriseRepository,
  ) { }

  async execute(command: EnterpriseHardDeleteCommand): Promise<void> {
    const { id } = command;

    const enterprise = await this.enterpriseRepository.findById(id);
    if (!enterprise) {
      throw new NotFoundException(`Enterprise with ID ${id} not found`);
    }

    await this.enterpriseRepository.delete(id);
  }
}
