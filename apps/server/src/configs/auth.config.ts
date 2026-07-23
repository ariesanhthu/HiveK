import { BaseConfigService } from '@hivek/nest-core';
import { Injectable } from '@nestjs/common';
import { registerAs } from '@nestjs/config';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

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

@Injectable()
export class AuthConfig extends BaseConfigService<AuthConfigDto> {
  constructor() {
    super(AuthConfigDto, {
      jwtSecret: process.env.JWT_SECRET || 'secret',
      jwtAccessExpirationMinutes: parseInt(process.env.JWT_ACCESS_EXPIRATION_MINUTES || '30', 10),
      jwtRefreshExpirationDays: parseInt(process.env.JWT_REFRESH_EXPIRATION_DAYS || '7', 10),
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

  getJwtSecret(): string {
    return this.config.jwtSecret;
  }

  getJwtAccessExpirationMinutes(): number {
    return this.config.jwtAccessExpirationMinutes;
  }

  getJwtRefreshExpirationDays(): number {
    return this.config.jwtRefreshExpirationDays;
  }

  getFacebookAppId(): string {
    return this.config.facebookAppId || 'dummy-id';
  }

  getFacebookAppSecret(): string {
    return this.config.facebookAppSecret || 'dummy-secret';
  }

  getFacebookCallbackUrl(): string {
    return this.config.facebookCallbackUrl || '';
  }

  getGoogleClientId(): string {
    return this.config.googleClientId || '';
  }

  getGoogleClientSecret(): string {
    return this.config.googleClientSecret || '';
  }

  getGoogleCallbackUrl(): string {
    return this.config.googleCallbackUrl || '';
  }

  getTwitterConsumerKey(): string {
    return this.config.twitterConsumerKey || 'dummy-key';
  }

  getTwitterConsumerSecret(): string {
    return this.config.twitterConsumerSecret || 'dummy-secret';
  }

  getTwitterCallbackUrl(): string {
    return this.config.twitterCallbackUrl || '';
  }

  getYoutubeClientId(): string {
    return this.config.youtubeClientId || 'dummy-id';
  }

  getYoutubeClientSecret(): string {
    return this.config.youtubeClientSecret || 'dummy-secret';
  }

  getYoutubeCallbackUrl(): string {
    return this.config.youtubeCallbackUrl || '';
  }
}

export const authConfig = registerAs('auth', () => new AuthConfig());
