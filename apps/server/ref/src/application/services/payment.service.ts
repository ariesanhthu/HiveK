import { Injectable } from '@nestjs/common';
import {
	PaymentEntity,
	PaymentAttemptEntity,
	PaymentTransactionEntity,
	MoneyVO,
	PaymentAttemptStatusVO,
	EPaymentStatus,
	EPaymentAttemptStatus,
	EPaymentTransactionType,
	ETransactionStatus,
	PaymentAttemptNotFoundException,
	PaymentCannotRetryException,
	PaymentAlreadyCompletedException,
	PaymentInTerminalStateException,
	BillEntity,
	PaymentProviderEntity,
} from '@/core';
import { JsonRecord } from '@/shared/types';
import {
	PaymentAuthorizedEvent,
	PaymentCancelAttemptedEvent,
	PaymentAttemptStartedEvent,
	PaymentCompletedEvent,
	PaymentFailedEvent,
	PaymentRefundedEvent,
	TransactionRecordedEvent,
} from '@/core/events';

@Injectable()
export class PaymentService {
	/**
	 * REPLACES: Logic in PaymentEntity.addTransaction
	 * Handles the orchestration of adding a transaction to an attempt,
	 * managing status transitions, and dispatching specialized domain events.
	 */
	public processTransaction(
		payment: PaymentEntity,
		attemptId: string,
		transaction: PaymentTransactionEntity
	) {
		const attempt = payment.paymentAttempts.find((a) => a.id === attemptId);
		if (!attempt) {
			throw new PaymentAttemptNotFoundException(payment.id, attemptId);
		}

		const oldPaymentStatus = payment.status.value;
		const oldPaymentAttemptStatus = attempt.status.value;

		// 1. Add transaction to attempt
		attempt.addTransaction(transaction);

		// 2. Record the raw transaction event
		payment.addDomainEvent(
			new TransactionRecordedEvent(
				payment.id,
				attemptId,
				transaction.id,
				transaction.transactionType,
				transaction.transactionSource,
				transaction.status,
				transaction.amount.amount,
				transaction.amount.currency
			)
		);

		// 3. Coordinate status transitions if this is the latest attempt
		if (attempt === payment.getLatestAttempt()) {
			attempt.transitionStatus();
			this.transitionStatus(payment);
		}

		// 4. Dispatch specialized domain events based on business outcomes
		this.dispatchSpecializedEvents(payment, attempt, transaction);

		return {
			oldPaymentStatus,
			oldPaymentAttemptStatus,
			newPaymentStatus: payment.status.value,
			newPaymentAttemptStatus: attempt.status.value,
		};
	}

	/**
	 * REPLACES: Logic in PaymentEntity.retry
	 * Coordinates the lifecycle of a payment retry, including canceling
	 * the previous attempt and initializing a new one.
	 */
	public initiateRetry(
		payment: PaymentEntity,
		paymentProviderId: string,
		idempotencyKey: string
	): string {
		if (!payment.canRetry()) {
			throw new PaymentCannotRetryException(
				payment.id,
				'Latest attempt is not in a retryable state.'
			);
		}

		if (payment.status.isCompleted()) {
			throw new PaymentAlreadyCompletedException(payment.id);
		}

		const latestAttempt = payment.getLatestAttempt();

		// Cancel previous attempt if it exists and matches idempotency
		if (latestAttempt) {
			if (latestAttempt.idempotencyKey === idempotencyKey) {
				throw new PaymentCannotRetryException(
					payment.id,
					'Latest attempt is already in a retryable state.'
				);
			}
			latestAttempt.cancel();
		}

		const newAttempt = PaymentAttemptEntity.create({
			paymentProviderId,
			attemptNumber: latestAttempt ? latestAttempt.attemptNumber + 1 : 1,
			status: new PaymentAttemptStatusVO(EPaymentAttemptStatus.INITIATED),
			providerTransactionId: undefined,
			paymentUrl: undefined,
			failureReason: undefined,
			failureType: undefined,
			totalRefundedAmount: MoneyVO.zero(payment.amount.currency),
			transactions: [],
			createdAt: new Date(),
			updatedAt: new Date(),
			idempotencyKey,
		});

		payment.paymentAttempts.push(newAttempt);

		payment.addDomainEvent(
			new PaymentAttemptStartedEvent(
				payment.id,
				newAttempt.id,
				newAttempt.attemptNumber,
				paymentProviderId
			)
		);

		// Update payment status to PENDING
		payment.updateStatus(EPaymentStatus.PENDING);

		return newAttempt.id;
	}

	/**
	 * REPLACES: Logic in PaymentEntity.receiveWebhook
	 * Handlers the webhook orchestration and reporting.
	 */
	public handleWebhook(payment: PaymentEntity, attemptId: string) {
		const attempt = payment.paymentAttempts.find((a) => a.id === attemptId);
		if (!attempt) {
			throw new PaymentAttemptNotFoundException(payment.id, attemptId);
		}

		const oldPaymentStatus = payment.status.value;
		const oldPaymentAttemptStatus = attempt.status.value;

		attempt.receiveWebhook();
		this.transitionStatus(payment);

		return {
			oldPaymentStatus,
			oldPaymentAttemptStatus,
			newPaymentStatus: payment.status.value,
			newPaymentAttemptStatus: attempt.status.value,
		};
	}

