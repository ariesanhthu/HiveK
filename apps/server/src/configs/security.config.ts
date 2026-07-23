import { BaseConfigService } from '@hivek/nest-core';
import { Injectable } from '@nestjs/common';
import { registerAs } from '@nestjs/config';
import { IsOptional, IsString } from 'class-validator';

/* -------------------------------------------------------------------------- */
/*                                1. DTO SCHEMA                               */
/* -------------------------------------------------------------------------- */

/**
 * DTO containing validation rules for security credentials (API Key, reCAPTCHA).
 */
export class SecurityConfigDto {
  @IsString()
  @IsOptional()
  apiKey?: string;

  @IsString()
  @IsOptional()
  recaptchaSecretKey?: string;
}

/* -------------------------------------------------------------------------- */
/*                               2. CONFIG SERVICE                            */
/* -------------------------------------------------------------------------- */

/**
 * Application security configuration service (X-API-KEY, reCAPTCHA verification key).
 */
@Injectable()
export class SecurityConfig extends BaseConfigService<SecurityConfigDto> {
  constructor() {
    super(SecurityConfigDto, {
      apiKey: process.env.API_KEY,
      recaptchaSecretKey: process.env.RECAPTCHA_SECRET_KEY,
    });
  }

  /**
   * Get API Key for ApiKeyGuard validation.
   * @returns API key string or undefined
   */
  getApiKey(): string | undefined {
    return this.config.apiKey;
  }

  /**
   * Get Google reCAPTCHA Secret Key for RecaptchaGuard verification.
   * @returns reCAPTCHA secret key string or undefined
   */
  getRecaptchaSecretKey(): string | undefined {
    return this.config.recaptchaSecretKey;
  }
}

/* -------------------------------------------------------------------------- */
/*                          3. NESTJS CONFIG FACTORY                          */
/* -------------------------------------------------------------------------- */

/**
 * Register 'security' namespace with NestJS ConfigModule.
 */
export const securityConfig = registerAs('security', () => new SecurityConfig());
