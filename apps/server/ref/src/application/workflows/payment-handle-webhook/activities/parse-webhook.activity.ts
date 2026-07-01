/**
 * Parse Webhook Activity
 *
 * Provider-specific webhook parsing to extract transaction details.
 * Steps:
 * 1. Get provider instance
 * 2. Call provider.parseWebhook() to extract action, data, amount, currency
 * 3. Map action + status to EPaymentTransactionType
 * 4. Return structured webhook data + provider response
 */

import { Injectable, Inject } from '@nestjs/common';
import { z } from 'zod';
import { Activity, ActivityValidation } from '@/shared/durable-execution';
import { PARSE_WEBHOOK_ACTIVITY } from '../payment-handle-webhook.token';
import { type ILoggerService, LOGGER_SERVICE } from '@/core/interfaces';
import { EPaymentTransactionType } from '@/core';
import {
	PAYMENT_PROVIDER_DISCOVERY,
	type IPaymentProviderDiscovery,
	PAYMENT_PROVIDER_REPOSITORY,
	type IPaymentProviderRepository,
	PaymentProviderNotFoundException,
} from '@/core';

// Input/Output schemas
const ParseWebhookInputSchema = z.object({
	providerCode: z.string(),
	providerId: z.string(),
	webhookData: z.record(z.string(), z.unknown()),
});

const ParseWebhookOutputSchema = z.object({
	action: z.enum(['payment', 'refund', 'cancel', 'other']),
	data: z.object({
		transactionId: z.string().optional(),
		isSuccess: z.boolean(),
		status: z.enum(['authorized', 'succeeded', 'failed', 'pending', 'expired']),
		errorMessage: z.string().optional(),
	}),
	amount: z.number(),
	currency: z.string(),
	transactionType: z.enum(EPaymentTransactionType),
	metadata: z.record(z.string(), z.unknown()).optional(),
	rawPayload: z.record(z.string(), z.unknown()),
	providerResponse: z.object({
		statusCode: z.number(),
		payload: z.record(z.string(), z.unknown()).optional(),
	}),
});

type ParseWebhookInput = z.infer<typeof ParseWebhookInputSchema>;
type ParseWebhookOutput = z.infer<typeof ParseWebhookOutputSchema>;

@Injectable()
@Activity(PARSE_WEBHOOK_ACTIVITY)
@ActivityValidation({
	input: ParseWebhookInputSchema,
	output: ParseWebhookOutputSchema,
})
export class ParseWebhookActivity {
	constructor(
		@Inject(LOGGER_SERVICE) private readonly logger: ILoggerService,
		@Inject(PAYMENT_PROVIDER_DISCOVERY)
		private readonly providerDiscovery: IPaymentProviderDiscovery,
		@Inject(PAYMENT_PROVIDER_REPOSITORY)
		private readonly providerRepository: IPaymentProviderRepository
	) {}

	async execute(input: ParseWebhookInput): Promise<ParseWebhookOutput> {
		const { providerCode, providerId, webhookData } = input;

		this.logger.log(`Parsing webhook from provider: ${providerCode}`);

		// 1. Get provider instance
		const providerInstance = this.providerDiscovery.findProvider(providerCode);
		if (!providerInstance?.parseWebhook) {
			throw new PaymentProviderNotFoundException(providerCode);
		}

		// 2. Get provider credentials
		const providerEntity = await this.providerRepository.findById(providerId);
		if (!providerEntity) {
			throw new PaymentProviderNotFoundException(providerId);
		}

		// 3. Call provider.parseWebhook() to extract webhook data
		const webhookResult = providerInstance.parseWebhook(webhookData, {
			credentials: providerEntity.credentials,
		});

		// 4. Map action + status to EPaymentTransactionType
		const transactionType = this.mapToTransactionType(
			webhookResult.action,
			webhookResult.data.status
		);

		this.logger.log(
			`Parsed webhook: action=${webhookResult.action}, status=${webhookResult.data.status}, type=${transactionType}`
		);

		return {
			action: webhookResult.action,
			data: webhookResult.data,
			amount: webhookResult.amount,
			currency: webhookResult.currency,
			transactionType,
			metadata: webhookResult.metadata,
			rawPayload: webhookResult.rawPayload,
			providerResponse: webhookResult.response,
		};
	}

	/**
	 * Map provider action + status to EPaymentTransactionType
	 */
	private mapToTransactionType(
		action: 'payment' | 'refund' | 'cancel' | 'other',
		status: 'authorized' | 'succeeded' | 'failed' | 'pending' | 'expired'
	): EPaymentTransactionType {
		switch (action) {
			case 'payment':
				switch (status) {
					case 'authorized':
						return EPaymentTransactionType.AUTHORIZATION;
					case 'succeeded':
					case 'failed':
						return EPaymentTransactionType.CAPTURE;
					case 'expired':
						return EPaymentTransactionType.CANCEL;
					case 'pending':
						return EPaymentTransactionType.AUTHORIZATION;
					default:
						return EPaymentTransactionType.AUTHORIZATION;
				}
			case 'refund':
				return EPaymentTransactionType.REFUND;
			case 'cancel':
				return EPaymentTransactionType.CANCEL;
			default:
				return EPaymentTransactionType.AUTHORIZATION;
		}
	}
}
