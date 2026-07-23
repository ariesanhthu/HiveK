import { LOGGER_SERVICE, MAILER_SERVICE } from '@/application/interfaces';
import {
  AppConfig,
  AuthConfig,
  CloudinaryConfig,
  MailerConfig,
  MongoConfig,
  RabbitMQConfig,
  RedisConfig,
  SecurityConfig,
} from '@/configs';
import { STORAGE_SERVICE } from '@/core/interfaces/storage';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/adapters/handlebars.adapter';
import { Global, Module } from '@nestjs/common';
import * as path from 'path';
import { CloudinaryStorageService } from '../cloudinary';
import { WinstonLoggerService } from '../logger';
import { NestjsMailerService } from '../mailer';

@Global()
@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [MailerConfig],
      useFactory: (mailerConfig: MailerConfig) => ({
        transport: {
          host: mailerConfig.getHost(),
          port: mailerConfig.getPort(),
          auth: {
            user: mailerConfig.getUser(),
            pass: mailerConfig.getPass(),
          },
          secure: mailerConfig.isSecure(),
        },
        defaults: {
          from: mailerConfig.getFrom(),
        },
        template: {
          dir: path.join(__dirname, '..', 'mailer', 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
  ],
  providers: [
    AppConfig,
    AuthConfig,
    CloudinaryConfig,
    MailerConfig,
    MongoConfig,
    RabbitMQConfig,
    RedisConfig,
    SecurityConfig,
    {
      provide: LOGGER_SERVICE,
      useClass: WinstonLoggerService,
    },
    {
      provide: STORAGE_SERVICE,
      useClass: CloudinaryStorageService,
    },
    {
      provide: MAILER_SERVICE,
      useClass: NestjsMailerService,
    },
  ],
  exports: [
    AppConfig,
    AuthConfig,
    CloudinaryConfig,
    MailerConfig,
    MongoConfig,
    RabbitMQConfig,
    RedisConfig,
    SecurityConfig,
    LOGGER_SERVICE,
    STORAGE_SERVICE,
    MAILER_SERVICE,
  ],
})
export class InfrastructureModule {}
