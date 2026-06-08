import { AuthSignUpCommandHandler } from '@/application/commands/auth-sign-up/auth-sign-up.handler';
import { AuthSignUpCommand } from '@/application/commands/auth-sign-up/auth-sign-up.command';
import { ERoleType } from '@/core/enums';
import { AuthSendOtpCommand } from '@/application/commands/auth-send-otp/auth-send-otp.command';
import { EOtpType } from '@/core/enums/otp-type.enum';
import { UserConflictException, RoleNotFoundException } from '@/core/exceptions';

describe('AuthSignUpCommandHandler', () => {
  let handler: AuthSignUpCommandHandler;
  let mockUserRepository: any;
  let mockRoleReadService: any;
  let mockAuthService: any;
  let mockCommandBus: any;
  let mockUow: any;

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: jest.fn(),
      save: jest.fn(),
    };
    mockRoleReadService = {
      findAll: jest.fn(),
    };
    mockAuthService = {
      normalizeEmail: jest.fn().mockImplementation((e) => e),
      hashPassword: jest.fn().mockResolvedValue('hashedPassword'),
    };
    mockCommandBus = {
      execute: jest.fn(),
    };
    mockUow = {
        execute: jest.fn((fn: any) => fn()),
    };
    handler = new AuthSignUpCommandHandler(
      mockUserRepository,
      mockRoleReadService,
      mockAuthService,
      mockCommandBus,
      mockUow,
    );
  });

  it('should successfully sign up a new user', async () => {
    const input = { email: 'kol@example.com', password: 'password123' };
    const command = new AuthSignUpCommand(ERoleType.KOL, input);

    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockRoleReadService.findAll.mockResolvedValue({
      data: [{ id: 'role-123', title: 'KOL' }],
    });

    const result = await handler.execute(command);

    expect(result).toBeDefined();
    expect(mockUserRepository.save).toHaveBeenCalled();
    expect(mockCommandBus.execute).toHaveBeenCalledWith(
      expect.any(AuthSendOtpCommand),
    );
    const sentCmd = mockCommandBus.execute.mock.calls[0][0];
    expect(sentCmd.input).toEqual({
      email: 'kol@example.com',
      type: EOtpType.CREATE_ACCOUNT,
    });
  });

  it('should throw error if user already exists', async () => {
    const input = { email: 'kol@example.com', password: 'password123' };
    const command = new AuthSignUpCommand(ERoleType.KOL, input);

    mockUserRepository.findByEmail.mockResolvedValue({ id: 'existing-id' });

    await expect(handler.execute(command)).rejects.toThrow(UserConflictException);
  });

  it('should throw error if no roles are found', async () => {
    const input = { email: 'kol@example.com', password: 'password123' };
    const command = new AuthSignUpCommand(ERoleType.KOL, input);

    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockRoleReadService.findAll.mockResolvedValue({ data: [] });

    await expect(handler.execute(command)).rejects.toThrow(RoleNotFoundException);
  });
});
