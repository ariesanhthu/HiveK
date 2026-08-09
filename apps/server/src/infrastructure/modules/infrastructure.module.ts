import { Global, Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/adapters/handlebars.adapter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as path from 'path';
import { LOGGER_SERVICE, MAILER_SERVICE } from '@/application/interfaces';
import { STORAGE_SERVICE } from '@/core/interfaces/storage';
import { CloudinaryStorageService } from '../cloudinary';
import { NestjsMailerService } from '../mailer';
import { WinstonLoggerService } from '../logger';

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
          from: configService.get<string>(
            'SMTP_FROM',
            '"HiveK" <noreply@hivek.com>',
          ),
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
  exports: [LOGGER_SERVICE, STORAGE_SERVICE, MAILER_SERVICE],
})
export class InfrastructureModule {}
