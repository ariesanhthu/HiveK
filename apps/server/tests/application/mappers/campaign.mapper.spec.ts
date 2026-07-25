import { CampaignMapper } from '@/application/mappers/campaign.mapper';
import { ECampaignStatus } from '@/core/enums/campaign-status.enum';

describe('CampaignMapper', () => {
  it('should map CampaignRoot to CampaignDto', () => {
    const mockRoot = {
      id: 'campaign-123',
      ownerId: 'owner-123',
      enterpriseId: 'enterprise-123',
      budget: 5000,
      financialTarget: { target: 'sales' },
      description: 'Summer sale campaign',
      platformTarget: [
        {
          platformId: 'instagram',
          minFollowers: 1000,
          maxFollowers: 5000,
          note: 'E2E target platform',
          extras: { age: '18-25' },
        },
      ],
      status: ECampaignStatus.DRAFT,
      collaboratorIds: ['owner-123'],
      rawContents: [
        {
          fileId: 'file-123',
          rawContent: 'Original details text',
        },
      ],
      participants: [],
    } as any;

    const dto = CampaignMapper.toDto(mockRoot);

    expect(dto).toBeDefined();
    expect(dto.id).toBe('campaign-123');
    expect(dto.budget).toBe(5000);
    expect(dto.status).toBe(ECampaignStatus.DRAFT);
  });

  it('should map list of roots to list of DTOs', () => {
    const mockRoot = {
      id: 'campaign-123',
      ownerId: 'owner-123',
      enterpriseId: 'enterprise-123',
      budget: 5000,
      financialTarget: {},
      description: 'Summer sale campaign',
      platformTarget: [],
      status: ECampaignStatus.DRAFT,
      collaboratorIds: ['owner-123'],
      rawContents: [],
      participants: [],
    } as any;

    const dtos = CampaignMapper.toListDto([mockRoot]);
    expect(dtos).toHaveLength(1);
    expect(dtos[0].id).toBe('campaign-123');
  });
});
