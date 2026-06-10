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
      phone: '+841234567890',
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
      phone: '+841234567890',
    });

    await expect(handler.execute(command)).rejects.toThrow(UserConflictException);
  });
});
