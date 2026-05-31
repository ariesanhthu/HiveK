import { KolProfileGetByIdHandler } from '@/application/queries/kol-profile-get-by-id/kol-profile-get-by-id.handler';
import { KolProfileGetByIdQuery } from '@/application/queries/kol-profile-get-by-id/kol-profile-get-by-id.query';
import { UserNotFoundException } from '@/core/exceptions';

describe('KolProfileGetByIdHandler', () => {
  let handler: KolProfileGetByIdHandler;
  let mockKolProfileReadService: any;

  beforeEach(() => {
    mockKolProfileReadService = {
      findById: jest.fn(),
    };
    handler = new KolProfileGetByIdHandler(mockKolProfileReadService);
  });

  it('should return profile when found', async () => {
    const mockProfile = { id: 'kol-123', name: 'John Doe' };
    mockKolProfileReadService.findById.mockResolvedValue(mockProfile);

    const query = new KolProfileGetByIdQuery('kol-123');
    const result = await handler.execute(query);

    expect(result).toEqual(mockProfile);
    expect(mockKolProfileReadService.findById).toHaveBeenCalledWith('kol-123');
  });

  it('should throw NotFoundException when profile not found', async () => {
    mockKolProfileReadService.findById.mockResolvedValue(null);

    const query = new KolProfileGetByIdQuery('kol-123');
    await expect(handler.execute(query)).rejects.toThrow(UserNotFoundException);
  });
});
