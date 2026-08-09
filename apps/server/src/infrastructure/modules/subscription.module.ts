import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongoModule } from '../mongo/mongo.module';
import { ProrationService } from '@/application/services';

import { SubscriptionUpdateHandler } from '@/application/commands';
import {
  SubscriptionGetByIdHandler,
  SubscriptionGetByUserIdHandler,
  SubscriptionGetListHandler,
  SubscriptionHistoryGetListHandler,
  QuotaUsageGetByEnterpriseIdHandler,
  EnterpriseQuotaAllocationGetByOwnerIdHandler,
} from '@/application/queries';
import {
  SubscriptionUpdatedEventHandler,
  PaymentCompletedEventHandler,
} from '@/application/events';
import { SubscriptionCronService } from './subscription-cron.service';
import { MongoEnterpriseQuotaAllocationRepository } from '@/infrastructure/mongo/repositories';
import { ENTERPRISE_QUOTA_ALLOCATION_REPOSITORY } from '@/core/interfaces/repositories';
import {
  SubscriptionAdminController,
  SubscriptionClientController,
  QuotaAdminController,
  QuotaClientController,
} from '@/presentation/controllers/http';

@Module({
  imports: [CqrsModule, MongoModule],
  controllers: [
    SubscriptionAdminController,
    SubscriptionClientController,
    QuotaAdminController,
    QuotaClientController,
  ],
  providers: [
    // Services
    ProrationService,
    SubscriptionCronService,
    // Handlers
    SubscriptionUpdateHandler,
    SubscriptionUpdatedEventHandler,
    PaymentCompletedEventHandler,
    // Queries
    SubscriptionGetByIdHandler,
    SubscriptionGetByUserIdHandler,
    SubscriptionGetListHandler,
    SubscriptionHistoryGetListHandler,
    QuotaUsageGetByEnterpriseIdHandler,
    EnterpriseQuotaAllocationGetByOwnerIdHandler,
    // Repositories
    {
      provide: ENTERPRISE_QUOTA_ALLOCATION_REPOSITORY,
      useClass: MongoEnterpriseQuotaAllocationRepository,
    },
  ],
})
export class SubscriptionModule {}
