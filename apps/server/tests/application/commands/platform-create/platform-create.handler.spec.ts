import { PlatformCreateCommand } from '@/application/commands/platform-create/platform-create.command';
import { PlatformCreateCommandHandler } from '@/application/commands/platform-create/platform-create.handler';
import { PlatformConflictException } from '@/core/exceptions';

describe('PlatformCreateCommandHandler', () => {
  let handler: PlatformCreateCommandHandler;
  let mockPlatformRepository: any;

  beforeEach(() => {
    mockPlatformRepository = {
      findByName: jest.fn(),
      save: jest.fn(),
    };
    handler = new PlatformCreateCommandHandler(mockPlatformRepository);
  });

  it('should create platform successfully', async () => {
    mockPlatformRepository.findByName.mockResolvedValue(null);

    const input = {
      name: 'Test Platform',
      baseUrl: 'https://test.com',
      apiStatus: 'STABLE',
    };

    const command = new PlatformCreateCommand(input as any);
    const result = await handler.execute(command);

    expect(result).toBeDefined();
    expect(mockPlatformRepository.findByName).toHaveBeenCalledWith('Test Platform');
    expect(mockPlatformRepository.save).toHaveBeenCalled();
  });

  it('should throw ConflictException if platform name already exists', async () => {
    mockPlatformRepository.findByName.mockResolvedValue({ id: 'existing-id' });

    const input = {
      name: 'Existing Platform',
      baseUrl: 'https://test.com',
    };

    const command = new PlatformCreateCommand(input as any);
    await expect(handler.execute(command)).rejects.toThrow(PlatformConflictException);
  });
});
