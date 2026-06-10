import { AuthSignUpCommandHandler } from '@/application/commands/auth-sign-up/auth-sign-up.handler';
import { AuthSignUpCommand } from '@/application/commands/auth-sign-up/auth-sign-up.command';
import { ERoleType } from '@/core/enums';
import { AuthSendOtpCommand } from '@/application/commands/auth-send-otp/auth-send-otp.command';
import { EOtpType } from '@/core/enums/otp-type.enum';
import { UserConflictException, RoleNotFoundException, InvalidUserTypeException } from '@/core/exceptions';
import { createMockUserRepository } from '../../../__mocks__/mock-repositories';
import { createMockAuthService, createMockUnitOfWork, createMockCommandBus, createMockRoleReadService } from '../../../__mocks__/mock-services';
import { KOLUserRoot, EnterpriseUserRoot, AdminRoot } from '@/core/aggregate-roots';
import { PhoneNumberVO } from '@/core/value-objects/phone-number.value-object';

describe('AuthSignUpCommandHandler', () => {
  let handler: AuthSignUpCommandHandler;
  let mockUserRepository: ReturnType<typeof createMockUserRepository>;
  let mockRoleReadService: ReturnType<typeof createMockRoleReadService>;
  let mockAuthService: ReturnType<typeof createMockAuthService>;
  let mockCommandBus: ReturnType<typeof createMockCommandBus>;
  let mockUow: ReturnType<typeof createMockUnitOfWork>;

  beforeEach(() => {
    mockUserRepository = createMockUserRepository();
    mockRoleReadService = createMockRoleReadService();
    mockAuthService = createMockAuthService();
    mockCommandBus = createMockCommandBus();
    mockUow = createMockUnitOfWork();

    handler = new AuthSignUpCommandHandler(
      mockUserRepository,
      mockRoleReadService,
      mockAuthService as any,
      mockCommandBus as any,
      mockUow,
    );
  });

  const validRolesResponse = {
    data: [
      { id: 'role-kol', title: 'KOL' },
      { id: 'role-ent', title: 'ENTERPRISE' },
      { id: 'role-adm', title: 'ADMIN' },
    ],
    total: 3,
    page: 1,
    limit: 10,
  };

  describe('Happy Paths', () => {
    it('should successfully sign up a KOL user with all fields', async () => {
      const input = {
        email: 'kol@example.com',
        password: 'password123',
        phone: '+84123456789',
        fullName: 'KOL User',
      };
      const command = new AuthSignUpCommand(ERoleType.KOL, input);

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockRoleReadService.findAll.mockResolvedValue(validRolesResponse as any);
      mockAuthService.hashPassword!.mockResolvedValue('hashedPassword');

      const result = await handler.execute(command);

      expect(result).toBeDefined();
      expect(result.userId).toBeDefined();
      expect(mockUserRepository.save).toHaveBeenCalledWith(expect.any(KOLUserRoot));
      
      const savedUser = mockUserRepository.save.mock.calls[0][0] as KOLUserRoot;
      expect(savedUser.email).toBe('kol@example.com');
      expect(savedUser.fullName).toBe('KOL User');
      expect(savedUser.phone.value).toBe('+84123456789');
      expect(savedUser.type).toBe(ERoleType.KOL);
      expect(savedUser.roleId).toBe('role-kol');

      expect(mockCommandBus.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          input: {
            email: 'kol@example.com',
            type: EOtpType.CREATE_ACCOUNT,
          },
        }),
      );
    });

    it('should successfully sign up an Enterprise user and use default values', async () => {
      const input = {
        email: 'enterprise@example.com',
        password: 'password123',
      };
      const command = new AuthSignUpCommand(ERoleType.ENTERPRISE, input);

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockRoleReadService.findAll.mockResolvedValue(validRolesResponse as any);

      const result = await handler.execute(command);

      expect(mockUserRepository.save).toHaveBeenCalledWith(expect.any(EnterpriseUserRoot));
      const savedUser = mockUserRepository.save.mock.calls[0][0] as EnterpriseUserRoot;
      expect(savedUser.fullName).toBe('DEFAULT NAME');
      expect(savedUser.phone.value).toBe('+84000000000');
      expect(savedUser.roleId).toBe('role-ent');
    });

    it('should successfully sign up an Admin user', async () => {
      const input = { email: 'admin@example.com', password: 'password123' };
      const command = new AuthSignUpCommand(ERoleType.ADMIN, input);

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockRoleReadService.findAll.mockResolvedValue(validRolesResponse as any);

      await handler.execute(command);

      expect(mockUserRepository.save).toHaveBeenCalledWith(expect.any(AdminRoot));
      const savedUser = mockUserRepository.save.mock.calls[0][0] as AdminRoot;
      expect(savedUser.roleId).toBe('role-adm');
    });
  });

  describe('Sad Paths & Edge Cases', () => {
    it('should throw UserConflictException if email is already taken', async () => {
      const input = { email: 'taken@example.com', password: 'password123' };
      const command = new AuthSignUpCommand(ERoleType.KOL, input);

      mockUserRepository.findByEmail.mockResolvedValue({ id: 'existing' } as any);

      await expect(handler.execute(command)).rejects.toThrow(UserConflictException);
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should throw RoleNotFoundException if no roles are available', async () => {
      const input = { email: 'user@example.com', password: 'password123' };
      const command = new AuthSignUpCommand(ERoleType.KOL, input);

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockRoleReadService.findAll.mockResolvedValue({ data: [] } as any);

      await expect(handler.execute(command)).rejects.toThrow(RoleNotFoundException);
    });

    it('should throw InvalidUserTypeException for unsupported user type', async () => {
      const input = { email: 'user@example.com', password: 'password123' };
      // Force an invalid type
      const command = new AuthSignUpCommand('INVALID_TYPE' as any, input);

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockRoleReadService.findAll.mockResolvedValue(validRolesResponse as any);

      await expect(handler.execute(command)).rejects.toThrow(InvalidUserTypeException);
    });

    it('should NOT fail sign up if OTP dispatch fails', async () => {
      const input = { email: 'otp-fail@example.com', password: 'password123' };
      const command = new AuthSignUpCommand(ERoleType.KOL, input);

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockRoleReadService.findAll.mockResolvedValue(validRolesResponse as any);
      mockCommandBus.execute.mockRejectedValue(new Error('OTP Service Down'));

      const result = await handler.execute(command);

      expect(result.userId).toBeDefined();
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should normalize email before checking existence and saving', async () => {
      const input = { email: '  User@Example.Com  ', password: 'password123' };
      const command = new AuthSignUpCommand(ERoleType.KOL, input);

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockRoleReadService.findAll.mockResolvedValue(validRolesResponse as any);
      
      // authService.normalizeEmail is already mocked to trim and lowercase in mock-services.ts
      
      await handler.execute(command);

      expect(mockAuthService.normalizeEmail).toHaveBeenCalledWith('  User@Example.Com  ');
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('user@example.com');
      const savedUser = mockUserRepository.save.mock.calls[0][0] as KOLUserRoot;
      expect(savedUser.email).toBe('user@example.com');
    });
  });
});
