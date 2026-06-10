import { EnterpriseRevokeUserCommandHandler } from '@/application/commands/enterprise-revoke-user/enterprise-revoke-user.handler';
import { EnterpriseRevokeUserCommand } from '@/application/commands/enterprise-revoke-user/enterprise-revoke-user.command';
import { EnterpriseUserRoot, EnterpriseRoot } from '@/core/aggregate-roots';
import { ERoleType } from '@/core/enums';
import { UserNotFoundException, InvalidUserTypeException, EnterpriseNotFoundException, EnterpriseForbiddenException } from '@/core/exceptions';
import { createMockUserRepository, createMockEnterpriseRepository } from '../../../__mocks__/mock-repositories';
import { createMockUnitOfWork } from '../../../__mocks__/mock-services';

describe('EnterpriseRevokeUserCommandHandler', () => {
  let handler: EnterpriseRevokeUserCommandHandler;
  let mockUserRepository: ReturnType<typeof createMockUserRepository>;
  let mockEnterpriseRepository: ReturnType<typeof createMockEnterpriseRepository>;
  let mockUow: ReturnType<typeof createMockUnitOfWork>;

  beforeEach(() => {
    mockUserRepository = createMockUserRepository();
    mockEnterpriseRepository = createMockEnterpriseRepository();
    mockUow = createMockUnitOfWork();

    handler = new EnterpriseRevokeUserCommandHandler(
        mockUserRepository, 
        mockEnterpriseRepository, 
        mockUow
    );
  });

  const enterpriseId = 'ent-123';
  const ownerId = 'owner-123';
  const memberId = 'member-123';

  const createMockEnterprise = () => EnterpriseRoot.instantiate(enterpriseId, {
    userId: ownerId,
    companyName: 'Test Ent',
    contactEmail: 'test@ent.com',
    isVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deleteAt: null,
    deleteBy: null,
  });

  const createMockUser = (id: string, entIds: string[] = []) => {
    const user = EnterpriseUserRoot.instantiate(id, {
      email: `test-${id}@ent.com`,
      phone: { value: '+84123456789' } as any,
      passwordHash: 'hash',
      fullName: 'Test User',
      type: ERoleType.ENTERPRISE,
      roleId: 'role-1',
      isEmailVerified: true,
      enterpriseIds: entIds,
      createdAt: new Date(),
      updatedAt: new Date(),
      deleteAt: null,
      deleteBy: null,
      refreshToken: null,
      googleId: null,
    });
    return user;
  };

  describe('Happy Path', () => {
    it('should revoke user from enterprise successfully if owned', async () => {
      const enterprise = createMockEnterprise();
      mockEnterpriseRepository.findById.mockResolvedValue(enterprise);
      
      const member = createMockUser(memberId, [enterpriseId, 'ent-other']);
      mockUserRepository.findByIds.mockResolvedValue([member]);

      const command = new EnterpriseRevokeUserCommand(enterpriseId, { memberIds: [memberId] }, ownerId);
      await handler.execute(command);

      expect(member.enterpriseIds).not.toContain(enterpriseId);
      expect(member.enterpriseIds).toContain('ent-other');
      expect(mockUserRepository.saveMany).toHaveBeenCalledWith([member]);
    });

    it('should filter out users who are not members anyway', async () => {
        const enterprise = createMockEnterprise();
        mockEnterpriseRepository.findById.mockResolvedValue(enterprise);
        
        const memberActual = createMockUser('active', [enterpriseId]);
        const memberNot = createMockUser('not-active', ['other-ent']);
        mockUserRepository.findByIds.mockResolvedValue([memberActual, memberNot]);
  
        const command = new EnterpriseRevokeUserCommand(enterpriseId, { memberIds: ['active', 'not-active'] }, ownerId);
        await handler.execute(command);
  
        expect(memberActual.enterpriseIds).not.toContain(enterpriseId);
        expect(mockUserRepository.saveMany).toHaveBeenCalledWith([memberActual]); // Only the one who was actually a member should be saved
    });
  });

  describe('Sad Paths', () => {
    it('should throw EnterpriseNotFoundException if enterprise does not exist', async () => {
      mockEnterpriseRepository.findById.mockResolvedValue(null);
      const command = new EnterpriseRevokeUserCommand(enterpriseId, { memberIds: [memberId] }, ownerId);
      await expect(handler.execute(command)).rejects.toThrow(EnterpriseNotFoundException);
    });

    it('should throw EnterpriseForbiddenException if requester is not owner', async () => {
      const enterprise = createMockEnterprise();
      mockEnterpriseRepository.findById.mockResolvedValue(enterprise);
      
      const command = new EnterpriseRevokeUserCommand(enterpriseId, { memberIds: [memberId] }, 'wrong-owner');
      await expect(handler.execute(command)).rejects.toThrow(EnterpriseForbiddenException);
    });
  });
});
