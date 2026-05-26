import { EnterpriseGetByIdHandler } from '@/application/queries/enterprise-get-by-id/enterprise-get-by-id.handler';
import { EnterpriseGetByIdQuery } from '@/application/queries/enterprise-get-by-id/enterprise-get-by-id.query';

describe('EnterpriseGetByIdHandler', () => {
  let handler: EnterpriseGetByIdHandler;
  let mockEnterpriseReadService: any;

  beforeEach(() => {
    mockEnterpriseReadService = {
      findById: jest.fn(),
    };
    handler = new EnterpriseGetByIdHandler(mockEnterpriseReadService);
  });

  it('should return enterprise when found', async () => {
    const mockEnterprise = { id: 'ent-123', companyName: 'Enterprise 1' };
    mockEnterpriseReadService.findById.mockResolvedValue(mockEnterprise);

    const query = new EnterpriseGetByIdQuery('ent-123');
    const result = await handler.execute(query);

    expect(result).toEqual(mockEnterprise);
    expect(mockEnterpriseReadService.findById).toHaveBeenCalledWith('ent-123');
  });

  it('should throw error when enterprise not found', async () => {
    mockEnterpriseReadService.findById.mockResolvedValue(null);

    const query = new EnterpriseGetByIdQuery('ent-123');
    await expect(handler.execute(query)).rejects.toThrow('Enterprise not found');
  });
});
