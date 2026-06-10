import { KolProfileUpdateCommandHandler } from '@/application/commands/kol-profile-update/kol-profile-update.handler';
import { KolProfileUpdateCommand } from '@/application/commands/kol-profile-update/kol-profile-update.command';
import { UserNotFoundException } from '@/core/exceptions';

describe('KolProfileUpdateCommandHandler', () => {
  let handler: KolProfileUpdateCommandHandler;
  let mockKolProfileRepository: any;

  beforeEach(() => {
    mockKolProfileRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    };
    handler = new KolProfileUpdateCommandHandler(mockKolProfileRepository);
  });

  it('should update KOL profile successfully', async () => {
    const mockProfile = {
      id: 'profile-123',
      props: {
        name: 'Old Name',
      },
    };
    mockKolProfileRepository.findById.mockResolvedValue(mockProfile);

    const input = { name: 'New Name' };
    const command = new KolProfileUpdateCommand('profile-123', input as any);
    const result = await handler.execute(command);

    expect(result).toBeDefined();
    expect(mockKolProfileRepository.findById).toHaveBeenCalledWith('profile-123');
    expect(mockKolProfileRepository.save).toHaveBeenCalled();
  });

  it('should throw NotFoundException if KOL profile not found', async () => {
    mockKolProfileRepository.findById.mockResolvedValue(null);

    const command = new KolProfileUpdateCommand('profile-123', {});
    await expect(handler.execute(command)).rejects.toThrow(UserNotFoundException);
  });
});
