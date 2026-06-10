import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from '@/presentation/middleware/guards/jwt-auth.guard';
import { JwtStrategy } from '@/infrastructure/auth/strategies/jwt.strategy';
import { ERoleType } from '@/core/enums';
import { ExecutionContext } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { LOGGER_SERVICE } from '@/application';

describe('JwtAuthGuard & Strategy', () => {
  let mockCommandBus: any;
  let mockLogger: any;

  beforeEach(() => {
      mockCommandBus = {
          execute: jest.fn(),
      };
      mockLogger = {
          setContext: jest.fn(),
          debug: jest.fn(),
          log: jest.fn(),
          error: jest.fn(),
      };
  });

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
              provide: CommandBus,
              useValue: mockCommandBus,
          },
          {
              provide: LOGGER_SERVICE,
              useValue: mockLogger,
          }
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
          {
              provide: CommandBus,
              useValue: mockCommandBus,
          },
          {
              provide: LOGGER_SERVICE,
              useValue: mockLogger,
          }
        ],
      }).compile();

      strategy = module.get<JwtStrategy>(JwtStrategy);
    });

    it('should be defined', () => {
      expect(strategy).toBeDefined();
    });

    it('should return payload if user is valid', async () => {
      const payload = { sub: 'user-1', email: 'alice@example.com', role: 'role-1' };
      const mockUser = { id: 'user-1', email: 'alice@example.com', roleId: 'role-1', type: ERoleType.KOL };
      mockCommandBus.execute.mockResolvedValue(mockUser);

      const result = await strategy.validate(payload);

      expect(result).toEqual({
        sub: 'user-1',
        email: 'alice@example.com',
        role: 'role-1',
        type: ERoleType.KOL,
      });
      expect(mockCommandBus.execute).toHaveBeenCalled();
    });
  });
});
