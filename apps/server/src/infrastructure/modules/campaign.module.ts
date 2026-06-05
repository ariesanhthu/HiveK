import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';
import { CampaignModel, CampaignSchema } from '@/infrastructure/mongo/schemas';
import { CAMPAIGN_READ_SERVICE } from '@/application/interfaces';
import { CAMPAIGN_REPOSITORY } from '@/core/interfaces/repositories';
import { MongoCampaignReadService } from '@/infrastructure/mongo/read-services';
import { MongoCampaignRepository } from '@/infrastructure/mongo/repositories';
import { CreateCampaignHandler, UpdateCampaignHandler, CampaignHardDeleteCommandHandler, CampaignSoftDeleteCommandHandler, CampaignRestoreCommandHandler, CampaignUpdateStatusCommandHandler, CampaignInviteCollaboratorCommandHandler, CampaignRevokeCollaboratorCommandHandler } from '@/application/commands';
import { CampaignGetListHandler, CampaignGetByIdHandler } from '@/application/queries';
import { CampaignController } from '@/presentation/controllers/campaign.controller';

import { LinkCampaignRawHandler } from '@/application/events';

const Handlers = [
  CreateCampaignHandler,
  UpdateCampaignHandler,
  CampaignHardDeleteCommandHandler,
  CampaignSoftDeleteCommandHandler,
  CampaignRestoreCommandHandler,
  CampaignUpdateStatusCommandHandler,
  CampaignInviteCollaboratorCommandHandler,
  CampaignRevokeCollaboratorCommandHandler,
  CampaignGetListHandler,
  CampaignGetByIdHandler,
  LinkCampaignRawHandler,
];

import { UserModule } from './user.module';

@Module({
  imports: [
    CqrsModule,
    UserModule,
    MongooseModule.forFeature([
      { name: CampaignModel.name, schema: CampaignSchema },
    ]),
  ],
  controllers: [CampaignController],
  providers: [
    ...Handlers,
    {
      provide: CAMPAIGN_READ_SERVICE,
      useClass: MongoCampaignReadService,
    },
    {
      provide: CAMPAIGN_REPOSITORY,
      useClass: MongoCampaignRepository,
    },
  ],
  exports: [CAMPAIGN_READ_SERVICE, CAMPAIGN_REPOSITORY],
})
export class CampaignModule { }
