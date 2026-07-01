/**
 * Process Refund Result Activity
 *
 * Processes the refund result from payment provider.
 * Records transaction, transitions payment status, and publishes events.
 */

import { PaymentService } from '@/application/services/payment.service';
import { Inject, Injectable } from '@nestjs/common';
import { z } from 'zod';
import { Activity, ActivityValidation } from '@/shared/durable-execution';
import { PROCESS_REFUND_ACTIVITY } from '../payment-refund.token';
import { EVENT_SERVICE, type IEventService } from '@/core';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/core/interfaces';
import { type ILoggerService, LOGGER_SERVICE } from '@/core/interfaces';
import {
	ETransactionStatus,
	EPaymentTransactionType,
	ETransactionSource,
	PaymentTransactionEntity,
	PaymentNotFoundException,
	MoneyVO,
} from '@/core';
import { toError } from '@/shared/utils/error.util';
import { ECurrency } from '@/core';

// Input/Output schemas
const ProcessRefundInputSchema = z.object({
	paymentId: z.string(),
	attemptId: z.string(),
	refundAmount: z.number().positive(),
	currency: z.string(),
	refundedBy: z.string(),
	result: z.object({
		isSuccess: z.boolean(),
		data: z.looseObject({
			transactionId: z.string().optional(),
		}),
		requestPayload: z.record(z.string(), z.unknown()).optional(),
		responsePayload: z.record(z.string(), z.unknown()).optional(),
		requestHeaders: z.record(z.string(), z.string()).optional(),
		responseHeaders: z.record(z.string(), z.string()).optional(),
		requestTimestamp: z.date(),
		responseTimestamp: z.date(),
	}),
});

const ProcessRefundOutputSchema = z.object({
	success: z.boolean(),
});

type ProcessRefundInput = z.infer<typeof ProcessRefundInputSchema>;
type ProcessRefundOutput = z.infer<typeof ProcessRefundOutputSchema>;

@Injectable()
@Activity(PROCESS_REFUND_ACTIVITY)
@ActivityValidation({
	input: ProcessRefundInputSchema,
	output: ProcessRefundOutputSchema,
})
export class ProcessRefundActivity {
	constructor(
		@Inject(UNIT_OF_WORK) private readonly uow: IUnitOfWork,
		@Inject(LOGGER_SERVICE) private readonly logger: ILoggerService,
		@Inject(EVENT_SERVICE) private readonly eventService: IEventService,
		private readonly paymentService: PaymentService
	) {}

	async execute(input: ProcessRefundInput): Promise<ProcessRefundOutput> {
		const { paymentId, attemptId, refundAmount, currency, result, refundedBy } = input;
		this.logger.log(`Processing refund result for payment ${paymentId}`);

		const session = await this.uow.start();
		try {
			const payment = await session.paymentRepository.findById(paymentId);
			if (!payment) throw new PaymentNotFoundException(paymentId);

			// 2. Create refund transaction via Domain Entity factory
			const transaction = PaymentTransactionEntity.fromProvider({
				transactionType: EPaymentTransactionType.REFUND,
				transactionSource: ETransactionSource.API,
				status: result.isSuccess ? ETransactionStatus.SUCCESS : ETransactionStatus.FAILED,
				amount: new MoneyVO(refundAmount, currency as ECurrency),
				description: `Refund by ${refundedBy}`,
				providerTransactionId: result.data.transactionId,
				requestPayload: result.requestPayload,
				responsePayload: result.responsePayload,
				requestHeaders: result.requestHeaders,
				responseHeaders: result.responseHeaders,
				requestTimestamp: result.requestTimestamp,
				responseTimestamp: result.responseTimestamp,
			});

			// 3. Add transaction and process transitions via PaymentService
			this.paymentService.processTransaction(payment, attemptId, transaction);

			await session.paymentRepository.save(payment);
			// Publish events BEFORE commit for atomicity
			await this.eventService.publishEvents(payment, session);
			await session.commit();

			this.logger.log(`Successfully processed refund for payment ${paymentId}`);

			return {
				success: result.isSuccess,
			};
		} catch (e) {
			await session.rollback();
			throw toError(e);
		} finally {
			await session.end();
		}
	}
}
