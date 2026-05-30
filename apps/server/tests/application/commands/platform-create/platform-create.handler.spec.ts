import { CreatePlatformHandler } from '@/application/commands/platform-create/platform-create.handler';
import { PlatformCreateCommand } from '@/application/commands/platform-create/platform-create.command';
import { ConflictException } from '@nestjs/common';

describe('CreatePlatformHandler', () => {
  let handler: CreatePlatformHandler;
  let mockPlatformRepository: any;

  beforeEach(() => {
    mockPlatformRepository = {
      findByName: jest.fn(),
      save: jest.fn(),
    };
    handler = new CreatePlatformHandler(mockPlatformRepository);
  });

  it('should create platform successfully', async () => {
    const input = {
      name: 'Facebook',
      baseUrl: 'https://facebook.com',
      apiStatus: 'active',
    };
    const command = new PlatformCreateCommand(input as any);

    mockPlatformRepository.findByName.mockResolvedValue(null);

    const result = await handler.execute(command);

    expect(result).toBeDefined();
    expect(mockPlatformRepository.findByName).toHaveBeenCalledWith('Facebook');
    expect(mockPlatformRepository.save).toHaveBeenCalled();
    expect(result.name).toBe('facebook');
    expect(result.icon).toBeNull();
  });

  it('should throw ConflictException if platform name already exists', async () => {
    const input = {
      name: 'Facebook',
      baseUrl: 'https://facebook.com',
      apiStatus: 'active',
    };
    const command = new PlatformCreateCommand(input as any);

    mockPlatformRepository.findByName.mockResolvedValue({ id: 'existing-id' });

    await expect(handler.execute(command)).rejects.toThrow(ConflictException);
    expect(mockPlatformRepository.save).not.toHaveBeenCalled();
  });
});
