import { EnterpriseRevokeUserCommandHandler } from '@/application/commands/enterprise-revoke-user/enterprise-revoke-user.handler';
import { EnterpriseRevokeUserCommand } from '@/application/commands/enterprise-revoke-user/enterprise-revoke-user.command';
import { EnterpriseUserRoot } from '@/core/aggregate-roots';
import { ERoleType } from '@/core/enums';
import { UserNotFoundException, InvalidUserTypeException, EnterpriseNotFoundException, EnterpriseForbiddenException } from '@/core/exceptions';

describe('EnterpriseRevokeUserCommandHandler', () => {
  let handler: EnterpriseRevokeUserCommandHandler;
  let mockUserRepository: any;
  let mockEnterpriseRepository: any;
  let mockUow: any;

  beforeEach(() => {
    mockUserRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    };
    mockEnterpriseRepository = {
        findById: jest.fn(),
    };
    mockUow = {
        execute: jest.fn((fn: any) => fn()),
    };
    handler = new EnterpriseRevokeUserCommandHandler(
        mockUserRepository, 
        mockEnterpriseRepository, 
        mockUow
    );
  });

  it('should revoke user from enterprise successfully if owned', async () => {
    const mockUser = EnterpriseUserRoot.instantiate('user-123', {
      email: 'test@ent.com',
      phone: '+84123456789',
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
    mockUserRepository.findByIds = jest.fn().mockResolvedValue([mockUser]);
    mockEnterpriseRepository.findById.mockResolvedValue({ id: 'ent-1', userId: 'owner-123' });

    const command = new EnterpriseRevokeUserCommand('ent-1', { memberIds: ['user-123'] }, 'owner-123');
    await handler.execute(command);

    expect(mockUser.enterpriseIds).not.toContain('ent-1');
    expect(mockUser.enterpriseIds).toContain('ent-2');
    expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
  });

  it('should throw ForbiddenException if requester is not owner', async () => {
    mockEnterpriseRepository.findById.mockResolvedValue({ id: 'ent-1', userId: 'owner-123' });

    const command = new EnterpriseRevokeUserCommand('ent-1', { memberIds: ['user-123'] }, 'wrong-user');
    await expect(handler.execute(command)).rejects.toThrow(EnterpriseForbiddenException);
  });

  it('should throw UserNotFoundException if user does not exist', async () => {
    mockEnterpriseRepository.findById.mockResolvedValue({ id: 'ent-1', userId: 'owner-123' });
    mockUserRepository.findByIds = jest.fn().mockResolvedValue([]);
    const command = new EnterpriseRevokeUserCommand('ent-1', { memberIds: ['none'] }, 'owner-123');
    await expect(handler.execute(command)).rejects.toThrow(UserNotFoundException);
  });

  it('should throw InvalidUserTypeException if user is not ENTERPRISE type', async () => {
    mockEnterpriseRepository.findById.mockResolvedValue({ id: 'ent-1', userId: 'owner-123' });
    const mockUser = { type: ERoleType.KOL } as any;
    mockUserRepository.findByIds = jest.fn().mockResolvedValue([mockUser]);

    const command = new EnterpriseRevokeUserCommand('ent-1', { memberIds: ['user-kol'] }, 'owner-123');
    await expect(handler.execute(command)).rejects.toThrow(InvalidUserTypeException);
  });
});
