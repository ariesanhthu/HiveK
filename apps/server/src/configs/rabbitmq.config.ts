import { BaseConfigService } from '@hivek/nest-core';
import { Injectable } from '@nestjs/common';
import { registerAs } from '@nestjs/config';
import { IsInt, IsOptional, IsString } from 'class-validator';

/* -------------------------------------------------------------------------- */
/*                                1. DTO SCHEMA                               */
/* -------------------------------------------------------------------------- */

/**
 * DTO containing validation rules for RabbitMQ Broker connection parameters.
 */
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

/* -------------------------------------------------------------------------- */
/*                               2. CONFIG SERVICE                            */
/* -------------------------------------------------------------------------- */

/**
 * RabbitMQ Message Broker connection configuration service.
 */
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

  /**
   * Get RabbitMQ account username.
   * @returns User string (default: 'guest')
   */
  getUser(): string {
    return this.config.user || 'guest';
  }

  /**
   * Get RabbitMQ account password.
   * @returns Password string (default: 'guest')
   */
  getPassword(): string {
    return this.config.password || 'guest';
  }

  /**
   * Get RabbitMQ broker host.
   * @returns Host string (default: 'localhost')
   */
  getHost(): string {
    return this.config.host || 'localhost';
  }

  /**
   * Get RabbitMQ AMQP port.
   * @returns Port number (default: 5672)
   */
  getPort(): number {
    return this.config.port;
  }

  /**
   * Get RabbitMQ Virtual Host (vhost).
   * @returns Vhost string (default: '/')
   */
  getVhost(): string {
    return this.config.vhost || '/';
  }
}

/* -------------------------------------------------------------------------- */
/*                          3. NESTJS CONFIG FACTORY                          */
/* -------------------------------------------------------------------------- */

/**
 * Register 'rabbitmq' namespace with NestJS ConfigModule.
 */
export const rabbitmqConfig = registerAs('rabbitmq', () => new RabbitMQConfig());
