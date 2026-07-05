import { EnterpriseSoftDeleteCommandHandler } from '@/application/commands/enterprise-soft-delete/enterprise-soft-delete.handler';
import { EnterpriseSoftDeleteCommand } from '@/application/commands/enterprise-soft-delete/enterprise-soft-delete.command';
import { EnterpriseNotFoundException, EnterpriseForbiddenException, InvalidOperationException } from '@/core/exceptions';
import { EnterpriseRoot } from '@/core/aggregate-roots';
import { createMockEnterpriseRepository, createMockCampaignRepository } from '../../../__mocks__/mock-repositories';
import { createMockUnitOfWork } from '../../../__mocks__/mock-services';

describe('EnterpriseSoftDeleteCommandHandler', () => {
  let handler: EnterpriseSoftDeleteCommandHandler;
  let mockEnterpriseRepository: ReturnType<typeof createMockEnterpriseRepository>;
  let mockCampaignRepository: ReturnType<typeof createMockCampaignRepository>;
  let mockUow: ReturnType<typeof createMockUnitOfWork>;

  beforeEach(() => {
    mockEnterpriseRepository = createMockEnterpriseRepository();
    mockCampaignRepository = createMockCampaignRepository();
    mockUow = createMockUnitOfWork();
    
    handler = new EnterpriseSoftDeleteCommandHandler(
        mockEnterpriseRepository, 
        mockCampaignRepository, 
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
    it('should soft delete enterprise successfully', async () => {
      const enterprise = createMockEnterprise();
      mockEnterpriseRepository.findById.mockResolvedValue(enterprise);
      mockCampaignRepository.hasActiveCampaigns.mockResolvedValue(false);

      const command = new EnterpriseSoftDeleteCommand(enterpriseId, userId, 'admin-123');
      await handler.execute(command);

      expect(enterprise.deleteAt).toBeDefined();
      expect(enterprise.deleteBy).toBe('admin-123');
      expect(mockEnterpriseRepository.save).toHaveBeenCalledWith(enterprise);
    });
  });

  describe('Sad Paths', () => {
    it('should throw EnterpriseNotFoundException if enterprise does not exist', async () => {
      mockEnterpriseRepository.findById.mockResolvedValue(null);
      const command = new EnterpriseSoftDeleteCommand(enterpriseId, userId, 'admin-123');
      await expect(handler.execute(command)).rejects.toThrow(EnterpriseNotFoundException);
    });

    it('should throw EnterpriseForbiddenException if requester is not owner', async () => {
      const enterprise = createMockEnterprise();
      mockEnterpriseRepository.findById.mockResolvedValue(enterprise);
      
      const command = new EnterpriseSoftDeleteCommand(enterpriseId, 'wrong-user', 'admin-123');
      await expect(handler.execute(command)).rejects.toThrow(EnterpriseForbiddenException);
    });

    it('should throw InvalidOperationException if enterprise has active campaigns', async () => {
      const enterprise = createMockEnterprise();
      mockEnterpriseRepository.findById.mockResolvedValue(enterprise);
      mockCampaignRepository.hasActiveCampaigns.mockResolvedValue(true);

      const command = new EnterpriseSoftDeleteCommand(enterpriseId, userId, 'admin-123');
      await expect(handler.execute(command)).rejects.toThrow(InvalidOperationException);
      expect(mockEnterpriseRepository.save).not.toHaveBeenCalled();
    });
  });
});
