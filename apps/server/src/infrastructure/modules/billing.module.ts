import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongoModule } from '../mongo/mongo.module';
import { PaymentProvidersModule } from '../payment-providers/payment-providers.module';
import { BillService, PaymentService } from '@/application/services';

import {
  PackageUpdateHandler,
  PackagePublishHandler,
  PackageArchiveHandler,
  PackageDeleteHandler,
  BillCalculateHandler,
  BillCreateHandler,
  BillCancelHandler,
  PaymentProviderCreateHandler,
  PaymentProviderUpdateHandler,
  PaymentProviderDeleteHandler,
  PaymentProviderRestoreHandler,
  PaymentCreateHandler,
  PaymentRetryHandler,
  PaymentHandleWebhookHandler,
  PaymentCaptureHandler,
  PaymentCancelHandler,
  PaymentVoidAuthorizationHandler,
  SubscriptionUpdateHandler,
} from '@/application/commands';
import { SubscriptionUpdatedEventHandler } from '@/application/events';
import { SubscriptionCronService } from './subscription-cron.service';

@Module({
  imports: [
    CqrsModule,
    MongoModule,
    PaymentProvidersModule,
  ],
  providers: [
    PaymentService,
    // Package Handlers
    PackageUpdateHandler,
    PackagePublishHandler,
    PackageArchiveHandler,
    PackageDeleteHandler,
    // Bill Handlers
    BillCalculateHandler,
    BillCreateHandler,
    BillCancelHandler,
    BillService,
    // Payment Provider Handlers
    PaymentProviderCreateHandler,
    PaymentProviderUpdateHandler,
    PaymentProviderDeleteHandler,
    PaymentProviderRestoreHandler,
    // Payment Handlers
    PaymentCreateHandler,
    PaymentRetryHandler,
    PaymentHandleWebhookHandler,
    PaymentCaptureHandler,
    PaymentCancelHandler,
    PaymentVoidAuthorizationHandler,
    // Subscription Handlers
    SubscriptionUpdateHandler,
    SubscriptionUpdatedEventHandler,
    SubscriptionCronService,
  ],
  exports: [
    PaymentService,
  ],
})
export class BillingModule {}
