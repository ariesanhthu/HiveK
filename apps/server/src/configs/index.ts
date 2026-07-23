import { appConfig } from './app.config';
import { authConfig } from './auth.config';
import { cloudinaryConfig } from './cloudinary.config';
import { mailerConfig } from './mailer.config';
import { mongoConfig } from './mongo.config';
import { rabbitmqConfig } from './rabbitmq.config';
import { redisConfig } from './redis.config';
import { securityConfig } from './security.config';

export * from './app.config';
export * from './auth.config';
export * from './cloudinary.config';
export * from './mailer.config';
export * from './mongo.config';
export * from './rabbitmq.config';
export * from './redis.config';
export * from './security.config';

/**
 * Global array of all configuration factories loaded at once by NestJS ConfigModule.forRoot()
 */
export const globalConfigs = [
  appConfig,
  authConfig,
  cloudinaryConfig,
  mailerConfig,
  mongoConfig,
  rabbitmqConfig,
  redisConfig,
  securityConfig,
];
