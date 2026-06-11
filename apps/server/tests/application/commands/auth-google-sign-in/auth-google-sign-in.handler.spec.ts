import { AuthGoogleSignInCommandHandler } from '@/application/commands/auth-google-sign-in/auth-google-sign-in.handler';
import { AuthGoogleSignInCommand } from '@/application/commands/auth-google-sign-in/auth-google-sign-in.command';
import { ERoleType } from '@/core/enums';
import { KOLUserRoot } from '@/core/aggregate-roots';
import { UserDeletedException, RoleNotFoundException } from '@/core/exceptions';
import { createMockUserRepository, createMockRoleRepository } from '../../../__mocks__/mock-repositories';
import { createMockAuthService, createMockOutboxService } from '../../../__mocks__/mock-services';

describe('AuthGoogleSignInCommandHandler', () => {
  let handler: AuthGoogleSignInCommandHandler;
  let mockUserRepository: ReturnType<typeof createMockUserRepository>;
  let mockRoleRepository: ReturnType<typeof createMockRoleRepository>;
  let mockAuthService: ReturnType<typeof createMockAuthService>;
  let mockOutboxService: ReturnType<typeof createMockOutboxService>;

  beforeEach(() => {
    mockUserRepository = createMockUserRepository();
    mockRoleRepository = createMockRoleRepository();
    mockAuthService = createMockAuthService();
    mockOutboxService = createMockOutboxService();

    handler = new AuthGoogleSignInCommandHandler(
      mockUserRepository,
      mockRoleRepository,
      mockAuthService as any,
      mockOutboxService as any,
    );
  });

  const googleInput = {
    googleId: 'google-123',
    email: 'google@example.com',
    displayName: 'Google User',
  };

  describe('Happy Path', () => {
    it('should create a new user and enqueue integration events when user does not exist', async () => {
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
      
      // Verify integration events are enqueued for NEW users
      expect(mockOutboxService.enqueueMany).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            eventType: 'SendVerificationEmailRequested',
          })
        ])
      );
    });

    it('should login existing user without re-triggering signup events', async () => {
      const existingUser = KOLUserRoot.instantiate('user-1', {
        email: 'google@example.com',
        phone: { value: '+84123' } as any,
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
        googleId: 'google-123',
      });

      mockAuthService.normalizeEmail.mockReturnValue('google@example.com');
      mockUserRepository.findByEmail.mockResolvedValue(existingUser);
      mockAuthService.generateTokens.mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });

      const command = new AuthGoogleSignInCommand(googleInput);
      await handler.execute(command);

      expect(mockUserRepository.save).toHaveBeenCalled();
      
      // Domain events should be cleared or mapper should return empty for existing users
      // In this handler, only newly created users get domain events mapped because 
      // UserSignedUpEvent is only emitted when setId is called on a new instance.
      expect(mockOutboxService.enqueueMany).not.toHaveBeenCalled();
    });
  });

  describe('Sad Paths', () => {
    it('should throw UserDeletedException if user is soft deleted', async () => {
      const deletedUser = { email: 'deleted@example.com', deleteAt: new Date() } as any;
      mockAuthService.normalizeEmail.mockReturnValue('deleted@example.com');
      mockUserRepository.findByEmail.mockResolvedValue(deletedUser);

      const command = new AuthGoogleSignInCommand({ ...googleInput, email: 'deleted@example.com' });
      await expect(handler.execute(command)).rejects.toThrow(UserDeletedException);
    });

    it('should throw RoleNotFoundException if default KOL role is missing', async () => {
      mockAuthService.normalizeEmail.mockReturnValue('google@example.com');
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockRoleRepository.findByTitle.mockResolvedValue(null);

      const command = new AuthGoogleSignInCommand(googleInput);
      await expect(handler.execute(command)).rejects.toThrow(RoleNotFoundException);
    });
  });
});
