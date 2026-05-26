import { AuthSignOutCommandHandler } from '@/application/commands/auth-sign-out/auth-sign-out.handler';
import { AuthSignOutCommand } from '@/application/commands/auth-sign-out/auth-sign-out.command';

describe('AuthSignOutCommandHandler', () => {
  let handler: AuthSignOutCommandHandler;

  beforeEach(() => {
    handler = new AuthSignOutCommandHandler();
  });

  it('should sign out successfully', async () => {
    const command = new AuthSignOutCommand({ userId: 'user-123' });
    const result = await handler.execute(command);
    expect(result).toEqual({ success: true });
  });
});
