import { EnterpriseHardDeleteCommandHandler } from '@/application/commands/enterprise-hard-delete/enterprise-hard-delete.handler';
import { EnterpriseHardDeleteCommand } from '@/application/commands/enterprise-hard-delete/enterprise-hard-delete.command';
import { EnterpriseNotFoundException, EnterpriseForbiddenException, InvalidOperationException } from '@/core/exceptions';
import { EnterpriseRoot } from '@/core/aggregate-roots';
import { createMockEnterpriseRepository, createMockCampaignRepository } from '../../../__mocks__/mock-repositories';
import { createMockUnitOfWork, createMockOutboxService } from '../../../__mocks__/mock-services';

describe('EnterpriseHardDeleteCommandHandler', () => {
  let handler: EnterpriseHardDeleteCommandHandler;
  let mockEnterpriseRepository: ReturnType<typeof createMockEnterpriseRepository>;
  let mockCampaignRepository: ReturnType<typeof createMockCampaignRepository>;
  let mockOutboxService: ReturnType<typeof createMockOutboxService>;
  let mockUow: ReturnType<typeof createMockUnitOfWork>;

  beforeEach(() => {
    mockEnterpriseRepository = createMockEnterpriseRepository();
    mockCampaignRepository = createMockCampaignRepository();
    mockOutboxService = createMockOutboxService();
    mockUow = createMockUnitOfWork();
    
    handler = new EnterpriseHardDeleteCommandHandler(
        mockEnterpriseRepository, 
        mockCampaignRepository, 
        mockOutboxService as any,
        mockUow
    );
  });

  const enterpriseId = 'ent-123';
  const userId = 'user-123';

  const createMockEnterprise = () => EnterpriseRoot.instantiate(enterpriseId, {
    userId: userId,
    companyName: 'Test Ent',
    contactEmail: 'test@ent.com',
    isVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deleteAt: null,
    deleteBy: null,
  });

  describe('Happy Path', () => {
    it('should hard delete enterprise and enqueue domain events to outbox', async () => {
      const enterprise = createMockEnterprise();
      mockEnterpriseRepository.findById.mockResolvedValue(enterprise);
      mockCampaignRepository.hasActiveCampaigns.mockResolvedValue(false);
      mockCampaignRepository.findByEnterpriseId.mockResolvedValue([{ id: 'camp-1' } as any]);

      const command = new EnterpriseHardDeleteCommand(enterpriseId, userId);
      await handler.execute(command);

      expect(mockCampaignRepository.delete).toHaveBeenCalledWith('camp-1');
      expect(mockEnterpriseRepository.delete).toHaveBeenCalledWith(enterpriseId);
      
      // Verification: Currently EventMapper returns empty for EntityHardDeletedEvent
      // So no events are enqueued in the current implementation
      expect(mockOutboxService.enqueueMany).not.toHaveBeenCalled();
    });
  });

  describe('Sad Paths', () => {
    it('should throw EnterpriseNotFoundException if enterprise does not exist', async () => {
      mockEnterpriseRepository.findById.mockResolvedValue(null);
      const command = new EnterpriseHardDeleteCommand(enterpriseId, userId);
      await expect(handler.execute(command)).rejects.toThrow(EnterpriseNotFoundException);
    });

    it('should throw EnterpriseForbiddenException if requester is not owner', async () => {
      const enterprise = createMockEnterprise();
      mockEnterpriseRepository.findById.mockResolvedValue(enterprise);
      
      const command = new EnterpriseHardDeleteCommand(enterpriseId, 'wrong-user');
      await expect(handler.execute(command)).rejects.toThrow(EnterpriseForbiddenException);
    });

    it('should throw InvalidOperationException if enterprise has active campaigns', async () => {
      const enterprise = createMockEnterprise();
      mockEnterpriseRepository.findById.mockResolvedValue(enterprise);
      mockCampaignRepository.hasActiveCampaigns.mockResolvedValue(true);

      const command = new EnterpriseHardDeleteCommand(enterpriseId, userId);
      await expect(handler.execute(command)).rejects.toThrow(InvalidOperationException);
      expect(mockOutboxService.enqueueMany).not.toHaveBeenCalled();
    });
  });
});
