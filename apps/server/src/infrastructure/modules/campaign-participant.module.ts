import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';
import { CampaignParticipantModel, CampaignParticipantSchema } from '../mongo/schemas/campaign-participant.schema';
import { CAMPAIGN_PARTICIPANT_REPOSITORY } from '@/core/interfaces/repositories/campaign-participant.repository';
import { MongoCampaignParticipantRepository } from '../mongo/repositories/campaign-participant.repository';
import { CAMPAIGN_PARTICIPANT_READ_SERVICE } from '@/application/interfaces';
import { MongoCampaignParticipantReadService } from '../mongo/read-services/campaign-participant.read-service';

// Command Handlers
import { CampaignParticipantCreateCommandHandler } from '@/application/commands/campaign-participant-create/campaign-participant-create.handler';
import { CampaignParticipantSoftDeleteCommandHandler } from '@/application/commands/campaign-participant-soft-delete/campaign-participant-soft-delete.handler';
import { CampaignParticipantHardDeleteCommandHandler } from '@/application/commands/campaign-participant-hard-delete/campaign-participant-hard-delete.handler';
import { CampaignParticipantRestoreCommandHandler } from '@/application/commands/campaign-participant-restore/campaign-participant-restore.handler';
import { CampaignParticipantUpdateCommandHandler } from '@/application/commands/campaign-participant-update/campaign-participant-update.handler';

// Query Handlers
import { CampaignParticipantGetByIdQueryHandler } from '@/application/queries/campaign-participant-get-by-id/campaign-participant-get-by-id.handler';
import { CampaignParticipantGetListQueryHandler } from '@/application/queries/campaign-participant-get-list/campaign-participant-get-list.handler';

// Event Handlers
import { LinkCampaignParticipantOutputFileHandler } from '@/application/events';
import { CampaignParticipantController } from '@/presentation/controllers/campaign-participant.controller';
import { CampaignParticipantResolver } from '@/presentation/resolvers/campaign-participant.resolver';

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

import { CampaignModule } from './campaign.module';

@Module({
  imports: [
    CqrsModule,
    CampaignModule,
    MongooseModule.forFeature([
      { name: CampaignParticipantModel.name, schema: CampaignParticipantSchema },
    ]),
  ],
  controllers: [CampaignParticipantController],
  providers: [
    ...Handlers,
    CampaignParticipantResolver,
    {
      provide: CAMPAIGN_PARTICIPANT_REPOSITORY,
      useClass: MongoCampaignParticipantRepository,
    },
    {
      provide: CAMPAIGN_PARTICIPANT_READ_SERVICE,
      useClass: MongoCampaignParticipantReadService,
    },
  ],
  exports: [
    CAMPAIGN_PARTICIPANT_REPOSITORY,
    CAMPAIGN_PARTICIPANT_READ_SERVICE,
    MongooseModule,
  ],
})
export class CampaignParticipantModule {}
