import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from '@/presentation/middleware/guards/jwt-auth.guard';
import { JwtStrategy } from '@/infrastructure/auth/strategies/jwt.strategy';
import { ERoleType } from '@/core/enums';
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

    beforeEach(async () => {
      const mockConfigService = {
        get: jest.fn().mockReturnValue('test-secret'),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          JwtStrategy,
          {
            provide: ConfigService,
            useValue: mockConfigService,
          },
        ],
      }).compile();

      strategy = module.get<JwtStrategy>(JwtStrategy);
    });

    it('should be defined', () => {
      expect(strategy).toBeDefined();
    });

    it('should return payload with inferred type from role string', async () => {
      const payload = { sub: 'user-1', email: 'alice@example.com', role: 'kol' };

      const result = await strategy.validate(payload);

      expect(result).toEqual({
        sub: 'user-1',
        email: 'alice@example.com',
        role: 'kol',
        type: ERoleType.KOL,
      });
    });

    it('should handle enterprise role', async () => {
      const payload = { sub: 'user-2', email: 'biz@example.com', role: 'enterprise' };

      const result = await strategy.validate(payload);

      expect(result.type).toBe(ERoleType.ENTERPRISE);
    });

    it('should handle admin role', async () => {
      const payload = { sub: 'user-3', email: 'admin@example.com', role: 'admin' };

      const result = await strategy.validate(payload);

      expect(result.type).toBe(ERoleType.ADMIN);
    });

    it('should handle payload with explicit type field', async () => {
      const payload = { sub: 'user-4', email: 'test@example.com', role: 'custom', type: 'kol' };

      const result = await strategy.validate(payload);

      expect(result.type).toBe('kol');
    });

    it('should provide fallback values for missing fields', async () => {
      const payload = { sub: 'user-5' } as any;

      const result = await strategy.validate(payload);

      expect(result.sub).toBe('user-5');
      expect(result.email).toBe('');
      expect(result.role).toBe('');
      expect(result.type).toBeDefined();
    });
  });
});