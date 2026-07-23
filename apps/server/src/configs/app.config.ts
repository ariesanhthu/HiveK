import { BaseConfigService } from '@hivek/nest-core';
import { Injectable } from '@nestjs/common';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

/**
 * 1. DTO Schema containing validation rules for environment/runtime variables.
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

/**
 * 2. AppConfig Service utilizing AppConfigDto for env validation
 * and private static readonly constants for non-sensitive static values.
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

  // Dynamic environment variables
  getHost(): string {
    return this.config.host;
  }

  getPort(): number {
    return this.config.port;
  }

  getEnv(): string {
    return this.config.env;
  }

  // Static non-sensitive constant configurations
  getGlobalPrefix(): string {
    return AppConfig.GLOBAL_PREFIX;
  }

  getSwaggerTitle(): string {
    return AppConfig.SWAGGER_TITLE;
  }

  getSwaggerDescription(): string {
    return AppConfig.SWAGGER_DESCRIPTION;
  }

  getSwaggerVersion(): string {
    return AppConfig.SWAGGER_VERSION;
  }
}
