import { EnterpriseInviteMemberCommandHandler } from '@/application/commands/enterprise-invite-member/enterprise-invite-member.handler';
import { EnterpriseInviteMemberCommand } from '@/application/commands/enterprise-invite-member/enterprise-invite-member.command';
import { EEnterpriseMemberMode, EEnterpriseInvitationStatus, ERoleType } from '@/core/enums';
import {
  EnterpriseNotFoundException,
  EnterpriseForbiddenException,
  EnterpriseConflictException,
  UserNotFoundException,
  InvalidUserTypeException,
} from '@/core/exceptions';
import { EnterpriseRoot, EnterpriseUserRoot, KOLUserRoot } from '@/core/aggregate-roots';
import {
  createMockUserRepository,
  createMockEnterpriseRepository,
  createMockEnterpriseInvitationRepository,
} from '../../../__mocks__/mock-repositories';
import { createMockUnitOfWork } from '../../../__mocks__/mock-services';

describe('EnterpriseInviteMemberCommandHandler', () => {
  let handler: EnterpriseInviteMemberCommandHandler;
  let mockEnterpriseRepository: ReturnType<typeof createMockEnterpriseRepository>;
  let mockUserRepository: ReturnType<typeof createMockUserRepository>;
  let mockInvitationRepository: ReturnType<typeof createMockEnterpriseInvitationRepository>;
  let mockUow: ReturnType<typeof createMockUnitOfWork>;

  beforeEach(() => {
    mockEnterpriseRepository = createMockEnterpriseRepository();
    mockUserRepository = createMockUserRepository();
    mockInvitationRepository = createMockEnterpriseInvitationRepository();
    mockUow = createMockUnitOfWork();

    handler = new EnterpriseInviteMemberCommandHandler(
      mockEnterpriseRepository,
      mockUserRepository,
      mockInvitationRepository,
      mockUow,
    );
  });

  const enterpriseId = 'enterprise-123';
  const ownerId = 'owner-123';
  const subOwnerId = 'sub-owner-123';
  const normalUserId = 'user-555';
  const inviteeEmail = 'invitee@test.com';

  const inviteInput = {
    email: inviteeEmail,
    mode: EEnterpriseMemberMode.USER,
  };

  const createMockEnterprise = () => {
    return EnterpriseRoot.create({
      userId: ownerId,
      companyName: 'ACME Corp',
      contactEmail: 'contact@acme.com',
      isVerified: true,
      members: [],
    });
  };

  const createMockEnterpriseUser = (id: string, email: string) => {
    const user = EnterpriseUserRoot.create({
      email,
      phone: { value: '+84123456789' } as any,
      passwordHash: 'hash',
      fullName: 'Enterprise User',
      type: ERoleType.ENTERPRISE,
      roleId: 'role-ent',
    });
    user.setId(id);
    return user;
  };

  describe('Happy Paths', () => {
    it('should successfully invite a user when requested by owner', async () => {
      const enterprise = createMockEnterprise();
      enterprise.setId(enterpriseId);
      mockEnterpriseRepository.findById.mockResolvedValue(enterprise);

      const invitee = createMockEnterpriseUser('invitee-id', inviteeEmail);
      mockUserRepository.findByEmail.mockResolvedValue(invitee);
      mockInvitationRepository.findPendingByEmailAndEnterpriseId.mockResolvedValue(null);

      const command = new EnterpriseInviteMemberCommand(enterpriseId, ownerId, inviteInput);
      const result = await handler.execute(command);

      expect(result).toBeDefined();
      expect(result.email).toBe(inviteeEmail);
      expect(result.status).toBe(EEnterpriseInvitationStatus.PENDING);
      expect(mockInvitationRepository.save).toHaveBeenCalled();
    });

    it('should successfully invite a user when requested by a sub-owner', async () => {
      const enterprise = createMockEnterprise();
      enterprise.setId(enterpriseId);
      enterprise.addMember(subOwnerId, EEnterpriseMemberMode.SUB_OWNER);
      mockEnterpriseRepository.findById.mockResolvedValue(enterprise);

      const invitee = createMockEnterpriseUser('invitee-id', inviteeEmail);
      mockUserRepository.findByEmail.mockResolvedValue(invitee);
      mockInvitationRepository.findPendingByEmailAndEnterpriseId.mockResolvedValue(null);

      const command = new EnterpriseInviteMemberCommand(enterpriseId, subOwnerId, inviteInput);
      const result = await handler.execute(command);

      expect(result).toBeDefined();
      expect(mockInvitationRepository.save).toHaveBeenCalled();
    });
  });

  describe('Sad Paths', () => {
    it('should throw EnterpriseNotFoundException if enterprise does not exist', async () => {
      mockEnterpriseRepository.findById.mockResolvedValue(null);
      const command = new EnterpriseInviteMemberCommand(enterpriseId, ownerId, inviteInput);
      await expect(handler.execute(command)).rejects.toThrow(EnterpriseNotFoundException);
    });

    it('should throw EnterpriseForbiddenException if requested by normal user', async () => {
      const enterprise = createMockEnterprise();
      enterprise.setId(enterpriseId);
      enterprise.addMember(normalUserId, EEnterpriseMemberMode.USER);
      mockEnterpriseRepository.findById.mockResolvedValue(enterprise);

      const command = new EnterpriseInviteMemberCommand(enterpriseId, normalUserId, inviteInput);
      await expect(handler.execute(command)).rejects.toThrow(EnterpriseForbiddenException);
    });

    it('should throw UserNotFoundException if invitee does not exist', async () => {
      const enterprise = createMockEnterprise();
      enterprise.setId(enterpriseId);
      mockEnterpriseRepository.findById.mockResolvedValue(enterprise);
      mockUserRepository.findByEmail.mockResolvedValue(null);

      const command = new EnterpriseInviteMemberCommand(enterpriseId, ownerId, inviteInput);
      await expect(handler.execute(command)).rejects.toThrow(UserNotFoundException);
    });

    it('should throw InvalidUserTypeException if invitee is not an enterprise user', async () => {
      const enterprise = createMockEnterprise();
      enterprise.setId(enterpriseId);
      mockEnterpriseRepository.findById.mockResolvedValue(enterprise);

      const kolUser = KOLUserRoot.create({
        email: inviteeEmail,
        phone: { value: '+841' } as any,
        passwordHash: 'h',
        fullName: 'KOL',
        type: ERoleType.KOL,
        roleId: 'r',
      });
      mockUserRepository.findByEmail.mockResolvedValue(kolUser);

      const command = new EnterpriseInviteMemberCommand(enterpriseId, ownerId, inviteInput);
      await expect(handler.execute(command)).rejects.toThrow(InvalidUserTypeException);
    });

    it('should throw EnterpriseConflictException if invitee is already in roster', async () => {
      const enterprise = createMockEnterprise();
      enterprise.setId(enterpriseId);
      enterprise.addMember('invitee-id', EEnterpriseMemberMode.USER);
      mockEnterpriseRepository.findById.mockResolvedValue(enterprise);

      const invitee = createMockEnterpriseUser('invitee-id', inviteeEmail);
      mockUserRepository.findByEmail.mockResolvedValue(invitee);

      const command = new EnterpriseInviteMemberCommand(enterpriseId, ownerId, inviteInput);
      await expect(handler.execute(command)).rejects.toThrow(EnterpriseConflictException);
    });

    it('should throw EnterpriseConflictException if pending invitation already exists', async () => {
      const enterprise = createMockEnterprise();
      enterprise.setId(enterpriseId);
      mockEnterpriseRepository.findById.mockResolvedValue(enterprise);

      const invitee = createMockEnterpriseUser('invitee-id', inviteeEmail);
      mockUserRepository.findByEmail.mockResolvedValue(invitee);
      mockInvitationRepository.findPendingByEmailAndEnterpriseId.mockResolvedValue({} as any);

      const command = new EnterpriseInviteMemberCommand(enterpriseId, ownerId, inviteInput);
      await expect(handler.execute(command)).rejects.toThrow(EnterpriseConflictException);
    });
  });
});
