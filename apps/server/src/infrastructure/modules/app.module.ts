import { globalConfigs } from '@/configs';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { ZodValidationPipe } from 'nestjs-zod';

/* -------------------------- Infrastructure Modules -------------------------- */
import { RedisCacheModule } from '../cache/redis/redis-cache.module';
import { EventsModule } from '../events/events.module';
import { GraphqlModule } from '../graphql';
import { MongoModule } from '../mongo/mongo.module';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';
import { WebSocketModule } from '../websocket/websocket.module';
import { InfrastructureModule } from './infrastructure.module';

/* --------------------------- Domain & Feature Modules --------------------------- */
import { AnalyticsModule } from './analytics.module';
import { AuthModule } from './auth.module';
import { CampaignParticipantModule } from './campaign-participant.module';
import { CampaignProposalModule } from './campaign-proposal.module';
import { CampaignModule } from './campaign.module';
import { EnterpriseModule } from './enterprise.module';
import { KolProfileModule } from './kol-profile.module';
import { NotificationModule } from './notification.module';
import { PlatformModule } from './platform.module';
import { PublicReviewModule } from './public-review.module';
import { RoleModule } from './role.module';
import { UploadedFileModule } from './uploaded-file.module';
import { UserModule } from './user.module';

/* -------------------------- Presentation & Handlers --------------------------- */
import { TestRmqHandler } from '@/presentation/controllers/rmq/test-rmq.controller';
import { HttpExceptionFilter } from '@/presentation/middleware/filters';
import { ApiKeyGuard } from '@/presentation/middleware/guards';
import { LoggingInterceptor, TransformInterceptor } from '@/presentation/middleware/interceptors';

@Module({
  imports: [
    /* -------------------------------------------------------------------------- */
    /*                 1. CORE & FRAMEWORK CONFIGURATION MODULES                  */
    /* -------------------------------------------------------------------------- */
    ConfigModule.forRoot({
      isGlobal: true,
      load: globalConfigs,
    }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),

    /* -------------------------------------------------------------------------- */
    /*          2. SHARED INFRASTRUCTURE MODULES (DB, CACHE, RMQ, ETC.)          */
    /* -------------------------------------------------------------------------- */
    InfrastructureModule,
    MongoModule,
    RedisCacheModule,
    RabbitMQModule,
    WebSocketModule,
    GraphqlModule,
    EventsModule,

    /* -------------------------------------------------------------------------- */
    /*                    3. DOMAIN & BUSINESS FEATURE MODULES                    */
    /* -------------------------------------------------------------------------- */
    UserModule,
    EnterpriseModule,
    RoleModule,
    AuthModule,
    PlatformModule,
    KolProfileModule,
    AnalyticsModule,
    CampaignModule,
    CampaignParticipantModule,
    CampaignProposalModule,
    UploadedFileModule,
    NotificationModule,
    PublicReviewModule,
  ],
  controllers: [],
  providers: [
    /* -------------------------------------------------------------------------- */
    /*                GLOBAL PIPES, FILTERS, INTERCEPTORS & GUARDS                */
    /* -------------------------------------------------------------------------- */
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

    /* -------------------------------------------------------------------------- */
    /*                         HANDLERS & EVENT LISTENERS                         */
    /* -------------------------------------------------------------------------- */
    TestRmqHandler,
  ],
})
export class AppModule {}
