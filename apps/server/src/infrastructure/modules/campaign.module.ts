import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

// Commands
import {
  CampaignCreateCommandHandler,
  CampaignHardDeleteCommandHandler,
  CampaignInviteCollaboratorCommandHandler,
  CampaignRestoreCommandHandler,
  CampaignRevokeCollaboratorCommandHandler,
  CampaignSoftDeleteCommandHandler,
  CampaignUpdateCommandHandler,
  CampaignUpdateStatusCommandHandler,
} from '@/application/commands';

// Queries
import { CampaignGetByIdHandler, CampaignGetListHandler } from '@/application/queries';

// Events
import { LinkCampaignRawHandler } from '@/application/events';

// Presentation
import {
  CampaignAdminController,
  CampaignClientController,
  CampaignResolver,
} from '@/presentation/controllers';

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

const QUERY_HANDLERS = [CampaignGetListHandler, CampaignGetByIdHandler];

const EVENT_HANDLERS = [LinkCampaignRawHandler];

@Module({
  imports: [CqrsModule, UserModule],
  controllers: [CampaignAdminController, CampaignClientController],
  providers: [
    ...COMMAND_HANDLERS,
    ...QUERY_HANDLERS,
    ...EVENT_HANDLERS,
    CampaignResolver,
  ],
  exports: [],
})
export class CampaignModule {}
