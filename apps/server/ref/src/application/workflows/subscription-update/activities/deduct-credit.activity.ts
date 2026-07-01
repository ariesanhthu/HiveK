/**
 * Deduct Credit Activity
 *
 * Deducts credit applied from bill from wallet balance.
 * Creates wallet transaction with idempotency key.
 * Validates wallet balance before deduction.
 */

import { Injectable, Inject } from '@nestjs/common';
import { z } from 'zod';
import { Activity, ActivityValidation } from '@/shared/durable-execution';
import { DEDUCT_CREDIT_ACTIVITY } from '../subscription-update.token';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/core/interfaces';
import { type ILoggerService, LOGGER_SERVICE } from '@/core/interfaces';

// Input/Output schemas
const DeductCreditInputSchema = z.object({
	subscriptionId: z.string(),
	billId: z.string(),
	creditToDeduct: z.number(),
	currency: z.string(),
});

const DeductCreditOutputSchema = z.object({
	deductedAmount: z.number(),
	transactionId: z.string(),
});

type DeductCreditInput = z.infer<typeof DeductCreditInputSchema>;
type DeductCreditOutput = z.infer<typeof DeductCreditOutputSchema>;

@Injectable()
@Activity(DEDUCT_CREDIT_ACTIVITY)
@ActivityValidation({
	input: DeductCreditInputSchema,
	output: DeductCreditOutputSchema,
})
export class DeductCreditActivity {
	constructor(
		@Inject(UNIT_OF_WORK) private readonly uow: IUnitOfWork,
		@Inject(LOGGER_SERVICE) private readonly logger: ILoggerService
	) {}

	async execute(input: DeductCreditInput): Promise<DeductCreditOutput> {
		const { subscriptionId, billId: _billId, creditToDeduct, currency: _currency } = input;
		this.logger.log(
			`Deduct credit is disabled (wallet feature disabled). Returning 0 for subscription: ${subscriptionId}, amount: ${creditToDeduct}`
		);
		return {
			deductedAmount: 0,
			transactionId: '',
		};
		/*
		// If no credit to deduct, skip
		if (creditToDeduct === 0) {
			this.logger.log('No credit to deduct');
			return {
				deductedAmount: 0,
				transactionId: '',
			};
		}

		const session = await this.uow.start();
		try {
			const idempotencyKey = `sub-${subscriptionId}-bill-${billId}-deduct`;

			// Check if transaction already exists (idempotency)
			const existingTx =
				await session.walletTransactionRepository.findByIdempotencyKey(idempotencyKey);
			if (existingTx) {
				this.logger.log(`Deduction already processed. Transaction ID: ${existingTx.id}`);
				return {
					deductedAmount: existingTx.amount.amount,
					transactionId: existingTx.id,
				};
			}

			// Fetch subscription to get enterpriseId
			const subscription = await session.subscriptionRepository.findById(subscriptionId);
			if (!subscription) {
				throw new Error(`Subscription not found: ${subscriptionId}`);
			}

			// Fetch wallet
			const wallet = await session.walletRepository.findByEnterpriseId(
				subscription.enterpriseId
			);
			if (!wallet) {
				throw new Error(`Wallet not found for enterprise: ${subscription.enterpriseId}`);
			}

			// Validate balance
			const deductAmount = new MoneyVO(creditToDeduct, currency as ECurrency);
			if (!wallet.canDebit(deductAmount)) {
				throw new Error(
					`Insufficient wallet balance. Required: ${creditToDeduct}, Available: ${wallet.balance.amount}`
				);
			}

			// Create wallet transaction (DEBIT)
			const transaction = WalletTransactionEntity.create({
				walletId: wallet.id,
				type: EWalletTransactionType.DEBIT,
				amount: deductAmount,
				billId,
				idempotencyKey,
				description: `Credit applied for Bill ${billId}`,
				metadata: { subscriptionId },
				createdAt: new Date(),
			});

			await session.walletTransactionRepository.create(transaction);

			// Update wallet balance
			wallet.debit(deductAmount);
			await session.walletRepository.save(wallet);

			await session.commit();

			this.logger.log(
				`Successfully deducted ${creditToDeduct} from wallet. Transaction ID: ${transaction.id}`
			);

			return {
				deductedAmount: creditToDeduct,
				transactionId: transaction.id,
			};
		} catch (error) {
			await session.rollback();
			throw toError(error);
		} finally {
			await session.end();
		}
		*/
	}
}
