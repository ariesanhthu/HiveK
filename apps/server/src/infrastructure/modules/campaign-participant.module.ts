import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { CampaignParticipantCreateCommandHandler } from '@/application/commands/campaign-participant-create/campaign-participant-create.handler';
import { CampaignParticipantSoftDeleteCommandHandler } from '@/application/commands/campaign-participant-soft-delete/campaign-participant-soft-delete.handler';
import { CampaignParticipantHardDeleteCommandHandler } from '@/application/commands/campaign-participant-hard-delete/campaign-participant-hard-delete.handler';
import { CampaignParticipantRestoreCommandHandler } from '@/application/commands/campaign-participant-restore/campaign-participant-restore.handler';
import { CampaignParticipantUpdateCommandHandler } from '@/application/commands/campaign-participant-update/campaign-participant-update.handler';
import { CampaignParticipantGetByIdQueryHandler } from '@/application/queries/campaign-participant-get-by-id/campaign-participant-get-by-id.handler';
import { CampaignParticipantGetListQueryHandler } from '@/application/queries/campaign-participant-get-list/campaign-participant-get-list.handler';
import { LinkCampaignParticipantOutputFileHandler } from '@/application/events';
import { CampaignParticipantController } from '@/presentation/controllers'
import { CampaignParticipantResolver } from '@/presentation/resolvers/campaign-participant.resolver';
import { CampaignModule } from './campaign.module';

const Handlers = [
  CampaignParticipantCreateCommandHandler,
  CampaignParticipantSoftDeleteCommandHandler,
  CampaignParticipantHardDeleteCommandHandler,
  CampaignParticipantRestoreCommandHandler,
  CampaignParticipantUpdateCommandHandler,
  CampaignParticipantGetByIdQueryHandler,
  CampaignParticipantGetListQueryHandler,
  LinkCampaignParticipantOutputFileHandler,
];

@Module({
  imports: [CqrsModule, CampaignModule],
  controllers: [CampaignParticipantController],
  providers: [...Handlers, CampaignParticipantResolver],
  exports: [],
})
export class CampaignParticipantModule {}