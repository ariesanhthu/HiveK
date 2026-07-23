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
  @IsOptional()
  port?: number;

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
      user: process.env.RMQ_USER,
      password: process.env.RMQ_PASSWORD,
      host: process.env.RMQ_HOST,
      port: process.env.RMQ_PORT ? parseInt(process.env.RMQ_PORT, 10) : undefined,
      vhost: process.env.RMQ_VHOST,
    });
  }

  /**
   * Get RabbitMQ account username.
   * @returns User string or undefined
   */
  getUser(): string | undefined {
    return this.config.user;
  }

  /**
   * Get RabbitMQ account password.
   * @returns Password string or undefined
   */
  getPassword(): string | undefined {
    return this.config.password;
  }

  /**
   * Get RabbitMQ broker host.
   * @returns Host string or undefined
   */
  getHost(): string | undefined {
    return this.config.host;
  }

  /**
   * Get RabbitMQ AMQP port.
   * @returns Port number or undefined
   */
  getPort(): number | undefined {
    return this.config.port;
  }

  /**
   * Get RabbitMQ Virtual Host (vhost).
   * @returns Vhost string or undefined
   */
  getVhost(): string | undefined {
    return this.config.vhost;
  }
}

/* -------------------------------------------------------------------------- */
/*                          3. NESTJS CONFIG FACTORY                          */
/* -------------------------------------------------------------------------- */

/**
 * Register 'rabbitmq' namespace with NestJS ConfigModule.
 */
export const rabbitmqConfig = registerAs('rabbitmq', () => new RabbitMQConfig());
