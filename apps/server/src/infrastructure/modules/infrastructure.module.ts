import { LOGGER_SERVICE, MAILER_SERVICE } from '@/application/interfaces';
import { AppConfig } from '@/configs/app.config';
import { STORAGE_SERVICE } from '@/core/interfaces/storage';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/adapters/handlebars.adapter';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as path from 'path';
import { CloudinaryStorageService } from '../cloudinary';
import { WinstonLoggerService } from '../logger';
import { NestjsMailerService } from '../mailer';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('SMTP_HOST'),
          port: configService.get<number>('SMTP_PORT', 587),
          auth: {
            user: configService.get<string>('SMTP_USER'),
            pass: configService.get<string>('SMTP_PASS'),
          },
          secure: configService.get<number>('SMTP_PORT') === 465,
        },
        defaults: {
          from: configService.get<string>('SMTP_FROM', '"HiveK" <noreply@hivek.com>'),
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
  exports: [AppConfig, LOGGER_SERVICE, STORAGE_SERVICE, MAILER_SERVICE],
})
export class InfrastructureModule {}
