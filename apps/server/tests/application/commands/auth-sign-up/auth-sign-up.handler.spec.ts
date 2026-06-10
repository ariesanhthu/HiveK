import { AuthSignUpCommandHandler } from '@/application/commands/auth-sign-up/auth-sign-up.handler';
import { AuthSignUpCommand } from '@/application/commands/auth-sign-up/auth-sign-up.command';
import { ERoleType } from '@/core/enums';
import { UserConflictException, RoleNotFoundException } from '@/core/exceptions';
import { createMockUserRepository } from '../../../__mocks__/mock-repositories';
import { createMockAuthService, createMockUnitOfWork, createMockOutboxService, createMockRoleReadService } from '../../../__mocks__/mock-services';
import { KOLUserRoot, EnterpriseUserRoot } from '@/core/aggregate-roots';

describe('AuthSignUpCommandHandler', () => {
  let handler: AuthSignUpCommandHandler;
  let mockUserRepository: ReturnType<typeof createMockUserRepository>;
  let mockRoleReadService: ReturnType<typeof createMockRoleReadService>;
  let mockAuthService: ReturnType<typeof createMockAuthService>;
  let mockOutboxService: ReturnType<typeof createMockOutboxService>;
  let mockUow: ReturnType<typeof createMockUnitOfWork>;

  beforeEach(() => {
    mockUserRepository = createMockUserRepository();
    mockRoleReadService = createMockRoleReadService();
    mockAuthService = createMockAuthService();
    mockOutboxService = createMockOutboxService();
    mockUow = createMockUnitOfWork();

    handler = new AuthSignUpCommandHandler(
      mockUserRepository,
      mockRoleReadService,
      mockAuthService as any,
      mockOutboxService as any,
      mockUow,
    );
  });

  const validRolesResponse = {
    data: [
      { id: 'role-kol', title: 'KOL' },
      { id: 'role-ent', title: 'ENTERPRISE' },
    ],
    total: 2,
    page: 1,
    limit: 10,
  };

  describe('Happy Paths', () => {
    it('should successfully sign up a KOL user and enqueue outbox event', async () => {
      const input = {
        email: 'kol@example.com',
        password: 'password123',
        fullName: 'KOL User',
      };
      const command = new AuthSignUpCommand(ERoleType.KOL, input);

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockRoleReadService.findAll.mockResolvedValue(validRolesResponse as any);
      mockAuthService.hashPassword!.mockResolvedValue('hashedPassword');

      const result = await handler.execute(command);

      expect(result).toBeDefined();
      expect(mockUserRepository.save).toHaveBeenCalledWith(expect.any(KOLUserRoot));
      expect(mockOutboxService.enqueue).toHaveBeenCalledWith('auth.user.registered', expect.objectContaining({
        email: 'kol@example.com',
        type: ERoleType.KOL,
      }));
      expect(mockUow.execute).toHaveBeenCalled();
    });

    it('should successfully sign up an Enterprise user', async () => {
      const input = { email: 'enterprise@example.com', password: 'password123' };
      const command = new AuthSignUpCommand(ERoleType.ENTERPRISE, input);

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockRoleReadService.findAll.mockResolvedValue(validRolesResponse as any);

      await handler.execute(command);

      expect(mockUserRepository.save).toHaveBeenCalledWith(expect.any(EnterpriseUserRoot));
      expect(mockOutboxService.enqueue).toHaveBeenCalled();
    });
  });

  describe('Sad Paths', () => {
    it('should throw UserConflictException if email is already taken', async () => {
      const input = { email: 'taken@example.com', password: 'password123' };
      const command = new AuthSignUpCommand(ERoleType.KOL, input);

      mockUserRepository.findByEmail.mockResolvedValue({ id: 'existing' } as any);

      await expect(handler.execute(command)).rejects.toThrow(UserConflictException);
      expect(mockUserRepository.save).not.toHaveBeenCalled();
      expect(mockOutboxService.enqueue).not.toHaveBeenCalled();
    });
  });
});
