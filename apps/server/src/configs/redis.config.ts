import { BaseConfigService } from '@hivek/nest-core';
import { Injectable } from '@nestjs/common';
import { registerAs } from '@nestjs/config';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

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

@Injectable()
export class RedisConfig extends BaseConfigService<RedisConfigDto> {
  constructor() {
    super(RedisConfigDto, {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD || undefined,
    });
  }

  getHost(): string {
    return this.config.host;
  }

  getPort(): number {
    return this.config.port;
  }

  getPassword(): string | undefined {
    return this.config.password;
  }
}

export const redisConfig = registerAs('redis', () => new RedisConfig());
