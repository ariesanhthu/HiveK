import { Module } from '@nestjs/common';
import { MongoModule } from '@/infrastructure/mongo/mongo.module';
import { EnterpriseModule } from '@/infrastructure/modules/enterprise.module';
import { UserModule } from '@/infrastructure/modules/user.module';
import { RoleModule } from '@/infrastructure/modules/role.module';
import { AuthModule } from '@/infrastructure/modules/auth.module';
import { RabbitMQModule } from '@/infrastructure/rabbitmq/rabbitmq.module';
import { WebSocketModule } from '@/infrastructure/websocket/websocket.module';
import { APP_PIPE, APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ZodValidationPipe } from 'nestjs-zod';
import { ThrottlerModule } from '@nestjs/throttler';
import { GqlThrottlerGuard, ApiKeyGuard } from '../../presentation/middleware/guards';
import { InfrastructureModule } from './infrastructure.module';
import { PlatformModule } from './platform.module';
import { KolProfileModule } from './kol-profile.module';
import { AnalyticsModule } from './analytics.module';
import { CampaignModule } from './campaign.module';
import { UploadedFileModule } from './uploaded-file.module';
import { NotificationModule } from './notification.module';
import { CampaignParticipantModule } from './campaign-participant.module';
import { CampaignProposalModule } from './campaign-proposal.module';
import { PublicReviewModule } from './public-review.module';
import { TestRmqHandler } from '../../presentation/controllers/rmq/test-rmq.controller';
import { GraphqlModule } from '../graphql';
import { HttpExceptionFilter } from '@/presentation/middleware/filters';
import { LoggingInterceptor, TransformInterceptor } from '@/presentation/middleware/interceptors';
import { ScheduleModule } from '@nestjs/schedule';
import { OutboxModule } from './outbox.module';
import { RedisCacheModule } from '../cache/redis/redis-cache.module';

@Module({
  imports: [
    // ConfigModule.forRoot({ isGlobal: true }),
    InfrastructureModule,
    ScheduleModule.forRoot(),
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
    CampaignProposalModule,
    PublicReviewModule,
    OutboxModule,
    RabbitMQModule,
    WebSocketModule,
    GraphqlModule,
    RedisCacheModule,
    // ThrottlerModule.forRoot([
    //   {
    //     ttl: 60000, // 1 minute
    //     limit: 60, // 60 requests per TTL
    //   },
    // ]),
  ],
  controllers: [],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor
    },
    {
      provide: APP_GUARD,
      useClass: ApiKeyGuard,
    },
    // {
    //   provide: APP_GUARD,
    //   useClass: GqlThrottlerGuard,
    // },
    TestRmqHandler
  ],
})
export class AppModule {}
