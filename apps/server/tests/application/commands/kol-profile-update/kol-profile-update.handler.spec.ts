import { UpdateKolProfileHandler } from '@/application/commands/kol-profile-update/kol-profile-update.handler';
import { KolProfileUpdateCommand } from '@/application/commands/kol-profile-update/kol-profile-update.command';
import { NotFoundException } from '@nestjs/common';
import { KolProfileEntity } from '@/core/entities/kol-profile.entity';
import { KolPlatformInfo } from '@/core/value-objects/kol-platform-info.value-object';

describe('UpdateKolProfileHandler', () => {
  let handler: UpdateKolProfileHandler;
  let mockKolProfileRepository: any;

  beforeEach(() => {
    mockKolProfileRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    };
    handler = new UpdateKolProfileHandler(mockKolProfileRepository);
  });

  it('should update KOL profile successfully', async () => {
    const existingEntity = KolProfileEntity.create({
      name: 'John Doe',
      location: 'VN',
      gender: 'M',
      bio: 'old bio',
      email: 'john@doe.com',
      phone: '123456',
      isVerified: false,
      platforms: [],
    }, 'kol-123');

    mockKolProfileRepository.findById.mockResolvedValue(existingEntity);

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
    expect(mockKolProfileRepository.save).toHaveBeenCalled();
  });

  it('should throw NotFoundException if KOL profile not found', async () => {
    mockKolProfileRepository.findById.mockResolvedValue(null);

    const command = new KolProfileUpdateCommand('kol-123', {});
    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
  });
});
