import { EnterpriseAddUserCommandHandler } from '@/application/commands/enterprise-add-user/enterprise-add-user.handler';
import { EnterpriseAddUserCommand } from '@/application/commands/enterprise-add-user/enterprise-add-user.command';
import { EnterpriseUserRoot } from '@/core/aggregate-roots';
import { ERoleType } from '@/core/enums';
import { UserNotFoundException, InvalidUserTypeException } from '@/core/exceptions';
import { UserAddedToEnterpriseEvent } from '@/application/events';

describe('EnterpriseAddUserCommandHandler', () => {
  let handler: EnterpriseAddUserCommandHandler;
  let mockUserRepository: any;
  let mockEventBus: any;

  beforeEach(() => {
    mockUserRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    };
    mockEventBus = {
      publish: jest.fn(),
    };
    handler = new EnterpriseAddUserCommandHandler(mockUserRepository, mockEventBus);
  });

  it('should add user to enterprise successfully and publish event', async () => {
    const mockUser = EnterpriseUserRoot.create({
      email: 'test@ent.com',
      phone: '123',
      passwordHash: 'hash',
      fullName: 'Test User',
      type: ERoleType.ENTERPRISE,
      roleId: 'role-1',
      isEmailVerified: true,
    });
    mockUser.setId('user-123');
    mockUserRepository.findById.mockResolvedValue(mockUser);

    const command = new EnterpriseAddUserCommand({ userId: 'user-123', enterpriseId: 'ent-1' });
    await handler.execute(command);

    expect(mockUser.enterpriseIds).toContain('ent-1');
    expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
    expect(mockEventBus.publish).toHaveBeenCalledWith(expect.any(UserAddedToEnterpriseEvent));
  });

  it('should ignore if user is already in the enterprise', async () => {
    const mockUser = EnterpriseUserRoot.instantiate('user-123', {
      email: 'test@ent.com',
      phone: '123',
      passwordHash: 'hash',
      fullName: 'Test User',
      type: ERoleType.ENTERPRISE,
      roleId: 'role-1',
      isEmailVerified: true,
      enterpriseIds: ['ent-1'],
      createdAt: new Date(),
      updatedAt: new Date(),
      deleteAt: null,
      deleteBy: null,
      refreshToken: null,
      googleId: null,
    } as any);
    mockUserRepository.findById.mockResolvedValue(mockUser);

    const command = new EnterpriseAddUserCommand({ userId: 'user-123', enterpriseId: 'ent-1' });
    await handler.execute(command);

    expect(mockUserRepository.save).not.toHaveBeenCalled();
    expect(mockEventBus.publish).not.toHaveBeenCalled();
  });

  it('should throw UserNotFoundException if user does not exist', async () => {
    mockUserRepository.findById.mockResolvedValue(null);
    const command = new EnterpriseAddUserCommand({ userId: 'none', enterpriseId: 'ent-1' });
    await expect(handler.execute(command)).rejects.toThrow(UserNotFoundException);
  });

  it('should throw InvalidUserTypeException if user is not ENTERPRISE type', async () => {
    const mockUser = { type: ERoleType.KOL } as any;
    mockUserRepository.findById.mockResolvedValue(mockUser);

    const command = new EnterpriseAddUserCommand({ userId: 'user-kol', enterpriseId: 'ent-1' });
    await expect(handler.execute(command)).rejects.toThrow(InvalidUserTypeException);
  });
});
