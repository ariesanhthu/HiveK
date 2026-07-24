import { BaseConfigService } from '@hivek/nest-core';
import { Injectable } from '@nestjs/common';
import { registerAs } from '@nestjs/config';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

/* -------------------------------------------------------------------------- */
/*                                1. DTO SCHEMA                               */
/* -------------------------------------------------------------------------- */

/**
 * DTO containing validation rules for Redis Cache connection parameters.
 */
export class RedisConfigDto {
  @IsString()
  @IsNotEmpty()
  host: string;

  @Type(() => Number)
  @IsInt()
  port: number;

  @IsString()
  @IsOptional()
  password?: string;
}

/* -------------------------------------------------------------------------- */
/*                               2. CONFIG SERVICE                            */
/* -------------------------------------------------------------------------- */

/**
 * Redis Cache configuration service (Host, Port, Password).
 */
@Injectable()
export class RedisConfig extends BaseConfigService<RedisConfigDto> {
  constructor() {
    super(RedisConfigDto, {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT
        ? parseInt(process.env.REDIS_PORT, 10)
        : undefined,
      password: process.env.REDIS_PASSWORD,
    });
  }

  /**
   * Get Redis server host.
   * @returns Host string
   */
  getHost(): string {
    return this.config.host;
  }

  /**
   * Get Redis server listening port.
   * @returns Port number
   */
  getPort(): number {
    return this.config.port;
  }

  /**
   * Get Redis authentication password.
   * @returns Password string or undefined
   */
  getPassword(): string | undefined {
    return this.config.password;
  }
}

/* -------------------------------------------------------------------------- */
/*                          3. NESTJS CONFIG FACTORY                          */
/* -------------------------------------------------------------------------- */

/**
 * Register 'redis' namespace with NestJS ConfigModule.
 */
export const redisConfig = registerAs('redis', () => new RedisConfig());
