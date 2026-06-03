import { AuthSignUpCommandHandler } from '@/application/commands/auth-sign-up/auth-sign-up.handler';
import { AuthSignUpCommand } from '@/application/commands/auth-sign-up/auth-sign-up.command';
import { ERoleType } from '@/core/enums';
import { AuthSendOtpCommand } from '@/application/commands/auth-send-otp/auth-send-otp.command';
import { EOtpType } from '@/core/enums/otp-type.enum';

describe('AuthSignUpCommandHandler', () => {
  let handler: AuthSignUpCommandHandler;
  let mockUserRepository: any;
  let mockRoleReadService: any;
  let mockAuthService: any;
  let mockCommandBus: any;

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: jest.fn(),
      save: jest.fn().mockImplementation((user: any) => {
        user.setId('some-user-id');
        return Promise.resolve();
      }),
    };
    mockRoleReadService = {
      findAll: jest.fn(),
    };
    mockAuthService = {
      normalizeEmail: jest.fn((email: string) => email.trim().toLowerCase()),
      hashPassword: jest.fn(),
    };
    mockCommandBus = {
      execute: jest.fn().mockResolvedValue({ success: true }),
    };
    handler = new AuthSignUpCommandHandler(mockUserRepository, mockRoleReadService, mockAuthService, mockCommandBus);
  });

  it('should sign up a KOL successfully', async () => {
    const input = { email: 'kol@example.com', password: 'password123' };
    const command = new AuthSignUpCommand(ERoleType.KOL, input);

    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockRoleReadService.findAll.mockResolvedValue({
      data: [{ id: 'role-kol', title: 'KOL' }],
    });
    mockAuthService.hashPassword.mockResolvedValue('hashed_password');

    const result = await handler.execute(command);

    expect(result).toBeDefined();
    expect(result.userId).toBeDefined();
    expect(mockAuthService.normalizeEmail).toHaveBeenCalledWith('kol@example.com');
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('kol@example.com');
    expect(mockAuthService.hashPassword).toHaveBeenCalledWith('password123');
    expect(mockUserRepository.save).toHaveBeenCalled();
    expect(mockCommandBus.execute).toHaveBeenCalledWith(
      expect.any(AuthSendOtpCommand)
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

    await expect(handler.execute(command)).rejects.toThrow('User already exists');
  });

  it('should throw error if no roles are found', async () => {
    const input = { email: 'kol@example.com', password: 'password123' };
    const command = new AuthSignUpCommand(ERoleType.KOL, input);

    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockRoleReadService.findAll.mockResolvedValue({ data: [] });

    await expect(handler.execute(command)).rejects.toThrow('No roles found in system');
  });
});

