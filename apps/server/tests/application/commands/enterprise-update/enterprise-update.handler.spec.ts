import { EnterpriseUpdateCommandHandler } from '@/application/commands/enterprise-update/enterprise-update.handler';
import { EnterpriseUpdateCommand } from '@/application/commands/enterprise-update/enterprise-update.command';
import { EnterpriseNotFoundException, EnterpriseForbiddenException } from '@/core/exceptions';

describe('EnterpriseUpdateCommandHandler', () => {
  let handler: EnterpriseUpdateCommandHandler;
  let mockEnterpriseRepository: any;
  let mockUploadedFileRepository: any;

  beforeEach(() => {
    mockEnterpriseRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    };
    mockUploadedFileRepository = {
      findById: jest.fn(),
    };
    handler = new EnterpriseUpdateCommandHandler(mockEnterpriseRepository, mockUploadedFileRepository);
  });

  it('should update enterprise successfully if owned by current user', async () => {
    const mockEnterprise = {
      userId: 'user-123',
      id: 'ent-123',
      companyName: 'Old Name',
      description: 'Old Description',
      contactEmail: 'old@test.com',
      contactPhone: '0000000000',
      website: 'https://old.com',
      taxId: 'TAXOLD',
      logoUrlId: 'logo-old',
      isVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      update: jest.fn(),
    };

    mockEnterpriseRepository.findById.mockResolvedValue(mockEnterprise);
    mockUploadedFileRepository.findById.mockResolvedValue({});

    const input = {
      companyName: 'New Name',
      description: 'New Description',
      logoUrlId: 'logo-new',
    };

    const command = new EnterpriseUpdateCommand('ent-123', 'user-123', input);
    const result = await handler.execute(command);

    expect(result).toBeDefined();
    expect(mockEnterpriseRepository.findById).toHaveBeenCalledWith('ent-123');
    expect(mockUploadedFileRepository.findById).toHaveBeenCalledWith('logo-new');
    expect(mockEnterprise.update).toHaveBeenCalledWith(expect.objectContaining({
      companyName: 'New Name',
      description: 'New Description',
      logoUrlId: 'logo-new',
    }));
    expect(mockEnterpriseRepository.save).toHaveBeenCalledWith(mockEnterprise);
  });

  it('should throw NotFoundException if enterprise not found', async () => {
    mockEnterpriseRepository.findById.mockResolvedValue(null);

    const command = new EnterpriseUpdateCommand('ent-123', 'user-123', {});
    await expect(handler.execute(command)).rejects.toThrow(EnterpriseNotFoundException);
  });

  it('should throw ForbiddenException if enterprise not owned by user', async () => {
    const mockEnterprise = {
      userId: 'user-other',
      id: 'ent-123',
    };
    mockEnterpriseRepository.findById.mockResolvedValue(mockEnterprise);

    const command = new EnterpriseUpdateCommand('ent-123', 'user-123', {});
    await expect(handler.execute(command)).rejects.toThrow(EnterpriseForbiddenException);
  });
});
