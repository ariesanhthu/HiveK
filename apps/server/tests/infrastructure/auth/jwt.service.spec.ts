import { JwtAuthService } from '@/infrastructure/auth/jwt.service';
import { JwtService } from '@nestjs/jwt';

describe('JwtAuthService', () => {
  let jwtAuthService: JwtAuthService;
  let nestJwtService: jest.Mocked<JwtService>;

  beforeEach(() => {
    nestJwtService = {
      sign: jest.fn().mockReturnValue('signed-token'),
      verify: jest.fn().mockReturnValue({ sub: 'user-1', email: 'test@test.com' }),
      decode: jest.fn().mockReturnValue({ sub: 'user-1', email: 'test@test.com' }),
    } as any;
    jwtAuthService = new JwtAuthService(nestJwtService);
  });

  describe('sign', () => {
    it('should sign payload with default options', () => {
      const payload = { sub: 'user-1', email: 'test@test.com', role: 'role-1', type: 'kol' };
      const token = jwtAuthService.sign(payload);
      expect(token).toBe('signed-token');
      expect(nestJwtService.sign).toHaveBeenCalledWith(payload, {});
    });

    it('should sign with expiresInMinutes converted to seconds', () => {
      const payload = { sub: 'user-1', email: 'test@test.com', role: 'role-1', type: 'kol' };
      jwtAuthService.sign(payload, { expiresInMinutes: 30 });
      expect(nestJwtService.sign).toHaveBeenCalledWith(payload, { expiresIn: 1800 });
    });

    it('should pass through optional JWT options', () => {
      const payload = { sub: 'user-1', email: 'test@test.com', role: 'role-1', type: 'kol' };
      jwtAuthService.sign(payload, {
        secret: 'custom-secret',
        audience: 'myapp',
        issuer: 'hivek',
        jwtid: 'id-1',
        subject: 'auth',
      });
      expect(nestJwtService.sign).toHaveBeenCalledWith(payload, {
        expiresIn: undefined,
        secret: 'custom-secret',
        audience: 'myapp',
        issuer: 'hivek',
        jwtid: 'id-1',
        subject: 'auth',
      });
    });
  });

  describe('verify', () => {
    it('should verify and return payload', () => {
      const result = jwtAuthService.verify('valid-token');
      expect(result).toEqual({ sub: 'user-1', email: 'test@test.com' });
      expect(nestJwtService.verify).toHaveBeenCalledWith('valid-token', undefined);
    });

    it('should verify with options', () => {
      jwtAuthService.verify('token', { secret: 'custom-secret' });
      expect(nestJwtService.verify).toHaveBeenCalledWith('token', { secret: 'custom-secret' });
    });
  });

  describe('decode', () => {
    it('should decode without verification', () => {
      const result = jwtAuthService.decode('some-token');
      expect(result).toEqual({ sub: 'user-1', email: 'test@test.com' });
    });
  });

  describe('extractTokenFromHeader', () => {
    it('should extract Bearer token', () => {
      const result = jwtAuthService.extractTokenFromHeader('Bearer my-jwt-token');
      expect(result).toBe('my-jwt-token');
    });

    it('should return null when no auth header', () => {
      expect(jwtAuthService.extractTokenFromHeader(undefined)).toBeNull();
    });

    it('should return null when not Bearer', () => {
      expect(jwtAuthService.extractTokenFromHeader('Basic base64encoded')).toBeNull();
    });
  });

  describe('extractTokenFromCookie', () => {
    it('should extract token from cookies', () => {
      const req = { cookies: { access_token: 'cookie-token' } };
      expect(jwtAuthService.extractTokenFromCookie(req)).toBe('cookie-token');
    });

    it('should return null when no cookies', () => {
      expect(jwtAuthService.extractTokenFromCookie({})).toBeNull();
    });

    it('should return null when req is undefined', () => {
      expect(jwtAuthService.extractTokenFromCookie(undefined)).toBeNull();
    });
  });

  describe('verifyAuthHeader', () => {
    it('should extract and verify token from header', () => {
      nestJwtService.verify.mockReturnValue({ sub: 'user-1', email: 'test@test.com' } as any);
      const result = jwtAuthService.verifyAuthHeader('Bearer my-token');
      expect(result).toEqual({ sub: 'user-1', email: 'test@test.com' });
      expect(nestJwtService.verify).toHaveBeenCalledWith('my-token', undefined);
    });

    it('should throw when header is missing', () => {
      expect(() => jwtAuthService.verifyAuthHeader(undefined)).toThrow(
        'No authorization token provided',
      );
    });
  });

  describe('verifyHandshake', () => {
    it('should use handshake token first', () => {
      nestJwtService.verify.mockReturnValue({ sub: 'user-1' } as any);
      const result = jwtAuthService.verifyHandshake('ignored', 'handshake-token');
      expect(result).toEqual({ sub: 'user-1' });
      expect(nestJwtService.verify).toHaveBeenCalledWith('handshake-token', undefined);
    });

    it('should strip Bearer prefix from handshake token', () => {
      nestJwtService.verify.mockReturnValue({ sub: 'user-1' } as any);
      jwtAuthService.verifyHandshake(undefined, 'Bearer striped-token');
      expect(nestJwtService.verify).toHaveBeenCalledWith('striped-token', undefined);
    });

    it('should fallback to auth header when no handshake token', () => {
      nestJwtService.verify.mockReturnValue({ sub: 'user-1' } as any);
      jwtAuthService.verifyHandshake('Bearer header-token', undefined);
      expect(nestJwtService.verify).toHaveBeenCalledWith('header-token', undefined);
    });

    it('should throw when no token provided', () => {
      expect(() => jwtAuthService.verifyHandshake(undefined, undefined)).toThrow(
        'No authorization token provided',
      );
    });
  });

  describe('verifyRequest', () => {
    it('should use auth header first', () => {
      nestJwtService.verify.mockReturnValue({ sub: 'user-1' } as any);
      const req = {
        headers: { authorization: 'Bearer header-token' },
        cookies: { access_token: 'cookie-token' },
      };
      const result = jwtAuthService.verifyRequest(req);
      expect(result).toEqual({ sub: 'user-1' });
      expect(nestJwtService.verify).toHaveBeenCalledWith('header-token', undefined);
    });

    it('should fallback to cookie when no auth header', () => {
      nestJwtService.verify.mockReturnValue({ sub: 'user-1' } as any);
      const req = { headers: {}, cookies: { access_token: 'cookie-token' } };
      const result = jwtAuthService.verifyRequest(req);
      expect(result).toEqual({ sub: 'user-1' });
      expect(nestJwtService.verify).toHaveBeenCalledWith('cookie-token', undefined);
    });

    it('should throw when no token anywhere', () => {
      const req = { headers: {} };
      expect(() => jwtAuthService.verifyRequest(req)).toThrow('No authorization token provided');
    });
  });
});
