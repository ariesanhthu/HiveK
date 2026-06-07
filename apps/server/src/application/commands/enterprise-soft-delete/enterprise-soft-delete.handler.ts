import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { EnterpriseNotFoundException, EnterpriseForbiddenException } from '@/core/exceptions';
import { ENTERPRISE_REPOSITORY, type IEnterpriseRepository } from '@/core/interfaces/repositories';
import { EnterpriseSoftDeleteCommand } from './enterprise-soft-delete.command';

@CommandHandler(EnterpriseSoftDeleteCommand)
export class EnterpriseSoftDeleteCommandHandler implements ICommandHandler<EnterpriseSoftDeleteCommand, void> {
  constructor(
    @Inject(ENTERPRISE_REPOSITORY)
    private readonly enterpriseRepository: IEnterpriseRepository,
  ) { }

  async execute(command: EnterpriseSoftDeleteCommand): Promise<void> {
    const { id, requestedBy, deletedBy } = command;

    const enterprise = await this.enterpriseRepository.findById(id);
    if (!enterprise) {
      throw new EnterpriseNotFoundException(id);
    }

    if (enterprise.userId !== requestedBy) {
      throw new EnterpriseForbiddenException();
    }

    enterprise.softDelete(deletedBy);
    await this.enterpriseRepository.save(enterprise);
  }
}
