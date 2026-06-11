import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CampaignParticipantClientController } from '@/presentation/controllers/http/client/campaign-participant.controller';
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
  let controller: CampaignParticipantClientController;
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
      controllers: [CampaignParticipantClientController],
      providers: [
        { provide: CommandBus, useValue: mockCommandBus },
        { provide: QueryBus, useValue: mockQueryBus },
      ],
    }).compile();

    controller = module.get<CampaignParticipantClientController>(CampaignParticipantClientController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should execute CampaignParticipantCreateCommand', async () => {
      const input = { campaignId: 'camp-123', kolProfileId: 'kol-123' };
      mockCommandBus.execute.mockResolvedValue('new-participant-id');

      const result = await controller.create(input as any);

      expect(mockCommandBus.execute).toHaveBeenCalledWith(new CampaignParticipantCreateCommand(input as any));
      expect(result).toBe('new-participant-id');
    });
  });

  describe('findById', () => {
    it('should execute CampaignParticipantGetByIdQuery', async () => {
      const id = 'participant-123';
      const mockDto = { id, campaignId: 'camp-123', kolProfileId: 'kol-123' };
      mockQueryBus.execute.mockResolvedValue(mockDto);

      const result = await controller.findById(id);

      expect(mockQueryBus.execute).toHaveBeenCalledWith(new CampaignParticipantGetByIdQuery(id));
      expect(result).toEqual(mockDto);
    });
  });

  describe('findAll', () => {
    it('should execute CampaignParticipantGetListQuery', async () => {
      const query = { campaignId: 'camp-123', page: 1, limit: 10 };
      const mockList = { data: [], total: 0 };
      mockQueryBus.execute.mockResolvedValue(mockList);

      const result = await controller.findAll(query as any);

      expect(mockQueryBus.execute).toHaveBeenCalledWith(new CampaignParticipantGetListQuery(query as any));
      expect(result).toEqual(mockList);
    });
  });

  describe('update', () => {
    it('should execute CampaignParticipantUpdateCommand', async () => {
      const id = 'participant-123';
      const input = { status: 'JOINED' as any };
      mockCommandBus.execute.mockResolvedValue(undefined);

      await controller.update(id, input as any);

      expect(mockCommandBus.execute).toHaveBeenCalledWith(new CampaignParticipantUpdateCommand(id, input as any));
    });
  });

  describe('delete', () => {
    it('should execute CampaignParticipantSoftDeleteCommand', async () => {
      const id = 'participant-123';
      mockCommandBus.execute.mockResolvedValue(undefined);

      await controller.delete(id, { deletedBy: 'Admin-User' });

      expect(mockCommandBus.execute).toHaveBeenCalledWith(new CampaignParticipantSoftDeleteCommand(id, 'Admin-User'));
    });
  });

  describe('restore', () => {
    it('should execute CampaignParticipantRestoreCommand', async () => {
      const id = 'participant-123';
      mockCommandBus.execute.mockResolvedValue(undefined);

      await controller.restore(id);

      expect(mockCommandBus.execute).toHaveBeenCalledWith(new CampaignParticipantRestoreCommand(id));
    });
  });

  describe('hardDelete', () => {
    it('should execute CampaignParticipantHardDeleteCommand', async () => {
      const id = 'participant-123';
      mockCommandBus.execute.mockResolvedValue(undefined);

      await controller.hardDelete(id);

      expect(mockCommandBus.execute).toHaveBeenCalledWith(new CampaignParticipantHardDeleteCommand(id));
    });
  });
});
