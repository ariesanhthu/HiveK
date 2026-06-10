import { jest } from '@jest/globals';
import { AuthService } from '@/application/services/auth.service';
import { OutboxService } from '@/application/services/outbox.service';
import { type IUnitOfWork } from '@/application/interfaces/uow.interface';
import { CommandBus, QueryBus, EventBus } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';
import { type IRoleReadService, type IAuthJwtService, type IMailerService, type IWebSocketService } from '@/application/interfaces';

/**
 * Centralized mock factories for all application service interfaces.
 */

export const createMockAuthService = (): jest.Mocked<Partial<AuthService>> => ({
  normalizeEmail: jest.fn((email: string) => email.trim().toLowerCase()),
  hashPassword: jest.fn().mockResolvedValue('$2b$10$hashedPasswordString'),
  comparePassword: jest.fn(),
  generateTokens: jest.fn().mockResolvedValue({
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
  }),
});

export const createMockOutboxService = (): jest.Mocked<Partial<OutboxService>> => ({
  enqueue: jest.fn().mockResolvedValue(undefined),
  enqueueMany: jest.fn().mockResolvedValue(undefined),
});

export const createMockJwtService = (): jest.Mocked<Partial<IAuthJwtService>> => ({
  sign: jest.fn().mockReturnValue('mock-signed-jwt-token'),
  verify: jest.fn().mockReturnValue({ sub: 'user-1', email: 'test@test.com', role: 'role-1', type: 'kol' } as any),
});

export const createMockLoggerService = () => ({
  setContext: jest.fn(),
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
});

export const createMockMailerService = (): jest.Mocked<IMailerService> => ({
  sendMail: jest.fn().mockResolvedValue(undefined),
});

export const createMockMessageQueueService = () => ({
  emit: jest.fn().mockResolvedValue(undefined),
  send: jest.fn(),
  isHealthy: jest.fn().mockReturnValue(true),
});

export const createMockWebSocketService = (): jest.Mocked<IWebSocketService> => ({
  emitToUser: jest.fn(),
  broadcastToRoom: jest.fn(),
  broadcastAll: jest.fn(),
  disconnectUser: jest.fn().mockResolvedValue(undefined),
});

export const createMockStorageService = () => ({
  upload: jest.fn().mockResolvedValue({ url: 'https://cloudinary.com/test.jpg', publicId: 'test-id' }),
  delete: jest.fn().mockResolvedValue(true),
  getUrl: jest.fn().mockReturnValue('https://cloudinary.com/test.jpg'),
});

export const createMockUnitOfWork = (): jest.Mocked<IUnitOfWork> => ({
  startTransaction: jest.fn().mockResolvedValue(undefined),
  commitTransaction: jest.fn().mockResolvedValue(undefined),
  rollbackTransaction: jest.fn().mockResolvedValue(undefined),
  execute: jest.fn((fn: any) => fn()),
});

export const createMockCommandBus = (): jest.Mocked<Partial<CommandBus>> => ({
  execute: jest.fn(),
});

export const createMockQueryBus = (): jest.Mocked<Partial<QueryBus>> => ({
  execute: jest.fn(),
});

export const createMockEventBus = (): jest.Mocked<Partial<EventBus>> => ({
  publish: jest.fn(),
});

export const createMockConfigService = (): jest.Mocked<Partial<ConfigService>> => ({
  get: jest.fn((key: string, defaultValue?: unknown) => {
    const config: Record<string, unknown> = {
      JWT_ACCESS_EXPIRATION_MINUTES: 30,
      JWT_REFRESH_EXPIRATION_MINUTES: 10080,
      JWT_SECRET: 'test-secret',
      MONGODB_URI: 'mongodb://localhost:27017/test',
      SMTP_HOST: 'smtp.test.com',
      SMTP_PORT: 587,
      SMTP_USER: 'test@test.com',
      SMTP_PASS: 'test-pass',
      SMTP_FROM: '"HiveK" <noreply@hivek.com>',
      CLOUDINARY_CLOUD_NAME: 'test-cloud',
      CLOUDINARY_API_KEY: 'test-key',
      CLOUDINARY_API_SECRET: 'test-secret',
    };
    return config[key] ?? defaultValue;
  }) as any,
});

/**
 * Mock factories for Read Services
 */

export const createMockUserReadService = () => ({
  findById: jest.fn(),
  findAll: jest.fn(),
});

export const createMockRoleReadService = (): jest.Mocked<Partial<IRoleReadService>> => ({
  findById: jest.fn(),
  findAll: jest.fn().mockResolvedValue({ data: [], total: 0, page: 1, limit: 20 }),
});

export const createMockCampaignReadService = () => ({
  findById: jest.fn(),
  findAll: jest.fn(),
});

export const createMockCampaignParticipantReadService = () => ({
  findById: jest.fn(),
  findAll: jest.fn(),
});

export const createMockEnterpriseReadService = () => ({
  findById: jest.fn(),
  findAll: jest.fn(),
});

export const createMockKolProfileReadService = () => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  findByUserId: jest.fn(),
});

export const createMockPlatformReadService = () => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  findByCode: jest.fn(),
});

export const createMockNotificationReadService = () => ({
  findById: jest.fn(),
  findAll: jest.fn(),
});

export const createMockUploadedFileReadService = () => ({
  findById: jest.fn(),
  findAll: jest.fn(),
});

export const createMockKpiLogReadService = () => ({
  findById: jest.fn(),
  findAll: jest.fn(),
});
