import { BaseConfigService } from '@hivek/nest-core';
import { Injectable } from '@nestjs/common';
import { registerAs } from '@nestjs/config';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

/* -------------------------------------------------------------------------- */
/*                                1. DTO SCHEMA                               */
/* -------------------------------------------------------------------------- */

/**
 * DTO containing validation rules for JWT and OAuth provider credentials.
 */
export class AuthConfigDto {
  @IsString()
  @IsNotEmpty()
  jwtSecret: string;

  @IsInt()
  jwtAccessExpirationMinutes: number;

  @IsInt()
  jwtRefreshExpirationDays: number;

  @IsString()
  @IsOptional()
  facebookAppId?: string;

  @IsString()
  @IsOptional()
  facebookAppSecret?: string;

  @IsString()
  @IsOptional()
  facebookCallbackUrl?: string;

  @IsString()
  @IsOptional()
  googleClientId?: string;

  @IsString()
  @IsOptional()
  googleClientSecret?: string;

  @IsString()
  @IsOptional()
  googleCallbackUrl?: string;

  @IsString()
  @IsOptional()
  twitterConsumerKey?: string;

  @IsString()
  @IsOptional()
  twitterConsumerSecret?: string;

  @IsString()
  @IsOptional()
  twitterCallbackUrl?: string;

  @IsString()
  @IsOptional()
  youtubeClientId?: string;

  @IsString()
  @IsOptional()
  youtubeClientSecret?: string;

  @IsString()
  @IsOptional()
  youtubeCallbackUrl?: string;
}

/* -------------------------------------------------------------------------- */
/*                               2. CONFIG SERVICE                            */
/* -------------------------------------------------------------------------- */

/**
 * Authentication configuration service (JWT Secret, Expiration & OAuth Provider Credentials).
 */
@Injectable()
export class AuthConfig extends BaseConfigService<AuthConfigDto> {
  constructor() {
    super(AuthConfigDto, {
      jwtSecret: process.env.JWT_SECRET || 'secret',
      jwtAccessExpirationMinutes: parseInt(
        process.env.JWT_ACCESS_EXPIRATION_MINUTES || '30',
        10,
      ),
      jwtRefreshExpirationDays: parseInt(
        process.env.JWT_REFRESH_EXPIRATION_DAYS || '7',
        10,
      ),
      facebookAppId: process.env.FACEBOOK_APP_ID || 'dummy-id',
      facebookAppSecret: process.env.FACEBOOK_APP_SECRET || 'dummy-secret',
      facebookCallbackUrl: process.env.FACEBOOK_CALLBACK_URL || '',
      googleClientId: process.env.GOOGLE_CLIENT_ID || '',
      googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL || '',
      twitterConsumerKey: process.env.TWITTER_CONSUMER_KEY || 'dummy-key',
      twitterConsumerSecret: process.env.TWITTER_CONSUMER_SECRET || 'dummy-secret',
      twitterCallbackUrl: process.env.TWITTER_CALLBACK_URL || '',
      youtubeClientId: process.env.YOUTUBE_CLIENT_ID || 'dummy-id',
      youtubeClientSecret: process.env.YOUTUBE_CLIENT_SECRET || 'dummy-secret',
      youtubeCallbackUrl: process.env.YOUTUBE_CALLBACK_URL || '',
    });
  }

  /* -------------------------- JWT Configuration --------------------------- */

  /**
   * Get JWT Secret key.
   * @returns JWT Secret string
   */
  getJwtSecret(): string {
    return this.config.jwtSecret;
  }

  /**
   * Get JWT Access Token expiration time in minutes.
   * @returns Expiration time in minutes
   */
  getJwtAccessExpirationMinutes(): number {
    return this.config.jwtAccessExpirationMinutes;
  }

  /**
   * Get JWT Refresh Token expiration time in days.
   * @returns Expiration time in days
   */
  getJwtRefreshExpirationDays(): number {
    return this.config.jwtRefreshExpirationDays;
  }

  /* ------------------------- Facebook OAuth Config ------------------------ */

  /**
   * Get Facebook App ID.
   * @returns Facebook App ID string
   */
  getFacebookAppId(): string {
    return this.config.facebookAppId || 'dummy-id';
  }

  /**
   * Get Facebook App Secret.
   * @returns Facebook App Secret string
   */
  getFacebookAppSecret(): string {
    return this.config.facebookAppSecret || 'dummy-secret';
  }

  /**
   * Get Facebook Callback URL.
   * @returns Facebook Callback URL string
   */
  getFacebookCallbackUrl(): string {
    return this.config.facebookCallbackUrl || '';
  }

  /* -------------------------- Google OAuth Config ------------------------- */

  /**
   * Get Google Client ID.
   * @returns Google Client ID string
   */
  getGoogleClientId(): string {
    return this.config.googleClientId || '';
  }

  /**
   * Get Google Client Secret.
   * @returns Google Client Secret string
   */
  getGoogleClientSecret(): string {
    return this.config.googleClientSecret || '';
  }

  /**
   * Get Google Callback URL.
   * @returns Google Callback URL string
   */
  getGoogleCallbackUrl(): string {
    return this.config.googleCallbackUrl || '';
  }

  /* ------------------------- Twitter OAuth Config ------------------------- */

  /**
   * Get Twitter Consumer Key.
   * @returns Twitter Consumer Key string
   */
  getTwitterConsumerKey(): string {
    return this.config.twitterConsumerKey || 'dummy-key';
  }

  /**
   * Get Twitter Consumer Secret.
   * @returns Twitter Consumer Secret string
   */
  getTwitterConsumerSecret(): string {
    return this.config.twitterConsumerSecret || 'dummy-secret';
  }

  /**
   * Get Twitter Callback URL.
   * @returns Twitter Callback URL string
   */
  getTwitterCallbackUrl(): string {
    return this.config.twitterCallbackUrl || '';
  }

  /* ------------------------- YouTube OAuth Config ------------------------- */

  /**
   * Get YouTube Client ID.
   * @returns YouTube Client ID string
   */
  getYoutubeClientId(): string {
    return this.config.youtubeClientId || 'dummy-id';
  }

  /**
   * Get YouTube Client Secret.
   * @returns YouTube Client Secret string
   */
  getYoutubeClientSecret(): string {
    return this.config.youtubeClientSecret || 'dummy-secret';
  }

  /**
   * Get YouTube Callback URL.
   * @returns YouTube Callback URL string
   */
  getYoutubeCallbackUrl(): string {
    return this.config.youtubeCallbackUrl || '';
  }
}

/* -------------------------------------------------------------------------- */
/*                          3. NESTJS CONFIG FACTORY                          */
/* -------------------------------------------------------------------------- */

/**
 * Register 'auth' namespace with NestJS ConfigModule.
 */
export const authConfig = registerAs('auth', () => new AuthConfig());
