import { EnterpriseSoftDeleteCommandHandler } from '@/application/commands/enterprise-soft-delete/enterprise-soft-delete.handler';
import { EnterpriseSoftDeleteCommand } from '@/application/commands/enterprise-soft-delete/enterprise-soft-delete.command';
import { NotFoundException } from '@nestjs/common';

describe('EnterpriseSoftDeleteCommandHandler', () => {
  let handler: EnterpriseSoftDeleteCommandHandler;
  let mockEnterpriseRepository: any;

  beforeEach(() => {
    mockEnterpriseRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    };
    handler = new EnterpriseSoftDeleteCommandHandler(mockEnterpriseRepository);
  });

  it('should soft delete enterprise successfully', async () => {
    const mockEnterprise = {
      softDelete: jest.fn(),
    };
    mockEnterpriseRepository.findById.mockResolvedValue(mockEnterprise);

    const command = new EnterpriseSoftDeleteCommand('ent-123', 'admin');
    await handler.execute(command);

    expect(mockEnterpriseRepository.findById).toHaveBeenCalledWith('ent-123');
    expect(mockEnterprise.softDelete).toHaveBeenCalledWith('admin');
    expect(mockEnterpriseRepository.save).toHaveBeenCalledWith(mockEnterprise);
  });

  it('should throw NotFoundException if enterprise not found', async () => {
    mockEnterpriseRepository.findById.mockResolvedValue(null);

    const command = new EnterpriseSoftDeleteCommand('ent-123', 'admin');
    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
  });
});
