/**
 * Cancel at Provider Activity
 *
 * Notifies payment gateway that payment was canceled.
 * Currently empty - provider notification not required for current gateways.
 *
 * Future Implementation:
 * - Call provider.cancel(transactionId) for gateways that require explicit cancellation
 * - Handle pre-authorized payments that need cancellation at provider side
 * - Record cancellation transaction in payment history
 */

import { Inject, Injectable } from '@nestjs/common';
import { z } from 'zod';
import { Activity, ActivityValidation } from '@/shared/durable-execution';
import { CANCEL_AT_PROVIDER_ACTIVITY } from '../payment-cancel.token';
import { type ILoggerService, LOGGER_SERVICE } from '@/core/interfaces';

// Input/Output schemas
const CancelAtProviderInputSchema = z.object({
	paymentId: z.string(),
});

const CancelAtProviderOutputSchema = z.object({
	notified: z.boolean(),
});

type CancelAtProviderInput = z.infer<typeof CancelAtProviderInputSchema>;
type CancelAtProviderOutput = z.infer<typeof CancelAtProviderOutputSchema>;

@Injectable()
@Activity(CANCEL_AT_PROVIDER_ACTIVITY)
@ActivityValidation({
	input: CancelAtProviderInputSchema,
	output: CancelAtProviderOutputSchema,
})
export class CancelAtProviderActivity {
	constructor(@Inject(LOGGER_SERVICE) private readonly logger: ILoggerService) {}

	async execute(input: CancelAtProviderInput): Promise<CancelAtProviderOutput> {
		const { paymentId } = input;

		// TODO: Implement when gateway requires notification
		// const session = await this.uow.start();
		// try {
		//     const payment = await session.paymentRepository.findById(paymentId);
		//     if (!payment) throw new PaymentNotFoundException(paymentId);
		//
		//     const latestAttempt = payment.getLatestAttempt();
		//     if (latestAttempt?.providerTransactionId) {
		//         const provider = await session.providerRepository.findById(
		//             latestAttempt.paymentProviderId
		//         );
		//         const gateway = this.providerDiscovery.getProvider(provider.code);
		//         await gateway.cancel(latestAttempt.providerTransactionId);
		//
		//         // Record CANCEL transaction
		//         const transaction = PaymentTransactionEntity.create({...});
		//         payment.addTransaction(transaction);
		//         await session.paymentRepository.save(payment);
		//     }
		//     await session.commit();
		// } catch (e) {
		//     await session.rollback();
		//     throw toError(e);
		// } finally {
		//     await session.end();
		// }

		this.logger.log(`Cancel at provider (no-op): payment ${paymentId}`);

		return {
			notified: false,
		};
	}
}
