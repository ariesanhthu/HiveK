import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { ENTERPRISE_REPOSITORY, type IEnterpriseRepository } from '@/core/interfaces/repositories';
import { EnterpriseRestoreCommand } from './enterprise-restore.command';

@CommandHandler(EnterpriseRestoreCommand)
export class EnterpriseRestoreCommandHandler implements ICommandHandler<EnterpriseRestoreCommand, void> {
  constructor(
    @Inject(ENTERPRISE_REPOSITORY)
    private readonly enterpriseRepository: IEnterpriseRepository,
  ) { }

  async execute(command: EnterpriseRestoreCommand): Promise<void> {
    const { id } = command;

    const enterprise = await this.enterpriseRepository.findById(id);
    if (!enterprise) {
      throw new NotFoundException(`Enterprise with ID ${id} not found`);
    }

    enterprise.restore();
    await this.enterpriseRepository.save(enterprise);
  }
}
