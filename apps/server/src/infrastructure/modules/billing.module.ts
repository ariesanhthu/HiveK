import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongoModule } from '../mongo/mongo.module';
import { PaymentProvidersModule } from '../payment-providers/payment-providers.module';
import { BillService, PaymentService, ProrationService } from '@/application/services';

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
} from '@/application/commands';

@Module({
  imports: [
    CqrsModule,
    MongoModule,
    PaymentProvidersModule,
  ],
  controllers: [],
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
  ],
  exports: [
    PaymentService,
  ],
})
export class BillingModule {}
