import { BaseConfigService } from '@hivek/nest-core';
import { Injectable } from '@nestjs/common';
import { registerAs } from '@nestjs/config';
import { IsOptional, IsString } from 'class-validator';

export class SecurityConfigDto {
  @IsString()
  @IsOptional()
  apiKey?: string;

  @IsString()
  @IsOptional()
  recaptchaSecretKey?: string;
}

@Injectable()
export class SecurityConfig extends BaseConfigService<SecurityConfigDto> {
  constructor() {
    super(SecurityConfigDto, {
      apiKey: process.env.API_KEY || '',
      recaptchaSecretKey: process.env.RECAPTCHA_SECRET_KEY || '',
    });
  }

  getApiKey(): string | undefined {
    return this.config.apiKey;
  }

  getRecaptchaSecretKey(): string | undefined {
    return this.config.recaptchaSecretKey;
  }
}

export const securityConfig = registerAs('security', () => new SecurityConfig());
