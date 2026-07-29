import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  EnterpriseNotFoundException,
  EnterpriseForbiddenException,
  InvalidOperationException,
} from '@/core/exceptions';
import {
  ENTERPRISE_REPOSITORY,
  CAMPAIGN_REPOSITORY,
  type IEnterpriseRepository,
  type ICampaignRepository,
} from '@/core/interfaces/repositories';
import { EnterpriseHardDeleteCommand } from './enterprise-hard-delete.command';
import {
  type IUnitOfWork,
  UNIT_OF_WORK,
  EVENT_SERVICE,
} from '@/application/interfaces';
import type { IEventService } from '@/application/interfaces';

@CommandHandler(EnterpriseHardDeleteCommand)
export class EnterpriseHardDeleteCommandHandler implements ICommandHandler<
  EnterpriseHardDeleteCommand,
  void
> {
  constructor(
    @Inject(ENTERPRISE_REPOSITORY)
    private readonly enterpriseRepository: IEnterpriseRepository,
    @Inject(CAMPAIGN_REPOSITORY)
    private readonly campaignRepository: ICampaignRepository,
    @Inject(EVENT_SERVICE)
    private readonly eventService: IEventService,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
  ) {}

  async execute(command: EnterpriseHardDeleteCommand): Promise<void> {
    await this.uow.execute(async () => {
      const { id, requestedBy } = command;

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

      // Register hard delete event
      enterprise.markForHardDelete();

      // Hard delete: remove all associated campaigns first
      const campaigns = await this.campaignRepository.findByEnterpriseId(id);
      for (const campaign of campaigns) {
        await this.campaignRepository.delete(campaign.id);
      }

      await this.enterpriseRepository.delete(id);

      await this.eventService.publishEvents(enterprise);
    });
  }
}
