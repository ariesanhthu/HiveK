import { AuthModule } from '@/infrastructure/modules/auth.module';
import { EnterpriseModule } from '@/infrastructure/modules/enterprise.module';
import { RoleModule } from '@/infrastructure/modules/role.module';
import { UserModule } from '@/infrastructure/modules/user.module';
import { MongoModule } from '@/infrastructure/mongo/mongo.module';
import { RabbitMQModule } from '@/infrastructure/rabbitmq/rabbitmq.module';
import { WebSocketModule } from '@/infrastructure/websocket/websocket.module';
import { HttpExceptionFilter } from '@/presentation/middleware/filters';
import { LoggingInterceptor, TransformInterceptor } from '@/presentation/middleware/interceptors';
import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { ZodValidationPipe } from 'nestjs-zod';
import { TestRmqHandler } from '../../presentation/controllers/rmq/test-rmq.controller';
import { ApiKeyGuard } from '../../presentation/middleware/guards';
import { RedisCacheModule } from '../cache/redis/redis-cache.module';
import { EventsModule } from '../events/events.module';
import { GraphqlModule } from '../graphql';
import { AnalyticsModule } from './analytics.module';
import { CampaignParticipantModule } from './campaign-participant.module';
import { CampaignProposalModule } from './campaign-proposal.module';
import { CampaignModule } from './campaign.module';
import { InfrastructureModule } from './infrastructure.module';
import { KolProfileModule } from './kol-profile.module';
import { NotificationModule } from './notification.module';
import { PlatformModule } from './platform.module';
import { PublicReviewModule } from './public-review.module';
import { UploadedFileModule } from './uploaded-file.module';

import { globalConfigs } from '@/configs';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: globalConfigs,
    }),
    InfrastructureModule,
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
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
    RabbitMQModule,
    WebSocketModule,
    GraphqlModule,
    RedisCacheModule,
    EventsModule,
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
      useClass: ZodValidationPipe,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: ApiKeyGuard,
    },
    // {
    //   provide: APP_GUARD,
    //   useClass: GqlThrottlerGuard,
    // },
    TestRmqHandler,
  ],
})
export class AppModule {}
