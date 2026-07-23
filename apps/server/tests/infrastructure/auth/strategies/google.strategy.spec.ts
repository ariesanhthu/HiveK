import { AuthGoogleSignInCommand } from '@/application/commands';
import { ERoleType } from '@/core/enums';
import { GoogleStrategy } from '@/infrastructure/auth/strategies/google.strategy';
import { ConfigService } from '@nestjs/config';
import { CommandBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';

describe('GoogleStrategy', () => {
  let strategy: GoogleStrategy;
  let mockCommandBus: jest.Mocked<CommandBus>;
  let mockConfigService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    mockCommandBus = {
      execute: jest.fn(),
    } as any;

    mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'GOOGLE_CLIENT_ID') return 'client-id';
        if (key === 'GOOGLE_CLIENT_SECRET') return 'client-secret';
        if (key === 'GOOGLE_CALLBACK_URL') return 'callback-url';
        return null;
      }),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoogleStrategy,
        { provide: CommandBus, useValue: mockCommandBus },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    strategy = module.get<GoogleStrategy>(GoogleStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    const mockProfile = {
      id: 'google-123',
      emails: [{ value: 'google@example.com' }],
      displayName: 'Google User',
      photos: [{ value: 'https://photo.com/u.jpg' }],
    };

    it('should parse type from state and execute AuthGoogleSignInCommand', async () => {
      const mockReq = {
        query: {
          state: JSON.stringify({ type: 'enterprise' }),
        },
      };

      mockCommandBus.execute.mockResolvedValue({ accessToken: 'at', refreshToken: 'rt' });

      const result = await strategy.validate(mockReq as any, 'at', 'rt', mockProfile);

      expect(mockCommandBus.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            googleId: 'google-123',
            email: 'google@example.com',
            type: ERoleType.ENTERPRISE,
          }),
        }),
      );
      expect(result).toEqual({ accessToken: 'at', refreshToken: 'rt' });
    });

    it('should default to KOL type if state is missing', async () => {
      const mockReq = {
        query: {},
      };

      mockCommandBus.execute.mockResolvedValue({ accessToken: 'at', refreshToken: 'rt' });

      await strategy.validate(mockReq as any, 'at', 'rt', mockProfile);

      expect(mockCommandBus.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            type: ERoleType.KOL,
          }),
        }),
      );
    });

    it('should handle raw string type in state for backward compatibility', async () => {
      const mockReq = {
        query: {
          state: 'enterprise',
        },
      };

      mockCommandBus.execute.mockResolvedValue({ accessToken: 'at', refreshToken: 'rt' });

      await strategy.validate(mockReq as any, 'at', 'rt', mockProfile);

      expect(mockCommandBus.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            type: ERoleType.ENTERPRISE,
          }),
        }),
      );
    });
  });
});
