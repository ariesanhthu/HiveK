/**
 * Validate Capture Activity
 *
 * Pre-flight validation before capturing an authorized payment.
 * Checks business rules and idempotency.
 *
 * Checks:
 * 1. Payment exists
 * 2. Has latest attempt (authorization succeeded)
 * 3. Provider exists
 * 4. Capture amount valid (not exceeding authorized amount)
 * 5. Idempotency: check for duplicate capture requests
 */

import { Inject, Injectable } from '@nestjs/common';
import { z } from 'zod';
import { Activity, ActivityValidation } from '@/shared/durable-execution';
import { VALIDATE_CAPTURE_ACTIVITY } from '../payment-capture.token';
import { type ILoggerService, LOGGER_SERVICE } from '@/core/interfaces';
import {
	PAYMENT_REPOSITORY,
	type IPaymentRepository,
	PaymentNotFoundException,
	PaymentHasNoAttemptsException,
	EPaymentTransactionType,
	ETransactionStatus,
} from '@/core';
import {
	PAYMENT_PROVIDER_REPOSITORY,
	type IPaymentProviderRepository,
	PaymentProviderNotFoundException,
} from '@/core';

// Input/Output schemas
const ValidateCaptureInputSchema = z.object({
	paymentId: z.string(),
	amount: z.number().positive().optional(),
	idempotencyKey: z.string().optional(),
});

const ValidateCaptureOutputSchema = z.object({
	canCapture: z.boolean(),
	alreadyCaptured: z.boolean(),
	attemptId: z.string().optional(),
	paymentProviderId: z.string().optional(),
	providerTransactionId: z.string().optional(),
	captureAmount: z.number().optional(),
	currency: z.string().optional(),
});

type ValidateCaptureInput = z.infer<typeof ValidateCaptureInputSchema>;
type ValidateCaptureOutput = z.infer<typeof ValidateCaptureOutputSchema>;

@Injectable()
@Activity(VALIDATE_CAPTURE_ACTIVITY)
@ActivityValidation({
	input: ValidateCaptureInputSchema,
	output: ValidateCaptureOutputSchema,
})
export class ValidateCaptureActivity {
	constructor(
		@Inject(PAYMENT_REPOSITORY) private readonly paymentRepository: IPaymentRepository,
		@Inject(PAYMENT_PROVIDER_REPOSITORY)
		private readonly providerRepository: IPaymentProviderRepository,
		@Inject(LOGGER_SERVICE) private readonly logger: ILoggerService
	) {}

	async execute(input: ValidateCaptureInput): Promise<ValidateCaptureOutput> {
		const { paymentId, amount, idempotencyKey } = input;
		this.logger.log(`Validating capture for payment ${paymentId}`);

		// 1. Check payment exists
		const payment = await this.paymentRepository.findById(paymentId);
		if (!payment) {
			throw new PaymentNotFoundException(paymentId);
		}

		// 2. Get latest attempt (authorization)
		const latestAttempt = payment.getLatestAttempt();
		if (!latestAttempt) {
			throw new PaymentHasNoAttemptsException(paymentId);
		}

		// 3. Idempotency check - look for recent successful capture transaction
		if (idempotencyKey) {
			const recentCapture = latestAttempt.transactions
				.filter(
					(t) =>
						t.transactionType === EPaymentTransactionType.CAPTURE &&
						t.status === ETransactionStatus.SUCCESS
				)
				.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

			if (recentCapture) {
				const timeDiff = Date.now() - recentCapture.createdAt.getTime();
				if (timeDiff < 60000) {
					// Within 1 minute
					this.logger.log(`Duplicate capture detected for payment ${paymentId}`);
					return {
						canCapture: false,
						alreadyCaptured: true,
					};
				}
			}
		}

		// 4. Validate provider exists
		const provider = await this.providerRepository.findById(latestAttempt.paymentProviderId);
		if (!provider) {
			throw new PaymentProviderNotFoundException(latestAttempt.paymentProviderId);
		}

		// 5. Validate capture amount (if partial capture)
		const requestedAmount = amount ?? payment.amount.amount;
		const authorizedAmount = payment.amount.amount;

		if (requestedAmount > authorizedAmount) {
			throw new Error(
				`Capture amount ${requestedAmount} exceeds authorized amount ${authorizedAmount}`
			);
		}

		this.logger.log(`Validation passed for capturing payment ${paymentId}`);

		return {
			canCapture: true,
			alreadyCaptured: false,
			attemptId: latestAttempt.id,
			paymentProviderId: provider.id,
			providerTransactionId: latestAttempt.providerTransactionId,
			captureAmount: requestedAmount,
			currency: payment.amount.currency,
		};
	}
}
