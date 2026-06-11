import { EnterpriseUpdateCommandHandler } from '@/application/commands/enterprise-update/enterprise-update.handler';
import { EnterpriseUpdateCommand } from '@/application/commands/enterprise-update/enterprise-update.command';
import { EnterpriseNotFoundException, EnterpriseForbiddenException } from '@/core/exceptions';
import { EnterpriseRoot } from '@/core/aggregate-roots';
import { createMockEnterpriseRepository } from '../../../__mocks__/mock-repositories';

describe('EnterpriseUpdateCommandHandler', () => {
  let handler: EnterpriseUpdateCommandHandler;
  let mockEnterpriseRepository: ReturnType<typeof createMockEnterpriseRepository>;

  beforeEach(() => {
    mockEnterpriseRepository = createMockEnterpriseRepository();
    handler = new EnterpriseUpdateCommandHandler(mockEnterpriseRepository);
  });

  const enterpriseId = 'ent-123';
  const userId = 'user-123';

  const createMockEnterprise = () => EnterpriseRoot.instantiate(enterpriseId, {
    userId: userId,
    companyName: 'Old Company',
    contactEmail: 'old@test.com',
    isVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deleteAt: null,
    deleteBy: null,
  });

  describe('Happy Path', () => {
    it('should update enterprise successfully if owned by current user', async () => {
      const enterprise = createMockEnterprise();
      mockEnterpriseRepository.findById.mockResolvedValue(enterprise);

      const input = {
        companyName: 'New Company',
        description: 'New Description',
        contactEmail: 'new@test.com',
      };

      const command = new EnterpriseUpdateCommand(enterpriseId, userId, input);
      const result = await handler.execute(command);

      expect(result).toBeDefined();
      expect(result.companyName).toBe('New Company');
      expect(enterprise.companyName).toBe('New Company');
      expect(enterprise.description).toBe('New Description');
      expect(mockEnterpriseRepository.save).toHaveBeenCalledWith(enterprise);
    });
  });

  describe('Sad Paths', () => {
    it('should throw EnterpriseNotFoundException if enterprise not found', async () => {
      mockEnterpriseRepository.findById.mockResolvedValue(null);

      const command = new EnterpriseUpdateCommand(enterpriseId, userId, {});
      await expect(handler.execute(command)).rejects.toThrow(EnterpriseNotFoundException);
    });

    it('should throw EnterpriseForbiddenException if enterprise not owned by user', async () => {
      const enterprise = createMockEnterprise();
      mockEnterpriseRepository.findById.mockResolvedValue(enterprise);

      const command = new EnterpriseUpdateCommand(enterpriseId, 'wrong-user', {});
      await expect(handler.execute(command)).rejects.toThrow(EnterpriseForbiddenException);
      expect(mockEnterpriseRepository.save).not.toHaveBeenCalled();
    });
  });
});
