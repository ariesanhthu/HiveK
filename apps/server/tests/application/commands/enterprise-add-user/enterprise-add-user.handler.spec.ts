import { EnterpriseAddUserCommandHandler } from '@/application/commands/enterprise-add-user/enterprise-add-user.handler';
import { EnterpriseAddUserCommand } from '@/application/commands/enterprise-add-user/enterprise-add-user.command';
import { EnterpriseUserRoot, EnterpriseRoot } from '@/core/aggregate-roots';
import { ERoleType } from '@/core/enums';
import { UserNotFoundException, InvalidUserTypeException, EnterpriseNotFoundException, EnterpriseForbiddenException } from '@/core/exceptions';
import { createMockUserRepository, createMockEnterpriseRepository } from '../../../__mocks__/mock-repositories';
import { createMockUnitOfWork, createMockOutboxService } from '../../../__mocks__/mock-services';

describe('EnterpriseAddUserCommandHandler', () => {
  let handler: EnterpriseAddUserCommandHandler;
  let mockUserRepository: ReturnType<typeof createMockUserRepository>;
  let mockEnterpriseRepository: ReturnType<typeof createMockEnterpriseRepository>;
  let mockOutboxService: ReturnType<typeof createMockOutboxService>;
  let mockUow: ReturnType<typeof createMockUnitOfWork>;

  beforeEach(() => {
    mockUserRepository = createMockUserRepository();
    mockEnterpriseRepository = createMockEnterpriseRepository();
    mockOutboxService = createMockOutboxService();
    mockUow = createMockUnitOfWork();

    handler = new EnterpriseAddUserCommandHandler(
        mockUserRepository, 
        mockEnterpriseRepository, 
        mockOutboxService as any,
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
    it('should successfully add user to enterprise and enqueue integration events', async () => {
      const enterprise = createMockEnterprise();
      mockEnterpriseRepository.findById.mockResolvedValue(enterprise);
      
      const member = createMockUser(memberId);
      mockUserRepository.findByIds.mockResolvedValue([member]);

      const command = new EnterpriseAddUserCommand(enterpriseId, { memberIds: [memberId] }, ownerId);
      await handler.execute(command);

      expect(member.enterpriseIds).toContain(enterpriseId);
      expect(mockUserRepository.saveMany).toHaveBeenCalledWith([member]);
      
      // Verification of Integration Event enqueuing
      expect(mockOutboxService.enqueueMany).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            eventType: 'EnterpriseUserAdded',
            payload: expect.objectContaining({
              userId: memberId,
              enterpriseId,
            }),
            transport: expect.objectContaining({
                routingKey: 'enterprise.user.added'
            })
          })
        ])
      );
      expect(mockUow.execute).toHaveBeenCalled();
    });

    it('should filter out users who are already members and not enqueue redundant events', async () => {
        const enterprise = createMockEnterprise();
        mockEnterpriseRepository.findById.mockResolvedValue(enterprise);
        
        const memberNew = createMockUser('new');
        const memberExisting = createMockUser('existing', [enterpriseId]);
        mockUserRepository.findByIds.mockResolvedValue([memberNew, memberExisting]);
  
        const command = new EnterpriseAddUserCommand(enterpriseId, { memberIds: ['new', 'existing'] }, ownerId);
        await handler.execute(command);
  
        expect(memberNew.enterpriseIds).toContain(enterpriseId);
        expect(mockUserRepository.saveMany).toHaveBeenCalledWith([memberNew]); 
        
        expect(mockOutboxService.enqueueMany).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.objectContaining({
                    eventType: 'EnterpriseUserAdded',
                    payload: expect.objectContaining({ userId: 'new' })
                })
            ])
        );
        // Ensure 'existing' user did not trigger an event
        const call = (mockOutboxService.enqueueMany as jest.Mock).mock.calls[0][0];
        expect(call).toHaveLength(1);
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

    it('should throw UserNotFoundException if some users are missing', async () => {
        const enterprise = createMockEnterprise();
        mockEnterpriseRepository.findById.mockResolvedValue(enterprise);
        mockUserRepository.findByIds.mockResolvedValue([]); // Missing all
  
        const command = new EnterpriseAddUserCommand(enterpriseId, { memberIds: [memberId] }, ownerId);
        await expect(handler.execute(command)).rejects.toThrow(UserNotFoundException);
    });

    it('should throw InvalidUserTypeException if user is not an enterprise type', async () => {
        const enterprise = createMockEnterprise();
        mockEnterpriseRepository.findById.mockResolvedValue(enterprise);
        
        const kolUser = createMockUser('kol');
        (kolUser as any).props.type = ERoleType.KOL;
        mockUserRepository.findByIds.mockResolvedValue([kolUser]);
  
        const command = new EnterpriseAddUserCommand(enterpriseId, { memberIds: ['kol'] }, ownerId);
        await expect(handler.execute(command)).rejects.toThrow(InvalidUserTypeException);
    });
  });
});
