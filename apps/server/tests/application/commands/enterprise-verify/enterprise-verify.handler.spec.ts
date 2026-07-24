import { EnterpriseVerifyCommand } from '@/application/commands/enterprise-verify/enterprise-verify.command';
import { EnterpriseVerifyCommandHandler } from '@/application/commands/enterprise-verify/enterprise-verify.handler';
import { EnterpriseRoot } from '@/core/aggregate-roots';
import { EnterpriseNotFoundException } from '@/core/exceptions';
import { createMockEnterpriseRepository } from '../../../__mocks__/mock-repositories';

describe('EnterpriseVerifyCommandHandler', () => {
  let handler: EnterpriseVerifyCommandHandler;
  let mockEnterpriseRepository: ReturnType<typeof createMockEnterpriseRepository>;

  beforeEach(() => {
    mockEnterpriseRepository = createMockEnterpriseRepository();
    handler = new EnterpriseVerifyCommandHandler(mockEnterpriseRepository);
  });

  const enterpriseId = 'ent-123';

  const createMockEnterprise = () => {
    return EnterpriseRoot.instantiate(enterpriseId, {
      userId: 'user-123',
      companyName: 'Test Ent',
      contactEmail: 'test@ent.com',
      isVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      deleteAt: null,
      deleteBy: null,
    });
  };

  describe('Happy Path', () => {
    it('should successfully verify enterprise', async () => {
      const enterprise = createMockEnterprise();
      mockEnterpriseRepository.findById.mockResolvedValue(enterprise);

      const command = new EnterpriseVerifyCommand({ enterpriseId }, 'admin-123');
      await handler.execute(command);

      expect(enterprise.isVerified).toBe(true);
      expect(mockEnterpriseRepository.save).toHaveBeenCalledWith(enterprise);
    });
  });

  describe('Sad Path', () => {
    it('should throw EnterpriseNotFoundException if enterprise does not exist', async () => {
      mockEnterpriseRepository.findById.mockResolvedValue(null);
      const command = new EnterpriseVerifyCommand({ enterpriseId }, 'admin-123');

      await expect(handler.execute(command)).rejects.toThrow(EnterpriseNotFoundException);
      expect(mockEnterpriseRepository.save).not.toHaveBeenCalled();
    });
  });
});
