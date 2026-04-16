import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongoModule } from '@/infrastructure/mongo/mongo.module';
import { EnterpriseModule } from '@/infrastructure/modules/enterprise.module';
import { UserModule } from '@/infrastructure/modules/user.module';
import { RoleModule } from '@/infrastructure/modules/role.module';
import { AuthModule } from '@/infrastructure/modules/auth.module';
import { RabbitMQModule } from '@/infrastructure/rabbitmq/rabbitmq.module';
import { WebSocketModule } from '@/infrastructure/websocket/websocket.module';
import { APP_PIPE } from '@nestjs/core';
import { ZodValidationPipe } from 'nestjs-zod';
import { NestConfigModule } from './infrastructure/nest-config/nest-config.module';
import { InfrastructureModule } from './infrastructure/modules/infrastructure.module';
import { PlatformModule } from './infrastructure/modules/platform.module';
import { KolProfileModule } from './infrastructure/modules/kol-profile.module';
import { AnalyticsModule } from './infrastructure/modules/analytics.module';
import { TestController } from './presentation/controllers/test/test.controller';
import { TestRmqHandler } from './presentation/controllers/test/test-rmq.controller';

@Module({
  imports: [
    // ConfigModule.forRoot({ isGlobal: true }),
    NestConfigModule,
    InfrastructureModule,
    MongoModule,
    UserModule,
    EnterpriseModule,
    RoleModule,
    AuthModule,
    PlatformModule,
    KolProfileModule,
    AnalyticsModule,
    RabbitMQModule,
    WebSocketModule,
  ],
  controllers: [
    TestController
  ],
  providers: [
    {
      provide: APP_PIPE,
      useValue: ZodValidationPipe
    },
    TestRmqHandler
  ],
})
export class AppModule {}
