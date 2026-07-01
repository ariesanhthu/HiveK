import { DomainEvent } from '../abstract/base.event';
import { EAggregateType } from '../enums';

export class BillPaidEvent extends DomainEvent<{
	billId: string;
	enterpriseId: string;
	paidAt: Date;
}> {
	eventType = 'BillPaidEvent';
	aggregateType = EAggregateType.BILL;

	constructor(
		public readonly billId: string,
		public readonly enterpriseId: string,
		public readonly paidAt: Date
	) {
		super(billId, {
			billId,
			enterpriseId,
			paidAt,
		});
	}
}
