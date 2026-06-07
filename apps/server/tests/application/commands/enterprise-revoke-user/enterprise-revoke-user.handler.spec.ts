import { EnterpriseRevokeUserCommandHandler } from '@/application/commands/enterprise-revoke-user/enterprise-revoke-user.handler';
import { EnterpriseRevokeUserCommand } from '@/application/commands/enterprise-revoke-user/enterprise-revoke-user.command';
import { EnterpriseUserRoot } from '@/core/aggregate-roots';
import { ERoleType } from '@/core/enums';
import { UserNotFoundException, InvalidUserTypeException } from '@/core/exceptions';

describe('EnterpriseRevokeUserCommandHandler', () => {
  let handler: EnterpriseRevokeUserCommandHandler;
  let mockUserRepository: any;

  beforeEach(() => {
    mockUserRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    };
    handler = new EnterpriseRevokeUserCommandHandler(mockUserRepository);
  });

  it('should revoke user from enterprise successfully', async () => {
    const mockUser = EnterpriseUserRoot.instantiate('user-123', {
      email: 'test@ent.com',
      phone: '123',
      passwordHash: 'hash',
      fullName: 'Test User',
      type: ERoleType.ENTERPRISE,
      roleId: 'role-1',
      isEmailVerified: true,
      enterpriseIds: ['ent-1', 'ent-2'],
      createdAt: new Date(),
      updatedAt: new Date(),
      deleteAt: null,
      deleteBy: null,
      refreshToken: null,
      googleId: null,
    } as any);
    mockUserRepository.findById.mockResolvedValue(mockUser);

    const command = new EnterpriseRevokeUserCommand({ userId: 'user-123', enterpriseId: 'ent-1' });
    await handler.execute(command);

    expect(mockUser.enterpriseIds).not.toContain('ent-1');
    expect(mockUser.enterpriseIds).toContain('ent-2');
    expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
  });

  it('should throw UserNotFoundException if user does not exist', async () => {
    mockUserRepository.findById.mockResolvedValue(null);
    const command = new EnterpriseRevokeUserCommand({ userId: 'none', enterpriseId: 'ent-1' });
    await expect(handler.execute(command)).rejects.toThrow(UserNotFoundException);
  });

  it('should throw InvalidUserTypeException if user is not ENTERPRISE type', async () => {
    const mockUser = { type: ERoleType.KOL } as any;
    mockUserRepository.findById.mockResolvedValue(mockUser);

    const command = new EnterpriseRevokeUserCommand({ userId: 'user-kol', enterpriseId: 'ent-1' });
    await expect(handler.execute(command)).rejects.toThrow(InvalidUserTypeException);
  });
});
