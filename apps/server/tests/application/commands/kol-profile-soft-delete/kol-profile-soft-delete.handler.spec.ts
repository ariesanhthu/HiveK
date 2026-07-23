import { KolProfileSoftDeleteCommand } from '@/application/commands/kol-profile-soft-delete/kol-profile-soft-delete.command';
import { KolProfileSoftDeleteCommandHandler } from '@/application/commands/kol-profile-soft-delete/kol-profile-soft-delete.handler';
import { UserNotFoundException } from '@/core/exceptions';

describe('KolProfileSoftDeleteCommandHandler', () => {
  let handler: KolProfileSoftDeleteCommandHandler;
  let mockKolProfileRepository: any;

  beforeEach(() => {
    mockKolProfileRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    };
    handler = new KolProfileSoftDeleteCommandHandler(mockKolProfileRepository);
  });

  it('should soft delete KOL profile successfully', async () => {
    const mockProfile = {
      softDelete: jest.fn(),
    };
    mockKolProfileRepository.findById.mockResolvedValue(mockProfile);

    const command = new KolProfileSoftDeleteCommand('kol-123', 'admin');
    await handler.execute(command);

    expect(mockKolProfileRepository.findById).toHaveBeenCalledWith('kol-123');
    expect(mockProfile.softDelete).toHaveBeenCalledWith('admin');
    expect(mockKolProfileRepository.save).toHaveBeenCalledWith(mockProfile);
  });

  it('should throw NotFoundException if KOL profile not found', async () => {
    mockKolProfileRepository.findById.mockResolvedValue(null);

    const command = new KolProfileSoftDeleteCommand('kol-123', 'admin');
    await expect(handler.execute(command)).rejects.toThrow(UserNotFoundException);
  });
});
