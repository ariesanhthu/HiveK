import { DomainEvent } from '../abstract/base.event';
import { EAggregateType } from '../enums';

export class PaymentRefundedEvent extends DomainEvent<{
	paymentId: string;
	attemptId: string;
	refundAmount: number;
	currency: string;
	isFullRefund: boolean;
}> {
	eventType = 'PaymentRefundedEvent';
	aggregateType = EAggregateType.PAYMENT;

	constructor(
		public readonly paymentId: string,
		public readonly attemptId: string,
		public readonly refundAmount: number,
		public readonly currency: string,
		public readonly isFullRefund: boolean
	) {
		super(paymentId, {
			paymentId,
			attemptId,
			refundAmount,
			currency,
			isFullRefund,
		});
	}
}
