import { EnterpriseCreateCommandHandler } from '@/application/commands/enterprise-create/enterprise-create.handler';
import { EnterpriseCreateCommand } from '@/application/commands/enterprise-create/enterprise-create.command';
import { EnterpriseConflictException } from '@/core/exceptions';
import { EnterpriseUserRoot } from '@/core/aggregate-roots';
import { ERoleType } from '@/core/enums';

describe('EnterpriseCreateCommandHandler', () => {
  let handler: EnterpriseCreateCommandHandler;
  let mockEnterpriseRepository: any;
  let mockUserRepository: any;
  let mockUow: any;

  beforeEach(() => {
    mockEnterpriseRepository = {
      findByUserId: jest.fn(),
      save: jest.fn().mockImplementation(async (ent: any) => {
        if (!ent.id) ent.setId('generated-ent-id');
      }),
    };
    mockUserRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    };
    mockUow = {
        execute: jest.fn((fn: any) => fn()),
    };
    handler = new EnterpriseCreateCommandHandler(mockEnterpriseRepository, mockUserRepository, mockUow);
  });

  it('should create enterprise successfully and associate with user', async () => {
    mockEnterpriseRepository.findByUserId.mockResolvedValue(null);
    const mockUser = EnterpriseUserRoot.create({
        email: 'ent@test.com',
        phone: '123',
        passwordHash: 'hash',
        fullName: 'Ent User',
        type: ERoleType.ENTERPRISE,
        roleId: 'role-ent',
        isEmailVerified: true,
    });
    mockUser.setId('user-123');
    mockUserRepository.findById.mockResolvedValue(mockUser);

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
    expect(mockUser.enterpriseIds).toContain('generated-ent-id');
    expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
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
