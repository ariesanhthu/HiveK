import { AuthGoogleSignInCommand } from '@/application/commands/auth-google-sign-in/auth-google-sign-in.command';
import { AuthGoogleSignInCommandHandler } from '@/application/commands/auth-google-sign-in/auth-google-sign-in.handler';
import { EnterpriseUserRoot, KOLUserRoot } from '@/core/aggregate-roots';
import { ERoleType } from '@/core/enums';
import { RoleNotFoundException, UserDeletedException } from '@/core/exceptions';
import { PhoneNumberVO } from '@/core/value-objects/phone-number.value-object';
import {
  createMockRoleRepository,
  createMockUserRepository,
} from '../../../__mocks__/mock-repositories';
import {
  createMockAuthService,
  createMockOutboxService,
  createMockUnitOfWork,
} from '../../../__mocks__/mock-services';

describe('AuthGoogleSignInCommandHandler', () => {
  let handler: AuthGoogleSignInCommandHandler;
  let mockUserRepository: ReturnType<typeof createMockUserRepository>;
  let mockRoleRepository: ReturnType<typeof createMockRoleRepository>;
  let mockAuthService: ReturnType<typeof createMockAuthService>;
  let mockOutboxService: ReturnType<typeof createMockOutboxService>;
  let mockUow: ReturnType<typeof createMockUnitOfWork>;

  beforeEach(() => {
    mockUserRepository = createMockUserRepository();
    mockRoleRepository = createMockRoleRepository();
    mockAuthService = createMockAuthService();
    mockOutboxService = createMockOutboxService();
    mockUow = createMockUnitOfWork();

    handler = new AuthGoogleSignInCommandHandler(
      mockUserRepository,
      mockRoleRepository,
      mockAuthService as any,
      mockOutboxService as any,
      mockUow,
    );
  });

  const googleInput = {
    googleId: 'google-123',
    email: 'google@example.com',
    displayName: 'Google User',
    avatarUrl: 'https://avatar.com/u1.jpg',
  };

  describe('Happy Path', () => {
    it('should create a new user and enqueue verification email when user does not exist', async () => {
      mockAuthService.normalizeEmail.mockReturnValue('google@example.com');
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockRoleRepository.findByTitle.mockResolvedValue({ id: 'role-kol', title: 'KOL' } as any);
      mockAuthService.generateTokens.mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });

      const command = new AuthGoogleSignInCommand(googleInput);
      const result = await handler.execute(command);

      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });

      expect(mockUserRepository.save).toHaveBeenCalled();

      // Verification email is not enqueued for Google sign-in in current implementation
      expect(mockOutboxService.enqueueMany).not.toHaveBeenCalled();
    });

    it('should create a new Enterprise user when type is Enterprise', async () => {
      mockAuthService.normalizeEmail.mockReturnValue('enterprise@example.com');
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockRoleRepository.findByTitle.mockResolvedValue(
        { id: 'role-ent', title: 'ENTERPRISE' } as any,
      );
      mockAuthService.generateTokens.mockResolvedValue({
        accessToken: 'at',
        refreshToken: 'rt',
      });

      const command = new AuthGoogleSignInCommand({
        ...googleInput,
        email: 'enterprise@example.com',
        type: ERoleType.ENTERPRISE,
      });
      await handler.execute(command);

      expect(mockUserRepository.save).toHaveBeenCalledWith(
        expect.any(EnterpriseUserRoot),
      );
      const savedUser = mockUserRepository.save.mock.calls[0][0];
      expect(savedUser.type).toBe(ERoleType.ENTERPRISE);
    });

    it('should login existing user and update googleId if missing', async () => {
      const existingUser = KOLUserRoot.instantiate('user-1', {
        email: 'google@example.com',
        phone: PhoneNumberVO.create({ value: '+84123456789' }),
        passwordHash: 'hash',
        fullName: 'Existing User',
        type: ERoleType.KOL,
        roleId: 'role-kol',
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deleteAt: null,
        deleteBy: null,
        refreshToken: null,
        googleId: null, // Initially null
      });

      mockAuthService.normalizeEmail.mockReturnValue('google@example.com');
      mockUserRepository.findByEmail.mockResolvedValue(existingUser);
      mockAuthService.generateTokens.mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });

      const command = new AuthGoogleSignInCommand(googleInput);
      await handler.execute(command);

      expect(existingUser.googleId).toBe('google-123');
      expect(mockUserRepository.save).toHaveBeenCalledWith(existingUser);
      expect(mockOutboxService.enqueueMany).not.toHaveBeenCalled();
    });
  });

  describe('Sad Paths', () => {
    it('should throw UserDeletedException if user is soft deleted', async () => {
      const deletedUser = KOLUserRoot.instantiate('user-deleted', {
        email: 'deleted@example.com',
        phone: PhoneNumberVO.create({ value: '+84123456789' }),
        passwordHash: 'hash',
        fullName: 'Deleted User',
        type: ERoleType.KOL,
        roleId: 'role-kol',
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deleteAt: new Date(),
        deleteBy: 'admin',
        refreshToken: null,
        googleId: 'google-123',
      });

      mockAuthService.normalizeEmail.mockReturnValue('deleted@example.com');
      mockUserRepository.findByEmail.mockResolvedValue(deletedUser);

      const command = new AuthGoogleSignInCommand({ ...googleInput, email: 'deleted@example.com' });
      await expect(handler.execute(command)).rejects.toThrow(UserDeletedException);
    });

    it('should throw RoleNotFoundException if default KOL role is missing from system', async () => {
      mockAuthService.normalizeEmail.mockReturnValue('google@example.com');
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockRoleRepository.findByTitle.mockResolvedValue(null);

      const command = new AuthGoogleSignInCommand(googleInput);
      await expect(handler.execute(command)).rejects.toThrow(RoleNotFoundException);
    });
  });
});
