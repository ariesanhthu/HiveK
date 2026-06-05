import { CampaignRoot, CampaignProps } from '@core/aggregate-roots/campaign.aggregate';
import { ECampaignStatus } from '@/core/enums/campaign-status.enum';
import { InvalidOperationException } from '@/core/exceptions';

describe('CampaignRoot Aggregate Root', () => {
  const props: CampaignProps = {
    ownerId: 'owner-1',
    enterpriseId: 'enterprise-1',
    budget: 5000,
    financialTarget: { sales: 10000 },
    description: 'Summer sale campaign',
    platformTarget: [
      {
        platformId: 'instagram',
        minFollowers: 1000,
        maxFollowers: 5000,
        note: 'High priority',
        others: { age: '18-25' },
      },
    ],
    status: ECampaignStatus.DRAFT,
    collaboratorIds: ['owner-1'],
    rawContents: [
      {
        fileId: 'file-123',
        rawContent: 'Original details text',
      },
    ],
    deleteAt: null,
    deleteBy: null,
  };

  it('should create and get properties correctly', () => {
    const root = CampaignRoot.create({
      ownerId: props.ownerId,
      enterpriseId: props.enterpriseId,
      budget: props.budget,
      financialTarget: props.financialTarget,
      description: props.description,
      platformTarget: props.platformTarget,
      rawContents: props.rawContents,
    });

    expect(root).toBeDefined();
    expect(root.ownerId).toBe(props.ownerId);
    expect(root.enterpriseId).toBe(props.enterpriseId);
    expect(root.budget).toBe(props.budget);
    expect(root.financialTarget).toEqual(props.financialTarget);
    expect(root.description).toBe(props.description);
    expect(root.status).toBe(ECampaignStatus.DRAFT);
    expect(root.collaboratorIds).toContain(props.ownerId);
    expect(root.rawContents[0].fileId).toBe('file-123');
    expect(root.platformTarget[0].minFollowers).toBe(1000);
    expect(root.platformTarget[0].note).toBe('High priority');
  });

  it('should instantiate and update correctly', () => {
    const root = CampaignRoot.instantiate('campaign-123', props);
    expect(root.id).toBe('campaign-123');

    root.update({
      description: 'Updated summer description',
      budget: 6000,
    });

    expect(root.description).toBe('Updated summer description');
    expect(root.budget).toBe(6000);
  });

  it('should not allow updates when status is not DRAFT', () => {
    const root = CampaignRoot.instantiate('campaign-123', {
      ...props,
      status: ECampaignStatus.FINDING_KOL,
    });

    expect(() => root.update({ description: 'New description' })).toThrow(InvalidOperationException);
  });

  it('should handle status transitions correctly', () => {
    const root = CampaignRoot.instantiate('campaign-123', props);

    root.updateStatus(ECampaignStatus.FINDING_KOL);
    expect(root.status).toBe(ECampaignStatus.FINDING_KOL);

    root.updateStatus(ECampaignStatus.IN_PROGRESS);
    expect(root.status).toBe(ECampaignStatus.IN_PROGRESS);

    root.updateStatus(ECampaignStatus.COMPLETED);
    expect(root.status).toBe(ECampaignStatus.COMPLETED);
  });

  it('should allow cancellation from DRAFT or FINDING_KOL but not later', () => {
    const root1 = CampaignRoot.instantiate('campaign-123', { ...props, status: ECampaignStatus.DRAFT });
    root1.updateStatus(ECampaignStatus.CANCELLED);
    expect(root1.status).toBe(ECampaignStatus.CANCELLED);

    const root2 = CampaignRoot.instantiate('campaign-124', { ...props, status: ECampaignStatus.FINDING_KOL });
    root2.updateStatus(ECampaignStatus.CANCELLED);
    expect(root2.status).toBe(ECampaignStatus.CANCELLED);

    const root3 = CampaignRoot.instantiate('campaign-125', { ...props, status: ECampaignStatus.IN_PROGRESS });
    expect(() => root3.updateStatus(ECampaignStatus.CANCELLED)).toThrow(InvalidOperationException);
  });

  it('should handle collaborator invitation and revocation with ownership checks', () => {
    const root = CampaignRoot.instantiate('campaign-123', props);

    // Fail invite because requestedBy is not owner
    expect(() => root.inviteCollaborator('user-2', 'user-3')).toThrow(InvalidOperationException);

    root.inviteCollaborator('user-2', 'owner-1');
    expect(root.collaboratorIds).toContain('user-2');

    expect(() => root.inviteCollaborator('user-2', 'owner-1')).toThrow(InvalidOperationException);

    // Fail revoke because requestedBy is not owner
    expect(() => root.revokeCollaborator('user-2', 'user-3')).toThrow(InvalidOperationException);

    root.revokeCollaborator('user-2', 'owner-1');
    expect(root.collaboratorIds).not.toContain('user-2');

    expect(() => root.revokeCollaborator('owner-1', 'owner-1')).toThrow(InvalidOperationException);
    expect(() => root.revokeCollaborator('non-existent', 'owner-1')).toThrow(InvalidOperationException);
  });
});
