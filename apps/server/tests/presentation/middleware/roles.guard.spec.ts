import { ERoleType } from '@/core/enums';
import { RolesGuard } from '@/presentation/middleware/guards/roles.guard';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  const createMockContext = (request: any): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext;
  };

  it('should return true if no roles are required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
      if (key === 'roles') return undefined;
      return false;
    });

    const context = createMockContext({ user: { type: ERoleType.KOL } });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should return true if required roles list is empty', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
      if (key === 'roles') return [];
      return false;
    });

    const context = createMockContext({ user: { type: ERoleType.KOL } });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should return false if roles are required but user is not authenticated/present', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
      if (key === 'roles') return [ERoleType.KOL];
      return false;
    });

    const context = createMockContext({});
    expect(guard.canActivate(context)).toBe(false);
  });

  it('should return true if user type matches the required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
      if (key === 'roles') return [ERoleType.KOL];
      return false;
    });

    const context = createMockContext({ user: { type: ERoleType.KOL } });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should return false if user type does not match any required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
      if (key === 'roles') return [ERoleType.ENTERPRISE];
      return false;
    });

    const context = createMockContext({ user: { type: ERoleType.KOL } });
    expect(guard.canActivate(context)).toBe(false);
  });

  it('should return true if user is ADMIN even if ADMIN is not in required roles', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
      if (key === 'roles') return [ERoleType.ENTERPRISE];
      return false;
    });

    const context = createMockContext({ user: { type: ERoleType.ADMIN } });
    expect(guard.canActivate(context)).toBe(true);
  });
});
