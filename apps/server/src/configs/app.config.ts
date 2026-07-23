import { BaseConfigService } from '@hivek/nest-core';
import { Injectable } from '@nestjs/common';
import { registerAs } from '@nestjs/config';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

/* -------------------------------------------------------------------------- */
/*                                1. DTO SCHEMA                               */
/* -------------------------------------------------------------------------- */

/**
 * DTO containing validation rules for application environment variables.
 */
export class AppConfigDto {
  @IsString()
  @IsNotEmpty()
  host: string;

  @IsInt()
  port: number;

  @IsString()
  @IsNotEmpty()
  env: string;
}

/* -------------------------------------------------------------------------- */
/*                               2. CONFIG SERVICE                            */
/* -------------------------------------------------------------------------- */

/**
 * Core application configuration service (Host, Port, Environment, Swagger).
 * Extends BaseConfigService for automatic environment validation via AppConfigDto.
 */
@Injectable()
export class AppConfig extends BaseConfigService<AppConfigDto> {
  private static readonly GLOBAL_PREFIX = 'hivek';
  private static readonly SWAGGER_TITLE = 'HiveK API';
  private static readonly SWAGGER_DESCRIPTION =
    'The API documentation for the HiveK Platform.\n\nNOTE: Sensitive endpoints (Sign-In, Sign-Up, OTP) are rate-limited to 5 requests per minute.';
  private static readonly SWAGGER_VERSION = '1.0';

  constructor() {
    super(AppConfigDto, {
      host: process.env.HOST || '0.0.0.0',
      port: parseInt(process.env.PORT || '3000', 10),
      env: process.env.NODE_ENV || 'development',
    });
  }

  /* ---------------------- Dynamic Environment Getters ---------------------- */

  /**
   * Get application server host string.
   * @returns Server host string
   */
  getHost(): string {
    return this.config.host;
  }

  /**
   * Get server listening port.
   * @returns Port number
   */
  getPort(): number {
    return this.config.port;
  }

  /**
   * Get current environment name (development, production, test).
   * @returns Environment runtime string
   */
  getEnv(): string {
    return this.config.env;
  }

  /* ------------------- Static Constant Config Getters --------------------- */

  /**
   * Get global API route prefix.
   * @returns Global URL prefix
   */
  getGlobalPrefix(): string {
    return AppConfig.GLOBAL_PREFIX;
  }

  /**
   * Get Swagger API documentation title.
   * @returns Swagger title
   */
  getSwaggerTitle(): string {
    return AppConfig.SWAGGER_TITLE;
  }

  /**
   * Get Swagger API description text.
   * @returns Swagger description
   */
  getSwaggerDescription(): string {
    return AppConfig.SWAGGER_DESCRIPTION;
  }

  /**
   * Get Swagger API version string.
   * @returns Swagger version
   */
  getSwaggerVersion(): string {
    return AppConfig.SWAGGER_VERSION;
  }
}

/* -------------------------------------------------------------------------- */
/*                          3. NESTJS CONFIG FACTORY                          */
/* -------------------------------------------------------------------------- */

/**
 * Register 'app' namespace with NestJS ConfigModule.
 */
export const appConfig = registerAs('app', () => new AppConfig());
