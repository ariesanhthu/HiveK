/**
 * Execute Refund Activity
 *
 * Executes payment provider refund.
 * Fetches provider configuration internally to avoid credential leakage.
 */

import { PaymentService } from '@/application/services/payment.service';
import { Inject, Injectable } from '@nestjs/common';
import { z } from 'zod';
import { Activity, ActivityValidation } from '@/shared/durable-execution';
import { EXECUTE_REFUND_ACTIVITY } from '../payment-refund.token';
import { type ILoggerService, LOGGER_SERVICE } from '@/core/interfaces';
import {
	PAYMENT_PROVIDER_DISCOVERY,
	type IPaymentProviderDiscovery,
	PAYMENT_PROVIDER_REPOSITORY,
	type IPaymentProviderRepository,
	PaymentProviderNotFoundException,
} from '@/core';
import { ECurrency } from '@/core';

// Input/Output schemas
const ExecuteRefundInputSchema = z.object({
	paymentProviderId: z.string(),
	providerTransactionId: z.string(),
	refundAmount: z.number().positive(),
	currency: z.string(),
});

const ExecuteRefundOutputSchema = z.object({
	isSuccess: z.boolean(),
	data: z.unknown(),
	requestPayload: z.record(z.string(), z.unknown()).optional(),
	responsePayload: z.record(z.string(), z.unknown()).optional(),
	requestHeaders: z.record(z.string(), z.string()).optional(),
	responseHeaders: z.record(z.string(), z.string()).optional(),
	requestTimestamp: z.date().optional(),
	responseTimestamp: z.date().optional(),
});

type ExecuteRefundInput = z.infer<typeof ExecuteRefundInputSchema>;
type ExecuteRefundOutput = z.infer<typeof ExecuteRefundOutputSchema>;

@Injectable()
@Activity(EXECUTE_REFUND_ACTIVITY)
@ActivityValidation({
	input: ExecuteRefundInputSchema,
	output: ExecuteRefundOutputSchema,
})
export class ExecuteRefundActivity {
	constructor(
		@Inject(LOGGER_SERVICE) private readonly logger: ILoggerService,
		@Inject(PAYMENT_PROVIDER_DISCOVERY)
		private readonly paymentProviderDiscovery: IPaymentProviderDiscovery,
		@Inject(PAYMENT_PROVIDER_REPOSITORY)
		private readonly providerRepository: IPaymentProviderRepository,
		private readonly paymentService: PaymentService
	) {}

	async execute(input: ExecuteRefundInput): Promise<ExecuteRefundOutput> {
		const { paymentProviderId, providerTransactionId, refundAmount, currency } = input;
		this.logger.log(`Executing refund for transaction ${providerTransactionId}`);

		// 1. Fetch provider configuration internally
		const provider = await this.providerRepository.findById(paymentProviderId);
		if (!provider) {
			throw new PaymentProviderNotFoundException(paymentProviderId);
		}

		// 2. Get provider implementation
		const providerInstance = this.paymentProviderDiscovery.findProvider(provider.code);
		if (!providerInstance?.refund) {
			throw new PaymentProviderNotFoundException(provider.code);
		}

		// 3. Build provider configuration using service helper
		const config = this.paymentService.getProviderConfig(provider);

		// 4. Call provider refund API
		const result = await providerInstance.refund(
			providerTransactionId,
			refundAmount,
			currency as ECurrency,
			config
		);

		this.logger.log(
			`Refund executed for transaction ${providerTransactionId}: ${result.data.isSuccess ? 'success' : 'failed'}`
		);

		return {
			isSuccess: result.data.isSuccess,
			data: result.data,
			requestPayload: result.requestPayload,
			responsePayload: result.responsePayload,
			requestHeaders: result.requestHeaders as Record<string, string> | undefined,
			responseHeaders: result.responseHeaders as Record<string, string> | undefined,
			requestTimestamp: result.requestTimestamp,
			responseTimestamp: result.responseTimestamp,
		};
	}
}
