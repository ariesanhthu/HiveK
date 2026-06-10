import { EnterpriseRestoreCommandHandler } from '@/application/commands/enterprise-restore/enterprise-restore.handler';
import { EnterpriseRestoreCommand } from '@/application/commands/enterprise-restore/enterprise-restore.command';
import { EnterpriseNotFoundException } from '@/core/exceptions';

describe('EnterpriseRestoreCommandHandler', () => {
  let handler: EnterpriseRestoreCommandHandler;
  let mockEnterpriseRepository: any;

  beforeEach(() => {
    mockEnterpriseRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    };
    handler = new EnterpriseRestoreCommandHandler(mockEnterpriseRepository);
  });

  it('should restore enterprise successfully', async () => {
    const mockEnterprise = {
      restore: jest.fn(),
    };
    mockEnterpriseRepository.findById.mockResolvedValue(mockEnterprise);

    const command = new EnterpriseRestoreCommand('ent-123');
    await handler.execute(command);

    expect(mockEnterpriseRepository.findById).toHaveBeenCalledWith('ent-123');
    expect(mockEnterprise.restore).toHaveBeenCalled();
    expect(mockEnterpriseRepository.save).toHaveBeenCalledWith(mockEnterprise);
  });

  it('should throw NotFoundException if enterprise not found', async () => {
    mockEnterpriseRepository.findById.mockResolvedValue(null);

    const command = new EnterpriseRestoreCommand('ent-123');
    await expect(handler.execute(command)).rejects.toThrow(EnterpriseNotFoundException);
  });
});
