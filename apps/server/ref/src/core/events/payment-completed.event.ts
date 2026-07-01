import { DomainEvent } from '../abstract/base.event';
import { EAggregateType } from '../enums';

export class PaymentCompletedEvent extends DomainEvent<{
	paymentId: string;
	billId: string;
	attemptId: string;
	amount: number;
	currency: string;
}> {
	eventType = 'PaymentCompletedEvent';
	aggregateType = EAggregateType.PAYMENT;

	constructor(
		public readonly paymentId: string,
		public readonly billId: string,
		public readonly attemptId: string,
		public readonly amount: number,
		public readonly currency: string
	) {
		super(paymentId, {
			paymentId,
			billId,
			attemptId,
			amount,
			currency,
		});
	}
}
