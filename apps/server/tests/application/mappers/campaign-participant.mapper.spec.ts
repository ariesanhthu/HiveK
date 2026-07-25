import { CampaignParticipantMapper } from '@application/mappers/campaign-participant.mapper';
import { CampaignParticipantEntity } from '@core/entities';
import { EParticipantStatus } from '@core/enums';

describe('CampaignParticipantMapper', () => {
  const mockRoot = CampaignParticipantEntity.instantiate('participant-1', {
    kolProfileId: 'kol-1',
    status: EParticipantStatus.JOINED,
    joinedAt: new Date('2026-01-01T00:00:00Z'),
    deleteAt: null,
    deleteBy: null,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  });

  it('should map root to DTO correctly', () => {
    const dto = CampaignParticipantMapper.toDto(mockRoot);

    expect(dto.id).toBe('participant-1');
    expect(dto.kolProfileId).toBe('kol-1');
    expect(dto.status).toBe(EParticipantStatus.JOINED);
    expect(dto.joinedAt).toBe('2026-01-01T00:00:00.000Z');
  });

  it('should map list of roots to list of DTOs correctly', () => {
    const dtos = CampaignParticipantMapper.toListDto([mockRoot]);
    expect(dtos).toHaveLength(1);
    expect(dtos[0].id).toBe('participant-1');
  });

  it('should handle null joinedAt correctly', () => {
    const rootNoJoinedAt = CampaignParticipantEntity.instantiate('participant-2', {
      kolProfileId: 'kol-1',
      status: EParticipantStatus.PENDING_APPROVAL,
      joinedAt: null,
      deleteAt: null,
      deleteBy: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const dto = CampaignParticipantMapper.toDto(rootNoJoinedAt);
    expect(dto.joinedAt).toBeNull();
  });
});
