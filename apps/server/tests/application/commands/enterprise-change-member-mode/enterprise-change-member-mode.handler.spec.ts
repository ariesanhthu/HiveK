import { EnterpriseChangeMemberModeCommandHandler } from '@/application/commands/enterprise-change-member-mode/enterprise-change-member-mode.handler';
import { EnterpriseChangeMemberModeCommand } from '@/application/commands/enterprise-change-member-mode/enterprise-change-member-mode.command';
import { EEnterpriseMemberMode } from '@/core/enums';
import {
  EnterpriseNotFoundException,
  EnterpriseForbiddenException,
} from '@/core/exceptions';
import { EnterpriseRoot } from '@/core/aggregate-roots';
import { createMockEnterpriseRepository } from '../../../__mocks__/mock-repositories';
import { createMockUnitOfWork } from '../../../__mocks__/mock-services';

describe('EnterpriseChangeMemberModeCommandHandler', () => {
  let handler: EnterpriseChangeMemberModeCommandHandler;
  let mockEnterpriseRepository: ReturnType<typeof createMockEnterpriseRepository>;
  let mockUow: ReturnType<typeof createMockUnitOfWork>;

  beforeEach(() => {
    mockEnterpriseRepository = createMockEnterpriseRepository();
    mockUow = createMockUnitOfWork();

    handler = new EnterpriseChangeMemberModeCommandHandler(
      mockEnterpriseRepository,
      mockUow,
    );
  });

  const enterpriseId = 'enterprise-123';
  const ownerId = 'owner-123';
  const subOwnerId = 'sub-owner-123';
  const normalUserId = 'user-555';

  const createMockEnterprise = () => {
    return EnterpriseRoot.instantiate(enterpriseId, {
      userId: ownerId,
      companyName: 'ACME Corp',
      contactEmail: 'contact@acme.com',
      isVerified: true,
      members: [
        { userId: subOwnerId, mode: EEnterpriseMemberMode.SUB_OWNER },
        { userId: normalUserId, mode: EEnterpriseMemberMode.USER },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      deleteAt: null,
      deleteBy: null,
    });
  };

  describe('Happy Paths', () => {
    it('should allow Owner to promote a User to Sub-Owner', async () => {
      const enterprise = createMockEnterprise();
      mockEnterpriseRepository.findById.mockResolvedValue(enterprise);

      const command = new EnterpriseChangeMemberModeCommand(enterpriseId, ownerId, {
        userId: normalUserId,
        mode: EEnterpriseMemberMode.SUB_OWNER,
      });
      await handler.execute(command);

      const member = enterprise.members.find(m => m.userId === normalUserId);
      expect(member?.mode).toBe(EEnterpriseMemberMode.SUB_OWNER);
      expect(mockEnterpriseRepository.save).toHaveBeenCalledWith(enterprise);
    });

    it('should allow Owner to demote a Sub-Owner to User', async () => {
      const enterprise = createMockEnterprise();
      mockEnterpriseRepository.findById.mockResolvedValue(enterprise);

      const command = new EnterpriseChangeMemberModeCommand(enterpriseId, ownerId, {
        userId: subOwnerId,
        mode: EEnterpriseMemberMode.USER,
      });
      await handler.execute(command);

      const member = enterprise.members.find(m => m.userId === subOwnerId);
      expect(member?.mode).toBe(EEnterpriseMemberMode.USER);
    });
  });

  describe('Sad Paths', () => {
    it('should throw EnterpriseForbiddenException if Sub-Owner attempts to promote a User', async () => {
      const enterprise = createMockEnterprise();
      mockEnterpriseRepository.findById.mockResolvedValue(enterprise);

      const command = new EnterpriseChangeMemberModeCommand(enterpriseId, subOwnerId, {
        userId: normalUserId,
        mode: EEnterpriseMemberMode.SUB_OWNER,
      });
      await expect(handler.execute(command)).rejects.toThrow(EnterpriseForbiddenException);
    });

    it('should throw EnterpriseForbiddenException if Sub-Owner attempts to demote another Sub-Owner', async () => {
      const enterprise = createMockEnterprise();
      mockEnterpriseRepository.findById.mockResolvedValue(enterprise);

      const command = new EnterpriseChangeMemberModeCommand(enterpriseId, subOwnerId, {
        userId: subOwnerId,
        mode: EEnterpriseMemberMode.USER,
      });
      await expect(handler.execute(command)).rejects.toThrow(EnterpriseForbiddenException);
    });
  });
});
