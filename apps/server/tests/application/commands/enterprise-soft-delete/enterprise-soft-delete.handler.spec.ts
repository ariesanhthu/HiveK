import { EnterpriseSoftDeleteCommandHandler } from '@/application/commands/enterprise-soft-delete/enterprise-soft-delete.handler';
import { EnterpriseSoftDeleteCommand } from '@/application/commands/enterprise-soft-delete/enterprise-soft-delete.command';
import { EnterpriseNotFoundException, EnterpriseForbiddenException, InvalidOperationException } from '@/core/exceptions';

describe('EnterpriseSoftDeleteCommandHandler', () => {
  let handler: EnterpriseSoftDeleteCommandHandler;
  let mockEnterpriseRepository: any;
  let mockCampaignRepository: any;
  let mockUow: any;

  beforeEach(() => {
    mockEnterpriseRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    };
    mockCampaignRepository = {
      hasActiveCampaigns: jest.fn(),
    };
    mockUow = {
      execute: jest.fn((fn: any) => fn()),
    };
    handler = new EnterpriseSoftDeleteCommandHandler(
        mockEnterpriseRepository, 
        mockCampaignRepository, 
        mockUow
    );
  });

  it('should soft delete enterprise successfully if owned and no active campaigns', async () => {
    const mockEnterprise = {
      userId: 'owner-123',
      softDelete: jest.fn(),
    };
    mockEnterpriseRepository.findById.mockResolvedValue(mockEnterprise);
    mockCampaignRepository.hasActiveCampaigns.mockResolvedValue(false);

    const command = new EnterpriseSoftDeleteCommand('ent-123', 'owner-123', 'owner-123');
    await handler.execute(command);

    expect(mockEnterprise.softDelete).toHaveBeenCalledWith('owner-123');
    expect(mockEnterpriseRepository.save).toHaveBeenCalledWith(mockEnterprise);
  });

  it('should throw ForbiddenException if user is not owner', async () => {
    const mockEnterprise = {
      userId: 'owner-123',
    };
    mockEnterpriseRepository.findById.mockResolvedValue(mockEnterprise);

    const command = new EnterpriseSoftDeleteCommand('ent-123', 'wrong-user', 'any');
    await expect(handler.execute(command)).rejects.toThrow(EnterpriseForbiddenException);
  });

  it('should throw InvalidOperationException if enterprise has active campaigns', async () => {
    const mockEnterprise = {
      userId: 'owner-123',
    };
    mockEnterpriseRepository.findById.mockResolvedValue(mockEnterprise);
    mockCampaignRepository.hasActiveCampaigns.mockResolvedValue(true);

    const command = new EnterpriseSoftDeleteCommand('ent-123', 'owner-123', 'owner-123');
    await expect(handler.execute(command)).rejects.toThrow(InvalidOperationException);
  });

  it('should throw NotFoundException if enterprise not found', async () => {
    mockEnterpriseRepository.findById.mockResolvedValue(null);

    const command = new EnterpriseSoftDeleteCommand('ent-123', 'any', 'any');
    await expect(handler.execute(command)).rejects.toThrow(EnterpriseNotFoundException);
  });
});
