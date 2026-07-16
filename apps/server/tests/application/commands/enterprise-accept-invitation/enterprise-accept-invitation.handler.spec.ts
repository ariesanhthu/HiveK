import { EnterpriseAcceptInvitationCommandHandler } from '@/application/commands/enterprise-accept-invitation/enterprise-accept-invitation.handler';
import { EnterpriseAcceptInvitationCommand } from '@/application/commands/enterprise-accept-invitation/enterprise-accept-invitation.command';
import { EEnterpriseMemberMode, EEnterpriseInvitationStatus, ERoleType } from '@/core/enums';
import {
  EnterpriseNotFoundException,
  EnterpriseForbiddenException,
  UserNotFoundException,
  InvalidUserTypeException,
} from '@/core/exceptions';
import { EnterpriseRoot, EnterpriseUserRoot, EnterpriseInvitationRoot, KOLUserRoot } from '@/core/aggregate-roots';
import {
  createMockUserRepository,
  createMockEnterpriseRepository,
  createMockEnterpriseInvitationRepository,
} from '../../../__mocks__/mock-repositories';
import { createMockUnitOfWork } from '../../../__mocks__/mock-services';

describe('EnterpriseAcceptInvitationCommandHandler', () => {
  let handler: EnterpriseAcceptInvitationCommandHandler;
  let mockEnterpriseRepository: ReturnType<typeof createMockEnterpriseRepository>;
  let mockUserRepository: ReturnType<typeof createMockUserRepository>;
  let mockInvitationRepository: ReturnType<typeof createMockEnterpriseInvitationRepository>;
  let mockUow: ReturnType<typeof createMockUnitOfWork>;

  beforeEach(() => {
    mockEnterpriseRepository = createMockEnterpriseRepository();
    mockUserRepository = createMockUserRepository();
    mockInvitationRepository = createMockEnterpriseInvitationRepository();
    mockUow = createMockUnitOfWork();

    handler = new EnterpriseAcceptInvitationCommandHandler(
      mockEnterpriseRepository,
      mockUserRepository,
      mockInvitationRepository,
      mockUow,
    );
  });

  const enterpriseId = 'enterprise-123';
  const invitationId = 'invitation-123';
  const userId = 'user-123';
  const email = 'user@test.com';

  const createMockInvitation = () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    return EnterpriseInvitationRoot.instantiate(invitationId, {
      enterpriseId,
      email,
      mode: EEnterpriseMemberMode.USER,
      inviterId: 'owner-123',
      status: EEnterpriseInvitationStatus.PENDING,
      expiresAt: futureDate,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  };

  const createMockEnterprise = () => {
    return EnterpriseRoot.create({
      userId: 'owner-123',
      companyName: 'ACME Corp',
      contactEmail: 'contact@acme.com',
      isVerified: true,
      members: [],
    });
  };

  const createMockEnterpriseUser = (id: string, userEmail: string) => {
    const user = EnterpriseUserRoot.create({
      email: userEmail,
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
    it('should accept invitation, add user to enterprise roster, and update user aggregate', async () => {
      const invitation = createMockInvitation();
      mockInvitationRepository.findById.mockResolvedValue(invitation);

      const user = createMockEnterpriseUser(userId, email);
      mockUserRepository.findById.mockResolvedValue(user);

      const enterprise = createMockEnterprise();
      enterprise.setId(enterpriseId);
      mockEnterpriseRepository.findById.mockResolvedValue(enterprise);

      const command = new EnterpriseAcceptInvitationCommand(enterpriseId, invitationId, userId);
      await handler.execute(command);

      expect(invitation.status).toBe(EEnterpriseInvitationStatus.ACCEPTED);
      expect(enterprise.members).toContainEqual({ userId, mode: EEnterpriseMemberMode.USER });
      expect(user.enterpriseIds).toContain(enterpriseId);

      expect(mockInvitationRepository.save).toHaveBeenCalledWith(invitation);
      expect(mockEnterpriseRepository.save).toHaveBeenCalledWith(enterprise);
      expect(mockUserRepository.save).toHaveBeenCalledWith(user);
    });
  });

  describe('Sad Paths', () => {
    it('should throw UserNotFoundException if invitation is not found', async () => {
      mockInvitationRepository.findById.mockResolvedValue(null);
      const command = new EnterpriseAcceptInvitationCommand(enterpriseId, invitationId, userId);
      await expect(handler.execute(command)).rejects.toThrow(UserNotFoundException);
    });

    it('should throw UserNotFoundException if accepting user is not found', async () => {
      const invitation = createMockInvitation();
      mockInvitationRepository.findById.mockResolvedValue(invitation);
      mockUserRepository.findById.mockResolvedValue(null);

      const command = new EnterpriseAcceptInvitationCommand(enterpriseId, invitationId, userId);
      await expect(handler.execute(command)).rejects.toThrow(UserNotFoundException);
    });

    it('should throw EnterpriseForbiddenException if emails do not match', async () => {
      const invitation = createMockInvitation();
      mockInvitationRepository.findById.mockResolvedValue(invitation);

      const user = createMockEnterpriseUser(userId, 'mismatch@test.com');
      mockUserRepository.findById.mockResolvedValue(user);

      const command = new EnterpriseAcceptInvitationCommand(enterpriseId, invitationId, userId);
      await expect(handler.execute(command)).rejects.toThrow(EnterpriseForbiddenException);
    });

    it('should throw InvalidUserTypeException if user is not ENTERPRISE type', async () => {
      const invitation = createMockInvitation();
      mockInvitationRepository.findById.mockResolvedValue(invitation);

      const kolUser = KOLUserRoot.create({
        email,
        phone: { value: '+841' } as any,
        passwordHash: 'h',
        fullName: 'KOL',
        type: ERoleType.KOL,
        roleId: 'r',
      });
      kolUser.setId(userId);
      mockUserRepository.findById.mockResolvedValue(kolUser);

      const command = new EnterpriseAcceptInvitationCommand(enterpriseId, invitationId, userId);
      await expect(handler.execute(command)).rejects.toThrow(InvalidUserTypeException);
    });

    it('should throw EnterpriseNotFoundException if enterprise does not exist', async () => {
      const invitation = createMockInvitation();
      mockInvitationRepository.findById.mockResolvedValue(invitation);

      const user = createMockEnterpriseUser(userId, email);
      mockUserRepository.findById.mockResolvedValue(user);

      mockEnterpriseRepository.findById.mockResolvedValue(null);

      const command = new EnterpriseAcceptInvitationCommand(enterpriseId, invitationId, userId);
      await expect(handler.execute(command)).rejects.toThrow(EnterpriseNotFoundException);
    });
  });
});
