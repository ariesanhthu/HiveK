import { BaseConfigService } from '@hivek/nest-core';
import { Injectable } from '@nestjs/common';
import { registerAs } from '@nestjs/config';
import { IsNotEmpty, IsString } from 'class-validator';

export class MongoConfigDto {
  @IsString()
  @IsNotEmpty()
  uri: string;
}

@Injectable()
export class MongoConfig extends BaseConfigService<MongoConfigDto> {
  constructor() {
    super(MongoConfigDto, {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/hivek',
    });
  }

  getUri(): string {
    return this.config.uri;
  }
}

export const mongoConfig = registerAs('mongo', () => new MongoConfig());
