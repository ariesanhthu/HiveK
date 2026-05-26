import { KolProfileRestoreCommandHandler } from '@/application/commands/kol-profile-restore/kol-profile-restore.handler';
import { KolProfileRestoreCommand } from '@/application/commands/kol-profile-restore/kol-profile-restore.command';
import { NotFoundException } from '@nestjs/common';

describe('KolProfileRestoreCommandHandler', () => {
  let handler: KolProfileRestoreCommandHandler;
  let mockKolProfileRepository: any;

  beforeEach(() => {
    mockKolProfileRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    };
    handler = new KolProfileRestoreCommandHandler(mockKolProfileRepository);
  });

  it('should restore KOL profile successfully', async () => {
    const mockProfile = {
      restore: jest.fn(),
    };
    mockKolProfileRepository.findById.mockResolvedValue(mockProfile);

    const command = new KolProfileRestoreCommand('kol-123');
    await handler.execute(command);

    expect(mockKolProfileRepository.findById).toHaveBeenCalledWith('kol-123');
    expect(mockProfile.restore).toHaveBeenCalled();
    expect(mockKolProfileRepository.save).toHaveBeenCalledWith(mockProfile);
  });

  it('should throw NotFoundException if KOL profile not found', async () => {
    mockKolProfileRepository.findById.mockResolvedValue(null);

    const command = new KolProfileRestoreCommand('kol-123');
    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
  });
});
