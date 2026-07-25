import { EnterpriseRevokeMemberCommandHandler } from '@/application/commands/enterprise-revoke-member/enterprise-revoke-member.handler';
import { EnterpriseRevokeMemberCommand } from '@/application/commands/enterprise-revoke-member/enterprise-revoke-member.command';
import { EEnterpriseMemberMode, ERoleType } from '@/core/enums';
import {
  EnterpriseNotFoundException,
  EnterpriseForbiddenException,
  UserNotFoundException,
} from '@/core/exceptions';
import { EnterpriseRoot, EnterpriseUserRoot } from '@/core/aggregate-roots';
import {
  createMockUserRepository,
  createMockEnterpriseRepository,
} from '../../../__mocks__/mock-repositories';
import { createMockUnitOfWork } from '../../../__mocks__/mock-services';

describe('EnterpriseRevokeMemberCommandHandler', () => {
  let handler: EnterpriseRevokeMemberCommandHandler;
  let mockEnterpriseRepository: ReturnType<typeof createMockEnterpriseRepository>;
  let mockUserRepository: ReturnType<typeof createMockUserRepository>;
  let mockUow: ReturnType<typeof createMockUnitOfWork>;

  beforeEach(() => {
    mockEnterpriseRepository = createMockEnterpriseRepository();
    mockUserRepository = createMockUserRepository();
    mockUow = createMockUnitOfWork();

    handler = new EnterpriseRevokeMemberCommandHandler(
      mockEnterpriseRepository,
      mockUserRepository,
      mockUow,
    );
  });

  const enterpriseId = 'enterprise-123';
  const ownerId = 'owner-123';
  const subOwner1Id = 'sub-owner-1';
  const subOwner2Id = 'sub-owner-2';
  const normalUserId = 'user-555';

  const createMockEnterprise = () => {
    const enterprise = EnterpriseRoot.instantiate(enterpriseId, {
      userId: ownerId,
      companyName: 'ACME Corp',
      contactEmail: 'contact@acme.com',
      isVerified: true,
      members: [
        { userId: subOwner1Id, mode: EEnterpriseMemberMode.SUB_OWNER },
        { userId: subOwner2Id, mode: EEnterpriseMemberMode.SUB_OWNER },
        { userId: normalUserId, mode: EEnterpriseMemberMode.USER },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      deleteAt: null,
      deleteBy: null,
    });
    return enterprise;
  };

  const createMockEnterpriseUser = (id: string, enterpriseIds: string[] = []) => {
    const user = EnterpriseUserRoot.instantiate(id, {
      email: `${id}@test.com`,
      phone: { value: '+84123456789' } as any,
      passwordHash: 'hash',
      fullName: 'Enterprise User',
      type: ERoleType.ENTERPRISE,
      roleId: 'role-ent',
      enterpriseIds,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return user;
  };

  describe('Happy Paths', () => {
    it('should allow Owner to revoke a normal User', async () => {
      const enterprise = createMockEnterprise();
      mockEnterpriseRepository.findById.mockResolvedValue(enterprise);

      const user = createMockEnterpriseUser(normalUserId, [enterpriseId]);
      mockUserRepository.findById.mockResolvedValue(user);

      const command = new EnterpriseRevokeMemberCommand(enterpriseId, ownerId, { userId: normalUserId });
      await handler.execute(command);

      expect(enterprise.isMember(normalUserId)).toBe(false);
      expect(user.enterpriseIds).not.toContain(enterpriseId);
      expect(mockEnterpriseRepository.save).toHaveBeenCalledWith(enterprise);
      expect(mockUserRepository.save).toHaveBeenCalledWith(user);
    });

    it('should allow Owner to revoke a Sub-Owner', async () => {
      const enterprise = createMockEnterprise();
      mockEnterpriseRepository.findById.mockResolvedValue(enterprise);

      const user = createMockEnterpriseUser(subOwner1Id, [enterpriseId]);
      mockUserRepository.findById.mockResolvedValue(user);

      const command = new EnterpriseRevokeMemberCommand(enterpriseId, ownerId, { userId: subOwner1Id });
      await handler.execute(command);

      expect(enterprise.isMember(subOwner1Id)).toBe(false);
      expect(user.enterpriseIds).not.toContain(enterpriseId);
    });

    it('should allow Sub-Owner to revoke a normal User', async () => {
      const enterprise = createMockEnterprise();
      mockEnterpriseRepository.findById.mockResolvedValue(enterprise);

      const user = createMockEnterpriseUser(normalUserId, [enterpriseId]);
      mockUserRepository.findById.mockResolvedValue(user);

      const command = new EnterpriseRevokeMemberCommand(enterpriseId, subOwner1Id, { userId: normalUserId });
      await handler.execute(command);

      expect(enterprise.isMember(normalUserId)).toBe(false);
    });
  });

  describe('Sad Paths', () => {
    it('should throw EnterpriseForbiddenException if Sub-Owner attempts to revoke Owner', async () => {
      const enterprise = createMockEnterprise();
      mockEnterpriseRepository.findById.mockResolvedValue(enterprise);
      mockUserRepository.findById.mockResolvedValue(createMockEnterpriseUser(ownerId));

      const command = new EnterpriseRevokeMemberCommand(enterpriseId, subOwner1Id, { userId: ownerId });
      await expect(handler.execute(command)).rejects.toThrow(EnterpriseForbiddenException);
    });

    it('should throw EnterpriseForbiddenException if Sub-Owner attempts to revoke another Sub-Owner', async () => {
      const enterprise = createMockEnterprise();
      mockEnterpriseRepository.findById.mockResolvedValue(enterprise);
      mockUserRepository.findById.mockResolvedValue(createMockEnterpriseUser(subOwner2Id));

      const command = new EnterpriseRevokeMemberCommand(enterpriseId, subOwner1Id, { userId: subOwner2Id });
      await expect(handler.execute(command)).rejects.toThrow(EnterpriseForbiddenException);
    });

    it('should throw EnterpriseForbiddenException if normal User attempts to revoke anyone', async () => {
      const enterprise = createMockEnterprise();
      mockEnterpriseRepository.findById.mockResolvedValue(enterprise);
      mockUserRepository.findById.mockResolvedValue(createMockEnterpriseUser(subOwner1Id));

      const command = new EnterpriseRevokeMemberCommand(enterpriseId, normalUserId, { userId: subOwner1Id });
      await expect(handler.execute(command)).rejects.toThrow(EnterpriseForbiddenException);
    });
  });
});
