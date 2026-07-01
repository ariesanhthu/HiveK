/**
 * Refund Credit Activity
 *
 * Calculates and refunds credit for removed/expired packages.
 * Creates wallet transaction with idempotency key.
 *
 * Phase 1: Returns 0 (no package removal logic yet)
 */

import { Injectable, Inject } from '@nestjs/common';
import { z } from 'zod';
import { Activity, ActivityValidation } from '@/shared/durable-execution';
import { REFUND_CREDIT_ACTIVITY } from '../subscription-update.token';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/core/interfaces';
import { type ILoggerService, LOGGER_SERVICE } from '@/core/interfaces';

// Input/Output schemas
const RefundCreditInputSchema = z.object({
	subscriptionId: z.string(),
	billId: z.string(),
	amount: z.number(),
	currency: z.string(),
});

const RefundCreditOutputSchema = z.object({
	refundedAmount: z.number(),
	transactionId: z.string().optional(),
});

type RefundCreditInput = z.infer<typeof RefundCreditInputSchema>;
type RefundCreditOutput = z.infer<typeof RefundCreditOutputSchema>;

@Injectable()
@Activity(REFUND_CREDIT_ACTIVITY)
@ActivityValidation({
	input: RefundCreditInputSchema,
	output: RefundCreditOutputSchema,
})
export class RefundCreditActivity {
	constructor(
		@Inject(UNIT_OF_WORK) private readonly uow: IUnitOfWork,
		@Inject(LOGGER_SERVICE) private readonly logger: ILoggerService
	) {}

	async execute(input: RefundCreditInput): Promise<RefundCreditOutput> {
		const { subscriptionId, billId: _billId, amount, currency: _currency } = input;
		this.logger.log(
			`Refund credit is disabled (wallet feature disabled). Returning 0 for subscription: ${subscriptionId}, amount: ${amount}`
		);
		return {
			refundedAmount: 0,
			transactionId: undefined,
		};
		/*
		if (amount <= 0) {
			this.logger.log('Refund amount is zero or negative, skipping refund');
			return {
				refundedAmount: 0,
				transactionId: undefined,
			};
		}

		const session = await this.uow.start();
		try {
			const idempotencyKey = `sub-${subscriptionId}-bill-${billId}-refund`;

			// Check if transaction already exists (idempotency)
			const existingTx =
				await session.walletTransactionRepository.findByIdempotencyKey(idempotencyKey);
			if (existingTx) {
				this.logger.log(`Refund already processed. Transaction ID: ${existingTx.id}`);
				return {
					refundedAmount: existingTx.amount.amount,
					transactionId: existingTx.id,
				};
			}

			// Fetch subscription to get enterpriseId
			const subscription = await session.subscriptionRepository.findById(subscriptionId);
			if (!subscription) {
				throw new Error(`Subscription not found: ${subscriptionId}`);
			}

			// Fetch wallet
			let wallet = await session.walletRepository.findByEnterpriseId(
				subscription.enterpriseId
			);
			if (!wallet) {
				const walletEntity = WalletEntity.create({
					enterpriseId: subscription.enterpriseId,
					balance: new MoneyVO(0, currency as ECurrency),
					createdAt: new Date(),
					updatedAt: new Date(),
				});
				wallet = await session.walletRepository.create(walletEntity);
			}

			// Create wallet transaction (CREDIT)
			const transaction = WalletTransactionEntity.create({
				walletId: wallet.id,
				type: EWalletTransactionType.CREDIT,
				amount: new MoneyVO(amount, currency as ECurrency),
				billId,
				idempotencyKey,
				description: `Refund for removed packages - Bill ${billId}`,
				metadata: { subscriptionId },
				createdAt: new Date(),
			});

			await session.walletTransactionRepository.create(transaction);

			// Update wallet balance
			wallet.credit(new MoneyVO(amount, currency as ECurrency));
			await session.walletRepository.save(wallet);

			await session.commit();

			this.logger.log(
				`Successfully refunded ${amount} to wallet. Transaction ID: ${transaction.id}`
			);

			return {
				refundedAmount: amount,
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
