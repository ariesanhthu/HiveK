import { UserCheckValidCommand } from '@/application/commands/user-check-valid/user-check-valid.command';
import { UserCheckValidCommandHandler } from '@/application/commands/user-check-valid/user-check-valid.handler';
import { KOLUserRoot } from '@/core/aggregate-roots';
import { ERoleType } from '@/core/enums';
import { UserNotFoundException } from '@/core/exceptions';
import { PhoneNumberVO } from '@/core/value-objects/phone-number.value-object';

describe('UserCheckValidCommandHandler', () => {
  let handler: UserCheckValidCommandHandler;
  let mockUserRepository: any;

  beforeEach(() => {
    mockUserRepository = {
      findById: jest.fn(),
    };
    handler = new UserCheckValidCommandHandler(mockUserRepository);
  });

  const userId = 'user-123';

  const createMockUser = (deleteAt: Date | null = null) => {
    return KOLUserRoot.instantiate(userId, {
      email: 'test@example.com',
      phone: PhoneNumberVO.create({ value: '+84123456789' }),
      passwordHash: 'hash',
      fullName: 'Test User',
      type: ERoleType.KOL,
      roleId: 'role-1',
      isEmailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      deleteAt,
      deleteBy: null,
      refreshToken: null,
      googleId: null,
    } as any);
  };

  it('should return user DTO if user is valid', async () => {
    const user = createMockUser();
    mockUserRepository.findById.mockResolvedValue(user);

    const command = new UserCheckValidCommand({ id: userId });
    const result = await handler.execute(command);

    expect(result).toBeDefined();
    expect(result.id).toBe(userId);
  });

  it('should throw UserNotFoundException if user does not exist', async () => {
    mockUserRepository.findById.mockResolvedValue(null);
    const command = new UserCheckValidCommand({ id: userId });

    await expect(handler.execute(command)).rejects.toThrow(UserNotFoundException);
  });

  it('should throw UserNotFoundException if user is soft deleted', async () => {
    const user = createMockUser(new Date());
    mockUserRepository.findById.mockResolvedValue(user);

    const command = new UserCheckValidCommand({ id: userId });

    await expect(handler.execute(command)).rejects.toThrow(UserNotFoundException);
  });
});
