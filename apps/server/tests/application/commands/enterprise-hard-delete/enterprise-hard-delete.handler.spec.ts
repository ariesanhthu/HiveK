import { EnterpriseHardDeleteCommandHandler } from '@/application/commands/enterprise-hard-delete/enterprise-hard-delete.handler';
import { EnterpriseHardDeleteCommand } from '@/application/commands/enterprise-hard-delete/enterprise-hard-delete.command';
import { EnterpriseNotFoundException, EnterpriseForbiddenException, InvalidOperationException } from '@/core/exceptions';

describe('EnterpriseHardDeleteCommandHandler', () => {
  let handler: EnterpriseHardDeleteCommandHandler;
  let mockEnterpriseRepository: any;
  let mockCampaignRepository: any;
  let mockUow: any;

  beforeEach(() => {
    mockEnterpriseRepository = {
      findById: jest.fn(),
      delete: jest.fn(),
    };
    mockCampaignRepository = {
        hasActiveCampaigns: jest.fn(),
        findByEnterpriseId: jest.fn(),
        delete: jest.fn(),
    };
    mockUow = {
        execute: jest.fn((fn: any) => fn()),
    };
    handler = new EnterpriseHardDeleteCommandHandler(
        mockEnterpriseRepository, 
        mockCampaignRepository, 
        mockUow
    );
  });

  it('should hard delete enterprise successfully if owned and no active campaigns', async () => {
    const mockEnterprise = { id: 'ent-123', userId: 'owner-123' };
    mockEnterpriseRepository.findById.mockResolvedValue(mockEnterprise);
    mockCampaignRepository.hasActiveCampaigns.mockResolvedValue(false);
    mockCampaignRepository.findByEnterpriseId.mockResolvedValue([]);

    const command = new EnterpriseHardDeleteCommand('ent-123', 'owner-123');
    await handler.execute(command);

    expect(mockEnterpriseRepository.findById).toHaveBeenCalledWith('ent-123');
    expect(mockEnterpriseRepository.delete).toHaveBeenCalledWith('ent-123');
  });

  it('should throw ForbiddenException if user is not owner', async () => {
    const mockEnterprise = { id: 'ent-123', userId: 'owner-123' };
    mockEnterpriseRepository.findById.mockResolvedValue(mockEnterprise);

    const command = new EnterpriseHardDeleteCommand('ent-123', 'wrong-user');
    await expect(handler.execute(command)).rejects.toThrow(EnterpriseForbiddenException);
  });

  it('should throw InvalidOperationException if enterprise has active campaigns', async () => {
    const mockEnterprise = { id: 'ent-123', userId: 'owner-123' };
    mockEnterpriseRepository.findById.mockResolvedValue(mockEnterprise);
    mockCampaignRepository.hasActiveCampaigns.mockResolvedValue(true);

    const command = new EnterpriseHardDeleteCommand('ent-123', 'owner-123');
    await expect(handler.execute(command)).rejects.toThrow(InvalidOperationException);
  });

  it('should throw NotFoundException if enterprise not found', async () => {
    mockEnterpriseRepository.findById.mockResolvedValue(null);

    const command = new EnterpriseHardDeleteCommand('ent-123', 'owner-123');
    await expect(handler.execute(command)).rejects.toThrow(EnterpriseNotFoundException);
  });
});
