/**
 * Validate Retry Activity
 *
 * Pre-flight validation before retrying a payment.
 * Lighter validation compared to validate-create (no bill check needed).
 *
 * Checks:
 * 1. Payment exists
 * 2. Payment can retry (canRetry() = true)
 * 3. Provider exists and is active
 * 4. Idempotency check (return existing attempt if found)
 */

import { Inject, Injectable } from '@nestjs/common';
import { z } from 'zod';
import { Activity, ActivityValidation } from '@/shared/durable-execution';
import { VALIDATE_RETRY_ACTIVITY } from '../payment-retry.token';
import { type ILoggerService, LOGGER_SERVICE } from '@/core/interfaces';
import {
	PAYMENT_REPOSITORY,
	type IPaymentRepository,
	PaymentNotFoundException,
	PaymentCannotRetryException,
	PaymentAlreadyCompletedException,
} from '@/core';
import { PAYMENT_PROVIDER_REPOSITORY, type IPaymentProviderRepository } from '@/core';
import { PaymentProviderNotFoundException, PaymentProviderDisabledException } from '@/core';

// Input/Output schemas
const ValidateRetryInputSchema = z.object({
	paymentId: z.string(),
	paymentProviderId: z.string(),
	idempotencyKey: z.string(),
});

const ValidateRetryOutputSchema = z.object({
	valid: z.boolean(),
	alreadyExists: z.boolean(),
	existingAttemptId: z.string().optional(),
});

export type ValidateRetryInput = z.infer<typeof ValidateRetryInputSchema>;
export type ValidateRetryOutput = z.infer<typeof ValidateRetryOutputSchema>;

@Injectable()
@Activity(VALIDATE_RETRY_ACTIVITY)
@ActivityValidation({
	input: ValidateRetryInputSchema,
	output: ValidateRetryOutputSchema,
})
export class ValidateRetryActivity {
	constructor(
		@Inject(PAYMENT_REPOSITORY) private readonly paymentRepository: IPaymentRepository,
		@Inject(PAYMENT_PROVIDER_REPOSITORY)
		private readonly providerRepository: IPaymentProviderRepository,
		@Inject(LOGGER_SERVICE) private readonly logger: ILoggerService
	) {}

	async execute(input: ValidateRetryInput): Promise<ValidateRetryOutput> {
		const { paymentId, paymentProviderId, idempotencyKey } = input;

		this.logger.log(`Validating retry for payment ${paymentId}`);

		// 1. Check payment exists
		const payment = await this.paymentRepository.findById(paymentId);
		if (!payment) throw new PaymentNotFoundException(paymentId);

		// 2. Idempotency Check - Check if attempt with same idempotencyKey exists
		const existingAttempt = payment.paymentAttempts.find(
			(attempt) => attempt.idempotencyKey === idempotencyKey
		);

		if (existingAttempt) {
			this.logger.log(`Attempt with idempotency key already exists: ${existingAttempt.id}`);
			return {
				valid: true,
				alreadyExists: true,
				existingAttemptId: existingAttempt.id,
			};
		}

		// 3. Check payment can retry
		if (!payment.canRetry()) {
			throw new PaymentCannotRetryException(
				paymentId,
				'Latest attempt is not in a retryable state'
			);
		}

		if (payment.status.isCompleted()) {
			throw new PaymentAlreadyCompletedException(paymentId);
		}

		// 4. Validate provider
		const provider = await this.providerRepository.findById(paymentProviderId);
		if (!provider) {
			throw new PaymentProviderNotFoundException(paymentProviderId);
		}

		if (!provider.isActive) {
			throw new PaymentProviderDisabledException();
		}

		this.logger.log(`Validation passed for retry of payment ${paymentId}`);

		return {
			valid: true,
			alreadyExists: false,
		};
	}
}
