import { jest } from '@jest/globals';
import { AuthSignUpCommandHandler } from '@/application/commands/auth-sign-up/auth-sign-up.handler';
import { AuthSignUpCommand } from '@/application/commands/auth-sign-up/auth-sign-up.command';
import { ERoleType, EOtpType } from '@/core/enums';
import { UserConflictException, RoleNotFoundException, InvalidUserTypeException } from '@/core/exceptions';
import { createMockUserRepository } from '../../../__mocks__/mock-repositories';
import {
  createMockAuthService,
  createMockUnitOfWork,
  createMockOutboxService,
  createMockRoleReadService,
  createMockCommandBus,
} from '../../../__mocks__/mock-services';
import { KOLUserRoot, EnterpriseUserRoot, AdminRoot } from '@/core/aggregate-roots';
import { AuthSendOtpCommand } from '@/application/commands';

describe('AuthSignUpCommandHandler', () => {
  let handler: AuthSignUpCommandHandler;
  let mockUserRepository: ReturnType<typeof createMockUserRepository>;
  let mockRoleReadService: ReturnType<typeof createMockRoleReadService>;
  let mockAuthService: ReturnType<typeof createMockAuthService>;
  let mockOutboxService: ReturnType<typeof createMockOutboxService>;
  let mockUow: ReturnType<typeof createMockUnitOfWork>;
  let mockCommandBus: ReturnType<typeof createMockCommandBus>;

  beforeEach(() => {
    mockUserRepository = createMockUserRepository();
    mockRoleReadService = createMockRoleReadService();
    mockAuthService = createMockAuthService();
    mockOutboxService = createMockOutboxService();
    mockUow = createMockUnitOfWork();
    mockCommandBus = createMockCommandBus();

    handler = new AuthSignUpCommandHandler(
      mockUserRepository,
      mockRoleReadService as any, // IRoleReadService is an interface
      mockAuthService,
      mockOutboxService,
      mockUow,
      mockCommandBus as any, // CommandBus is a class from NestJS
    );
  });

  const validRolesResponse = {
    data: [
      { id: 'role-kol', title: 'KOL' },
      { id: 'role-ent', title: 'ENTERPRISE' },
      { id: 'role-admin', title: 'ADMIN' },
    ],
    total: 3,
    page: 1,
    limit: 10,
  };

  const signUpInput = {
    email: 'test@example.com',
    password: 'Password123!',
    fullName: 'Test User',
    phone: '+84987654321',
  };

  describe('execute', () => {
    it('should successfully sign up a KOL user', async () => {
      // Arrange
      const command = new AuthSignUpCommand(ERoleType.KOL, signUpInput);
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockRoleReadService.findAll.mockResolvedValue(validRolesResponse as any);
      mockAuthService.normalizeEmail.mockReturnValue('test@example.com');
      mockAuthService.hashPassword.mockResolvedValue('hashed-password');

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(result).toBeDefined();
      expect(result.userId).toBeDefined();
      expect(mockUserRepository.save).toHaveBeenCalledWith(expect.any(KOLUserRoot));
      expect(mockCommandBus.execute).toHaveBeenCalledWith(expect.any(AuthSendOtpCommand));
      const otpCommand = (mockCommandBus.execute as jest.Mock).mock.calls[0][0] as AuthSendOtpCommand;
      expect(otpCommand.input.email).toBe('test@example.com');
      expect(otpCommand.input.type).toBe(EOtpType.CREATE_ACCOUNT);

      expect(mockOutboxService.enqueueMany).toHaveBeenCalled();
      expect(mockUow.execute).toHaveBeenCalled();
    });

    it('should successfully sign up an Enterprise user', async () => {
      // Arrange
      const command = new AuthSignUpCommand(ERoleType.ENTERPRISE, signUpInput);
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockRoleReadService.findAll.mockResolvedValue(validRolesResponse as any);
      mockAuthService.normalizeEmail.mockReturnValue('test@example.com');

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(result.userId).toBeDefined();
      expect(mockUserRepository.save).toHaveBeenCalledWith(expect.any(EnterpriseUserRoot));
    });

    it('should successfully sign up an Admin user', async () => {
      // Arrange
      const command = new AuthSignUpCommand(ERoleType.ADMIN, signUpInput);
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockRoleReadService.findAll.mockResolvedValue(validRolesResponse as any);
      mockAuthService.normalizeEmail.mockReturnValue('test@example.com');

      // Act
      const result = await handler.execute(command);

      // Assert
      expect(result.userId).toBeDefined();
      expect(mockUserRepository.save).toHaveBeenCalledWith(expect.any(AdminRoot));
    });

    it('should throw UserConflictException if email is already taken', async () => {
      // Arrange
      const command = new AuthSignUpCommand(ERoleType.KOL, signUpInput);
      mockAuthService.normalizeEmail.mockReturnValue('test@example.com');
      mockUserRepository.findByEmail.mockResolvedValue(KOLUserRoot.create({
        email: 'test@example.com',
        fullName: 'Existing',
        passwordHash: 'hash',
        type: ERoleType.KOL,
        roleId: 'role-kol',
      } as any));

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(UserConflictException);
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should throw RoleNotFoundException if no roles are found', async () => {
      // Arrange
      const command = new AuthSignUpCommand(ERoleType.KOL, signUpInput);
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockRoleReadService.findAll.mockResolvedValue({ data: [], total: 0, page: 1, limit: 10 } as any);

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(RoleNotFoundException);
    });

    it('should throw InvalidUserTypeException for invalid user type', async () => {
      // Arrange
      const command = new AuthSignUpCommand('INVALID' as ERoleType, signUpInput);
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockRoleReadService.findAll.mockResolvedValue(validRolesResponse as any);

      // Act & Assert
      await expect(handler.execute(command)).rejects.toThrow(InvalidUserTypeException);
    });

    it('should use default phone if phone is not provided', async () => {
      // Arrange
      const inputWithoutPhone = { ...signUpInput, phone: undefined };
      const command = new AuthSignUpCommand(ERoleType.KOL, inputWithoutPhone);
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockRoleReadService.findAll.mockResolvedValue(validRolesResponse as any);

      // Act
      await handler.execute(command);

      // Assert
      const savedUser = (mockUserRepository.save as jest.Mock).mock.calls[0][0] as KOLUserRoot;
      expect(savedUser.phone.value).toBe('+84000000000');
    });
  });
});
