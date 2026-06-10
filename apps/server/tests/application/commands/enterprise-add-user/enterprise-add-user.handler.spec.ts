import { EnterpriseAddUserCommandHandler } from '@/application/commands/enterprise-add-user/enterprise-add-user.handler';
import { EnterpriseAddUserCommand } from '@/application/commands/enterprise-add-user/enterprise-add-user.command';
import { EnterpriseUserRoot, EnterpriseRoot } from '@/core/aggregate-roots';
import { ERoleType } from '@/core/enums';
import { UserNotFoundException, InvalidUserTypeException, EnterpriseNotFoundException, EnterpriseForbiddenException } from '@/core/exceptions';
import { UserAddedToEnterpriseEvent } from '@/application/events';
import { createMockUserRepository, createMockEnterpriseRepository } from '../../../__mocks__/mock-repositories';
import { createMockUnitOfWork, createMockEventBus } from '../../../__mocks__/mock-services';

describe('EnterpriseAddUserCommandHandler', () => {
  let handler: EnterpriseAddUserCommandHandler;
  let mockUserRepository: ReturnType<typeof createMockUserRepository>;
  let mockEnterpriseRepository: ReturnType<typeof createMockEnterpriseRepository>;
  let mockEventBus: ReturnType<typeof createMockEventBus>;
  let mockUow: ReturnType<typeof createMockUnitOfWork>;

  beforeEach(() => {
    mockUserRepository = createMockUserRepository();
    mockEnterpriseRepository = createMockEnterpriseRepository();
    mockEventBus = createMockEventBus();
    mockUow = createMockUnitOfWork();

    handler = new EnterpriseAddUserCommandHandler(
        mockUserRepository, 
        mockEnterpriseRepository, 
        mockEventBus as any, 
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
        phone: { value: '+84000000000' } as any,
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

  describe('Happy Paths', () => {
    it('should add user to enterprise successfully and publish event', async () => {
      const enterprise = createMockEnterprise();
      mockEnterpriseRepository.findById.mockResolvedValue(enterprise);
      
      const member = createMockUser(memberId);
      mockUserRepository.findByIds.mockResolvedValue([member]);

      const command = new EnterpriseAddUserCommand(enterpriseId, { memberIds: [memberId] }, ownerId);
      await handler.execute(command);

      expect(member.enterpriseIds).toContain(enterpriseId);
      expect(mockUserRepository.saveMany).toHaveBeenCalledWith([member]);
      expect(mockEventBus.publish).toHaveBeenCalledWith(expect.any(UserAddedToEnterpriseEvent));
    });

    it('should filter out users who are already members', async () => {
        const enterprise = createMockEnterprise();
        mockEnterpriseRepository.findById.mockResolvedValue(enterprise);
        
        const memberNew = createMockUser('new');
        const memberExisting = createMockUser('existing', [enterpriseId]);
        mockUserRepository.findByIds.mockResolvedValue([memberNew, memberExisting]);
  
        const command = new EnterpriseAddUserCommand(enterpriseId, { memberIds: ['new', 'existing'] }, ownerId);
        await handler.execute(command);
  
        expect(memberNew.enterpriseIds).toContain(enterpriseId);
        expect(mockUserRepository.saveMany).toHaveBeenCalledWith([memberNew]); // Only 'new' should be saved
        expect(mockEventBus.publish).toHaveBeenCalledTimes(1);
        expect(mockEventBus.publish).toHaveBeenCalledWith(expect.objectContaining({ userId: 'new' }));
    });
  });

  describe('Sad Paths', () => {
    it('should throw EnterpriseNotFoundException if enterprise does not exist', async () => {
      mockEnterpriseRepository.findById.mockResolvedValue(null);
      const command = new EnterpriseAddUserCommand(enterpriseId, { memberIds: [memberId] }, ownerId);
      await expect(handler.execute(command)).rejects.toThrow(EnterpriseNotFoundException);
    });

    it('should throw EnterpriseForbiddenException if requester is not the owner', async () => {
      const enterprise = createMockEnterprise();
      mockEnterpriseRepository.findById.mockResolvedValue(enterprise);
      
      const command = new EnterpriseAddUserCommand(enterpriseId, { memberIds: [memberId] }, 'wrong-owner');
      await expect(handler.execute(command)).rejects.toThrow(EnterpriseForbiddenException);
    });
  });
});
