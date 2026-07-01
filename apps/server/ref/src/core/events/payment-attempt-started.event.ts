import { DomainEvent } from '../abstract/base.event';
import { EAggregateType } from '../enums';

export class PaymentAttemptStartedEvent extends DomainEvent<{
	paymentId: string;
	attemptId: string;
	attemptNumber: number;
	providerId: string;
}> {
	eventType = 'PaymentAttemptStartedEvent';
	aggregateType = EAggregateType.PAYMENT;

	constructor(
		public readonly paymentId: string,
		public readonly attemptId: string,
		public readonly attemptNumber: number,
		public readonly providerId: string
	) {
		super(paymentId, {
			paymentId,
			attemptId,
			attemptNumber,
			providerId,
		});
	}
}
