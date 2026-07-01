import { Injectable } from '@nestjs/common';
import { PaymentEntity, BillEntity } from '@/core/aggregate-roots';
import { PaymentAttemptEntity, PaymentTransactionEntity } from '@/core/entities';
import { MoneyVO, PaymentAttemptStatusVO } from '@/core/value-objects';
import { EPaymentStatus, EPaymentAttemptStatus, EPaymentTransactionType, ETransactionStatus } from '@/core/enums';
import {
  PaymentAttemptNotFoundException,
  PaymentCannotRetryException,
  PaymentAlreadyCompletedException,
  PaymentInTerminalStateException,
} from '@/core/exceptions';
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
      throw new PaymentAttemptNotFoundException(payment.id!, attemptId);
    }

    const oldPaymentStatus = payment.status.value;
    const oldPaymentAttemptStatus = attempt.status.value;

    // 1. Add transaction to attempt
    attempt.addTransaction(transaction);

    // 2. Record the raw transaction event
    payment.recordEvent(
      new TransactionRecordedEvent(
        payment.id!,
        attemptId,
        transaction.id!,
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
        payment.id!,
        'Latest attempt is not in a retryable state.'
      );
    }

    if (payment.status.isCompleted()) {
      throw new PaymentAlreadyCompletedException(payment.id!);
    }

    const latestAttempt = payment.getLatestAttempt();

    // Cancel previous attempt if it exists and matches idempotency
    if (latestAttempt) {
      if (latestAttempt.idempotencyKey === idempotencyKey) {
        throw new PaymentCannotRetryException(
          payment.id!,
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

    payment.recordEvent(
      new PaymentAttemptStartedEvent(
        payment.id!,
        newAttempt.id!,
        newAttempt.attemptNumber,
        paymentProviderId
      )
    );

    // Update payment status to PENDING
    payment.updateStatus(EPaymentStatus.PENDING);

    return newAttempt.id!;
  }

  /**
   * Handlers the webhook orchestration and reporting.
   */
  public handleWebhook(payment: PaymentEntity, attemptId: string) {
    const attempt = payment.paymentAttempts.find((a) => a.id === attemptId);
    if (!attempt) {
      throw new PaymentAttemptNotFoundException(payment.id!, attemptId);
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
   * Coordinates the cancellation of the aggregate and its active child entities.
   */
  public cancelPayment(payment: PaymentEntity, reason: string, by: string): void {
    if (payment.status.isTerminal()) {
      throw new PaymentInTerminalStateException(payment.id!);
    }

    payment.updateStatus(EPaymentStatus.CANCELED);
    payment.setCancelDetails(reason, by);

    const latestAttempt = payment.getLatestAttempt();
    if (latestAttempt && !latestAttempt.status.isTerminal()) {
      latestAttempt.cancel();
    }
  }

  /**
   * Coordinates status transitions based on latest attempt.
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
   * Private helper to manage specialized event dispatching logic.
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
        payment.recordEvent(
          new PaymentAuthorizedEvent(payment.id!, {
            paymentId: payment.id!,
            paymentAttemptId: attempt.id!,
            capturedBy: 'system',
            amount: payment.amount.amount,
            idempotencyKey: attempt.idempotencyKey,
          })
        );
      } else {
        payment.recordEvent(new PaymentCancelAttemptedEvent(payment.id!, attempt.id!));
      }
    }

    // 2. Capture Success (Payment Completed)
    if (
      transaction.transactionType === EPaymentTransactionType.CAPTURE &&
      transaction.status === ETransactionStatus.SUCCESS &&
      attempt.status.isSuccess()
    ) {
      payment.recordEvent(
        new PaymentCompletedEvent(payment.id!, {
          paymentId: payment.id!,
          billId: payment.billId,
          attemptId: attempt.id!,
          amount: payment.amount.amount,
          currency: payment.amount.currency,
        })
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
      payment.recordEvent(
        new PaymentFailedEvent(
          payment.id!,
          attempt.id!,
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
      payment.recordEvent(
        new PaymentRefundedEvent(
          payment.id!,
          attempt.id!,
          transaction.amount.amount,
          transaction.amount.currency,
          isFullRefund
        )
      );
    }
  }

  /**
   * Marks bill as paid when capture succeeds.
   */
  public coordinateCaptureSuccess(payment: PaymentEntity, bill?: BillEntity): void {
    if (bill?.id === payment.billId) {
      bill.markAsPaid();
    }
  }
}
