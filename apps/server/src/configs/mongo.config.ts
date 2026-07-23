import { BaseConfigService } from '@hivek/nest-core';
import { Injectable } from '@nestjs/common';
import { registerAs } from '@nestjs/config';
import { IsNotEmpty, IsString } from 'class-validator';

/* -------------------------------------------------------------------------- */
/*                                1. DTO SCHEMA                               */
/* -------------------------------------------------------------------------- */

/**
 * DTO containing validation rules for MongoDB Connection URI.
 */
export class MongoConfigDto {
  @IsString()
  @IsNotEmpty()
  uri: string;
}

/* -------------------------------------------------------------------------- */
/*                               2. CONFIG SERVICE                            */
/* -------------------------------------------------------------------------- */

/**
 * MongoDB database configuration service.
 */
@Injectable()
export class MongoConfig extends BaseConfigService<MongoConfigDto> {
  constructor() {
    super(MongoConfigDto, {
      uri: process.env.MONGODB_URI as string,
    });
  }

  /**
   * Get MongoDB connection URI string.
   * @returns MongoDB URI string
   */
  getUri(): string {
    return this.config.uri;
  }
}

/* -------------------------------------------------------------------------- */
/*                          3. NESTJS CONFIG FACTORY                          */
/* -------------------------------------------------------------------------- */

/**
 * Register 'mongo' namespace with NestJS ConfigModule.
 */
export const mongoConfig = registerAs('mongo', () => new MongoConfig());
