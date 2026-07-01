/**
 * Execute Capture Activity
 *
 * Executes payment provider capture.
 * Fetches provider configuration internally to avoid credential leakage.
 */

import { PaymentService } from '@/application/services/payment.service';
import { Inject, Injectable } from '@nestjs/common';
import { z } from 'zod';
import { Activity, ActivityValidation } from '@/shared/durable-execution';
import { EXECUTE_CAPTURE_ACTIVITY } from '../payment-capture.token';
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
const ExecuteCaptureInputSchema = z.object({
	paymentProviderId: z.string(),
	providerTransactionId: z.string(),
	attemptId: z.string(),
	captureAmount: z.number().positive(),
	currency: z.string(),
});

const ExecuteCaptureOutputSchema = z.object({
	isSuccess: z.boolean(),
	data: z.unknown(),
	requestPayload: z.unknown(),
	responsePayload: z.unknown(),
	requestHeaders: z.unknown(),
	responseHeaders: z.unknown(),
	requestTimestamp: z.date(),
	responseTimestamp: z.date(),
});

type ExecuteCaptureInput = z.infer<typeof ExecuteCaptureInputSchema>;
type ExecuteCaptureOutput = z.infer<typeof ExecuteCaptureOutputSchema>;

@Injectable()
@Activity(EXECUTE_CAPTURE_ACTIVITY)
@ActivityValidation({
	input: ExecuteCaptureInputSchema,
	output: ExecuteCaptureOutputSchema,
})
export class ExecuteCaptureActivity {
	constructor(
		@Inject(LOGGER_SERVICE) private readonly logger: ILoggerService,
		@Inject(PAYMENT_PROVIDER_DISCOVERY)
		private readonly paymentProviderDiscovery: IPaymentProviderDiscovery,
		@Inject(PAYMENT_PROVIDER_REPOSITORY)
		private readonly providerRepository: IPaymentProviderRepository,
		private readonly paymentService: PaymentService
	) {}

	async execute(input: ExecuteCaptureInput): Promise<ExecuteCaptureOutput> {
		const { paymentProviderId, providerTransactionId, captureAmount, currency, attemptId } =
			input;
		this.logger.log(`Executing capture for transaction ${providerTransactionId}`);

		// 1. Fetch provider configuration internally
		const provider = await this.providerRepository.findById(paymentProviderId);
		if (!provider) {
			throw new PaymentProviderNotFoundException(paymentProviderId);
		}

		// 2. Get provider implementation
		const providerInstance = this.paymentProviderDiscovery.findProvider(provider.code);
		if (!providerInstance?.capture) {
			throw new PaymentProviderNotFoundException(provider.code);
		}

		// 3. Build provider configuration using service helper
		const config = this.paymentService.getProviderConfig(provider);

		// 4. Call provider capture API
		const result = await providerInstance.capture(
			providerTransactionId,
			attemptId,
			captureAmount,
			currency as ECurrency,
			config
		);

		this.logger.log(
			`Capture executed for transaction ${providerTransactionId}: ${result.data.isSuccess ? 'success' : 'failed'}`
		);

		return {
			isSuccess: result.data.isSuccess,
			data: result.data,
			requestPayload: result.requestPayload,
			responsePayload: result.responsePayload,
			requestHeaders: result.requestHeaders,
			responseHeaders: result.responseHeaders,
			requestTimestamp: result.requestTimestamp,
			responseTimestamp: result.responseTimestamp,
		};
	}
}
