import { EnterpriseRevokeInvitationCommandHandler } from '@/application/commands/enterprise-revoke-invitation/enterprise-revoke-invitation.handler';
import { EnterpriseRevokeInvitationCommand } from '@/application/commands/enterprise-revoke-invitation/enterprise-revoke-invitation.command';
import { EEnterpriseMemberMode, EEnterpriseInvitationStatus } from '@/core/enums';
import {
  EnterpriseNotFoundException,
  EnterpriseForbiddenException,
  UserNotFoundException,
} from '@/core/exceptions';
import { EnterpriseRoot, EnterpriseInvitationRoot } from '@/core/aggregate-roots';
import {
  createMockEnterpriseRepository,
  createMockEnterpriseInvitationRepository,
} from '../../../__mocks__/mock-repositories';
import { createMockUnitOfWork } from '../../../__mocks__/mock-services';

describe('EnterpriseRevokeInvitationCommandHandler', () => {
  let handler: EnterpriseRevokeInvitationCommandHandler;
  let mockEnterpriseRepository: ReturnType<typeof createMockEnterpriseRepository>;
  let mockInvitationRepository: ReturnType<typeof createMockEnterpriseInvitationRepository>;
  let mockUow: ReturnType<typeof createMockUnitOfWork>;

  beforeEach(() => {
    mockEnterpriseRepository = createMockEnterpriseRepository();
    mockInvitationRepository = createMockEnterpriseInvitationRepository();
    mockUow = createMockUnitOfWork();

    handler = new EnterpriseRevokeInvitationCommandHandler(
      mockEnterpriseRepository,
      mockInvitationRepository,
      mockUow,
    );
  });

  const enterpriseId = 'enterprise-123';
  const invitationId = 'invitation-123';
  const ownerId = 'owner-123';
  const subOwnerId = 'sub-owner-123';
  const normalUserId = 'user-555';

  const createMockInvitation = () => {
    return EnterpriseInvitationRoot.instantiate(invitationId, {
      enterpriseId,
      email: 'invitee@test.com',
      mode: EEnterpriseMemberMode.USER,
      inviterId: ownerId,
      status: EEnterpriseInvitationStatus.PENDING,
      expiresAt: new Date(Date.now() + 100000),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  };

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
    it('should allow Owner to revoke/cancel a pending invitation', async () => {
      const enterprise = createMockEnterprise();
      mockEnterpriseRepository.findById.mockResolvedValue(enterprise);

      const invitation = createMockInvitation();
      mockInvitationRepository.findById.mockResolvedValue(invitation);

      const command = new EnterpriseRevokeInvitationCommand(enterpriseId, invitationId, ownerId);
      await handler.execute(command);

      expect(invitation.status).toBe(EEnterpriseInvitationStatus.REVOKED);
      expect(mockInvitationRepository.save).toHaveBeenCalledWith(invitation);
    });

    it('should allow Sub-Owner to revoke/cancel a pending invitation', async () => {
      const enterprise = createMockEnterprise();
      mockEnterpriseRepository.findById.mockResolvedValue(enterprise);

      const invitation = createMockInvitation();
      mockInvitationRepository.findById.mockResolvedValue(invitation);

      const command = new EnterpriseRevokeInvitationCommand(enterpriseId, invitationId, subOwnerId);
      await handler.execute(command);

      expect(invitation.status).toBe(EEnterpriseInvitationStatus.REVOKED);
    });
  });

  describe('Sad Paths', () => {
    it('should throw EnterpriseForbiddenException if normal User attempts to revoke invitation', async () => {
      const enterprise = createMockEnterprise();
      mockEnterpriseRepository.findById.mockResolvedValue(enterprise);

      const invitation = createMockInvitation();
      mockInvitationRepository.findById.mockResolvedValue(invitation);

      const command = new EnterpriseRevokeInvitationCommand(enterpriseId, invitationId, normalUserId);
      await expect(handler.execute(command)).rejects.toThrow(EnterpriseForbiddenException);
    });
  });
});
