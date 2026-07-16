import { EnterpriseInvitationRoot } from '@core/aggregate-roots/enterprise-invitation.aggregate';
import { EEnterpriseMemberMode, EEnterpriseInvitationStatus } from '@core/enums';

describe('EnterpriseInvitationRoot', () => {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 7);

  const props = {
    enterpriseId: 'enterprise-123',
    email: 'test@example.com',
    mode: EEnterpriseMemberMode.USER,
    inviterId: 'user-123',
    expiresAt: futureDate,
  };

  it('should create with pending status by default', () => {
    const invitation = EnterpriseInvitationRoot.create(props);

    expect(invitation).toBeDefined();
    expect(invitation.enterpriseId).toBe(props.enterpriseId);
    expect(invitation.email).toBe(props.email);
    expect(invitation.mode).toBe(props.mode);
    expect(invitation.inviterId).toBe(props.inviterId);
    expect(invitation.status).toBe(EEnterpriseInvitationStatus.PENDING);
    expect(invitation.isExpired()).toBe(false);
  });

  it('should accept pending invitation successfully', () => {
    const invitation = EnterpriseInvitationRoot.create(props);
    invitation.accept();
    expect(invitation.status).toBe(EEnterpriseInvitationStatus.ACCEPTED);
  });

  it('should fail to accept invitation when already accepted', () => {
    const invitation = EnterpriseInvitationRoot.create(props);
    invitation.accept();
    expect(() => invitation.accept()).toThrow('Invitation is not pending');
  });

  it('should fail to accept invitation when expired', () => {
    const pastDate = new Date();
    pastDate.setMinutes(pastDate.getMinutes() - 10);

    const expiredInvitation = EnterpriseInvitationRoot.create({
      ...props,
      expiresAt: pastDate,
    });

    expect(expiredInvitation.isExpired()).toBe(true);
    expect(() => expiredInvitation.accept()).toThrow('Invitation has expired');
    expect(expiredInvitation.status).toBe(EEnterpriseInvitationStatus.EXPIRED);
  });

  it('should revoke pending invitation successfully', () => {
    const invitation = EnterpriseInvitationRoot.create(props);
    invitation.revoke();
    expect(invitation.status).toBe(EEnterpriseInvitationStatus.REVOKED);
  });

  it('should fail to revoke non-pending invitation', () => {
    const invitation = EnterpriseInvitationRoot.create(props);
    invitation.revoke();
    expect(() => invitation.revoke()).toThrow('Invitation is not pending');
  });
});
