import { BaseConfigService } from '@hivek/nest-core';
import { Injectable } from '@nestjs/common';
import { registerAs } from '@nestjs/config';
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
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD || undefined,
    });
  }

  /**
   * Get Redis server host.
   * @returns Host string (default: 'localhost')
   */
  getHost(): string {
    return this.config.host;
  }

  /**
   * Get Redis server listening port.
   * @returns Port number (default: 6379)
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
