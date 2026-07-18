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
// Presentation
import { CampaignAdminController, CampaignClientController, CampaignResolver } from '@/presentation/controllers'

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
];

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