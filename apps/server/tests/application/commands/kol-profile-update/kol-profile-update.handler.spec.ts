import { UpdateKolProfileHandler } from '@/application/commands/kol-profile-update/kol-profile-update.handler';
import { KolProfileUpdateCommand } from '@/application/commands/kol-profile-update/kol-profile-update.command';
import { NotFoundException } from '@nestjs/common';

describe('UpdateKolProfileHandler', () => {
  let handler: UpdateKolProfileHandler;
  let mockKolProfileModel: any;

  beforeEach(() => {
    mockKolProfileModel = {
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
    };
    handler = new UpdateKolProfileHandler(mockKolProfileModel);
  });

  it('should update KOL profile successfully', async () => {
    const mockDoc = {
      _id: 'kol-123',
      name: 'John Doe',
      exec: jest.fn(),
    };
    mockKolProfileModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockDoc),
    });

    const mockUpdatedDoc = {
      _id: 'kol-123',
      name: 'John Doe Updated',
      location: 'VN',
      gender: 'M',
      bio: 'updated bio',
      email: 'john@doe.com',
      phone: '123456',
      is_verified: true,
      scores: { popularity: 90 },
      platforms: [
        {
          platform_id: 'plat-1',
          uniqueId: 'john_handle',
          external_id: 'ext-1',
          follower_count: 1000,
          avg_engagement: 5.2,
          top_tags: ['tech'],
          categories: ['technology'],
        },
      ],
    };

    mockKolProfileModel.findByIdAndUpdate.mockReturnValue({
      lean: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUpdatedDoc),
      }),
    });

    const input = {
      name: 'John Doe Updated',
      location: 'VN',
      gender: 'M',
      bio: 'updated bio',
      email: 'john@doe.com',
      phone: '123456',
      isVerified: true,
      platforms: [
        {
          platformId: 'plat-1',
          uniqueId: 'john_handle',
          externalId: 'ext-1',
          followerCount: 1000,
          avgEngagement: 5.2,
          topTags: ['tech'],
          categories: ['technology'],
        },
      ],
    };

    const command = new KolProfileUpdateCommand('kol-123', input as any);
    const result = await handler.execute(command);

    expect(result).toBeDefined();
    expect(result.name).toBe('John Doe Updated');
    expect(result.platforms[0].uniqueId).toBe('john_handle');
  });

  it('should throw NotFoundException if KOL profile not found', async () => {
    mockKolProfileModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    const command = new KolProfileUpdateCommand('kol-123', {});
    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
  });
});
