import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { EnterpriseNotFoundException, EnterpriseForbiddenException, InvalidOperationException } from '@/core/exceptions';
import { ENTERPRISE_REPOSITORY, CAMPAIGN_REPOSITORY, type IEnterpriseRepository, type ICampaignRepository } from '@/core/interfaces/repositories';
import { EnterpriseHardDeleteCommand } from './enterprise-hard-delete.command';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/application/interfaces';
import { OutboxService } from '@/application/services/outbox.service';
import { EventMapper } from '@/application/mappers';

@CommandHandler(EnterpriseHardDeleteCommand)
export class EnterpriseHardDeleteCommandHandler implements ICommandHandler<EnterpriseHardDeleteCommand, void> {
  constructor(
    @Inject(ENTERPRISE_REPOSITORY)
    private readonly enterpriseRepository: IEnterpriseRepository,
    @Inject(CAMPAIGN_REPOSITORY)
    private readonly campaignRepository: ICampaignRepository,
    private readonly outboxService: OutboxService,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
  ) { }

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
            throw new InvalidOperationException(`Cannot delete enterprise with active campaigns. Please complete or cancel them first.`);
        }

        // Register hard delete event
        enterprise.markForHardDelete();

        // Hard delete: remove all associated campaigns first
        const campaigns = await this.campaignRepository.findByEnterpriseId(id);
        for (const campaign of campaigns) {
            await this.campaignRepository.delete(campaign.id!);
        }

        await this.enterpriseRepository.delete(id);

        const events = EventMapper.mapToIntegrationEvents(enterprise.domainEvents);
        if (events.length > 0) {
          await this.outboxService.enqueueMany(events.map(event => ({
            eventType: event.eventType,
            payload: event.payload,
            metadata: event.metadata,
            transport: event.transport,
            maxRetry: 5,
          })));
        }
    });
  }
}
