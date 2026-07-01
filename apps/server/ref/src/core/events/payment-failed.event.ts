import { DomainEvent } from '../abstract/base.event';
import { EAggregateType } from '../enums';

export class PaymentFailedEvent extends DomainEvent<{
	paymentId: string;
	attemptId: string;
	reason: string;
	failureType: string;
}> {
	eventType = 'PaymentFailedEvent';
	aggregateType = EAggregateType.PAYMENT;

	constructor(
		public readonly paymentId: string,
		public readonly attemptId: string,
		public readonly reason: string,
		public readonly failureType: string
	) {
		super(paymentId, {
			paymentId,
			attemptId,
			reason,
			failureType,
		});
	}
}
