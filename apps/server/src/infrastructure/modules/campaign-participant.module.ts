import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import {
  CampaignParticipantCreateCommandHandler,
  CampaignParticipantHardDeleteCommandHandler,
  CampaignParticipantRestoreCommandHandler,
  CampaignParticipantSoftDeleteCommandHandler,
  CampaignParticipantUpdateCommandHandler,
  CampaignParticipantUpdateStatusCommandHandler,
} from '@/application/commands';

import {
  CampaignParticipantGetByIdQueryHandler,
  CampaignParticipantGetListQueryHandler,
} from '@/application/queries';

import { LinkCampaignParticipantOutputFileHandler } from '@/application/events';

import { CampaignParticipantResolver } from '@/presentation/controllers';

import { CampaignModule } from './campaign.module';

const COMMAND_HANDLERS = [
  CampaignParticipantCreateCommandHandler,
  CampaignParticipantSoftDeleteCommandHandler,
  CampaignParticipantHardDeleteCommandHandler,
  CampaignParticipantRestoreCommandHandler,
  CampaignParticipantUpdateCommandHandler,
  CampaignParticipantUpdateStatusCommandHandler,
];

const QUERY_HANDLERS = [
  CampaignParticipantGetByIdQueryHandler,
  CampaignParticipantGetListQueryHandler,
];

const EVENT_HANDLERS = [LinkCampaignParticipantOutputFileHandler];

@Module({
  imports: [CqrsModule, CampaignModule],
  controllers: [],
  providers: [
    ...COMMAND_HANDLERS,
    ...QUERY_HANDLERS,
    ...EVENT_HANDLERS,
    CampaignParticipantResolver,
  ],
  exports: [],
})
export class CampaignParticipantModule {}
