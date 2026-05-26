import { AuthResetPasswordCommandHandler } from '@/application/commands/auth-reset-password/auth-reset-password.handler';
import { AuthResetPasswordCommand } from '@/application/commands/auth-reset-password/auth-reset-password.command';

describe('AuthResetPasswordCommandHandler', () => {
  let handler: AuthResetPasswordCommandHandler;

  beforeEach(() => {
    handler = new AuthResetPasswordCommandHandler();
  });

  it('should reset password successfully', async () => {
    const command = new AuthResetPasswordCommand({ email: 'user@example.com' });
    const result = await handler.execute(command);
    expect(result).toEqual({ success: true });
  });
});
