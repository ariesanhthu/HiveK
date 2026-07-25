import { CampaignParticipantEntity } from '@/core/entities';
import { EParticipantStatus } from '@/core/enums';

describe('CampaignParticipantEntity', () => {
  it('should create a campaign participant in PENDING_APPROVAL state', () => {
    const participant = CampaignParticipantEntity.create({
      kolProfileId: 'kol-456',
      status: EParticipantStatus.PENDING_APPROVAL,
      joinedAt: null,
    });

    expect(participant).toBeDefined();
    expect(participant.kolProfileId).toBe('kol-456');
    expect(participant.status).toBe(EParticipantStatus.PENDING_APPROVAL);
    expect(participant.joinedAt).toBeNull();
  });

  it('should transition to JOINED status on join()', () => {
    const participant = CampaignParticipantEntity.create({
      kolProfileId: 'kol-456',
      status: EParticipantStatus.PENDING_APPROVAL,
      joinedAt: null,
    });
    participant.join();
    expect(participant.status).toBe(EParticipantStatus.JOINED);
    expect(participant.joinedAt).toBeInstanceOf(Date);
  });

  // @code-comment: join() guard is at CampaignRoot.joinParticipant() level, not on the entity itself.

  it('should transition to REJECTED on reject() if status is PENDING_APPROVAL or JOINED', () => {
    const p1 = CampaignParticipantEntity.create({
      kolProfileId: 'kol-1', status: EParticipantStatus.PENDING_APPROVAL, joinedAt: null,
    });
    p1.reject();
    expect(p1.status).toBe(EParticipantStatus.REJECTED);

    const p2 = CampaignParticipantEntity.create({
      kolProfileId: 'kol-2', status: EParticipantStatus.PENDING_APPROVAL, joinedAt: null,
    });
    p2.join();
    p2.reject();
    expect(p2.status).toBe(EParticipantStatus.REJECTED);
  });

  it('should transition to COMPLETED on complete() if status is JOINED', () => {
    const participant = CampaignParticipantEntity.create({
      kolProfileId: 'kol-456', status: EParticipantStatus.PENDING_APPROVAL, joinedAt: null,
    });
    participant.join();
    participant.complete();
    expect(participant.status).toBe(EParticipantStatus.COMPLETED);
  });

  it('should soft delete and restore', () => {
    const participant = CampaignParticipantEntity.create({
      kolProfileId: 'kol-456', status: EParticipantStatus.PENDING_APPROVAL, joinedAt: null,
    });
    participant.softDelete('admin-1');
    expect(participant.deleteAt).toBeInstanceOf(Date);
    expect(participant.deleteBy).toBe('admin-1');

    participant.restore();
    expect(participant.deleteAt).toBeNull();
    expect(participant.deleteBy).toBeNull();
  });

  it('should update status via updateStatus()', () => {
    const participant = CampaignParticipantEntity.create({
      kolProfileId: 'kol-456', status: EParticipantStatus.PENDING_APPROVAL, joinedAt: null,
    });
    participant.updateStatus(EParticipantStatus.JOINED);
    expect(participant.status).toBe(EParticipantStatus.JOINED);
  });
});
