import { DomainEvent } from '../abstract/base.event';
import { EAggregateType } from '../enums';

export class PaymentAuthorizedEvent extends DomainEvent<{
	paymentId: string;
	paymentAttemptId: string;
	capturedBy: string;
	amount: number;
	idempotencyKey: string;
}> {
	eventType = 'PaymentAuthorizedEvent';
	aggregateType = EAggregateType.PAYMENT;

	constructor(
		public readonly paymentId: string,
		public readonly paymentAttemptId: string,
		public readonly capturedBy: string,
		public readonly amount: number,
		public readonly idempotencyKey: string
	) {
		super(paymentId, {
			paymentId,
			paymentAttemptId,
			capturedBy,
			amount,
			idempotencyKey,
		});
	}
}
