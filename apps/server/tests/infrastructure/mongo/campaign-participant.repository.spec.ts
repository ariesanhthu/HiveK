import { Model, Types } from 'mongoose';
import { MongoCampaignParticipantRepository } from '@/infrastructure/mongo/repositories/campaign-participant.repository';
import { CampaignParticipantRoot } from '@/core/aggregate-roots';
import { EParticipantStatus, EOutputType, EOutputStatus } from '@/core/enums';

jest.mock('mongoose', () => {
  const actual = jest.requireActual('mongoose');
  return {
    ...actual,
    Types: {
      ObjectId: jest.fn().mockImplementation((id: string) => ({
        toString: () => id,
      })),
    },
  };
});

describe('MongoCampaignParticipantRepository', () => {
  let repo: MongoCampaignParticipantRepository;
  let mockModel: any;

  const participantDoc = {
    _id: new Types.ObjectId('participant-123'),
    campaign_id: new Types.ObjectId('camp-123'),
    kol_profile_id: new Types.ObjectId('kol-123'),
    status: EParticipantStatus.JOINED,
    joined_at: new Date('2026-06-02T00:00:00Z'),
    outputs: [
      {
        _id: new Types.ObjectId('out-123'),
        platform_id: new Types.ObjectId('plat-123'),
        output_type: EOutputType.VIDEO,
        title: 'Video Title',
        is_schedule_for_post: false,
        file_id: new Types.ObjectId('file-123'),
        scheduled_at: null,
        status: EOutputStatus.PUBLISHED,
        url: 'http://youtube.com/test',
        posted_at: new Date('2026-06-03T00:00:00Z'),
      },
    ],
    delete_at: null,
    delete_by: null,
    get: (key: string) => new Date(),
  } as any;

  beforeEach(() => {
    mockModel = jest.fn();
    mockModel.findById = jest.fn().mockReturnThis();
    mockModel.findOne = jest.fn().mockReturnThis();
    mockModel.findByIdAndUpdate = jest.fn().mockReturnThis();
    mockModel.findByIdAndDelete = jest.fn().mockReturnThis();
    mockModel.exec = jest.fn();

    repo = new MongoCampaignParticipantRepository(mockModel as any);
  });

  describe('findById', () => {
    it('should return CampaignParticipantRoot when found', async () => {
      (mockModel.exec as jest.Mock).mockResolvedValueOnce(participantDoc);

      const result = await repo.findById('participant-123');

      expect(mockModel.findById).toHaveBeenCalledWith('participant-123');
      expect(result).toBeInstanceOf(CampaignParticipantRoot);
      expect(result?.id).toBe('participant-123');
      expect(result?.campaignId).toBe('camp-123');
      expect(result?.kolProfileId).toBe('kol-123');
      expect(result?.outputs[0].title).toBe('Video Title');
    });

    it('should return null when not found', async () => {
      (mockModel.exec as jest.Mock).mockResolvedValueOnce(null);

      const result = await repo.findById('participant-123');

      expect(result).toBeNull();
    });
  });

  describe('findByCampaignAndKol', () => {
    it('should execute findOne and return mapped entity', async () => {
      (mockModel.exec as jest.Mock).mockResolvedValueOnce(participantDoc);

      const result = await repo.findByCampaignAndKol('camp-123', 'kol-123');

      expect(mockModel.findOne).toHaveBeenCalledWith({
        campaign_id: expect.objectContaining({ toString: expect.any(Function) }),
        kol_profile_id: expect.objectContaining({ toString: expect.any(Function) }),
      });
      expect(result).toBeInstanceOf(CampaignParticipantRoot);
    });
  });

  describe('findByOutputId', () => {
    it('should execute findOne and search by nested output ID', async () => {
      (mockModel.exec as jest.Mock).mockResolvedValueOnce(participantDoc);

      const result = await repo.findByOutputId('out-123');

      expect(mockModel.findOne).toHaveBeenCalledWith({
        'outputs._id': expect.objectContaining({ toString: expect.any(Function) }),
      });
      expect(result).toBeInstanceOf(CampaignParticipantRoot);
    });
  });

  describe('save', () => {
    it('should save a new campaign participant and set ID', async () => {
      const participant = CampaignParticipantRoot.create({
        campaignId: 'camp-123',
        kolProfileId: 'kol-123',
      });

      const saveMock = jest.fn().mockResolvedValue({ _id: new Types.ObjectId('generated-part-id') });
      mockModel.mockImplementation(() => ({ save: saveMock }));

      await repo.save(participant);

      expect(saveMock).toHaveBeenCalled();
      expect(participant.id).toBe('generated-part-id');
    });

    it('should update an existing campaign participant when ID is present', async () => {
      const participant = CampaignParticipantRoot.instantiate('participant-123', {
        campaignId: 'camp-123',
        kolProfileId: 'kol-123',
        status: EParticipantStatus.JOINED,
        joinedAt: new Date(),
        outputs: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deleteAt: null,
        deleteBy: null,
      });

      (mockModel.exec as jest.Mock).mockResolvedValueOnce(undefined);

      await repo.save(participant);

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'participant-123',
        expect.objectContaining({
          campaign_id: expect.any(Object),
          kol_profile_id: expect.any(Object),
          status: EParticipantStatus.JOINED,
        }),
        { upsert: true }
      );
    });
  });

  describe('delete', () => {
    it('should call findByIdAndDelete with the correct ID', async () => {
      (mockModel.exec as jest.Mock).mockResolvedValueOnce(undefined);

      await repo.delete('participant-123');

      expect(mockModel.findByIdAndDelete).toHaveBeenCalledWith('participant-123');
    });
  });
});
