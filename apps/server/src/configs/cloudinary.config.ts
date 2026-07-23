import { BaseConfigService } from '@hivek/nest-core';
import { Injectable } from '@nestjs/common';
import { registerAs } from '@nestjs/config';
import { IsOptional, IsString } from 'class-validator';

export class CloudinaryConfigDto {
  @IsString()
  @IsOptional()
  cloudName?: string;

  @IsString()
  @IsOptional()
  apiKey?: string;

  @IsString()
  @IsOptional()
  apiSecret?: string;

  @IsString()
  @IsOptional()
  uploadPreset?: string;
}

@Injectable()
export class CloudinaryConfig extends BaseConfigService<CloudinaryConfigDto> {
  private static readonly DEFAULT_PRESET = 'hivek_uploads';

  constructor() {
    super(CloudinaryConfigDto, {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
      apiKey: process.env.CLOUDINARY_API_KEY || '',
      apiSecret: process.env.CLOUDINARY_API_SECRET || '',
      uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET || CloudinaryConfig.DEFAULT_PRESET,
    });
  }

  getCloudName(): string | undefined {
    return this.config.cloudName;
  }

  getApiKey(): string | undefined {
    return this.config.apiKey;
  }

  getApiSecret(): string | undefined {
    return this.config.apiSecret;
  }

  getUploadPreset(): string {
    return this.config.uploadPreset || CloudinaryConfig.DEFAULT_PRESET;
  }
}

export const cloudinaryConfig = registerAs('cloudinary', () => new CloudinaryConfig());
