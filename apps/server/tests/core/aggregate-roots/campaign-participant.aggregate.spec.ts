import { CampaignParticipantRoot } from '@/core/aggregate-roots/campaign-participant.aggregate';
import { EParticipantStatus, EOutputStatus, EOutputType } from '@/core/enums';

describe('CampaignParticipantRoot', () => {
  const validProps = {
    campaignId: 'campaign-123',
    kolProfileId: 'kol-456',
  };

  it('should create a campaign participant in PENDING_APPROVAL state', () => {
    const participant = CampaignParticipantRoot.create(validProps);
    expect(participant).toBeDefined();
    expect(participant.campaignId).toBe('campaign-123');
    expect(participant.kolProfileId).toBe('kol-456');
    expect(participant.status).toBe(EParticipantStatus.PENDING_APPROVAL);
    expect(participant.joinedAt).toBeNull();
    expect(participant.outputs).toEqual([]);
  });

  it('should transition to JOINED status on join()', () => {
    const participant = CampaignParticipantRoot.create(validProps);
    participant.join();
    expect(participant.status).toBe(EParticipantStatus.JOINED);
    expect(participant.joinedAt).toBeInstanceOf(Date);
  });

  it('should throw an error on join() if not in PENDING_APPROVAL status', () => {
    const participant = CampaignParticipantRoot.create(validProps);
    participant.join(); // status is now JOINED
    expect(() => participant.join()).toThrow('Can only join when status is PENDING_APPROVAL');
  });

  it('should transition to REJECTED on reject() if status is PENDING_APPROVAL or JOINED', () => {
    const participant1 = CampaignParticipantRoot.create(validProps);
    participant1.reject();
    expect(participant1.status).toBe(EParticipantStatus.REJECTED);

    const participant2 = CampaignParticipantRoot.create(validProps);
    participant2.join();
    participant2.reject();
    expect(participant2.status).toBe(EParticipantStatus.REJECTED);
  });

  it('should throw error on reject() if status is already REJECTED or COMPLETED', () => {
    const participant = CampaignParticipantRoot.create(validProps);
    participant.join();
    participant.complete(); // status is now COMPLETED

    expect(() => participant.reject()).toThrow(
      'Can only reject when status is PENDING_APPROVAL or JOINED',
    );
  });

  it('should transition to COMPLETED on complete() if status is JOINED', () => {
    const participant = CampaignParticipantRoot.create(validProps);
    participant.join();
    participant.complete();
    expect(participant.status).toBe(EParticipantStatus.COMPLETED);
  });

  it('should throw error on complete() if status is not JOINED', () => {
    const participant = CampaignParticipantRoot.create(validProps);
    expect(() => participant.complete()).toThrow('Can only complete when status is JOINED');
  });

  describe('Outputs', () => {
    it('should add scheduled output in SCHEDULED state', () => {
      const participant = CampaignParticipantRoot.create(validProps);
      participant.join();

      participant.addOutput({
        id: '64f7b2c9e8b3c9001f3e4e90',
        platformId: '64f7b2c9e8b3c9001f3e4e93',
        outputType: EOutputType.SHORT_VIDEO,
        title: 'My Video Post',
        isScheduleForPost: true,
        fileId: '64f7b2c9e8b3c9001f3e4e95',
        scheduledAt: new Date(),
      });

      expect(participant.outputs.length).toBe(1);
      expect(participant.outputs[0].status).toBe(EOutputStatus.SCHEDULED);
      expect(participant.outputs[0].url).toBeNull();
      expect(participant.outputs[0].postedAt).toBeNull();
    });

    it('should add direct published output in PUBLISHED state', () => {
      const participant = CampaignParticipantRoot.create(validProps);
      participant.join();

      participant.addOutput({
        id: '64f7b2c9e8b3c9001f3e4e91',
        platformId: '64f7b2c9e8b3c9001f3e4e94',
        outputType: EOutputType.VIDEO,
        title: 'TikTok Dance Video',
        isScheduleForPost: false,
        fileId: null,
        scheduledAt: null,
        url: 'https://tiktok.com/@myvideo',
      });

      expect(participant.outputs.length).toBe(1);
      expect(participant.outputs[0].status).toBe(EOutputStatus.PUBLISHED);
      expect(participant.outputs[0].url).toBe('https://tiktok.com/@myvideo');
      expect(participant.outputs[0].postedAt).toBeInstanceOf(Date);
    });

    it('should throw error if direct published output does not provide a URL', () => {
      const participant = CampaignParticipantRoot.create(validProps);
      participant.join();

      expect(() => {
        participant.addOutput({
          id: '64f7b2c9e8b3c9001f3e4e92',
          platformId: '64f7b2c9e8b3c9001f3e4e94',
          outputType: EOutputType.VIDEO,
          title: 'TikTok Video',
          isScheduleForPost: false,
          fileId: null,
          scheduledAt: null,
        });
      }).toThrow('Published output requires a URL');
    });

    it('should allow publishing a scheduled output via publishOutput()', () => {
      const participant = CampaignParticipantRoot.create(validProps);
      participant.join();

      participant.addOutput({
        id: '64f7b2c9e8b3c9001f3e4e90',
        platformId: '64f7b2c9e8b3c9001f3e4e93',
        outputType: EOutputType.SHORT_VIDEO,
        title: 'My Video Post',
        isScheduleForPost: true,
        fileId: '64f7b2c9e8b3c9001f3e4e95',
        scheduledAt: new Date(),
      });

      participant.publishOutput('64f7b2c9e8b3c9001f3e4e90', 'https://instagram.com/myreels');

      expect(participant.outputs[0].status).toBe(EOutputStatus.PUBLISHED);
      expect(participant.outputs[0].url).toBe('https://instagram.com/myreels');
      expect(participant.outputs[0].postedAt).toBeInstanceOf(Date);
    });

    it('should throw error when publishing non-existent output', () => {
      const participant = CampaignParticipantRoot.create(validProps);
      expect(() => participant.publishOutput('invalid-id', 'url')).toThrow("Output with ID 'invalid-id' not found");
    });

    it('should update tracking status', () => {
      const participant = CampaignParticipantRoot.create(validProps);
      participant.addOutput({
        id: 'out-1',
        platformId: 'plat-1',
        outputType: EOutputType.VIDEO,
        title: 'Video',
        isScheduleForPost: false,
        fileId: null,
        scheduledAt: null,
        url: 'http://url',
      });

      participant.updateTrackingStatus('out-1', false);
      expect(participant.outputs[0].isTrackingActive).toBe(false);

      participant.updateTrackingStatus('out-1', true);
      expect(participant.outputs[0].isTrackingActive).toBe(true);
    });

    it('should set output file id', () => {
      const participant = CampaignParticipantRoot.create(validProps);
      participant.addOutput({
        id: 'out-1',
        platformId: 'plat-1',
        outputType: EOutputType.VIDEO,
        title: 'Video',
        isScheduleForPost: false,
        fileId: null,
        scheduledAt: null,
        url: 'http://url',
      });

      participant.setOutputFileId('out-1', 'new-file-id');
      expect(participant.outputs[0].fileId).toBe('new-file-id');
    });
  });

  describe('Deletion and Update', () => {
    it('should soft delete and restore', () => {
      const participant = CampaignParticipantRoot.create(validProps);
      participant.softDelete('admin-1');
      expect(participant.deleteAt).toBeInstanceOf(Date);
      expect(participant.deleteBy).toBe('admin-1');

      participant.restore();
      expect(participant.deleteAt).toBeNull();
      expect(participant.deleteBy).toBeNull();
    });

    it('should throw error if soft deleting participant with published outputs', () => {
      const participant = CampaignParticipantRoot.create(validProps);
      participant.addOutput({
        id: 'out-1',
        platformId: 'plat-1',
        outputType: EOutputType.VIDEO,
        title: 'Video',
        isScheduleForPost: false,
        fileId: null,
        scheduledAt: null,
        url: 'http://url',
      });

      expect(() => participant.softDelete('admin-1')).toThrow('Cannot delete participant with published outputs');
    });

    it('should update properties', () => {
      const participant = CampaignParticipantRoot.create(validProps);
      participant.update({ status: EParticipantStatus.JOINED });
      expect(participant.status).toBe(EParticipantStatus.JOINED);
    });

    it('should update outputs correctly', () => {
      const participant = CampaignParticipantRoot.create(validProps);
      const newOutputs = [{
        id: 'out-2',
        platformId: 'plat-2',
        outputType: EOutputType.VIDEO,
        title: 'Video 2',
        isScheduleForPost: true,
        fileId: null,
        scheduledAt: new Date(),
        status: EOutputStatus.SCHEDULED,
        url: null,
        postedAt: null,
        isTrackingActive: false,
      }];
      participant.updateOutputs(newOutputs);
      expect(participant.outputs).toEqual(newOutputs);
    });

    it('should throw error when updating outputs that delete published ones', () => {
      const participant = CampaignParticipantRoot.create(validProps);
      participant.addOutput({
        id: 'out-1',
        platformId: 'plat-1',
        outputType: EOutputType.VIDEO,
        title: 'Published Video',
        isScheduleForPost: false,
        fileId: null,
        scheduledAt: null,
        url: 'http://url',
      });

      expect(() => participant.updateOutputs([])).toThrow('Cannot delete published output: Published Video');
    });
  });
});
