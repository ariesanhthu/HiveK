/**
 * Request Payment URL Activity
 *
 * Requests payment URL from provider gateway and records transaction.
 * This is a standard activity that can be reused across workflows.
 *
 * Responsibilities:
 * - Fetch payment and provider details
 * - Call provider.create() to get payment URL
 * - Record CREATE transaction
 * - Update payment with transaction logs and URL
 */

import { PaymentService } from '@/application/services/payment.service';
import { Inject, Injectable } from '@nestjs/common';
import { z } from 'zod';
import { Activity, ActivityValidation } from '@/shared/durable-execution';
import { REQUEST_PAYMENT_URL_ACTIVITY } from '../payment-create.token';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/core/interfaces';
import { type ILoggerService, LOGGER_SERVICE } from '@/core/interfaces';
import { PAYMENT_PROVIDER_DISCOVERY, type IPaymentProviderDiscovery } from '@/core';
import { PaymentProviderNotFoundException } from '@/core';
import {
	PaymentNotFoundException,
	PaymentAttemptNotFoundException,
	EPaymentTransactionType,
	ETransactionStatus,
	ETransactionSource,
	PaymentTransactionEntity,
	PAYMENT_REPOSITORY,
	type IPaymentRepository,
	PaymentAttemptEntity,
} from '@/core';
import { EPaymentEventType, PaymentEventEntity } from '@/core';
import { type IPaymentProviderRepository, PAYMENT_PROVIDER_REPOSITORY } from '@/core';
import { getErrorMessage, toError } from '@/shared/utils/error.util';

// Input/Output schemas
const RequestPaymentUrlInputSchema = z.object({
	paymentId: z.string(),
	attemptId: z.string(),
});

const RequestPaymentUrlOutputSchema = z.object({
	isSuccess: z.boolean(),
	paymentUrl: z.string().optional(),
});

export type RequestPaymentUrlInput = z.infer<typeof RequestPaymentUrlInputSchema>;
export type RequestPaymentUrlOutput = z.infer<typeof RequestPaymentUrlOutputSchema>;

@Injectable()
@Activity(REQUEST_PAYMENT_URL_ACTIVITY)
@ActivityValidation({
	input: RequestPaymentUrlInputSchema,
	output: RequestPaymentUrlOutputSchema,
})
export class RequestPaymentUrlActivity {
	constructor(
		@Inject(UNIT_OF_WORK) private readonly uow: IUnitOfWork,
		@Inject(PAYMENT_REPOSITORY) private readonly paymentRepository: IPaymentRepository,
		@Inject(PAYMENT_PROVIDER_REPOSITORY)
		private readonly paymentProviderRepository: IPaymentProviderRepository,
		@Inject(LOGGER_SERVICE) private readonly logger: ILoggerService,
		@Inject(PAYMENT_PROVIDER_DISCOVERY)
		private readonly paymentProviderDiscovery: IPaymentProviderDiscovery,
		private readonly paymentService: PaymentService
	) {}

	async execute(input: RequestPaymentUrlInput): Promise<RequestPaymentUrlOutput> {
		const session = await this.uow.start();
		const { paymentId, attemptId } = input;
		this.logger.log(`Requesting payment URL for payment ${paymentId}, attempt ${attemptId}`);

		// 1. Fetch payment and attempt
		const payment = await session.paymentRepository.findById(paymentId);
		if (!payment) throw new PaymentNotFoundException(paymentId);

		const attempt = payment.getAttemptById(attemptId);
		if (!attempt) {
			throw new PaymentAttemptNotFoundException(paymentId, attemptId);
		}

		// 2. Fetch provider
		const provider = await this.paymentProviderRepository.findById(attempt.paymentProviderId);
		if (!provider) {
			throw new PaymentProviderNotFoundException(attempt.paymentProviderId);
		}

		// 3. Get provider instance
		const providerInstance = this.paymentProviderDiscovery.findProvider(provider.code);
		if (!providerInstance?.create) {
			throw new PaymentProviderNotFoundException(provider.code);
		}

		this.logger.log(`Calling provider ${provider.code} for attempt ${attemptId}`);

		// 4. Prepare provider config using service helper
		const config = {
			...this.paymentService.getProviderConfig(provider),
			others: {
				attemptId: attempt.id,
			},
		};

		// 5. Call provider to create payment
		const result = await providerInstance.create(
			attemptId,
			payment.amount.amount,
			payment.amount.currency,
			config
		);

		this.logger.log(
			`Provider response: isSuccess=${result.data.isSuccess}, hasUrl=${!!result.paymentUrl}`
		);

		// 6. Record CREATE transaction via Domain Entities & Service
		const transaction = PaymentTransactionEntity.fromProvider({
			transactionType: EPaymentTransactionType.CREATE,
			transactionSource: ETransactionSource.API,
			status: result.data.isSuccess ? ETransactionStatus.SUCCESS : ETransactionStatus.FAILED,
			amount: payment.amount,
			requestPayload: result.requestPayload,
			responsePayload: result.responsePayload,
			requestHeaders: result.requestHeaders as Record<string, string> | undefined,
			responseHeaders: result.responseHeaders as Record<string, string> | undefined,
			requestTimestamp: result.requestTimestamp,
			responseTimestamp: result.responseTimestamp,
			providerTransactionId: result.data.transactionId,
			description: 'Payment URL request',
		});

		const oldAttemptProps = { ...attempt.getProps() };
		if (oldAttemptProps.transactions) {
			oldAttemptProps.transactions = [...oldAttemptProps.transactions];
		}
		const oldAttempt = PaymentAttemptEntity.instantiate(attempt.id, oldAttemptProps);

		this.paymentService.processTransaction(payment, attemptId, transaction);

		// 7. Update payment URL if provided
		if (result.paymentUrl) {
			payment.setPaymentUrl(result.paymentUrl);
			this.logger.log(`Payment URL set: ${result.paymentUrl}`);
		}
		try {
			// 8. Save payment
			await session.paymentRepository.save(payment);
			// 9. Audit event
			const changes = PaymentAttemptEntity.getFieldChanges(oldAttempt, attempt);
			await session.auditRepository.create(
				PaymentEventEntity.create({
					paymentId: payment.id,
					paymentAttemptId: attemptId,
					eventType: result.data.isSuccess
						? EPaymentEventType.ATTEMPT_INITIATED
						: EPaymentEventType.ATTEMPT_FAILED,
					triggerType: 'SYSTEM',
					triggeredBy: 'system',
					fieldChanges: changes,
					occurredAt: new Date(),
				})
			);
			await session.commit();
			this.logger.log(`Payment URL request completed for payment ${paymentId}`);
			return {
				isSuccess: result.data.isSuccess,
				paymentUrl: result.paymentUrl,
			};
		} catch (e: unknown) {
			await session.rollback();
			this.logger.error(
				`Failed to request payment URL for payment ${paymentId}: ${getErrorMessage(e)}`
			);
			throw toError(e);
		} finally {
			await session.end();
		}
	}
}
