import { CreatePlatformHandler } from '@/application/commands/platform-create/platform-create.handler';
import { PlatformCreateCommand } from '@/application/commands/platform-create/platform-create.command';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('CreatePlatformHandler', () => {
  let handler: CreatePlatformHandler;
  let mockPlatformRepository: any;
  let mockUploadedFileRepository: any;

  beforeEach(() => {
    mockPlatformRepository = {
      findByName: jest.fn(),
      save: jest.fn(),
    };
    mockUploadedFileRepository = {
      findById: jest.fn(),
    };
    handler = new CreatePlatformHandler(mockPlatformRepository, mockUploadedFileRepository);
  });

  it('should create platform successfully', async () => {
    const input = {
      name: 'Facebook',
      baseUrl: 'https://facebook.com',
      apiStatus: 'active',
      icon: 'icon-123',
    };
    const command = new PlatformCreateCommand(input as any);

    mockPlatformRepository.findByName.mockResolvedValue(null);
    mockUploadedFileRepository.findById.mockResolvedValue({});

    const result = await handler.execute(command);

    expect(result).toBeDefined();
    expect(mockPlatformRepository.findByName).toHaveBeenCalledWith('Facebook');
    expect(mockUploadedFileRepository.findById).toHaveBeenCalledWith('icon-123');
    expect(mockPlatformRepository.save).toHaveBeenCalled();
    expect(result.name).toBe('facebook');
  });

  it('should throw ConflictException if platform name already exists', async () => {
    const input = {
      name: 'Facebook',
      baseUrl: 'https://facebook.com',
      apiStatus: 'active',
      icon: 'icon-123',
    };
    const command = new PlatformCreateCommand(input as any);

    mockPlatformRepository.findByName.mockResolvedValue({ id: 'existing-id' });

    await expect(handler.execute(command)).rejects.toThrow(ConflictException);
    expect(mockPlatformRepository.save).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException if icon file not found', async () => {
    const input = {
      name: 'Facebook',
      baseUrl: 'https://facebook.com',
      apiStatus: 'active',
      icon: 'icon-not-found',
    };
    const command = new PlatformCreateCommand(input as any);

    mockPlatformRepository.findByName.mockResolvedValue(null);
    mockUploadedFileRepository.findById.mockResolvedValue(null);

    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
    expect(mockPlatformRepository.save).not.toHaveBeenCalled();
  });
});
