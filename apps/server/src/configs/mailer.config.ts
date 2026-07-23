import { BaseConfigService } from '@hivek/nest-core';
import { Injectable } from '@nestjs/common';
import { registerAs } from '@nestjs/config';
import { IsInt, IsOptional, IsString } from 'class-validator';

/* -------------------------------------------------------------------------- */
/*                                1. DTO SCHEMA                               */
/* -------------------------------------------------------------------------- */

/**
 * DTO containing validation rules for Mailer (SMTP) configuration.
 */
export class MailerConfigDto {
  @IsString()
  @IsOptional()
  host?: string;

  @IsInt()
  @IsOptional()
  port?: number;

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

/* -------------------------------------------------------------------------- */
/*                               2. CONFIG SERVICE                            */
/* -------------------------------------------------------------------------- */

/**
 * Email service SMTP configuration class.
 */
@Injectable()
export class MailerConfig extends BaseConfigService<MailerConfigDto> {
  constructor() {
    super(MailerConfigDto, {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined,
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
      from: process.env.SMTP_FROM,
    });
  }

  /**
   * Get SMTP Host server.
   * @returns SMTP host string or undefined
   */
  getHost(): string | undefined {
    return this.config.host;
  }

  /**
   * Get SMTP connection port.
   * @returns Port number or undefined
   */
  getPort(): number | undefined {
    return this.config.port;
  }

  /**
   * Get SMTP authentication username.
   * @returns Username string or undefined
   */
  getUser(): string | undefined {
    return this.config.user;
  }

  /**
   * Get SMTP authentication password.
   * @returns Password string or undefined
   */
  getPass(): string | undefined {
    return this.config.pass;
  }

  /**
   * Get default 'From' email address header.
   * @returns From email string or undefined
   */
  getFrom(): string | undefined {
    return this.config.from;
  }

  /**
   * Check if SSL/TLS secure connection is used (port 465).
   * @returns Boolean indicating secure port status
   */
  isSecure(): boolean {
    return this.config.port === 465;
  }
}

/* -------------------------------------------------------------------------- */
/*                          3. NESTJS CONFIG FACTORY                          */
/* -------------------------------------------------------------------------- */

/**
 * Register 'mailer' namespace with NestJS ConfigModule.
 */
export const mailerConfig = registerAs('mailer', () => new MailerConfig());
