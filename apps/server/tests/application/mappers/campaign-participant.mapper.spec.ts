import { CampaignParticipantMapper } from '@application/mappers/campaign-participant.mapper';
import { CampaignParticipantRoot } from '@core/aggregate-roots';
import { EOutputStatus, EOutputType, EParticipantStatus } from '@core/enums';

describe('CampaignParticipantMapper', () => {
  const mockRoot = CampaignParticipantRoot.instantiate('participant-1', {
    campaignId: 'campaign-1',
    kolProfileId: 'kol-1',
    status: EParticipantStatus.JOINED,
    joinedAt: new Date('2026-01-01T00:00:00Z'),
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    outputs: [
      {
        id: 'output-1',
        platformId: 'platform-1',
        outputType: EOutputType.VIDEO,
        title: 'Test Video',
        isScheduleForPost: false,
        fileId: 'file-1',
        scheduledAt: null,
        status: EOutputStatus.PUBLISHED,
        url: 'http://example.com/video',
        postedAt: null,
        isTrackingActive: true,
      },
    ],
    deleteAt: null,
    deleteBy: null,
  });

  it('should map root to DTO correctly', () => {
    const dto = CampaignParticipantMapper.toDto(mockRoot);

    expect(dto.id).toBe('participant-1');
    expect(dto.campaignId).toBe('campaign-1');
    expect(dto.kolProfileId).toBe('kol-1');
    expect(dto.status).toBe(EParticipantStatus.JOINED);
    expect(dto.joinedAt).toBe('2026-01-01T00:00:00.000Z');
    expect(dto.outputs).toHaveLength(1);
    expect(dto.outputs[0].id).toBe('output-1');
    expect(dto.outputs[0].title).toBe('Test Video');
  });

  it('should map list of roots to list of DTOs correctly', () => {
    const dtos = CampaignParticipantMapper.toListDto([mockRoot]);
    expect(dtos).toHaveLength(1);
    expect(dtos[0].id).toBe('participant-1');
  });

  it('should handle null joinedAt correctly', () => {
    const rootNoJoinedAt = CampaignParticipantRoot.instantiate('participant-2', {
      campaignId: 'campaign-1',
      kolProfileId: 'kol-1',
      status: EParticipantStatus.PENDING_APPROVAL,
      joinedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      outputs: [],
      deleteAt: null,
      deleteBy: null,
    });

    const dto = CampaignParticipantMapper.toDto(rootNoJoinedAt);
    expect(dto.joinedAt).toBeNull();
  });
});
