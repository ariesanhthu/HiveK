import { DomainEvent } from '../abstract/base.event';
import { EAggregateType } from '../enums';

export class PaymentCreatedEvent extends DomainEvent<{
	paymentId: string;
	billId: string;
	amount: number;
	currency: string;
	enterpriseId: string;
}> {
	eventType = 'PaymentCreatedEvent';
	aggregateType = EAggregateType.PAYMENT;

	constructor(
		public readonly paymentId: string,
		public readonly billId: string,
		public readonly amount: number,
		public readonly currency: string,
		public readonly enterpriseId: string
	) {
		super(paymentId, {
			paymentId,
			billId,
			amount,
			currency,
			enterpriseId,
		});
	}
}
