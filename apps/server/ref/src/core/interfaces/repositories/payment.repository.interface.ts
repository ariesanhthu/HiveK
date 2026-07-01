import { type IRepository } from '@/core/interfaces';
import { type PaymentEntity } from '@/core/aggregate-roots';

export const PAYMENT_REPOSITORY = Symbol('PAYMENT_REPOSITORY');

export interface IPaymentRepository extends IRepository<PaymentEntity> {
	findByUserId(userId: string): Promise<PaymentEntity[]>;

	/**
	 * Find the currently active payment for a bill (if any).
	 * Active means: PENDING, PROCESSING, or AUTHORIZED status.
	 * Used for enforcing 1:1 bill-payment constraint.
	 */
	findActiveByBillId(billId: string): Promise<PaymentEntity | null>;

	/**
	 * Find all payments (active and inactive) for a bill.
	 * Used for history retrieval and analytics.
	 */
	findAllByBillId(billId: string): Promise<PaymentEntity[]>;

	/**
	 * Check if an active payment exists for a bill.
	 * Optimized query that returns boolean without loading full entity.
	 */
	hasActivePaymentForBill(billId: string): Promise<boolean>;

	findByIdempotencyKey(key: string): Promise<PaymentEntity | null>;
	findByAttemptId(attemptId: string): Promise<PaymentEntity | null>;
}
