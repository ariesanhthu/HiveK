import { EnterpriseGetInvitationsQueryHandler } from '@/application/queries/enterprise-get-invitations/enterprise-get-invitations.handler';
import { EnterpriseGetInvitationsQuery } from '@/application/queries/enterprise-get-invitations/enterprise-get-invitations.query';
import { EEnterpriseMemberMode, EEnterpriseInvitationStatus } from '@/core/enums';
import { EnterpriseNotFoundException, EnterpriseForbiddenException } from '@/core/exceptions';
import { EnterpriseRoot, EnterpriseInvitationRoot } from '@/core/aggregate-roots';
import {
  createMockEnterpriseRepository,
  createMockEnterpriseInvitationRepository,
} from '../../../__mocks__/mock-repositories';

describe('EnterpriseGetInvitationsQueryHandler', () => {
  let handler: EnterpriseGetInvitationsQueryHandler;
  let mockEnterpriseRepository: ReturnType<typeof createMockEnterpriseRepository>;
  let mockInvitationRepository: ReturnType<typeof createMockEnterpriseInvitationRepository>;

  beforeEach(() => {
    mockEnterpriseRepository = createMockEnterpriseRepository();
    mockInvitationRepository = createMockEnterpriseInvitationRepository();

    handler = new EnterpriseGetInvitationsQueryHandler(
      mockEnterpriseRepository,
      mockInvitationRepository,
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

  const createMockInvitation = () => {
    return EnterpriseInvitationRoot.instantiate('invite-1', {
      enterpriseId,
      email: 'invitee@test.com',
      mode: EEnterpriseMemberMode.USER,
      inviterId: ownerId,
      status: EEnterpriseInvitationStatus.PENDING,
      expiresAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  };

  describe('Happy Paths', () => {
    it('should allow Owner to view invitations list', async () => {
      const enterprise = createMockEnterprise();
      mockEnterpriseRepository.findById.mockResolvedValue(enterprise);

      const invite = createMockInvitation();
      mockInvitationRepository.findByEnterpriseId.mockResolvedValue([invite]);

      const query = new EnterpriseGetInvitationsQuery(enterpriseId, ownerId);
      const result = await handler.execute(query);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(invite.id);
    });

    it('should allow Sub-Owner to view invitations list', async () => {
      const enterprise = createMockEnterprise();
      mockEnterpriseRepository.findById.mockResolvedValue(enterprise);

      const invite = createMockInvitation();
      mockInvitationRepository.findByEnterpriseId.mockResolvedValue([invite]);

      const query = new EnterpriseGetInvitationsQuery(enterpriseId, subOwnerId);
      const result = await handler.execute(query);

      expect(result).toHaveLength(1);
    });
  });

  describe('Sad Paths', () => {
    it('should throw EnterpriseNotFoundException if enterprise does not exist', async () => {
      mockEnterpriseRepository.findById.mockResolvedValue(null);

      const query = new EnterpriseGetInvitationsQuery(enterpriseId, ownerId);
      await expect(handler.execute(query)).rejects.toThrow(EnterpriseNotFoundException);
    });

    it('should throw EnterpriseForbiddenException if normal user tries to view invitations', async () => {
      const enterprise = createMockEnterprise();
      mockEnterpriseRepository.findById.mockResolvedValue(enterprise);

      const query = new EnterpriseGetInvitationsQuery(enterpriseId, normalUserId);
      await expect(handler.execute(query)).rejects.toThrow(EnterpriseForbiddenException);
    });
  });
});
