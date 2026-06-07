import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

// Commands
import {
  CampaignCreateCommandHandler,
  CampaignUpdateCommandHandler,
  CampaignHardDeleteCommandHandler,
  CampaignSoftDeleteCommandHandler,
  CampaignRestoreCommandHandler,
  CampaignUpdateStatusCommandHandler,
  CampaignInviteCollaboratorCommandHandler,
  CampaignRevokeCollaboratorCommandHandler,
} from '@/application/commands';

// Queries
import { CampaignGetListHandler, CampaignGetByIdHandler } from '@/application/queries';

// Events
import { LinkCampaignRawHandler } from '@/application/events';

// Presentation
import { CampaignController } from '@/presentation/controllers/campaign.controller';
import { CampaignResolver } from '@/presentation/resolvers/campaign.resolver';

// Modules
import { UserModule } from './user.module';

const COMMAND_HANDLERS = [
  CampaignCreateCommandHandler,
  CampaignUpdateCommandHandler,
  CampaignHardDeleteCommandHandler,
  CampaignSoftDeleteCommandHandler,
  CampaignRestoreCommandHandler,
  CampaignUpdateStatusCommandHandler,
  CampaignInviteCollaboratorCommandHandler,
  CampaignRevokeCollaboratorCommandHandler,
];

const QUERY_HANDLERS = [
  CampaignGetListHandler,
  CampaignGetByIdHandler,
];

const EVENT_HANDLERS = [
  LinkCampaignRawHandler,
];

@Module({
  imports: [CqrsModule, UserModule],
  controllers: [CampaignController],
  providers: [
    ...COMMAND_HANDLERS,
    ...QUERY_HANDLERS,
    ...EVENT_HANDLERS,
    CampaignResolver,
  ],
  exports: [],
})
export class CampaignModule {}