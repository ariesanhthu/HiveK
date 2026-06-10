import { KolProfileHardDeleteCommandHandler } from '@/application/commands/kol-profile-hard-delete/kol-profile-hard-delete.handler';
import { KolProfileHardDeleteCommand } from '@/application/commands/kol-profile-hard-delete/kol-profile-hard-delete.command';
import { UserNotFoundException } from '@/core/exceptions';

describe('KolProfileHardDeleteCommandHandler', () => {
  let handler: KolProfileHardDeleteCommandHandler;
  let mockKolProfileRepository: any;

  beforeEach(() => {
    mockKolProfileRepository = {
      findById: jest.fn(),
      delete: jest.fn(),
    };
    handler = new KolProfileHardDeleteCommandHandler(mockKolProfileRepository);
  });

  it('should hard delete KOL profile successfully', async () => {
    const mockProfile = { _id: 'kol-123' };
    mockKolProfileRepository.findById.mockResolvedValue(mockProfile);

    const command = new KolProfileHardDeleteCommand('kol-123');
    await handler.execute(command);

    expect(mockKolProfileRepository.findById).toHaveBeenCalledWith('kol-123');
    expect(mockKolProfileRepository.delete).toHaveBeenCalledWith('kol-123');
  });

  it('should throw NotFoundException if KOL profile not found', async () => {
    mockKolProfileRepository.findById.mockResolvedValue(null);

    const command = new KolProfileHardDeleteCommand('kol-123');
    await expect(handler.execute(command)).rejects.toThrow(UserNotFoundException);
  });
});
