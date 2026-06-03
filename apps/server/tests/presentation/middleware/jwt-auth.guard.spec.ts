import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from '@/presentation/middleware/guards/jwt-auth.guard';
import { JwtStrategy } from '@/infrastructure/auth/strategies/jwt.strategy';
import { AUTH_JWT_SERVICE } from '@/application/interfaces/auth-jwt.interface';
import { USER_REPOSITORY } from '@/core/interfaces/repositories';
import { ERoleType } from '@/core/enums';
import { ExecutionContext } from '@nestjs/common';

describe('JwtAuthGuard & Strategy', () => {
  let mockUserRepository: any;

  beforeEach(() => {
    mockUserRepository = {
      findById: jest.fn(),
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
            provide: AUTH_JWT_SERVICE,
            useValue: { extractTokenFromCookie: jest.fn() },
          },
          {
            provide: USER_REPOSITORY,
            useValue: mockUserRepository,
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
          {
            provide: USER_REPOSITORY,
            useValue: mockUserRepository,
          },
        ],
      }).compile();

      strategy = module.get<JwtStrategy>(JwtStrategy);
    });

    it('should be defined', () => {
      expect(strategy).toBeDefined();
    });

    it('should validate and return the token payload if user exists and is not deleted', async () => {
      const payload = { sub: 'user-1', email: 'alice@example.com', role: 'KOL' };
      const mockUser = {
        id: 'user-1',
        email: 'alice@example.com',
        roleId: 'role-KOL',
        type: ERoleType.KOL,
        deleteAt: null,
      };
      mockUserRepository.findById.mockResolvedValue(mockUser);

      const result = await strategy.validate(payload);
      expect(result).toEqual({
        sub: 'user-1',
        email: 'alice@example.com',
        role: 'role-KOL',
        type: ERoleType.KOL,
      });
      expect(mockUserRepository.findById).toHaveBeenCalledWith('user-1');
    });

    it('should throw UnauthorizedException if user does not exist', async () => {
      const payload = { sub: 'user-1', email: 'alice@example.com', role: 'KOL' };
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(strategy.validate(payload)).rejects.toThrow('User not found or deleted');
      expect(mockUserRepository.findById).toHaveBeenCalledWith('user-1');
    });

    it('should throw UnauthorizedException if user is soft deleted', async () => {
      const payload = { sub: 'user-1', email: 'alice@example.com', role: 'KOL' };
      const mockUser = {
        id: 'user-1',
        email: 'alice@example.com',
        roleId: 'role-KOL',
        type: ERoleType.KOL,
        deleteAt: new Date(),
      };
      mockUserRepository.findById.mockResolvedValue(mockUser);

      await expect(strategy.validate(payload)).rejects.toThrow('User not found or deleted');
      expect(mockUserRepository.findById).toHaveBeenCalledWith('user-1');
    });
  });
});
