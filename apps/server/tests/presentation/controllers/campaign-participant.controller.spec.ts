import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CampaignClientController } from '@/presentation/controllers/http/client/campaign.controller';
import {
  CampaignParticipantCreateCommand,
  CampaignParticipantUpdateCommand,
  CampaignParticipantSoftDeleteCommand,
  CampaignParticipantRestoreCommand,
  CampaignParticipantHardDeleteCommand,
} from '@/application/commands';
import {
  CampaignParticipantGetByIdQuery,
  CampaignParticipantGetListQuery,
} from '@/application/queries';

describe('CampaignParticipantClientController', () => {
  let controller: CampaignClientController;
  let mockCommandBus: any;
  let mockQueryBus: any;

  beforeEach(async () => {
    mockCommandBus = {
      execute: jest.fn(),
    };
    mockQueryBus = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CampaignClientController],
      providers: [
        { provide: CommandBus, useValue: mockCommandBus },
        { provide: QueryBus, useValue: mockQueryBus },
      ],
    }).compile();

    controller = module.get<CampaignClientController>(CampaignClientController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
