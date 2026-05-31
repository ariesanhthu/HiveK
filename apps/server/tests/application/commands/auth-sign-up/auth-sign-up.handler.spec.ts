import { AuthSignUpCommandHandler } from '@/application/commands/auth-sign-up/auth-sign-up.handler';
import { AuthSignUpCommand } from '@/application/commands/auth-sign-up/auth-sign-up.command';
import { ERoleType } from '@/core/enums';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}));

describe('AuthSignUpCommandHandler', () => {
  let handler: AuthSignUpCommandHandler;
  let mockUserRepository: any;
  let mockRoleReadService: any;

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
    handler = new AuthSignUpCommandHandler(mockUserRepository, mockRoleReadService);
  });

  it('should sign up a KOL successfully', async () => {
    const input = { email: 'kol@example.com', password: 'password123' };
    const command = new AuthSignUpCommand(ERoleType.KOL, input);

    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockRoleReadService.findAll.mockResolvedValue({
      data: [{ id: 'role-kol', title: 'KOL' }],
    });
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');

    const result = await handler.execute(command);

    expect(result).toBeDefined();
    expect(result.userId).toBeDefined();
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('kol@example.com');
    expect(mockUserRepository.save).toHaveBeenCalled();
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
