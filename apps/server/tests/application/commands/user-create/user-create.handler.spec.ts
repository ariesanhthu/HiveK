import { UserCreateCommandHandler } from '@/application/commands/user-create/user-create.handler';
import { UserCreateCommand } from '@/application/commands/user-create/user-create.command';
import { ERoleType } from '@/core/enums';
import { ConflictException } from '@nestjs/common';

describe('UserCreateCommandHandler', () => {
  let handler: UserCreateCommandHandler;
  let mockUserRepository: any;

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: jest.fn(),
      save: jest.fn().mockImplementation((user: any) => {
        user.setId('some-user-id');
        return Promise.resolve();
      }),
    };
    handler = new UserCreateCommandHandler(mockUserRepository);
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
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('admin@test.com');
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

    await expect(handler.execute(command)).rejects.toThrow(ConflictException);
  });
});
