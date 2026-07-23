import { BaseConfigService } from '@hivek/nest-core';
import { Injectable } from '@nestjs/common';
import { registerAs } from '@nestjs/config';
import { IsOptional, IsString } from 'class-validator';

/* -------------------------------------------------------------------------- */
/*                                1. DTO SCHEMA                               */
/* -------------------------------------------------------------------------- */

/**
 * DTO containing validation rules for Cloudinary storage credentials.
 */
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

/* -------------------------------------------------------------------------- */
/*                               2. CONFIG SERVICE                            */
/* -------------------------------------------------------------------------- */

/**
 * Cloudinary Storage file upload configuration service.
 */
@Injectable()
export class CloudinaryConfig extends BaseConfigService<CloudinaryConfigDto> {
  constructor() {
    super(CloudinaryConfigDto, {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      apiSecret: process.env.CLOUDINARY_API_SECRET,
      uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET,
    });
  }

  /**
   * Get Cloudinary Cloud Name.
   * @returns Cloud name string or undefined
   */
  getCloudName(): string | undefined {
    return this.config.cloudName;
  }

  /**
   * Get Cloudinary API Key.
   * @returns API key string or undefined
   */
  getApiKey(): string | undefined {
    return this.config.apiKey;
  }

  /**
   * Get Cloudinary API Secret.
   * @returns API secret string or undefined
   */
  getApiSecret(): string | undefined {
    return this.config.apiSecret;
  }

  /**
   * Get Cloudinary Upload Preset string.
   * @returns Upload preset string or undefined
   */
  getUploadPreset(): string | undefined {
    return this.config.uploadPreset;
  }
}

/* -------------------------------------------------------------------------- */
/*                          3. NESTJS CONFIG FACTORY                          */
/* -------------------------------------------------------------------------- */

/**
 * Register 'cloudinary' namespace with NestJS ConfigModule.
 */
export const cloudinaryConfig = registerAs('cloudinary', () => new CloudinaryConfig());
