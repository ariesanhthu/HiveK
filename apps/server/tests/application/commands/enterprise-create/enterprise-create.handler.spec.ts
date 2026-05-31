import { EnterpriseCreateCommandHandler } from '@/application/commands/enterprise-create/enterprise-create.handler';
import { EnterpriseCreateCommand } from '@/application/commands/enterprise-create/enterprise-create.command';
import { EnterpriseConflictException } from '@/core/exceptions';

describe('EnterpriseCreateCommandHandler', () => {
  let handler: EnterpriseCreateCommandHandler;
  let mockEnterpriseRepository: any;

  beforeEach(() => {
    mockEnterpriseRepository = {
      findByUserId: jest.fn(),
      save: jest.fn(),
    };
    handler = new EnterpriseCreateCommandHandler(mockEnterpriseRepository);
  });

  it('should create enterprise successfully', async () => {
    mockEnterpriseRepository.findByUserId.mockResolvedValue(null);

    const input = {
      companyName: 'Test Company',
      description: 'Test Description',
      contactEmail: 'contact@test.com',
      contactPhone: '1234567890',
      website: 'https://test.com',
      taxId: 'TAX123',
    };

    const command = new EnterpriseCreateCommand('user-123', input);
    const result = await handler.execute(command);

    expect(result).toBeDefined();
    expect(result.companyName).toBe('Test Company');
    expect(result.userId).toBe('user-123');
    expect(mockEnterpriseRepository.findByUserId).toHaveBeenCalledWith('user-123');
    expect(mockEnterpriseRepository.save).toHaveBeenCalled();
  });

  it('should throw ConflictException if enterprise already exists for user', async () => {
    mockEnterpriseRepository.findByUserId.mockResolvedValue({});

    const input = {
      companyName: 'Test Company',
      description: 'Test Description',
      contactEmail: 'contact@test.com',
      contactPhone: '1234567890',
    };

    const command = new EnterpriseCreateCommand('user-123', input);
    await expect(handler.execute(command)).rejects.toThrow(EnterpriseConflictException);
  });
});
