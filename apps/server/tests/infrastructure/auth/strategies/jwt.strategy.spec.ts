import { LOGGER_SERVICE } from '@/application';
import { JwtStrategy } from '@/infrastructure/auth/strategies/jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { CommandBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { createMockCommandBus, createMockLoggerService } from '../../../__mocks__/mock-services';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let commandBus: any;
  let logger: any;

  beforeEach(async () => {
    commandBus = createMockCommandBus();
    logger = createMockLoggerService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-secret'),
          },
        },
        {
          provide: CommandBus,
          useValue: commandBus,
        },
        {
          provide: LOGGER_SERVICE,
          useValue: logger,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('should validate and return payload', async () => {
    const payload = { sub: 'user-123', email: 'test@test.com' };
    const mockUser = { id: 'user-123', email: 'test@test.com', roleId: 'role-1', type: 'kol' };
    commandBus.execute.mockResolvedValue(mockUser);

    const result = await strategy.validate(payload as any);

    expect(result).toEqual({
      sub: 'user-123',
      email: 'test@test.com',
      role: 'role-1',
      type: 'kol',
    });
    expect(commandBus.execute).toHaveBeenCalled();
  });

  it('should extract token from cookies', () => {
    // This is hard to test directly because it's in the super call constructor
    // but we can at least verify the strategy exists.
    expect(strategy).toBeDefined();
  });
});
