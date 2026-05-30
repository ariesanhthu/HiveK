import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from '@/presentation/middleware/guards/jwt-auth.guard';
import { JwtStrategy } from '@/infrastructure/auth/jwt.strategy';
import { AUTH_JWT_SERVICE } from '@/application/interfaces/auth-jwt.interface';
import { ExecutionContext } from '@nestjs/common';

describe('JwtAuthGuard & Strategy', () => {
  describe('JwtAuthGuard', () => {
    let guard: JwtAuthGuard;
    let mockReflector: any;

    beforeEach(async () => {
      mockReflector = {
        getAllAndOverride: jest.fn(),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          JwtAuthGuard,
          JwtStrategy,
          {
            provide: Reflector,
            useValue: mockReflector,
          },
          {
            provide: ConfigService,
            useValue: { get: jest.fn().mockReturnValue('test-secret') },
          },
          {
            provide: AUTH_JWT_SERVICE,
            useValue: { extractTokenFromCookie: jest.fn() },
          },
        ],
      }).compile();

      guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    });

    it('should be defined', () => {
      expect(guard).toBeDefined();
    });

    it('should allow activation without auth if route is marked public', () => {
      mockReflector.getAllAndOverride.mockReturnValue(true);

      const mockContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;

      const result = guard.canActivate(mockContext);
      expect(result).toBe(true);
      expect(mockReflector.getAllAndOverride).toHaveBeenCalled();
    });

    it('should execute standard passport AuthGuard validation if route is not public', async () => {
      mockReflector.getAllAndOverride.mockReturnValue(false);

      const mockRequest = {
        headers: {},
      };

      const mockContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: () => ({
          getRequest: () => mockRequest,
          getResponse: () => ({}),
        }),
      } as unknown as ExecutionContext;

      await expect(
        Promise.resolve(guard.canActivate(mockContext))
      ).rejects.toThrow();

      expect(mockReflector.getAllAndOverride).toHaveBeenCalled();
    });
  });

  describe('JwtStrategy', () => {
    let strategy: JwtStrategy;
    let mockConfigService: any;
    let mockJwtService: any;

    beforeEach(async () => {
      mockConfigService = {
        get: jest.fn().mockReturnValue('test-secret'),
      };

      mockJwtService = {
        extractTokenFromCookie: jest.fn(),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          JwtStrategy,
          {
            provide: ConfigService,
            useValue: mockConfigService,
          },
          {
            provide: AUTH_JWT_SERVICE,
            useValue: mockJwtService,
          },
        ],
      }).compile();

      strategy = module.get<JwtStrategy>(JwtStrategy);
    });

    it('should be defined', () => {
      expect(strategy).toBeDefined();
    });

    it('should validate and return the token payload', async () => {
      const payload = { sub: 'user-1', email: 'alice@example.com', role: 'KOL' };
      const result = await strategy.validate(payload);
      expect(result).toEqual(payload);
    });
  });
});
