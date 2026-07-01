/**
 * Validate Webhook Activity
 *
 * Pre-flight validation and security verification for incoming webhooks.
 * Steps:
 * 1. Find provider instance via discovery
 * 2. Find provider entity from database
 * 3. Extract attemptId from webhook payload (provider-specific)
 * 4. Find payment by attemptId
 * 5. Verify payment's provider matches webhook source
 * 6. Verify webhook signature (cryptographic verification)
 */

import { Injectable, Inject } from '@nestjs/common';
import { z } from 'zod';
import { Activity, ActivityValidation } from '@/shared/durable-execution';
import { VALIDATE_WEBHOOK_ACTIVITY } from '../payment-handle-webhook.token';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/core/interfaces';
import { type ILoggerService, LOGGER_SERVICE } from '@/core/interfaces';
import { PaymentNotFoundException, PaymentAttemptNotFoundException } from '@/core';
import {
	PAYMENT_PROVIDER_DISCOVERY,
	type IPaymentProviderDiscovery,
	PaymentProviderNotFoundException,
	PaymentProviderDisabledException,
} from '@/core';

// Input/Output schemas
const ValidateWebhookInputSchema = z.object({
	code: z.string(),
	data: z.record(z.string(), z.unknown()),
});

const ValidateWebhookOutputSchema = z.object({
	isValid: z.boolean(),
	attemptId: z.string(),
	paymentId: z.string(),
	providerCode: z.string(),
	providerId: z.string(),
});

type ValidateWebhookInput = z.infer<typeof ValidateWebhookInputSchema>;
type ValidateWebhookOutput = z.infer<typeof ValidateWebhookOutputSchema>;

@Injectable()
@Activity(VALIDATE_WEBHOOK_ACTIVITY)
@ActivityValidation({
	input: ValidateWebhookInputSchema,
	output: ValidateWebhookOutputSchema,
})
export class ValidateWebhookActivity {
	constructor(
		@Inject(UNIT_OF_WORK) private readonly uow: IUnitOfWork,
		@Inject(LOGGER_SERVICE) private readonly logger: ILoggerService,
		@Inject(PAYMENT_PROVIDER_DISCOVERY)
		private readonly providerDiscovery: IPaymentProviderDiscovery
	) {}

	async execute(input: ValidateWebhookInput): Promise<ValidateWebhookOutput> {
		const { code, data } = input;

		this.logger.log(`Validating webhook from provider: ${code}`);

		// 1. Find provider instance via discovery
		const providerInstance = this.providerDiscovery.findProvider(code);
		if (
			!providerInstance?.verifyWebhook ||
			!providerInstance.extractPaymentAttemptId ||
			!providerInstance.parseWebhook
		) {
			throw new PaymentProviderNotFoundException(code);
		}

		const session = await this.uow.start();
		try {
			// 2. Find provider entity from database
			const providerEntity = await session.providerRepository.findByCode(code);
			if (!providerEntity) {
				throw new PaymentProviderNotFoundException(code);
			}

			if (!providerEntity.isActive) {
				throw new PaymentProviderDisabledException();
			}

			// 3. Extract attemptId from webhook payload (provider-specific logic)
			const attemptId = providerInstance.extractPaymentAttemptId(data);
			if (!attemptId) {
				throw new PaymentAttemptNotFoundException('unknown', 'unknown');
			}

			this.logger.log(`Extracted attemptId: ${attemptId}`);

			// 4. Find payment by attemptId
			const payment = await session.paymentRepository.findByAttemptId(attemptId);
			if (!payment) {
				throw new PaymentNotFoundException(attemptId);
			}

			// 5. Verify payment's provider matches webhook source
			const latestAttempt = payment.getLatestAttempt();
			if (!latestAttempt) {
				throw new PaymentAttemptNotFoundException(payment.id, attemptId);
			}

			if (latestAttempt.paymentProviderId !== providerEntity.id) {
				throw new PaymentProviderNotFoundException(
					`Provider mismatch: payment uses ${latestAttempt.paymentProviderId}, webhook from ${providerEntity.id}`
				);
			}

			// 6. Verify webhook signature (cryptographic verification)
			const isSignatureValid = providerInstance.verifyWebhook(data, {
				credentials: providerEntity.credentials,
			});

			if (!isSignatureValid) {
				throw new Error('Webhook signature verification failed');
			}

			this.logger.log(`Webhook validated successfully for payment: ${payment.id}`);

			return {
				isValid: true,
				attemptId,
				paymentId: payment.id,
				providerCode: code,
				providerId: providerEntity.id,
			};
		} finally {
			await session.end();
		}
	}
}
