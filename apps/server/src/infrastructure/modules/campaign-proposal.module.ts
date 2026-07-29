import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

// Controllers & Resolvers
import {
  CampaignProposalAdminController,
  CampaignProposalClientController,
  CampaignProposalResolver,
} from '@/presentation/controllers';

// Commands
import {
  ProposalCreateCommandHandler,
  ProposalUpdateCommandHandler,
  ProposalUpdateStatusCommandHandler,
  ProposalUpdateMetricsCommandHandler,
  ProposalSoftDeleteCommandHandler,
  ProposalRestoreCommandHandler,
} from '@/application/commands';

// Queries
import {
  ProposalGetBySlugHandler,
  ProposalGetByIdHandler,
  ProposalGetListHandler,
} from '@/application/queries';

const COMMAND_HANDLERS = [
  ProposalCreateCommandHandler,
  ProposalUpdateCommandHandler,
  ProposalUpdateStatusCommandHandler,
  ProposalUpdateMetricsCommandHandler,
  ProposalSoftDeleteCommandHandler,
  ProposalRestoreCommandHandler,
];

const QUERY_HANDLERS = [
  ProposalGetBySlugHandler,
  ProposalGetByIdHandler,
  ProposalGetListHandler,
];

@Module({
  imports: [CqrsModule],
  controllers: [
    CampaignProposalAdminController,
    CampaignProposalClientController,
  ],
  providers: [
    CampaignProposalResolver,
    // Command & Query Handlers
    ...COMMAND_HANDLERS,
    ...QUERY_HANDLERS,
  ],
  exports: [],
})
export class CampaignProposalModule {}
