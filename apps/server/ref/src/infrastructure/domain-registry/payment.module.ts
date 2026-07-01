import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { InfrastructureModule } from '@/infrastructure/infrastructure.module';
import { PaymentController as PaymentGrpcController } from '@/presentation/controllers/grpc/payment.controller';
import { PaymentGrpcMapper } from '@/presentation/mappers';

import {
	PaymentCreateHandler,
	PaymentCancelHandler,
	PaymentRefundHandler,
	PaymentRetryHandler,
	PaymentHandleWebhookHandler,
} from '@/application/commands';

import {
	PaymentGetByIdHandler,
	PaymentGetByBillIdHandler,
	PaymentGetListHandler,
} from '@/application/queries';

// Import all workflow activities
import {
	ValidateCreateActivity,
	CreatePaymentEntryActivity,
	RequestPaymentUrlActivity,
	CancelAttemptActivity,
} from '@/application/workflows/payment-create/activities';

import {
	ValidateRetryActivity,
	CreateAttemptActivity,
} from '@/application/workflows/payment-retry/activities';

import {
	ValidateCancelActivity,
	CancelAtProviderActivity,
	CancelPaymentActivity,
} from '@/application/workflows/payment-cancel/activities';

import {
	ValidateCaptureActivity,
	ExecuteCaptureActivity,
	ProcessCaptureActivity,
	RefundFailedCaptureActivity,
} from '@/application/workflows/payment-capture/activities';

import {
	ValidateRefundActivity,
	ExecuteRefundActivity,
	ProcessRefundActivity,
} from '@/application/workflows/payment-refund/activities';

import {
	ValidateWebhookActivity,
	MarkWebhookReceivedActivity,
	ParseWebhookActivity,
	ProcessWebhookResultActivity,
} from '@/application/workflows/payment-handle-webhook/activities';

const COMMAND_HANDLERS = [
	PaymentCreateHandler,
	PaymentCancelHandler,
	PaymentRefundHandler,
	PaymentRetryHandler,
	PaymentHandleWebhookHandler,
];

const QUERY_HANDLERS = [PaymentGetByIdHandler, PaymentGetByBillIdHandler, PaymentGetListHandler];

const SAGAS = [];

// All workflow activities (23 total)
const WORKFLOW_ACTIVITIES = [
	// Payment Create (4)
	ValidateCreateActivity,
	CreatePaymentEntryActivity,
	RequestPaymentUrlActivity,
	CancelAttemptActivity,
	// Payment Retry (2 new + 2 reused from create)
	ValidateRetryActivity,
	CreateAttemptActivity,
	// Payment Cancel (3)
	ValidateCancelActivity,
	CancelAtProviderActivity,
	CancelPaymentActivity,
	// Payment Capture (4)
	ValidateCaptureActivity,
	ExecuteCaptureActivity,
	ProcessCaptureActivity,
	RefundFailedCaptureActivity,
	// Payment Refund (3)
	ValidateRefundActivity,
	ExecuteRefundActivity,
	ProcessRefundActivity,
	// Payment Handle Webhook (4)
	ValidateWebhookActivity,
	MarkWebhookReceivedActivity,
	ParseWebhookActivity,
	ProcessWebhookResultActivity,
];

import { PaymentService } from '@/application/services';
// ...
@Module({
	imports: [CqrsModule, InfrastructureModule],
	controllers: [PaymentGrpcController],
	providers: [
		PaymentGrpcMapper,
		...COMMAND_HANDLERS,
		...QUERY_HANDLERS,
		...SAGAS,
		...WORKFLOW_ACTIVITIES,
		PaymentService,
	],
	exports: [
		...COMMAND_HANDLERS,
		...QUERY_HANDLERS,
		...SAGAS,
		...WORKFLOW_ACTIVITIES,
		PaymentService,
	],
})
export class PaymentModule {}
