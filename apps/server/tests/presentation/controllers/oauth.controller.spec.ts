import { Test, TestingModule } from '@nestjs/testing';
import { OAuthController } from '@/presentation/controllers/http/oauth.controller';
import { GoogleAuthGuard } from '@/presentation/middleware/guards';

describe('OAuthController', () => {
  let controller: OAuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OAuthController],
    })
      .overrideGuard(GoogleAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<OAuthController>(OAuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('googleAuth', () => {
    it('should return undefined', async () => {
      const result = await controller.googleAuth();
      expect(result).toBeUndefined();
    });
  });

  describe('googleAuthCallback', () => {
    it('should set cookies and return user data when tokens are present', async () => {
      const mockReq = {
        user: {
          accessToken: 'test-access-token',
          refreshToken: 'test-refresh-token',
          id: 'user-1',
        },
      };

      const mockRes = {
        cookie: jest.fn(),
      };

      const result = await controller.googleAuthCallback(
        mockReq as any,
        mockRes as any,
      );

      expect(result).toEqual(mockReq.user);
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'access_token',
        'test-access-token',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
          maxAge: 24 * 60 * 60 * 1000,
        }),
      );
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'refresh_token',
        'test-refresh-token',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000,
        }),
      );
    });

    it('should not set cookies if tokens are missing', async () => {
      const mockReq = {
        user: {
          id: 'user-1',
        },
      };

      const mockRes = {
        cookie: jest.fn(),
      };

      const result = await controller.googleAuthCallback(
        mockReq as any,
        mockRes as any,
      );

      expect(result).toEqual(mockReq.user);
      expect(mockRes.cookie).not.toHaveBeenCalled();
    });

    it('should return undefined if req.user is empty', async () => {
      const mockReq = {};

      const mockRes = {
        cookie: jest.fn(),
      };

      const result = await controller.googleAuthCallback(
        mockReq as any,
        mockRes as any,
      );

      expect(result).toBeUndefined();
      expect(mockRes.cookie).not.toHaveBeenCalled();
    });
  });
});
