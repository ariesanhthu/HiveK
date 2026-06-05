import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '@/application/services/auth.service';
import { AUTH_JWT_SERVICE } from '@/application/interfaces/auth-jwt.interface';
import { ConfigService } from '@nestjs/config';

describe('AuthService', () => {
  let authService: AuthService;
  let mockJwtService: any;
  let mockConfigService: any;

  beforeEach(async () => {
    mockJwtService = {
      sign: jest.fn().mockReturnValue('mock-token'),
    };

    mockConfigService = {
      get: jest.fn((key: string, defaultValue?: any) => {
        const config: Record<string, any> = {
          JWT_ACCESS_EXPIRATION_MINUTES: 30,
          JWT_REFRESH_EXPIRATION_MINUTES: 10080,
        };
        return config[key] ?? defaultValue;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: AUTH_JWT_SERVICE,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  describe('normalizeEmail', () => {
    it('should trim whitespace', () => {
      expect(authService.normalizeEmail('  user@example.com  ')).toBe('user@example.com');
    });

    it('should convert to lowercase', () => {
      expect(authService.normalizeEmail('USER@EXAMPLE.COM')).toBe('user@example.com');
    });

    it('should handle mixed case with spaces', () => {
      expect(authService.normalizeEmail('  UserName@Example.Com  ')).toBe('username@example.com');
    });

    it('should handle already normalized email', () => {
      expect(authService.normalizeEmail('user@example.com')).toBe('user@example.com');
    });
  });

  describe('hashPassword', () => {
    it('should return a hashed string that starts with $2b$10$', async () => {
      const hash = await authService.hashPassword('myPassword123');
      expect(hash).toMatch(/^\$2b\$10\$/);
      expect(hash.length).toBeGreaterThan(50);
    });

    it('should produce different hashes for the same password (different salts)', async () => {
      const hash1 = await authService.hashPassword('samePassword');
      const hash2 = await authService.hashPassword('samePassword');
      expect(hash1).not.toBe(hash2);
    });

    it('should produce different hashes for different passwords', async () => {
      const hash1 = await authService.hashPassword('password1');
      const hash2 = await authService.hashPassword('password2');
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching password', async () => {
      const password = 'myPassword123';
      const hash = await authService.hashPassword(password);
      const result = await authService.comparePassword(password, hash);
      expect(result).toBe(true);
    });

    it('should return false for wrong password', async () => {
      const hash = await authService.hashPassword('correctPassword');
      const result = await authService.comparePassword('wrongPassword', hash);
      expect(result).toBe(false);
    });

    it('should return false for empty password', async () => {
      const hash = await authService.hashPassword('somePassword');
      const result = await authService.comparePassword('', hash);
      expect(result).toBe(false);
    });
  });

  describe('generateTokens', () => {
    it('should generate access and refresh tokens', async () => {
      const payload = { sub: 'user-1', email: 'user@test.com', role: 'role-1', type: 'kol' };
      const result = await authService.generateTokens(payload);

      expect(result).toBeDefined();
      expect(result.accessToken).toBe('mock-token');
      expect(result.refreshToken).toBe('mock-token');
      expect(mockJwtService.sign).toHaveBeenCalledTimes(2);
    });

    it('should call JWT sign with correct payload and options for access token', async () => {
      const payload = { sub: 'user-1', email: 'user@test.com', role: 'role-1', type: 'kol' };
      await authService.generateTokens(payload);

      expect(mockJwtService.sign).toHaveBeenNthCalledWith(1, payload, { expiresInMinutes: 30 });
    });

    it('should call JWT sign with correct payload and options for refresh token', async () => {
      const payload = { sub: 'user-1', email: 'user@test.com', role: 'role-1', type: 'kol' };
      await authService.generateTokens(payload);

      expect(mockJwtService.sign).toHaveBeenNthCalledWith(2, payload, { expiresInMinutes: 10080 });
    });
  });
});