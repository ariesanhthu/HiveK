/**
 * Validate Refund Activity
 *
 * Pre-flight validation before refunding a payment.
 * Checks business rules and idempotency.
 *
 * Checks:
 * 1. Payment exists
 * 2. Payment can be refunded (COMPLETED or PARTIALLY_REFUNDED)
 * 3. Has successful attempt with providerTransactionId
 * 4. Provider exists
 * 5. Refund amount valid (not exceeding remaining refundable amount)
 * 6. Idempotency: check for duplicate refund requests
 */

import { Inject, Injectable } from '@nestjs/common';
import { z } from 'zod';
import { Activity, ActivityValidation } from '@/shared/durable-execution';
import { VALIDATE_REFUND_ACTIVITY } from '../payment-refund.token';
import { type ILoggerService, LOGGER_SERVICE } from '@/core/interfaces';
import {
	PAYMENT_REPOSITORY,
	type IPaymentRepository,
	PaymentNotFoundException,
	PaymentCannotBeRefundedException,
	PaymentNoSuccessfulAttemptException,
	PaymentRefundAmountExceedsException,
	ETransactionStatus,
	EPaymentTransactionType,
} from '@/core';
import {
	PAYMENT_PROVIDER_REPOSITORY,
	type IPaymentProviderRepository,
	PaymentProviderNotFoundException,
} from '@/core';

// Input/Output schemas
const ValidateRefundInputSchema = z.object({
	paymentId: z.string(),
	amount: z.number().positive().optional(),
	idempotencyKey: z.string().optional(),
});

const ValidateRefundOutputSchema = z.object({
	canRefund: z.boolean(),
	alreadyRefunded: z.boolean(),
	attemptId: z.string().optional(),
	paymentProviderId: z.string().optional(),
	providerTransactionId: z.string().optional(),
	refundAmount: z.number().optional(),
	currency: z.string().optional(),
});

type ValidateRefundInput = z.infer<typeof ValidateRefundInputSchema>;
type ValidateRefundOutput = z.infer<typeof ValidateRefundOutputSchema>;

@Injectable()
@Activity(VALIDATE_REFUND_ACTIVITY)
@ActivityValidation({
	input: ValidateRefundInputSchema,
	output: ValidateRefundOutputSchema,
})
export class ValidateRefundActivity {
	constructor(
		@Inject(PAYMENT_REPOSITORY) private readonly paymentRepository: IPaymentRepository,
		@Inject(PAYMENT_PROVIDER_REPOSITORY)
		private readonly providerRepository: IPaymentProviderRepository,
		@Inject(LOGGER_SERVICE) private readonly logger: ILoggerService
	) {}

	async execute(input: ValidateRefundInput): Promise<ValidateRefundOutput> {
		const { paymentId, amount, idempotencyKey } = input;
		this.logger.log(`Validating refund for payment ${paymentId}`);

		// 1. Check payment exists
		const payment = await this.paymentRepository.findById(paymentId);
		if (!payment) {
			throw new PaymentNotFoundException(paymentId);
		}

		// 2. Check can be refunded (COMPLETED or PARTIALLY_REFUNDED)
		if (!payment.canBeRefunded()) {
			throw new PaymentCannotBeRefundedException(paymentId);
		}

		// 3. Get successful attempt with providerTransactionId
		const successAttempt = payment.getSuccessfulAttempt();
		if (!successAttempt?.providerTransactionId) {
			throw new PaymentNoSuccessfulAttemptException(paymentId);
		}

		// 4. Validate provider exists
		const provider = await this.providerRepository.findById(successAttempt.paymentProviderId);
		if (!provider) {
			throw new PaymentProviderNotFoundException(successAttempt.paymentProviderId);
		}

		// 5. Calculate refund amount
		const remainingRefundable = payment.getRemainingRefundableAmount();
		const requestedAmount = amount ?? payment.amount.amount;

		if (requestedAmount > remainingRefundable.amount) {
			throw new PaymentRefundAmountExceedsException(
				paymentId,
				requestedAmount,
				remainingRefundable.amount
			);
		}

		// 6. Idempotency check - look for recent successful refund transaction
		if (idempotencyKey) {
			// TODO: Implement idempotency key checking when metadata is added to transactions
			// For now, check if there's a very recent successful refund with same amount
			const latestAttempt = payment.getSuccessfulAttempt();
			if (latestAttempt) {
				const recentRefund = latestAttempt.transactions
					.filter(
						(t) =>
							t.transactionType === EPaymentTransactionType.REFUND &&
							t.status === ETransactionStatus.SUCCESS
					)
					.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

				if (recentRefund?.amount.amount === requestedAmount) {
					const timeDiff = Date.now() - recentRefund.createdAt.getTime();
					if (timeDiff < 60000) {
						// Within 1 minute
						this.logger.log(`Duplicate refund detected for payment ${paymentId}`);
						return {
							canRefund: false,
							alreadyRefunded: true,
						};
					}
				}
			}
		}

		this.logger.log(`Validation passed for refunding payment ${paymentId}`);

		return {
			canRefund: true,
			alreadyRefunded: false,
			attemptId: successAttempt.id,
			paymentProviderId: provider.id,
			providerTransactionId: successAttempt.providerTransactionId,
			refundAmount: requestedAmount,
			currency: payment.amount.currency,
		};
	}
}
