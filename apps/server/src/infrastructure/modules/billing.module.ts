import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongoModule } from '../mongo/mongo.module';
import { PaymentProvidersModule } from '../payment-providers/payment-providers.module';
import { BillService, PaymentService, ProrationService } from '@/application/services';

import {
  PackageCreateCommandHandler,
  PackageUpdateHandler,
  PackageUpdateStatusHandler,
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

import {
  PackageGetListHandler,
  PackageGetByIdHandler,
} from '@/application/queries';

import {
  PackageAdminController,
  PackageClientController,
} from '@/presentation/controllers';

@Module({
  imports: [
    CqrsModule,
    MongoModule,
    PaymentProvidersModule,
  ],
  controllers: [
    PackageAdminController,
    PackageClientController,
  ],
  providers: [
    PaymentService,
    // Package Command Handlers
    PackageCreateCommandHandler,
    PackageUpdateHandler,
    PackageUpdateStatusHandler,
    PackageDeleteHandler,
    // Package Query Handlers
    PackageGetListHandler,
    PackageGetByIdHandler,
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
