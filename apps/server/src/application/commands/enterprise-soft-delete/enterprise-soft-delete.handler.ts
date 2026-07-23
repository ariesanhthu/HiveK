import { type IUnitOfWork, UNIT_OF_WORK } from '@/application/interfaces';
import {
  EnterpriseForbiddenException,
  EnterpriseNotFoundException,
  InvalidOperationException,
} from '@/core/exceptions';
import {
  CAMPAIGN_REPOSITORY,
  ENTERPRISE_REPOSITORY,
  type ICampaignRepository,
  type IEnterpriseRepository,
} from '@/core/interfaces/repositories';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EnterpriseSoftDeleteCommand } from './enterprise-soft-delete.command';

@CommandHandler(EnterpriseSoftDeleteCommand)
export class EnterpriseSoftDeleteCommandHandler
  implements ICommandHandler<EnterpriseSoftDeleteCommand, void>
{
  constructor(
    @Inject(ENTERPRISE_REPOSITORY) private readonly enterpriseRepository: IEnterpriseRepository,
    @Inject(CAMPAIGN_REPOSITORY) private readonly campaignRepository: ICampaignRepository,
    @Inject(UNIT_OF_WORK) private readonly uow: IUnitOfWork,
  ) {}

  async execute(command: EnterpriseSoftDeleteCommand): Promise<void> {
    await this.uow.execute(async () => {
      const { id, requestedBy, deletedBy } = command;

      const enterprise = await this.enterpriseRepository.findById(id);
      if (!enterprise) {
        throw new EnterpriseNotFoundException(id);
      }

      if (enterprise.userId !== requestedBy) {
        throw new EnterpriseForbiddenException();
      }

      // Check if there are any active campaigns using the centralized repo method
      const hasActive = await this.campaignRepository.hasActiveCampaigns(id);
      if (hasActive) {
        throw new InvalidOperationException(
          `Cannot delete enterprise with active campaigns. Please complete or cancel them first.`,
        );
      }

      enterprise.softDelete(deletedBy);
      await this.enterpriseRepository.save(enterprise);
    });
  }
}
