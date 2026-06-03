import { KolProfileVerifyPlatformAccountHandler } from '@/application/commands/kol-profile-verify-platform-account/kol-profile-verify-platform-account.handler';
import { KolProfileVerifyPlatformAccountCommand } from '@/application/commands/kol-profile-verify-platform-account/kol-profile-verify-platform-account.command';
import { KolProfileEntity } from '@/core/entities/kol-profile.entity';
import { KolPlatformInfo } from '@/core/value-objects/kol-platform-info.value-object';

describe('KolProfileVerifyPlatformAccountHandler', () => {
  let handler: KolProfileVerifyPlatformAccountHandler;
  let mockKolProfileRepository: any;
  let mockMqService: any;

  beforeEach(() => {
    mockKolProfileRepository = {
      findById: jest.fn(),
      findByPlatformInfo: jest.fn(),
      findByUserId: jest.fn(),
      save: jest.fn(),
    };
    mockMqService = {
      emit: jest.fn(),
      send: jest.fn(),
    };
    handler = new KolProfileVerifyPlatformAccountHandler(mockKolProfileRepository, mockMqService);
  });

  it('should link user to existing profile found by platform info', async () => {
    const mockProfile = KolProfileEntity.create({
      userId: null,
      verificationType: null,
      name: 'Existing KOL',
      location: 'VN',
      gender: 'male',
      bio: 'test bio',
      email: 'test@example.com',
      phone: '123456',
      platforms: [],
      isVerified: false,
    }, 'profile-123');

    mockKolProfileRepository.findByPlatformInfo.mockResolvedValue(mockProfile);

    const command = new KolProfileVerifyPlatformAccountCommand(
      'user-456',
      'youtube',
      'ext-id',
      'unique-id',
      'Display Name',
      'test@example.com',
    );

    const result = await handler.execute(command);

    expect(mockKolProfileRepository.findByPlatformInfo).toHaveBeenCalledWith('youtube', 'ext-id');
    expect(mockKolProfileRepository.save).toHaveBeenCalledWith(mockProfile);
    expect(result.userId).toBe('user-456');
    expect(result.verificationType).toBe('OAUTH');
    expect(result.isVerified).toBe(true);
    expect(mockMqService.emit).not.toHaveBeenCalled();
  });

  it('should add platform to user\'s existing profile if profile exists by userId', async () => {
    const mockProfile = KolProfileEntity.create({
      userId: 'user-456',
      verificationType: null,
      name: 'Existing User KOL',
      location: 'VN',
      gender: 'male',
      bio: 'test bio',
      email: 'test@example.com',
      phone: '123456',
      platforms: [],
      isVerified: false,
    }, 'profile-123');

    mockKolProfileRepository.findByPlatformInfo.mockResolvedValue(null);
    mockKolProfileRepository.findByUserId.mockResolvedValue(mockProfile);

    const command = new KolProfileVerifyPlatformAccountCommand(
      'user-456',
      'youtube',
      'ext-id',
      'unique-id',
      'Display Name',
      'test@example.com',
    );

    const result = await handler.execute(command);

    expect(mockKolProfileRepository.findByPlatformInfo).toHaveBeenCalledWith('youtube', 'ext-id');
    expect(mockKolProfileRepository.findByUserId).toHaveBeenCalledWith('user-456');
    expect(mockKolProfileRepository.save).toHaveBeenCalledWith(mockProfile);
    expect(result.platforms.length).toBe(1);
    expect(result.platforms[0].platformId).toBe('youtube');
    expect(mockMqService.emit).toHaveBeenCalledWith('crawl_platform_data', {
      platformId: 'youtube',
      externalId: 'ext-id',
      uniqueId: 'unique-id',
      kolProfileId: 'profile-123',
    });
  });

  it('should create new KOL profile when no profiles exist', async () => {
    mockKolProfileRepository.findByPlatformInfo.mockResolvedValue(null);
    mockKolProfileRepository.findByUserId.mockResolvedValue(null);
    mockKolProfileRepository.save.mockImplementation(async (entity: KolProfileEntity) => {
      entity.setId('new-profile-789');
    });

    const command = new KolProfileVerifyPlatformAccountCommand(
      'user-456',
      'youtube',
      'ext-id',
      'unique-id',
      'Display Name',
      'test@example.com',
    );

    const result = await handler.execute(command);

    expect(mockKolProfileRepository.findByPlatformInfo).toHaveBeenCalledWith('youtube', 'ext-id');
    expect(mockKolProfileRepository.findByUserId).toHaveBeenCalledWith('user-456');
    expect(mockKolProfileRepository.save).toHaveBeenCalled();
    expect(result.id).toBe('new-profile-789');
    expect(result.userId).toBe('user-456');
    expect(result.verificationType).toBe('OAUTH');
    expect(result.isVerified).toBe(true);
    expect(result.platforms.length).toBe(1);
    expect(result.platforms[0].platformId).toBe('youtube');
    expect(mockMqService.emit).toHaveBeenCalledWith('crawl_platform_data', {
      platformId: 'youtube',
      externalId: 'ext-id',
      uniqueId: 'unique-id',
      kolProfileId: 'new-profile-789',
    });
  });
});
