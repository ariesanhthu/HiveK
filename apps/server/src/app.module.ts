import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongoModule } from '@/infrastructure/mongo/mongo.module';
import { EnterpriseModule } from '@/infrastructure/modules/enterprise.module';
import { UserModule } from '@/infrastructure/modules/user.module';
import { RoleModule } from '@/infrastructure/modules/role.module';
import { AuthModule } from '@/infrastructure/modules/auth.module';
import { RabbitMQModule } from '@/infrastructure/rabbitmq/rabbitmq.module';
import { WebSocketModule } from '@/infrastructure/websocket/websocket.module';
import { APP_PIPE, APP_GUARD, APP_FILTER } from '@nestjs/core';
import { ZodValidationPipe } from 'nestjs-zod';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { RolesGuard, JwtAuthGuard, GqlThrottlerGuard } from './presentation/middleware/guards';
import { NestConfigModule } from './infrastructure/nest-config/nest-config.module';
import { InfrastructureModule } from './infrastructure/modules/infrastructure.module';
import { PlatformModule } from './infrastructure/modules/platform.module';
import { KolProfileModule } from './infrastructure/modules/kol-profile.module';
import { AnalyticsModule } from './infrastructure/modules/analytics.module';
import { CampaignModule } from './infrastructure/modules/campaign.module';
import { UploadedFileModule } from './infrastructure/modules/uploaded-file.module';
import { NotificationModule } from './infrastructure/modules/notification.module';
import { CampaignParticipantModule } from './infrastructure/modules/campaign-participant.module';
import { TestController } from './presentation/controllers/test/test.controller';
import { TestRmqHandler } from './presentation/controllers/test/test-rmq.controller';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { DomainExceptionFilter } from './presentation/middleware/filters/domain-exception.filter';

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
    CampaignModule,
    CampaignParticipantModule,
    UploadedFileModule,
    NotificationModule,
    RabbitMQModule,
    WebSocketModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      path: '/hivek/graphql',
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/infrastructure/graphql/schema.gql'),
      playground: true,
      context: ({ req, res }) => ({ req, res }),
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 60, // 60 requests per TTL
      },
    ]),
  ],
  controllers: [
    TestController
  ],
  providers: [
    {
      provide: APP_PIPE,
      useValue: ZodValidationPipe
    },
    {
      provide: APP_FILTER,
      useClass: DomainExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: GqlThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    TestRmqHandler
  ],
})
export class AppModule {}
