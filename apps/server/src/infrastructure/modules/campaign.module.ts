import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';
import { CampaignModel, CampaignSchema } from '@infrastructure/mongo/schemas';
import { CAMPAIGN_READ_SERVICE } from '@application/interfaces';
import { CAMPAIGN_REPOSITORY } from '@core/interfaces';
import { MongoCampaignReadService } from '@infrastructure/mongo/read-services';
import { MongoCampaignRepository } from '@infrastructure/mongo/repositories';
import { CreateCampaignHandler, UpdateCampaignHandler, DeleteCampaignHandler } from '@application/campaigns/commands';
import { GetCampaignsHandler, GetCampaignByIdHandler } from '@application/campaigns/queries';
import { CampaignController } from '@/presentation/controllers/campaign.controller';

const Handlers = [
  CreateCampaignHandler,
  UpdateCampaignHandler,
  DeleteCampaignHandler,
  GetCampaignsHandler,
  GetCampaignByIdHandler,
];

@Module({
  imports: [
    CqrsModule,
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
export class CampaignModule {}
