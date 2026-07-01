/**
 * Refund Failed Capture Activity (Compensation)
 *
 * Compensation activity that refunds a payment when capture processing fails.
 * Reuses ExecuteRefundActivity to avoid duplicating provider interaction logic.
 *
 * Triggered when:
 * - Provider capture succeeds (money taken from customer)
 * - BUT process-result fails (database/event error)
 * - Need to refund customer automatically
 */

import { PaymentService } from '@/application/services/payment.service';
import { Inject, Injectable } from '@nestjs/common';
import { z } from 'zod';
import { Activity, ActivityValidation } from '@/shared/durable-execution';
import { REFUND_FAILED_CAPTURE_ACTIVITY } from '../payment-capture.token';
import { EVENT_SERVICE, type IEventService } from '@/core';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/core/interfaces';
import { type ILoggerService, LOGGER_SERVICE } from '@/core/interfaces';
import {
	ETransactionStatus,
	EPaymentTransactionType,
	ETransactionSource,
	PaymentTransactionEntity,
	PaymentNotFoundException,
	PaymentAttemptNotFoundException,
	MoneyVO,
} from '@/core';
import { ECurrency } from '@/core';
import { getErrorMessage, toError } from '@/shared/utils/error.util';
// ✅ Import ExecuteRefundActivity to reuse provider interaction
import { ExecuteRefundActivity } from '../../payment-refund/activities/execute-refund.activity';

// Input/Output schemas
const RefundFailedCaptureInputSchema = z.object({
	paymentId: z.string(),
	attemptId: z.string(),
	refundAmount: z.number().positive(),
	currency: z.string(),
	providerCaptureSucceeded: z.boolean(), // Whether provider capture actually succeeded
});

const RefundFailedCaptureOutputSchema = z.object({
	success: z.boolean(),
});

type RefundFailedCaptureInput = z.infer<typeof RefundFailedCaptureInputSchema>;
type RefundFailedCaptureOutput = z.infer<typeof RefundFailedCaptureOutputSchema>;

@Injectable()
@Activity(REFUND_FAILED_CAPTURE_ACTIVITY)
@ActivityValidation({
	input: RefundFailedCaptureInputSchema,
	output: RefundFailedCaptureOutputSchema,
})
export class RefundFailedCaptureActivity {
	constructor(
		@Inject(UNIT_OF_WORK) private readonly uow: IUnitOfWork,
		@Inject(LOGGER_SERVICE) private readonly logger: ILoggerService,
		@Inject(EVENT_SERVICE) private readonly eventService: IEventService,
		// ✅ Inject ExecuteRefundActivity to reuse provider call logic
		private readonly executeRefundActivity: ExecuteRefundActivity,
		private readonly paymentService: PaymentService
	) {}

	async execute(input: RefundFailedCaptureInput): Promise<RefundFailedCaptureOutput> {
		const { paymentId, attemptId, refundAmount, currency, providerCaptureSucceeded } = input;

		this.logger.log(`Compensation: Refunding failed capture for payment ${paymentId}`);

		// If provider capture didn't succeed, no refund needed (money wasn't charged)
		if (!providerCaptureSucceeded) {
			this.logger.log(
				`Skipping refund - provider capture didn't succeed for payment ${paymentId}`
			);
			return { success: true }; // Compensation "succeeds" by doing nothing
		}

		const session = await this.uow.start();
		try {
			// 1. Lightweight validation - fetch payment and attempt
			const payment = await session.paymentRepository.findById(paymentId);
			if (!payment) throw new PaymentNotFoundException(paymentId);

			const attempt = payment.getAttemptById(attemptId);
			if (!attempt) throw new PaymentAttemptNotFoundException(paymentId, attemptId);

			// 2. ✅ REUSE execute-refund-activity (no provider logic duplication!)
			const refundResult = await this.executeRefundActivity.execute({
				paymentProviderId: attempt.paymentProviderId,
				providerTransactionId: attempt.providerTransactionId!,
				refundAmount,
				currency,
			});

			// 3. Process result inline (simple transaction recording)
			const refundData = refundResult.data as { transactionId?: string } | undefined;
			const transaction = PaymentTransactionEntity.create({
				transactionType: EPaymentTransactionType.REFUND,
				transactionSource: ETransactionSource.API, // ← SYSTEM source for compensation
				status: refundResult.isSuccess
					? ETransactionStatus.SUCCESS
					: ETransactionStatus.FAILED,
				amount: new MoneyVO(refundAmount, currency as ECurrency),
				providerRequest: refundResult.requestPayload,
				providerResponse: refundResult.responsePayload,
				description: 'Auto-refund: capture processing failed', // ← Clear compensation reason
				providerTransactionId: refundData?.transactionId,
				providerRequestHeaders: refundResult.requestHeaders,
				providerRequestTimestamp: refundResult.requestTimestamp,
				providerResponseHeaders: refundResult.responseHeaders,
				providerResponseTimestamp: refundResult.responseTimestamp,
				metadata: {
					compensationReason: 'capture-process-failure',
					originalAttemptId: attemptId,
				}, // ← Track compensation metadata
				createdAt: new Date(),
			});

			this.paymentService.processTransaction(payment, attemptId, transaction);

			await session.paymentRepository.save(payment);
			await this.eventService.publishEvents(payment, session);
			await session.commit();

			this.logger.log(`Compensation refund successful for payment ${paymentId}`);

			return {
				success: refundResult.isSuccess,
			};
		} catch (e: unknown) {
			await session.rollback();
			this.logger.error(
				`Compensation refund failed for payment ${paymentId}: ${getErrorMessage(e)}`
			);
			throw toError(e);
		} finally {
			await session.end();
		}
	}
}
