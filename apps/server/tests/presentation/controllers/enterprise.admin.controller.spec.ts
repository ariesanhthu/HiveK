import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { EnterpriseAdminController } from '@/presentation/controllers/http/admin/enterprise.controller';
import {
  EnterpriseCreateCommand,
  EnterpriseUpdateCommand,
  EnterpriseSoftDeleteCommand,
  EnterpriseRestoreCommand,
  EnterpriseAddUserCommand,
  EnterpriseRevokeUserCommand,
} from '@/application/commands';
import { EnterpriseGetByIdQuery, EnterpriseGetListQuery } from '@/application/queries';

describe('EnterpriseAdminController', () => {
  let controller: EnterpriseAdminController;
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
      controllers: [EnterpriseAdminController],
      providers: [
        { provide: CommandBus, useValue: mockCommandBus },
        { provide: QueryBus, useValue: mockQueryBus },
      ],
    }).compile();

    controller = module.get<EnterpriseAdminController>(EnterpriseAdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should execute EnterpriseCreateCommand', async () => {
      const input = { companyName: 'New Ent', contactEmail: 'test@ent.com', contactPhone: '+841', description: '' };
      const userId = 'admin-123';
      mockCommandBus.execute.mockResolvedValue({ id: 'ent-1' });

      const result = await controller.create(userId, input as any);

      expect(mockCommandBus.execute).toHaveBeenCalledWith(new EnterpriseCreateCommand(userId, input as any));
      expect(result).toEqual({ id: 'ent-1' });
    });
  });

  describe('getList', () => {
    it('should execute EnterpriseGetListQuery', async () => {
      const filters = { limit: 10 };
      mockQueryBus.execute.mockResolvedValue({ data: [] });

      const result = await controller.getList(filters as any);

      expect(mockQueryBus.execute).toHaveBeenCalledWith(new EnterpriseGetListQuery(filters as any));
      expect(result).toEqual({ data: [] });
    });
  });

  describe('getById', () => {
    it('should execute EnterpriseGetByIdQuery', async () => {
      const id = 'ent-1';
      mockQueryBus.execute.mockResolvedValue({ id });

      const result = await controller.getById(id);

      expect(mockQueryBus.execute).toHaveBeenCalledWith(new EnterpriseGetByIdQuery(id));
      expect(result).toEqual({ id });
    });
  });
});
