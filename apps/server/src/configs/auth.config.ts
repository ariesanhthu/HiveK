import { BaseConfigService } from '@hivek/nest-core';
import { Injectable } from '@nestjs/common';
import { registerAs } from '@nestjs/config';
import { Type } from 'class-transformer';
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

  @Type(() => Number)
  @IsInt()
  jwtAccessExpirationMinutes: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  jwtRefreshExpirationDays?: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  jwtRefreshExpirationMinutes?: number;

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
      jwtSecret: process.env.JWT_SECRET,
      jwtAccessExpirationMinutes: process.env.JWT_ACCESS_EXPIRATION_MINUTES,
      jwtRefreshExpirationDays: process.env.JWT_REFRESH_EXPIRATION_DAYS,
      jwtRefreshExpirationMinutes: process.env.JWT_REFRESH_EXPIRATION_MINUTES,
      facebookAppId: process.env.FACEBOOK_APP_ID,
      facebookAppSecret: process.env.FACEBOOK_APP_SECRET,
      facebookCallbackUrl: process.env.FACEBOOK_CALLBACK_URL,
      googleClientId: process.env.GOOGLE_CLIENT_ID,
      googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
      googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL,
      twitterConsumerKey: process.env.TWITTER_CONSUMER_KEY,
      twitterConsumerSecret: process.env.TWITTER_CONSUMER_SECRET,
      twitterCallbackUrl: process.env.TWITTER_CALLBACK_URL,
      youtubeClientId: process.env.YOUTUBE_CLIENT_ID,
      youtubeClientSecret: process.env.YOUTUBE_CLIENT_SECRET,
      youtubeCallbackUrl: process.env.YOUTUBE_CALLBACK_URL,
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
    if (this.config.jwtRefreshExpirationDays !== undefined) {
      return this.config.jwtRefreshExpirationDays;
    }
    if (this.config.jwtRefreshExpirationMinutes !== undefined) {
      return Math.floor(this.config.jwtRefreshExpirationMinutes / (24 * 60));
    }
    return 7;
  }

  /* ------------------------- Facebook OAuth Config ------------------------ */

  /**
   * Get Facebook App ID.
   * @returns Facebook App ID string or undefined
   */
  getFacebookAppId(): string | undefined {
    return this.config.facebookAppId;
  }

  /**
   * Get Facebook App Secret.
   * @returns Facebook App Secret string or undefined
   */
  getFacebookAppSecret(): string | undefined {
    return this.config.facebookAppSecret;
  }

  /**
   * Get Facebook Callback URL.
   * @returns Facebook Callback URL string or undefined
   */
  getFacebookCallbackUrl(): string | undefined {
    return this.config.facebookCallbackUrl;
  }

  /* -------------------------- Google OAuth Config ------------------------- */

  /**
   * Get Google Client ID.
   * @returns Google Client ID string or undefined
   */
  getGoogleClientId(): string | undefined {
    return this.config.googleClientId;
  }

  /**
   * Get Google Client Secret.
   * @returns Google Client Secret string or undefined
   */
  getGoogleClientSecret(): string | undefined {
    return this.config.googleClientSecret;
  }

  /**
   * Get Google Callback URL.
   * @returns Google Callback URL string or undefined
   */
  getGoogleCallbackUrl(): string | undefined {
    return this.config.googleCallbackUrl;
  }

  /* ------------------------- Twitter OAuth Config ------------------------- */

  /**
   * Get Twitter Consumer Key.
   * @returns Twitter Consumer Key string or undefined
   */
  getTwitterConsumerKey(): string | undefined {
    return this.config.twitterConsumerKey;
  }

  /**
   * Get Twitter Consumer Secret.
   * @returns Twitter Consumer Secret string or undefined
   */
  getTwitterConsumerSecret(): string | undefined {
    return this.config.twitterConsumerSecret;
  }

  /**
   * Get Twitter Callback URL.
   * @returns Twitter Callback URL string or undefined
   */
  getTwitterCallbackUrl(): string | undefined {
    return this.config.twitterCallbackUrl;
  }

  /* ------------------------- YouTube OAuth Config ------------------------- */

  /**
   * Get YouTube Client ID.
   * @returns YouTube Client ID string or undefined
   */
  getYoutubeClientId(): string | undefined {
    return this.config.youtubeClientId;
  }

  /**
   * Get YouTube Client Secret.
   * @returns YouTube Client Secret string or undefined
   */
  getYoutubeClientSecret(): string | undefined {
    return this.config.youtubeClientSecret;
  }

  /**
   * Get YouTube Callback URL.
   * @returns YouTube Callback URL string or undefined
   */
  getYoutubeCallbackUrl(): string | undefined {
    return this.config.youtubeCallbackUrl;
  }
}

/* -------------------------------------------------------------------------- */
/*                          3. NESTJS CONFIG FACTORY                          */
/* -------------------------------------------------------------------------- */

/**
 * Register 'auth' namespace with NestJS ConfigModule.
 */
export const authConfig = registerAs('auth', () => new AuthConfig());
