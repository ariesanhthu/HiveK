/**
 * Validate Create Payment Activity
 *
 * Pre-flight validation before creating a payment entry:
 * 1. Idempotency check - Return existing payment if found
 * 2. Bill status check - Ensure bill is ready for payment
 * 3. Active payment check - Prevent duplicate active payments
 */

import { Inject, Injectable } from '@nestjs/common';
import { z } from 'zod';
import { Activity, ActivityValidation } from '@/shared/durable-execution';
import { VALIDATE_CREATE_ACTIVITY } from '../payment-create.token';
import { type ILoggerService, LOGGER_SERVICE } from '@/core/interfaces';
import {
	PAYMENT_REPOSITORY,
	type IPaymentRepository,
	PaymentAlreadyActiveForBillException,
	BillTerminateStatusException,
	PaymentException,
} from '@/core';
import {
	BILL_REPOSITORY,
	type IBillRepository,
	BillNotFoundException,
	BillEnterpriseMismatchException,
	EBillStatus,
} from '@/core';

// Input/Output schemas
const ValidateCreateInputSchema = z.object({
	idempotencyKey: z.string(),
	billId: z.string(),
	enterpriseId: z.string(),
});

const ValidateCreateOutputSchema = z.object({
	valid: z.boolean(),
	alreadyExists: z.boolean(),
	existingPaymentId: z.string().optional(),
	existingAttemptId: z.string().optional(),
	billStatus: z.string().optional(),
});

export type ValidateCreateInput = z.infer<typeof ValidateCreateInputSchema>;
export type ValidateCreateOutput = z.infer<typeof ValidateCreateOutputSchema>;

@Injectable()
@Activity(VALIDATE_CREATE_ACTIVITY)
@ActivityValidation({
	input: ValidateCreateInputSchema,
	output: ValidateCreateOutputSchema,
})
export class ValidateCreateActivity {
	constructor(
		@Inject(PAYMENT_REPOSITORY) private readonly paymentRepository: IPaymentRepository,
		@Inject(BILL_REPOSITORY) private readonly billRepository: IBillRepository,
		@Inject(LOGGER_SERVICE) private readonly logger: ILoggerService
	) {}

	async execute(input: ValidateCreateInput): Promise<ValidateCreateOutput> {
		const { idempotencyKey, billId, enterpriseId } = input;

		this.logger.log(`Validating payment creation for bill ${billId}`);

		// 1. Idempotency Check - Return existing payment if found
		const existingPayment = await this.paymentRepository.findByIdempotencyKey(idempotencyKey);
		if (existingPayment) {
			if (billId !== existingPayment.billId) {
				throw new PaymentException(
					'Idempotency key conflict: existing payment is associated with a different bill.'
				);
			}
			this.logger.log(`Payment already exists with idempotency key: ${idempotencyKey}`);
			const latestAttempt = existingPayment.getLatestAttempt();

			return {
				valid: true,
				alreadyExists: true,
				existingPaymentId: existingPayment.id,
				existingAttemptId:
					latestAttempt && !latestAttempt.status.isTerminal()
						? latestAttempt.id
						: undefined,
			};
		}

		// 2. Bill Status Check - Ensure bill exists and is ready for payment
		const bill = await this.billRepository.findById(billId);
		if (!bill) {
			throw new BillNotFoundException(billId);
		}

		// Check enterprise ownership
		if (bill.enterpriseId !== enterpriseId) {
			throw new BillEnterpriseMismatchException(billId, enterpriseId);
		}

		// Check bill status - must be PENDING or DONE
		if (bill.status !== EBillStatus.PENDING) {
			throw new BillTerminateStatusException(billId, bill.status);
		}

		// 3. Active Payment Check - Prevent duplicate active payments
		const hasActivePayment = await this.paymentRepository.hasActivePaymentForBill(billId);
		if (hasActivePayment) {
			throw new PaymentAlreadyActiveForBillException(billId, '');
		}

		this.logger.log(`Validation passed for bill ${billId} with status ${bill.status}`);

		return {
			valid: true,
			alreadyExists: false,
			billStatus: bill.status,
		};
	}
}
