import { EnterpriseHardDeleteCommandHandler } from '@/application/commands/enterprise-hard-delete/enterprise-hard-delete.handler';
import { EnterpriseHardDeleteCommand } from '@/application/commands/enterprise-hard-delete/enterprise-hard-delete.command';
import { EnterpriseNotFoundException } from '@/core/exceptions';

describe('EnterpriseHardDeleteCommandHandler', () => {
  let handler: EnterpriseHardDeleteCommandHandler;
  let mockEnterpriseRepository: any;

  beforeEach(() => {
    mockEnterpriseRepository = {
      findById: jest.fn(),
      delete: jest.fn(),
    };
    handler = new EnterpriseHardDeleteCommandHandler(mockEnterpriseRepository);
  });

  it('should hard delete enterprise successfully', async () => {
    const mockEnterprise = { _id: 'ent-123' };
    mockEnterpriseRepository.findById.mockResolvedValue(mockEnterprise);

    const command = new EnterpriseHardDeleteCommand('ent-123');
    await handler.execute(command);

    expect(mockEnterpriseRepository.findById).toHaveBeenCalledWith('ent-123');
    expect(mockEnterpriseRepository.delete).toHaveBeenCalledWith('ent-123');
  });

  it('should throw NotFoundException if enterprise not found', async () => {
    mockEnterpriseRepository.findById.mockResolvedValue(null);

    const command = new EnterpriseHardDeleteCommand('ent-123');
    await expect(handler.execute(command)).rejects.toThrow(EnterpriseNotFoundException);
  });
});