	/**
	 * REPLACES: Logic in PaymentEntity.cancel
	 * Coordinates the cancellation of the aggregate and its active child entities.
	 */
	public cancelPayment(payment: PaymentEntity, reason: string, by: string): void {
		if (payment.status.isTerminal()) {
			throw new PaymentInTerminalStateException(payment.id);
		}

		payment.updateStatus(EPaymentStatus.CANCELED);
		payment.setCancelDetails(reason, by);

		const latestAttempt = payment.getLatestAttempt();
		if (latestAttempt && !latestAttempt.status.isTerminal()) {
			latestAttempt.cancel();
		}
	}

	/**
	 * REPLACES: Logic in PaymentEntity.transitionStatus
	 */
	private transitionStatus(payment: PaymentEntity): void {
		const latestAttempt = payment.getLatestAttempt();
		if (!latestAttempt) {
			return;
		}

		const attemptStatus = latestAttempt.status;
		let newStatus: EPaymentStatus | undefined;

		if (attemptStatus.isInitiated()) {
			newStatus = EPaymentStatus.PENDING;
		} else if (attemptStatus.isProcessing()) {
			newStatus = EPaymentStatus.PROCESSING;
		} else if (attemptStatus.isSuccess()) {
			newStatus = EPaymentStatus.COMPLETED;
		} else if (attemptStatus.isFailed()) {
			newStatus = EPaymentStatus.PENDING_PAYMENT_PROVIDER;
		} else if (attemptStatus.isCanceled()) {
			newStatus = EPaymentStatus.CANCELED;
		} else if (attemptStatus.isRefunded()) {
			newStatus = EPaymentStatus.REFUNDED;
		} else if (attemptStatus.isPartiallyRefunded()) {
			newStatus = EPaymentStatus.PARTIALLY_REFUNDED;
		}

		if (newStatus) {
			payment.updateStatus(newStatus);
		}
	}

	/**
	 * Private helper to manage specialized event dispatching logic
	 * extracted from PaymentEntity.addTransaction.
	 */
	private dispatchSpecializedEvents(
		payment: PaymentEntity,
		attempt: PaymentAttemptEntity,
		transaction: PaymentTransactionEntity
	): void {
		// 1. Authorization Success
		if (
			transaction.transactionType === EPaymentTransactionType.AUTHORIZATION &&
			transaction.status === ETransactionStatus.SUCCESS
		) {
			if (attempt.status.isProcessing()) {
				payment.addDomainEvent(
					new PaymentAuthorizedEvent(
						payment.id,
						attempt.id,
						'system',
						payment.amount.amount,
						attempt.idempotencyKey
					)
				);
			} else {
				payment.addDomainEvent(new PaymentCancelAttemptedEvent(payment.id, attempt.id));
			}
		}

		// 2. Capture Success (Payment Completed)
		if (
			transaction.transactionType === EPaymentTransactionType.CAPTURE &&
			transaction.status === ETransactionStatus.SUCCESS &&
			attempt.status.isSuccess()
		) {
			payment.addDomainEvent(
				new PaymentCompletedEvent(
					payment.id,
					payment.billId,
					attempt.id,
					payment.amount.amount,
					payment.amount.currency
				)
			);
		}

		// 3. Failure Handling
		if (
			transaction.status === ETransactionStatus.FAILED &&
			[
				EPaymentTransactionType.CREATE,
				EPaymentTransactionType.AUTHORIZATION,
				EPaymentTransactionType.CAPTURE,
			].includes(transaction.transactionType) &&
			attempt.status.isFailed()
		) {
			payment.addDomainEvent(
				new PaymentFailedEvent(
					payment.id,
					attempt.id,
					attempt.failureReason ?? 'Unknown error',
					attempt.failureType?.type ?? 'UNKNOWN'
				)
			);
		}

		// 4. Refund Handling
		if (
			transaction.transactionType === EPaymentTransactionType.REFUND &&
			transaction.status === ETransactionStatus.SUCCESS
		) {
			const isFullRefund = attempt.status.isRefunded();
			payment.addDomainEvent(
				new PaymentRefundedEvent(
					payment.id,
					attempt.id,
					transaction.amount.amount,
					transaction.amount.currency,
					isFullRefund
				)
			);
		}
	}

	/**
	 * NEW: Orchestrates cross-entity side effects.
	 * Marks bill as paid when capture succeeds. (Ignoring REFUND bills per user request).
	 */
	public coordinateCaptureSuccess(payment: PaymentEntity, bill?: BillEntity): void {
		// Only mark bill as paid if this was a successful capture
		// and the bill exists and matches the payment
		if (bill?.id === payment.billId) {
			bill.markAsPaid();
		}
	}

	/**
	 * NEW: Pure method to build provider config from a provider entity.
	 */
	public getProviderConfig(provider: PaymentProviderEntity): {
		url: string;
		redirectUrl: string;
		webhookUrl: string;
		credentials: JsonRecord;
	} {
		const returnUrlRaw = provider.credentials?.['returnUrl'];
		return {
			url:
				(process.env.NODE_ENV === 'production' ? provider.baseUrl : provider.testUrl) || '',
			redirectUrl: typeof returnUrlRaw === 'string' ? returnUrlRaw : '',
			webhookUrl: provider.webhookUrl || '',
			credentials: provider.credentials || {},
		};
	}
}
