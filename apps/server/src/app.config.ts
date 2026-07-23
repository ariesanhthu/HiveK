import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, validateSync } from 'class-validator';

/**
 * Base Config Service that automatically transforms raw configurations
 * into the DTO class, validates it, and stores the validated config.
 */
export abstract class BaseConfigService<T extends object> {
  protected readonly config: T;

  constructor(dtoClass: new() => T, rawConfig: Record<string, any>) {
    const dtoInstance = plainToInstance(dtoClass, rawConfig, {
      enableImplicitConversion: true,
    });

    const errors = validateSync(dtoInstance, { skipMissingProperties: false });
    if (errors.length > 0) {
      const validationErrors = errors
        .map((err) => `${err.property}: ${Object.values(err.constraints || {}).join(', ')}`)
        .join('\n');
      throw new Error(`[Config Validation Error] in ${dtoClass.name}:\n${validationErrors}`);
    }

    this.config = dtoInstance;
  }
}

/**
 * 1. DTO Schema containing the validation rules for the Application configuration.
 */
export class AppConfigDto {
  @IsString()
  @IsNotEmpty()
  host: string;

  @IsInt()
  port: number;

  @IsString()
  @IsNotEmpty()
  globalPrefix: string;

  @IsString()
  @IsNotEmpty()
  env: string;

  // Swagger configs
  @IsString()
  @IsNotEmpty()
  swaggerTitle: string;

  @IsString()
  @IsNotEmpty()
  swaggerDescription: string;

  @IsString()
  @IsNotEmpty()
  swaggerVersion: string;
}

/**
 * 2. AppConfig Service that utilizes AppConfigDto to validate the config,
 * exposes getter methods, and is registered for NestJS Dependency Injection.
 */
@Injectable()
export class AppConfig extends BaseConfigService<AppConfigDto> {
  constructor() {
    super(AppConfigDto, {
      host: process.env.HOST || '0.0.0.0',
      port: parseInt(process.env.PORT || '3000', 10),
      globalPrefix: process.env.GLOBAL_PREFIX || 'hivek',
      env: process.env.NODE_ENV || 'development',
      swaggerTitle: process.env.SWAGGER_TITLE || 'HiveK API',
      swaggerDescription: process.env.SWAGGER_DESCRIPTION
        || 'The API documentation for the HiveK Platform.\n\nNOTE: Sensitive endpoints (Sign-In, Sign-Up, OTP) are rate-limited to 5 requests per minute.',
      swaggerVersion: process.env.SWAGGER_VERSION || '1.0',
    });
  }

  getHost(): string {
    return this.config.host;
  }

  getPort(): number {
    return this.config.port;
  }

  getGlobalPrefix(): string {
    return this.config.globalPrefix;
  }

  getEnv(): string {
    return this.config.env;
  }

  getSwaggerTitle(): string {
    return this.config.swaggerTitle;
  }

  getSwaggerDescription(): string {
    return this.config.swaggerDescription;
  }

  getSwaggerVersion(): string {
    return this.config.swaggerVersion;
  }
}
