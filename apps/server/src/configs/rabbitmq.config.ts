import { BaseConfigService } from '@hivek/nest-core';
import { Injectable } from '@nestjs/common';
import { registerAs } from '@nestjs/config';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class RabbitMQConfigDto {
  @IsString()
  @IsOptional()
  user?: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  host?: string;

  @IsInt()
  port: number;

  @IsString()
  @IsOptional()
  vhost?: string;
}

@Injectable()
export class RabbitMQConfig extends BaseConfigService<RabbitMQConfigDto> {
  constructor() {
    super(RabbitMQConfigDto, {
      user: process.env.RMQ_USER || 'guest',
      password: process.env.RMQ_PASSWORD || 'guest',
      host: process.env.RMQ_HOST || 'localhost',
      port: parseInt(process.env.RMQ_PORT || '5672', 10),
      vhost: process.env.RMQ_VHOST || '/',
    });
  }

  getUser(): string {
    return this.config.user || 'guest';
  }

  getPassword(): string {
    return this.config.password || 'guest';
  }

  getHost(): string {
    return this.config.host || 'localhost';
  }

  getPort(): number {
    return this.config.port;
  }

  getVhost(): string {
    return this.config.vhost || '/';
  }
}

export const rabbitmqConfig = registerAs('rabbitmq', () => new RabbitMQConfig());
