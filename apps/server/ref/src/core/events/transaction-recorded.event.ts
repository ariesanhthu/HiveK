import { DomainEvent } from '../abstract/base.event';
import { EAggregateType } from '../enums';

export class TransactionRecordedEvent extends DomainEvent<{
	paymentId: string;
	attemptId: string;
	transactionId: string;
	transactionType: string;
	transactionSource: string;
	status: string;
	amount: number;
	currency: string;
}> {
	eventType = 'TransactionRecordedEvent';
	aggregateType = EAggregateType.PAYMENT;

	constructor(
		public readonly paymentId: string,
		public readonly attemptId: string,
		public readonly transactionId: string,
		public readonly transactionType: string,
		public readonly transactionSource: string,
		public readonly status: string,
		public readonly amount: number,
		public readonly currency: string
	) {
		super(paymentId, {
			paymentId,
			attemptId,
			transactionId,
			transactionType,
			transactionSource,
			status,
			amount,
			currency,
		});
	}
}
