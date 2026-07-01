import { DomainEvent } from '../abstract/base.event';
import { EAggregateType } from '../enums';

export class PaymentCancelAttemptedEvent extends DomainEvent<{
	paymentId: string;
	attemptId: string;
}> {
	eventType = 'PaymentCancelAttemptedEvent';
	aggregateType = EAggregateType.PAYMENT;

	constructor(
		public readonly paymentId: string,
		public readonly attemptId: string
	) {
		super(paymentId, {
			paymentId,
			attemptId,
		});
	}
}
