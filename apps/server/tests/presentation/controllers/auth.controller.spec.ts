import {
  AuthChangePasswordCommand,
  AuthRefreshTokenCommand,
  AuthResetPasswordCommand,
  AuthSendOtpCommand,
  AuthSignInCommand,
  AuthSignOutCommand,
  AuthSignUpCommand,
  AuthVerifyOtpCommand,
} from '@/application/commands';
import { AuthGetProfileQuery } from '@/application/queries';
import { ERoleType } from '@/core/enums';
import { AuthClientController } from '@/presentation/controllers/http/client/auth.controller';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';

describe('AuthClientController', () => {
  let controller: AuthClientController;
  let mockCommandBus: any;
  let mockQueryBus: any;

  beforeEach(async () => {
    mockCommandBus = {
      execute: jest.fn(),
    };
    mockQueryBus = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthClientController],
      providers: [
        { provide: CommandBus, useValue: mockCommandBus },
        { provide: QueryBus, useValue: mockQueryBus },
      ],
    }).compile();

    controller = module.get<AuthClientController>(AuthClientController);
  });

  const createMockResponse = () => {
    const res: any = {};
    res.cookie = jest.fn().mockReturnValue(res);
    res.clearCookie = jest.fn().mockReturnValue(res);
    return res;
  };

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signUpKOL', () => {
    it('should execute AuthSignUpCommand with KOL role', async () => {
      const input = { email: 'kol@test.com', password: 'password123' };
      mockCommandBus.execute.mockResolvedValue({ userId: 'user-123' });

      const result = await controller.signUpKOL(input as any);

      expect(mockCommandBus.execute).toHaveBeenCalledWith(
        new AuthSignUpCommand(ERoleType.KOL, input as any),
      );
      expect(result).toEqual({ userId: 'user-123' });
    });
  });

  describe('signUpEnterprise', () => {
    it('should execute AuthSignUpCommand with Enterprise role', async () => {
      const input = { email: 'enterprise@test.com', password: 'password123' };
      mockCommandBus.execute.mockResolvedValue({ userId: 'user-456' });

      const result = await controller.signUpEnterprise(input as any);

      expect(mockCommandBus.execute).toHaveBeenCalledWith(
        new AuthSignUpCommand(ERoleType.ENTERPRISE, input as any),
      );
      expect(result).toEqual({ userId: 'user-456' });
    });
  });

  describe('signIn', () => {
    it('should execute AuthSignInCommand and set cookies', async () => {
      const input = { email: 'test@test.com', password: 'password123' };
      const tokens = { accessToken: 'access', refreshToken: 'refresh' };
      mockCommandBus.execute.mockResolvedValue(tokens);
      const res = createMockResponse();

      const result = await controller.signIn(input as any, res);

      expect(mockCommandBus.execute).toHaveBeenCalledWith(new AuthSignInCommand(input as any));
      expect(res.cookie).toHaveBeenCalledWith('access_token', 'access', expect.any(Object));
      expect(res.cookie).toHaveBeenCalledWith('refresh_token', 'refresh', expect.any(Object));
      expect(result).toEqual(tokens);
    });
  });

  describe('refreshToken', () => {
    it('should execute AuthRefreshTokenCommand and set cookies', async () => {
      const input = { refreshToken: 'old-refresh' };
      const tokens = { accessToken: 'new-access', refreshToken: 'new-refresh' };
      mockCommandBus.execute.mockResolvedValue(tokens);
      const res = createMockResponse();
      const req: any = { cookies: {} };

      const result = await controller.refreshToken(req, input as any, res);

      expect(mockCommandBus.execute).toHaveBeenCalledWith(
        new AuthRefreshTokenCommand(input as any),
      );
      expect(res.cookie).toHaveBeenCalledWith('access_token', 'new-access', expect.any(Object));
      expect(res.cookie).toHaveBeenCalledWith('refresh_token', 'new-refresh', expect.any(Object));
      expect(result).toEqual(tokens);
    });
  });

  describe('signOut', () => {
    it('should clear cookies and execute AuthSignOutCommand', async () => {
      const userId = 'user-123';
      mockCommandBus.execute.mockResolvedValue({ success: true });
      const res = createMockResponse();

      await controller.signOut(userId, res);

      expect(res.clearCookie).toHaveBeenCalledWith('access_token');
      expect(res.clearCookie).toHaveBeenCalledWith('refresh_token');
      expect(mockCommandBus.execute).toHaveBeenCalledWith(new AuthSignOutCommand(userId));
    });
  });

  describe('resetPassword', () => {
    it('should execute AuthResetPasswordCommand', async () => {
      const input = { email: 'test@test.com', otpCode: '123456', newPassword: 'newPassword' };
      mockCommandBus.execute.mockResolvedValue({ success: true });

      const result = await controller.resetPassword(input as any);

      expect(mockCommandBus.execute).toHaveBeenCalledWith(
        new AuthResetPasswordCommand(input as any),
      );
      expect(result).toEqual({ success: true });
    });
  });

  describe('sendOtp', () => {
    it('should execute AuthSendOtpCommand', async () => {
      const input = { email: 'test@test.com', type: 'reset_password' as any };
      mockCommandBus.execute.mockResolvedValue({ success: true });

      const result = await controller.sendOtp(input as any);

      expect(mockCommandBus.execute).toHaveBeenCalledWith(new AuthSendOtpCommand(input as any));
      expect(result).toEqual({ success: true });
    });
  });

  describe('verifyOtp', () => {
    it('should execute AuthVerifyOtpCommand', async () => {
      const input = { email: 'test@test.com', otpCode: '123456' };
      mockCommandBus.execute.mockResolvedValue({ success: true });

      const result = await controller.verifyOtp(input as any);

      expect(mockCommandBus.execute).toHaveBeenCalledWith(new AuthVerifyOtpCommand(input as any));
      expect(result).toEqual({ success: true });
    });
  });

  describe('changePassword', () => {
    it('should execute AuthChangePasswordCommand', async () => {
      const userId = 'user-123';
      const input = { oldPassword: 'old', newPassword: 'new', otpCode: '123456' };
      mockCommandBus.execute.mockResolvedValue({ success: true });

      const result = await controller.changePassword(userId, input as any);

      expect(mockCommandBus.execute).toHaveBeenCalledWith(
        new AuthChangePasswordCommand(userId, input as any),
      );
      expect(result).toEqual({ success: true });
    });
  });

  describe('getProfile', () => {
    it('should execute AuthGetProfileQuery', async () => {
      const userId = 'user-123';
      const profile = { email: 'test@test.com', fullName: 'Test Name' };
      mockQueryBus.execute.mockResolvedValue(profile);

      const result = await controller.getProfile(userId);

      expect(mockQueryBus.execute).toHaveBeenCalledWith(new AuthGetProfileQuery(userId));
      expect(result).toEqual(profile);
    });
  });
});
