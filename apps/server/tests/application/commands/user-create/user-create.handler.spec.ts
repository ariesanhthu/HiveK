import { UserCreateCommandHandler } from '@/application/commands/user-create/user-create.handler';
import { UserCreateCommand } from '@/application/commands/user-create/user-create.command';
import { ERoleType } from '@/core/enums';
import { UserConflictException } from '@/core/exceptions';
import { EnterpriseUserRoot } from '@/core/aggregate-roots';

describe('UserCreateCommandHandler', () => {
  let handler: UserCreateCommandHandler;
  let mockUserRepository: any;
  let mockAuthService: any;
  let mockUow: any;

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: jest.fn(),
      save: jest.fn().mockImplementation(async (user: any) => {
        if (!user.id) user.setId('generated-user-id');
      }),
    };
    mockAuthService = {
      normalizeEmail: jest.fn().mockImplementation((e) => e),
      hashPassword: jest.fn().mockResolvedValue('hashedPassword'),
    };
    mockUow = {
        execute: jest.fn((fn: any) => fn()),
    };
    handler = new UserCreateCommandHandler(
      mockUserRepository,
      mockAuthService,
      mockUow,
    );
  });

  it('should successfully create a new admin user', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);

    const command = new UserCreateCommand({
      email: 'admin@test.com',
      password: 'password123',
      fullName: 'Test Admin',
      type: ERoleType.ADMIN,
      roleId: 'role-123',
      phone: '1234567890',
    });

    const result = await handler.execute(command);

    expect(result).toBe('generated-user-id');
    expect(mockUserRepository.save).toHaveBeenCalled();
  });

  it('should throw ConflictException if user already exists', async () => {
    mockUserRepository.findByEmail.mockResolvedValue({ id: 'existing' });

    const command = new UserCreateCommand({
      email: 'admin@test.com',
      password: 'password123',
      fullName: 'Test Admin',
      type: ERoleType.ADMIN,
      roleId: 'role-123',
      phone: '1234567890',
    });

    await expect(handler.execute(command)).rejects.toThrow(UserConflictException);
  });

  it('should successfully create a new enterprise user with enterpriseIds', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);

    const command = new UserCreateCommand({
      email: 'ent@test.com',
      password: 'password123',
      fullName: 'Test Enterprise',
      type: ERoleType.ENTERPRISE,
      roleId: 'role-ent',
      phone: '1234567890',
      enterpriseIds: ['ent-1'],
    } as any);

    const result = await handler.execute(command);
    expect(result).toBe('generated-user-id');
    expect(mockUserRepository.save).toHaveBeenCalled();
    const savedUser = mockUserRepository.save.mock.calls[0][0];
    expect(savedUser.enterpriseIds).toContain('ent-1');
  });
});
