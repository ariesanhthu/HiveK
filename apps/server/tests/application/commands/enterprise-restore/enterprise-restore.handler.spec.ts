import { EnterpriseRestoreCommand } from '@/application/commands/enterprise-restore/enterprise-restore.command';
import { EnterpriseRestoreCommandHandler } from '@/application/commands/enterprise-restore/enterprise-restore.handler';
import { EnterpriseRoot } from '@/core/aggregate-roots';
import { EnterpriseNotFoundException } from '@/core/exceptions';
import { createMockEnterpriseRepository } from '../../../__mocks__/mock-repositories';

describe('EnterpriseRestoreCommandHandler', () => {
  let handler: EnterpriseRestoreCommandHandler;
  let mockEnterpriseRepository: ReturnType<typeof createMockEnterpriseRepository>;

  beforeEach(() => {
    mockEnterpriseRepository = createMockEnterpriseRepository();
    handler = new EnterpriseRestoreCommandHandler(mockEnterpriseRepository);
  });

  const enterpriseId = 'ent-123';

  const createMockEnterprise = () => {
    const ent = EnterpriseRoot.instantiate(enterpriseId, {
      userId: 'user-123',
      companyName: 'Test Ent',
      contactEmail: 'test@ent.com',
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      deleteAt: new Date(),
      deleteBy: 'admin',
    });
    return ent;
  };

  describe('Happy Path', () => {
    it('should restore enterprise successfully', async () => {
      const enterprise = createMockEnterprise();
      mockEnterpriseRepository.findById.mockResolvedValue(enterprise);

      const command = new EnterpriseRestoreCommand(enterpriseId);
      await handler.execute(command);

      expect(enterprise.deleteAt).toBeNull();
      expect(enterprise.deleteBy).toBeNull();
      expect(mockEnterpriseRepository.save).toHaveBeenCalledWith(enterprise);
    });
  });

  describe('Sad Path', () => {
    it('should throw EnterpriseNotFoundException if enterprise does not exist', async () => {
      mockEnterpriseRepository.findById.mockResolvedValue(null);
      const command = new EnterpriseRestoreCommand(enterpriseId);

      await expect(handler.execute(command)).rejects.toThrow(EnterpriseNotFoundException);
      expect(mockEnterpriseRepository.save).not.toHaveBeenCalled();
    });
  });
});
