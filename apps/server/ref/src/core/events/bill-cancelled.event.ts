import { DomainEvent } from '../abstract/base.event';
import { EAggregateType } from '../enums';

export class BillCancelledEvent extends DomainEvent<{
	billId: string;
	enterpriseId: string;
	reason: string;
}> {
	eventType = 'BillCancelledEvent';
	aggregateType = EAggregateType.BILL;

	constructor(
		public readonly billId: string,
		public readonly enterpriseId: string,
		public readonly reason: string
	) {
		super(billId, {
			billId,
			enterpriseId,
			reason,
		});
	}
}
