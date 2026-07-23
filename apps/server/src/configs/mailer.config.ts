import { BaseConfigService } from '@hivek/nest-core';
import { Injectable } from '@nestjs/common';
import { registerAs } from '@nestjs/config';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class MailerConfigDto {
  @IsString()
  @IsOptional()
  host?: string;

  @IsInt()
  port: number;

  @IsString()
  @IsOptional()
  user?: string;

  @IsString()
  @IsOptional()
  pass?: string;

  @IsString()
  @IsOptional()
  from?: string;
}

@Injectable()
export class MailerConfig extends BaseConfigService<MailerConfigDto> {
  private static readonly DEFAULT_FROM = '"HiveK" <noreply@hivek.com>';

  constructor() {
    super(MailerConfigDto, {
      host: process.env.SMTP_HOST || '',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
      from: process.env.SMTP_FROM || MailerConfig.DEFAULT_FROM,
    });
  }

  getHost(): string | undefined {
    return this.config.host;
  }

  getPort(): number {
    return this.config.port;
  }

  getUser(): string | undefined {
    return this.config.user;
  }

  getPass(): string | undefined {
    return this.config.pass;
  }

  getFrom(): string {
    return this.config.from || MailerConfig.DEFAULT_FROM;
  }

  isSecure(): boolean {
    return this.config.port === 465;
  }
}

export const mailerConfig = registerAs('mailer', () => new MailerConfig());
