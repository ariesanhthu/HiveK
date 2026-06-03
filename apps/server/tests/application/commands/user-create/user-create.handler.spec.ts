import { UserCreateCommandHandler } from '@/application/commands/user-create/user-create.handler';
import { UserCreateCommand } from '@/application/commands/user-create/user-create.command';
import { ERoleType } from '@/core/enums';
import { UserConflictException } from '@/core/exceptions';

describe('UserCreateCommandHandler', () => {
  let handler: UserCreateCommandHandler;
  let mockUserRepository: any;
  let mockAuthService: any;

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: jest.fn(),
      save: jest.fn().mockImplementation((user: any) => {
        user.setId('some-user-id');
        return Promise.resolve();
      }),
    };
    mockAuthService = {
      normalizeEmail: jest.fn((email: string) => email.trim().toLowerCase()),
      hashPassword: jest.fn(() => Promise.resolve('hashed')),
    };
    handler = new UserCreateCommandHandler(mockUserRepository, mockAuthService);
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
    expect(result).toBeDefined();
    expect(mockAuthService.normalizeEmail).toHaveBeenCalledWith('admin@test.com');
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('admin@test.com');
    expect(mockAuthService.hashPassword).toHaveBeenCalledWith('password123');
    expect(mockUserRepository.save).toHaveBeenCalled();
  });

  it('should throw ConflictException if user already exists', async () => {
    mockUserRepository.findByEmail.mockResolvedValue({ id: 'existing-id' });

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
});
