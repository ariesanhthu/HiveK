import { DomainException } from './domain.exception';

// Base exception
export class PaymentException extends DomainException {
	constructor(message: string) {
		super(message);
	}
}

// Not found exceptions
export class PaymentNotFoundException extends PaymentException {
	constructor(identifier: string) {
		super(`Payment not found with identifier: ${identifier}`);
	}
}

export class PaymentNotFoundForBillException extends PaymentException {
	constructor(billId: string) {
		super(`Payment not found for bill with id: ${billId}`);
	}
}

export class PaymentNotFoundForUserException extends PaymentException {
	constructor(userId: string) {
		super(`Payment not found for user with id: ${userId}`);
	}
}

// Failed exceptions
export class PaymentAlreadyExistsException extends PaymentException {
	constructor(identifier: string) {
		super(`Payment already exists with idempotency key: ${identifier}`);
	}
}

export class PaymentFailedException extends PaymentException {
	constructor(identifier: string, message: string) {
		super(`Payment failed with identifier: ${identifier}. Message: ${message}`);
	}
}

export class PaymentCapturedException extends PaymentException {
	constructor(identifier: string) {
		super(`Payment has been captured with identifier: ${identifier}`);
	}
}

export class PaymentCancelAttemptedException extends PaymentException {
	constructor(identifier: string) {
		super(`Payment has been canceled with identifier: ${identifier}`);
	}
}

export class PaymentExpiredException extends PaymentException {
	constructor(identifier: string) {
		super(`Payment has been expired with identifier: ${identifier}`);
	}
}

export class PaymentRefundedException extends PaymentException {
	constructor(identifier: string) {
		super(`Payment has been refunded with identifier: ${identifier}`);
	}
}

export class PaymentPartiallyRefundedException extends PaymentException {
	constructor(identifier: string) {
		super(`Payment has been partially refunded with identifier: ${identifier}`);
	}
}

export class PaymentAlreadyActiveForBillException extends PaymentException {
	constructor(billId: string, existingPaymentId: string) {
		super(
			`Cannot create payment for bill ${billId}: ` +
				`An active payment (${existingPaymentId}) already exists for this bill. ` +
				`Only one active payment is allowed per bill.`
		);
	}
}

export class PaymentCannotRetryException extends PaymentException {
	constructor(paymentId: string, reason: string) {
		super(`Payment ${paymentId} cannot be retried: ${reason}`);
	}
}

export class PaymentAlreadyCompletedException extends PaymentException {
	constructor(paymentId: string) {
		super(`Payment ${paymentId} is already completed and cannot be retried.`);
	}
}

export class PaymentAttemptNotFoundException extends PaymentException {
	constructor(paymentId: string, attemptId: string) {
		super(`Payment attempt ${attemptId} not found in payment ${paymentId}.`);
	}
}

export class PaymentHasNoAttemptsException extends PaymentException {
	constructor(paymentId: string) {
		super(`Payment ${paymentId} has no attempts.`);
	}
}

export class PaymentCannotBeRefundedException extends PaymentException {
	constructor(paymentId: string) {
		super(`Payment ${paymentId} cannot be refunded.`);
	}
}

export class PaymentNoSuccessfulAttemptException extends PaymentException {
	constructor(paymentId: string) {
		super(`Payment ${paymentId} has no successful attempt to refund.`);
	}
}

export class PaymentInTerminalStateException extends PaymentException {
	constructor(paymentId: string) {
		super(`Payment ${paymentId} is already in a terminal state and cannot be canceled.`);
	}
}

export class PaymentInvalidStateForCancelException extends PaymentException {
	constructor(paymentId: string, currentState: string) {
		super(
			`Payment ${paymentId} cannot be canceled from state ${currentState}. ` +
				`Only PENDING or PENDING_PAYMENT_PROVIDER payments can be canceled.`
		);
	}
}

export class PaymentAttemptProcessingException extends PaymentException {
	constructor(paymentId: string, attemptId: string) {
		super(
			`Cannot cancel payment ${paymentId}: ` +
				`Latest attempt ${attemptId} is currently processing.`
		);
	}
}

export class PaymentRefundAmountExceedsException extends PaymentException {
	constructor(paymentId: string, refundAmount: number, maxRefundableAmount: number) {
		super(
			`Cannot refund payment ${paymentId}: ` +
				`Requested refund amount ${refundAmount} exceeds maximum refundable amount ${maxRefundableAmount}.`
		);
	}
}
