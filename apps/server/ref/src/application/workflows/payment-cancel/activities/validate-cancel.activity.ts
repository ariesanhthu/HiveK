/**
 * Validate Cancel Activity
 *
 * Pre-flight validation before canceling a payment.
 * Checks business rules and returns early if already canceled (idempotency).
 *
 * Checks:
 * 1. Payment exists
 * 2. Payment not in terminal state
 * 3. Payment in PENDING or PENDING_PAYMENT_PROVIDER state
 * 4. Latest attempt not in PROCESSING state
 * 5. Idempotency: return alreadyCanceled if status is CANCELED
 */

import { Inject, Injectable } from '@nestjs/common';
import { z } from 'zod';
import { Activity, ActivityValidation } from '@/shared/durable-execution';
import { VALIDATE_CANCEL_ACTIVITY } from '../payment-cancel.token';
import { type ILoggerService, LOGGER_SERVICE } from '@/core/interfaces';
import {
	PAYMENT_REPOSITORY,
	type IPaymentRepository,
	PaymentNotFoundException,
	PaymentInTerminalStateException,
	PaymentInvalidStateForCancelException,
	PaymentAttemptProcessingException,
} from '@/core';

// Input/Output schemas
const ValidateCancelInputSchema = z.object({
	paymentId: z.string(),
});

const ValidateCancelOutputSchema = z.object({
	canCancel: z.boolean(),
	alreadyCanceled: z.boolean(),
});

type ValidateCancelInput = z.infer<typeof ValidateCancelInputSchema>;
type ValidateCancelOutput = z.infer<typeof ValidateCancelOutputSchema>;

@Injectable()
@Activity(VALIDATE_CANCEL_ACTIVITY)
@ActivityValidation({
	input: ValidateCancelInputSchema,
	output: ValidateCancelOutputSchema,
})
export class ValidateCancelActivity {
	constructor(
		@Inject(PAYMENT_REPOSITORY) private readonly paymentRepository: IPaymentRepository,
		@Inject(LOGGER_SERVICE) private readonly logger: ILoggerService
	) {}

	async execute(input: ValidateCancelInput): Promise<ValidateCancelOutput> {
		const { paymentId } = input;
		this.logger.log(`Validating cancel for payment ${paymentId}`);

		// 1. Check payment exists
		const payment = await this.paymentRepository.findById(paymentId);
		if (!payment) {
			throw new PaymentNotFoundException(paymentId);
		}

		// 2. Idempotency check - already canceled
		if (payment.status.isCanceled()) {
			this.logger.log(
				`Payment ${paymentId} is already canceled. Returning idempotent response.`
			);
			return {
				canCancel: false,
				alreadyCanceled: true,
			};
		}

		// 3. Check not in terminal state (REFUNDED, FAILED, COMPLETED)
		if (payment.status.isTerminal()) {
			throw new PaymentInTerminalStateException(paymentId);
		}

		// 4. Check payment is in cancellable state (PENDING or PENDING_PAYMENT_PROVIDER)
		if (!payment.status.isPending() && !payment.status.isPendingPaymentProvider()) {
			throw new PaymentInvalidStateForCancelException(paymentId, payment.status.value);
		}

		// 5. Check latest attempt is not processing
		const latestAttempt = payment.getLatestAttempt();
		if (latestAttempt?.status.isProcessing()) {
			throw new PaymentAttemptProcessingException(paymentId, latestAttempt.id);
		}

		this.logger.log(`Validation passed for canceling payment ${paymentId}`);

		return {
			canCancel: true,
			alreadyCanceled: false,
		};
	}
}
